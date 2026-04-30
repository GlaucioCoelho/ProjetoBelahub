import Agendamento from '../models/Agendamento.js';
import Transacao   from '../models/Transacao.js';
import Funcionario from '../models/Funcionario.js';
import Cliente     from '../models/Cliente.js';
import Usuario     from '../models/Usuario.js';
import {
  enviarConfirmacaoAgendamento,
  enviarCancelamentoAgendamento,
} from '../utils/emailService.js';

// ── Helpers ────────────────────────────────────────────────────────────────

async function notificarConfirmacao(agendamento, empresaId) {
  if (!agendamento.cliente) return;
  const [cliente, empresa] = await Promise.all([
    Cliente.findById(agendamento.cliente).select('nome email'),
    Usuario.findById(empresaId).select('nomeEmpresa'),
  ]);
  if (!cliente?.email) return;
  const data = new Date(agendamento.dataAgendamento).toLocaleDateString('pt-BR');
  enviarConfirmacaoAgendamento({
    nome:       cliente.nome,
    email:      cliente.email,
    servico:    agendamento.servico,
    profissional: agendamento.profissional,
    data,
    horario:    agendamento.horarioInicio,
    preco:      agendamento.preco,
    nomeEmpresa: empresa?.nomeEmpresa,
  }).catch(err => console.warn('[Email] Confirmação:', err.message));
}

async function notificarCancelamento(agendamento, empresaId) {
  if (!agendamento.cliente) return;
  const [cliente, empresa] = await Promise.all([
    Cliente.findById(agendamento.cliente).select('nome email'),
    Usuario.findById(empresaId).select('nomeEmpresa'),
  ]);
  if (!cliente?.email) return;
  const data = new Date(agendamento.dataAgendamento).toLocaleDateString('pt-BR');
  enviarCancelamentoAgendamento({
    nome:       cliente.nome,
    email:      cliente.email,
    servico:    agendamento.servico,
    profissional: agendamento.profissional,
    data,
    horario:    agendamento.horarioInicio,
    nomeEmpresa: empresa?.nomeEmpresa,
  }).catch(err => console.warn('[Email] Cancelamento:', err.message));
}

/**
 * Executado quando um agendamento é concluído.
 * Cria receita no fluxo de caixa e atualiza comissão/atendimentos do profissional.
 */
async function onConcluido(agendamento, empresa) {
  const preco = agendamento.preco || 0;

  // 1. Transação de receita (só cria se ainda não existir para este agendamento)
  const jaExiste = await Transacao.findOne({ agendamento: agendamento._id, tipo: 'receita' });
  if (!jaExiste) {
    await Transacao.create({
      empresa,
      tipo:        'receita',
      descricao:   `${agendamento.servico || 'Serviço'} – ${agendamento.nomeCliente || 'Cliente'}`,
      valor:       preco,
      status:      'concluida',
      categoria:   'Serviços',
      data:        agendamento.dataAgendamento || new Date(),
      agendamento: agendamento._id,
      ...(agendamento.cliente ? { cliente: agendamento.cliente } : {}),
    });
  }

  // 2. Atualizar profissional
  if (agendamento.profissional) {
    const func = await Funcionario.findOne({ empresa, nome: agendamento.profissional });
    if (func) {
      const comissaoValor = parseFloat(
        ((preco * (func.comissaoPercentual || 0)) / 100).toFixed(2)
      );
      await Funcionario.findByIdAndUpdate(func._id, {
        $inc: { totalAtendimentos: 1, totalFaturado: preco, totalComissoes: comissaoValor },
      });
    }
  }

  // 3. Atualizar estatísticas do cliente
  if (agendamento.cliente) {
    await Cliente.atualizarGastoTotal(agendamento.cliente);
  }
}

/**
 * Executado quando um agendamento que estava concluído volta a outro status.
 * Reverte receita e comissão.
 */
async function onDesconcluido(agendamento, empresa) {
  const preco = agendamento.preco || 0;

  // 1. Remover transação de receita vinculada
  await Transacao.deleteOne({ agendamento: agendamento._id, tipo: 'receita' });

  // 2. Reverter profissional
  if (agendamento.profissional) {
    const func = await Funcionario.findOne({ empresa, nome: agendamento.profissional });
    if (func) {
      const comissaoValor = parseFloat(
        ((preco * (func.comissaoPercentual || 0)) / 100).toFixed(2)
      );
      await Funcionario.findByIdAndUpdate(func._id, {
        $inc: {
          totalAtendimentos: -1,
          totalFaturado:     -preco,
          totalComissoes:    -comissaoValor,
        },
      });
    }
  }

  // 3. Recalcular cliente
  if (agendamento.cliente) {
    await Cliente.atualizarGastoTotal(agendamento.cliente);
  }
}

// ── Controllers ────────────────────────────────────────────────────────────

export const criar = async (req, res) => {
  try {
    const {
      cliente, nomeCliente, profissional, servico,
      dataAgendamento, horarioInicio, duracao, preco,
      notas, pagamento, status,
    } = req.body;

    if (!profissional || !servico || !dataAgendamento || !horarioInicio) {
      return res.status(400).json({ sucesso: false, mensagem: 'Campos obrigatórios faltando' });
    }

    try {
      const temConflito = await Agendamento.verificarConflito(
        profissional, dataAgendamento, horarioInicio, duracao || 60
      );
      if (temConflito) {
        return res.status(409).json({
          sucesso: false,
          mensagem: 'Horário não disponível para este profissional nesta data',
        });
      }
    } catch (conflictErr) {
      console.warn('[Agendamento] Falha ao verificar conflito de horário:', conflictErr.message);
    }

    const dados = {
      empresa:         req.usuario?.id,
      profissional,
      servico,
      dataAgendamento,
      horarioInicio,
      duracao:     duracao   || 60,
      preco:       preco     || 0,
      notas:       notas     || '',
      pagamento:   pagamento || 'Cartão',
      status:      status    || 'agendado',
      nomeCliente: nomeCliente || '',
    };

    if (cliente && cliente.length === 24 && cliente !== '000000000000000000000000') {
      dados.cliente = cliente;
    }

    const agendamento = await Agendamento.create(dados);

    // Se já foi criado como concluído, aplica a regra de negócio
    if (agendamento.status === 'concluido') {
      await onConcluido(agendamento, req.usuario?.id);
    }

    // Notificação de confirmação (fire-and-forget)
    if (agendamento.status === 'agendado' || agendamento.status === 'aguardando') {
      notificarConfirmacao(agendamento, req.usuario?.id);
    }

    res.status(201).json({ sucesso: true, mensagem: 'Agendamento criado com sucesso', dados: agendamento });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
};

export const listar = async (req, res) => {
  try {
    const { dataInicio, dataFim, profissional, cliente, status, limite = 200 } = req.query;

    const filtro = {};
    if (req.usuario?.id) filtro.empresa = req.usuario.id;

    if (dataInicio || dataFim) {
      filtro.dataAgendamento = {};
      if (dataInicio) {
        const d = new Date(dataInicio); d.setHours(0, 0, 0, 0);
        filtro.dataAgendamento.$gte = d;
      }
      if (dataFim) {
        const d = new Date(dataFim); d.setHours(23, 59, 59, 999);
        filtro.dataAgendamento.$lte = d;
      }
    }

    if (profissional) filtro.profissional = profissional;
    if (cliente)      filtro.cliente      = cliente;
    if (status)       filtro.status       = status;

    const agendamentos = await Agendamento.find(filtro)
      .limit(Number(limite))
      .sort({ horarioInicio: 1 });

    res.json({ sucesso: true, agendamentos });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
};

export const obter = async (req, res) => {
  try {
    const agendamento = await Agendamento.findById(req.params.id);
    if (!agendamento) {
      return res.status(404).json({ sucesso: false, mensagem: 'Agendamento não encontrado' });
    }
    res.json({ sucesso: true, dados: agendamento });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
};

export const atualizar = async (req, res) => {
  try {
    const agendamento = await Agendamento.findById(req.params.id);
    if (!agendamento) {
      return res.status(404).json({ sucesso: false, mensagem: 'Agendamento não encontrado' });
    }

    const statusAnterior = agendamento.status;
    const empresa = req.usuario?.id;

    const campos = [
      'dataAgendamento', 'horarioInicio', 'duracao', 'status',
      'preco', 'notas', 'pagamento', 'profissional', 'servico', 'nomeCliente',
    ];
    campos.forEach((c) => { if (req.body[c] !== undefined) agendamento[c] = req.body[c]; });

    await agendamento.save();

    const novoStatus = agendamento.status;

    // ── Regras de negócio por mudança de status ──────────────────
    if (statusAnterior !== 'concluido' && novoStatus === 'concluido') {
      await onConcluido(agendamento, empresa);
    } else if (statusAnterior === 'concluido' && novoStatus !== 'concluido') {
      await onDesconcluido(agendamento, empresa);
    }

    // Notificação de cancelamento (fire-and-forget)
    if (statusAnterior !== 'cancelado' && novoStatus === 'cancelado') {
      notificarCancelamento(agendamento, empresa);
    }

    res.json({ sucesso: true, mensagem: 'Atualizado', dados: agendamento });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
};

export const cancelar = async (req, res) => {
  try {
    const agendamento = await Agendamento.findByIdAndDelete(req.params.id);
    if (!agendamento) {
      return res.status(404).json({ sucesso: false, mensagem: 'Agendamento não encontrado' });
    }

    // Se era concluído, estorna receita e comissão ao excluir
    if (agendamento.status === 'concluido') {
      await onDesconcluido(agendamento, agendamento.empresa?.toString());
    }

    // Notificar cancelamento se o agendamento ainda estava ativo (fire-and-forget)
    if (['agendado', 'aguardando'].includes(agendamento.status)) {
      notificarCancelamento(agendamento, agendamento.empresa?.toString());
    }

    res.json({ sucesso: true, mensagem: 'Agendamento removido' });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
};

export const obterHorariosDisponiveis = async (req, res) => {
  try {
    const { profissional, data } = req.query;
    if (!profissional || !data) {
      return res.status(400).json({ sucesso: false, mensagem: 'profissional e data obrigatórios' });
    }
    const d = new Date(data);
    const agendamentos = await Agendamento.find({
      profissional,
      dataAgendamento: {
        $gte: new Date(new Date(d).setHours(0,0,0,0)),
        $lt:  new Date(new Date(d).setHours(23,59,59,999)),
      },
      status: { $in: ['agendado','aguardando'] },
    });
    res.json({ sucesso: true, agendamentos });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
};
