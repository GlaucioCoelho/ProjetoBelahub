import Funcionario from '../models/Funcionario.js';
import Escala from '../models/Escala.js';
import Agendamento from '../models/Agendamento.js';

export const criar = async (req, res) => {
  try {
    const { email, nome } = req.body;
    const empresa = req.usuario.id;

    if (!nome) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    if (email) {
      const emailUnico = await Funcionario.verificarEmailUnico(email);
      if (!emailUnico) {
        return res.status(400).json({ error: 'Email já registrado' });
      }
    }

    const funcionario = new Funcionario({
      ...req.body,
      empresa,
      ...(email ? { email } : {}),
    });

    await funcionario.save();
    res.status(201).json(funcionario.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const listar = async (req, res) => {
  try {
    const { cargo, status, busca, pagina = 1, limite = 10 } = req.query;
    const empresa = req.usuario.id;

    const filtro = { empresa };
    if (cargo) filtro.cargo = cargo;
    if (status) filtro.status = status;
    if (busca) {
      filtro.$or = [
        { nome: { $regex: busca, $options: 'i' } },
        { email: { $regex: busca, $options: 'i' } },
      ];
    }

    const paginaNum = parseInt(pagina);
    const limiteNum = parseInt(limite);
    const skip = (paginaNum - 1) * limiteNum;

    const funcionarios = await Funcionario.find(filtro)
      .limit(limiteNum)
      .skip(skip)
      .sort({ dataContratacao: -1 });

    const total = await Funcionario.countDocuments(filtro);

    res.json({
      funcionarios: funcionarios.map((f) => f.toJSON()),
      total,
      paginas: Math.ceil(total / limiteNum),
      paginaAtual: paginaNum,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const obter = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa = req.usuario.id;

    const funcionario = await Funcionario.findOne({ _id: id, empresa });
    if (!funcionario) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }

    res.json(funcionario.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    const empresa = req.usuario.id;

    if (email) {
      const emailUnico = await Funcionario.verificarEmailUnico(email, id);
      if (!emailUnico) {
        return res.status(400).json({ error: 'Email já registrado' });
      }
    }

    const funcionario = await Funcionario.findOneAndUpdate(
      { _id: id, empresa },
      req.body,
      { new: true, runValidators: true }
    );

    if (!funcionario) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }

    res.json(funcionario.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deletar = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa = req.usuario.id;

    const funcionario = await Funcionario.findOneAndDelete({ _id: id, empresa });
    if (!funcionario) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }

    await Escala.deleteMany({ funcionario: id });

    res.json({ message: 'Funcionário deletado com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const criarEscala = async (req, res) => {
  try {
    const { funcionarioId } = req.params;
    const { data, horarioInicio, horarioFim } = req.body;
    const empresa = req.usuario.id;

    const funcionario = await Funcionario.findOne({ _id: funcionarioId, empresa });
    if (!funcionario) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }

    const temConflito = await Escala.verificarConflito(funcionarioId, data, horarioInicio, horarioFim);
    if (temConflito) {
      return res.status(400).json({ error: 'Horário conflita com outra escala' });
    }

    const escala = new Escala({
      ...req.body,
      funcionario: funcionarioId,
      empresa,
    });

    await escala.save();
    res.status(201).json(escala.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const listarEscalas = async (req, res) => {
  try {
    const { funcionarioId } = req.params;
    const { dataInicio, dataFim, tipo } = req.query;
    const empresa = req.usuario.id;

    const funcionario = await Funcionario.findOne({ _id: funcionarioId, empresa });
    if (!funcionario) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }

    const filtro = { funcionario: funcionarioId, empresa };

    if (dataInicio || dataFim) {
      filtro.data = {};
      if (dataInicio) {
        const inicio = new Date(dataInicio);
        inicio.setHours(0, 0, 0, 0);
        filtro.data.$gte = inicio;
      }
      if (dataFim) {
        const fim = new Date(dataFim);
        fim.setHours(23, 59, 59, 999);
        filtro.data.$lte = fim;
      }
    }

    if (tipo) filtro.tipo = tipo;

    const escalas = await Escala.find(filtro).sort({ data: -1 });

    res.json({
      escalas: escalas.map((e) => e.toJSON()),
      total: escalas.length,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const atualizarEscala = async (req, res) => {
  try {
    const { funcionarioId, escalaId } = req.params;
    const { horarioInicio, horarioFim } = req.body;
    const empresa = req.usuario.id;

    const escala = await Escala.findOne({ _id: escalaId, funcionario: funcionarioId, empresa });
    if (!escala) {
      return res.status(404).json({ error: 'Escala não encontrada' });
    }

    if (horarioInicio || horarioFim) {
      const novoInicio = horarioInicio || escala.horarioInicio;
      const novoFim = horarioFim || escala.horarioFim;
      const temConflito = await Escala.verificarConflito(funcionarioId, escala.data, novoInicio, novoFim, escalaId);
      if (temConflito) {
        return res.status(400).json({ error: 'Horário conflita com outra escala' });
      }
    }

    const escalaAtualizada = await Escala.findByIdAndUpdate(escalaId, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(escalaAtualizada.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deletarEscala = async (req, res) => {
  try {
    const { funcionarioId, escalaId } = req.params;
    const empresa = req.usuario.id;

    const escala = await Escala.findOneAndDelete({
      _id: escalaId,
      funcionario: funcionarioId,
      empresa,
    });

    if (!escala) {
      return res.status(404).json({ error: 'Escala não encontrada' });
    }

    res.json({ message: 'Escala deletada com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const obterComissoes = async (req, res) => {
  try {
    const { funcionarioId } = req.params;
    const { dataInicio, dataFim } = req.query;
    const empresa = req.usuario.id;

    const funcionario = await Funcionario.findOne({ _id: funcionarioId, empresa });
    if (!funcionario) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }

    const filtro = { profissional: funcionario.nome, status: 'concluido' };

    if (dataInicio || dataFim) {
      filtro.dataAgendamento = {};
      if (dataInicio) {
        const inicio = new Date(dataInicio);
        inicio.setHours(0, 0, 0, 0);
        filtro.dataAgendamento.$gte = inicio;
      }
      if (dataFim) {
        const fim = new Date(dataFim);
        fim.setHours(23, 59, 59, 999);
        filtro.dataAgendamento.$lte = fim;
      }
    }

    const agendamentos = await Agendamento.find(filtro);

    const totalServicos = agendamentos.reduce((sum, a) => sum + (a.preco || 0), 0);
    const comissaoTotal = totalServicos * (funcionario.comissaoPercentual / 100);

    res.json({
      funcionario: funcionario.toJSON(),
      totalServicos,
      comissaoPercentual: funcionario.comissaoPercentual,
      comissaoTotal,
      agendamentos: agendamentos.length,
      detalhes: agendamentos.map((a) => ({
        data: a.dataAgendamento,
        servico: a.servico,
        preco: a.preco,
        comissao: a.preco * (funcionario.comissaoPercentual / 100),
      })),
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const obterEstatisticas = async (req, res) => {
  try {
    const { funcionarioId } = req.params;
    const empresa = req.usuario.id;

    const funcionario = await Funcionario.findOne({ _id: funcionarioId, empresa });
    if (!funcionario) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }

    const agendamentos = await Agendamento.find({
      profissional: funcionario.nome,
    });

    const agendamentosConcluidos = agendamentos.filter((a) => a.status === 'concluido').length;
    const agendamentosProximos = agendamentos.filter(
      (a) => a.status === 'agendado' && a.dataAgendamento >= new Date()
    ).length;

    const escalasProximas = await Escala.countDocuments({
      funcionario: funcionarioId,
      tipo: 'trabalho',
      data: { $gte: new Date() },
    });

    res.json({
      funcionario: funcionario.toJSON(),
      totalAgendamentos: agendamentos.length,
      agendamentosConcluidos,
      agendamentosProximos,
      escalasProximas,
      cargoAtual: funcionario.cargo,
      statusAtual: funcionario.status,
      diasContratacao: Math.floor((new Date() - new Date(funcionario.dataContratacao)) / (1000 * 60 * 60 * 24)),
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
