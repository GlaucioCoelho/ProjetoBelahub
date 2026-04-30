import express from 'express';
import Agendamento from '../models/Agendamento.js';
import Servico from '../models/Servico.js';
import Usuario from '../models/Usuario.js';
import Cliente from '../models/Cliente.js';
import { enviarConfirmacaoAgendamento } from '../utils/emailService.js';

const router = express.Router();

router.get('/saloes/:salaoId/servicos', async (req, res) => {
  try {
    const { salaoId } = req.params;

    const servicos = await Servico.find({ empresa: salaoId })
      .select('nome duracao preco descricao');

    res.json({ sucesso: true, dados: servicos });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
});

router.get('/saloes/:salaoId/horarios', async (req, res) => {
  try {
    const { salaoId } = req.params;
    const { data, profissional, duracao = 60 } = req.query;

    if (!data) {
      return res.status(400).json({ sucesso: false, mensagem: 'Data é obrigatória' });
    }

    const dataAgendamento = new Date(data);
    dataAgendamento.setHours(0, 0, 0, 0);

    const agendamentosDia = await Agendamento.find({
      empresa: salaoId,
      dataAgendamento,
      ...(profissional && { profissional }),
      status: { $in: ['agendado', 'aguardando', 'confirmado'] },
    }).select('horarioInicio duracao');

    const horariosOcupados = agendamentosDia.map(a => ({
      inicio: a.horarioInicio,
      fim: adicionarMinutos(a.horarioInicio, a.duracao || 60),
    }));

    const horariosDisponiveis = gerarHorariosDisponiveis(horariosOcupados, parseInt(duracao));

    res.json({ sucesso: true, dados: horariosDisponiveis });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
});

router.post('/saloes/:salaoId/agendamentos', async (req, res) => {
  try {
    const { salaoId } = req.params;
    const {
      nomeCliente, emailCliente, telefonecliente,
      profissional, servico, dataAgendamento, horarioInicio, duracao, preco, notas,
    } = req.body;

    if (!nomeCliente || !profissional || !servico || !dataAgendamento || !horarioInicio) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Nome do cliente, profissional, serviço, data e horário são obrigatórios'
      });
    }

    const temConflito = await Agendamento.verificarConflito(
      profissional, dataAgendamento, horarioInicio, duracao || 60
    );
    if (temConflito) {
      return res.status(409).json({
        sucesso: false,
        mensagem: 'Horário não disponível para este profissional nesta data',
      });
    }

    let clienteId = null;
    if (emailCliente) {
      const clienteExistente = await Cliente.findOne({ empresa: salaoId, email: emailCliente });
      if (clienteExistente) {
        clienteId = clienteExistente._id;
      } else {
        const novoCliente = await Cliente.create({
          empresa: salaoId,
          nome: nomeCliente,
          email: emailCliente,
          telefone: telefonecliente || '',
        });
        clienteId = novoCliente._id;
      }
    }

    const agendamento = await Agendamento.create({
      empresa: salaoId,
      cliente: clienteId,
      nomeCliente,
      profissional,
      servico,
      dataAgendamento,
      horarioInicio,
      duracao: duracao || 60,
      preco: preco || 0,
      notas: notas || '',
      pagamento: 'Pendente',
      status: 'aguardando',
    });

    if (emailCliente) {
      const data = new Date(dataAgendamento).toLocaleDateString('pt-BR');
      const salon = await Usuario.findById(salaoId).select('nomeEmpresa');
      enviarConfirmacaoAgendamento({
        nome: nomeCliente,
        email: emailCliente,
        servico,
        profissional,
        data,
        horario: horarioInicio,
        preco: agendamento.preco,
        nomeEmpresa: salon?.nomeEmpresa || 'Salão',
      }).catch(err => console.warn('[Email] Confirmação:', err.message));
    }

    res.status(201).json({
      sucesso: true,
      mensagem: 'Agendamento criado com sucesso. Aguarde confirmação.',
      dados: agendamento
    });
  } catch (erro) {
    console.error('[PublicBooking]', erro);
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
});

function adicionarMinutos(horario, minutos) {
  const [horas, mins] = horario.split(':').map(Number);
  const totalMinutos = horas * 60 + mins + minutos;
  const novasHoras = Math.floor(totalMinutos / 60) % 24;
  const novosMinutos = totalMinutos % 60;
  return `${String(novasHoras).padStart(2, '0')}:${String(novosMinutos).padStart(2, '0')}`;
}

function gerarHorariosDisponiveis(horariosOcupados, duracao) {
  const horarios = [];
  const HORARIO_INICIO = 8;
  const HORARIO_FIM = 18;

  for (let h = HORARIO_INICIO; h < HORARIO_FIM; h++) {
    for (let m = 0; m < 60; m += 30) {
      const horario = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const horarioFim = adicionarMinutos(horario, duracao);

      const temConflito = horariosOcupados.some(
        ocupado => sobrepoe(horario, horarioFim, ocupado.inicio, ocupado.fim)
      );

      if (!temConflito) {
        horarios.push(horario);
      }
    }
  }

  return horarios;
}

function sobrepoe(inicio1, fim1, inicio2, fim2) {
  return inicio1 < fim2 && fim1 > inicio2;
}

export default router;
