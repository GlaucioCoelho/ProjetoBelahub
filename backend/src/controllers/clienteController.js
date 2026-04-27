import Cliente from '../models/Cliente.js';
import Agendamento from '../models/Agendamento.js';

export const criar = async (req, res) => {
  try {
    const { nome, email, telefone, dataNascimento, endereco, observacoes, tag, instagram } = req.body;

    if (!nome) {
      return res.status(400).json({ sucesso: false, mensagem: 'Nome é obrigatório' });
    }

    if (email) {
      const clienteExistente = await Cliente.findOne({ empresa: req.usuario.id, email });
      if (clienteExistente) {
        return res.status(409).json({ sucesso: false, mensagem: 'Email já cadastrado' });
      }
    }

    const cliente = await Cliente.create({
      nome,
      ...(email    && { email }),
      ...(telefone && { telefone }),
      dataNascimento,
      endereco,
      observacoes,
      tag:      tag      || 'regular',
      instagram: instagram || '',
      empresa: req.usuario.id,
    });

    res.status(201).json({
      sucesso: true,
      mensagem: 'Cliente criado com sucesso',
      dados: cliente,
    });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
};

export const listar = async (req, res) => {
  try {
    const { busca, ativo } = req.query;
    const filtro = { empresa: req.usuario.id };

    if (busca) {
      filtro.$text = { $search: busca };
    }

    if (ativo !== undefined) {
      filtro.ativo = ativo === 'true';
    }

    const clientes = await Cliente.find(filtro).sort({ nome: 1 });

    res.json({ sucesso: true, dados: clientes });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
};

export const obter = async (req, res) => {
  try {
    const cliente = await Cliente.findOne({
      _id: req.params.id,
      empresa: req.usuario.id,
    });

    if (!cliente) {
      return res.status(404).json({ sucesso: false, mensagem: 'Cliente não encontrado' });
    }

    res.json({ sucesso: true, dados: cliente });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
};

export const atualizar = async (req, res) => {
  try {
    const { nome, email, telefone, dataNascimento, endereco, observacoes, ativo, tag, instagram } = req.body;

    const cliente = await Cliente.findOne({
      _id: req.params.id,
      empresa: req.usuario.id,
    });

    if (!cliente) {
      return res.status(404).json({ sucesso: false, mensagem: 'Cliente não encontrado' });
    }

    // Verifica se email já existe (se estiver mudando)
    if (email && email !== cliente.email) {
      const existe = await Cliente.findOne({ email });
      if (existe) {
        return res.status(409).json({ sucesso: false, mensagem: 'Email já cadastrado' });
      }
    }

    // Atualizar campos
    if (nome) cliente.nome = nome;
    if (email) cliente.email = email;
    if (telefone) cliente.telefone = telefone;
    if (dataNascimento) cliente.dataNascimento = dataNascimento;
    if (endereco) cliente.endereco = { ...cliente.endereco, ...endereco };
    if (observacoes !== undefined) cliente.observacoes = observacoes;
    if (ativo !== undefined) cliente.ativo = ativo;
    if (tag) cliente.tag = tag;
    if (instagram !== undefined) cliente.instagram = instagram;

    await cliente.save();

    res.json({
      sucesso: true,
      mensagem: 'Cliente atualizado com sucesso',
      dados: cliente,
    });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
};

export const deletar = async (req, res) => {
  try {
    const cliente = await Cliente.findOneAndDelete({
      _id: req.params.id,
      empresa: req.usuario.id,
    });

    if (!cliente) {
      return res.status(404).json({ sucesso: false, mensagem: 'Cliente não encontrado' });
    }

    res.json({
      sucesso: true,
      mensagem: 'Cliente deletado com sucesso',
      dados: cliente,
    });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
};

export const obterAgendamentos = async (req, res) => {
  try {
    const cliente = await Cliente.findOne({
      _id: req.params.id,
      empresa: req.usuario.id,
    });

    if (!cliente) {
      return res.status(404).json({ sucesso: false, mensagem: 'Cliente não encontrado' });
    }

    const agendamentos = await Agendamento.find({
      cliente: req.params.id,
    }).sort({ dataAgendamento: -1 });

    res.json({ sucesso: true, dados: agendamentos });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
};

export const obterEstatisticas = async (req, res) => {
  try {
    const agendamentos = await Agendamento.find({
      cliente: req.params.id,
    });

    const concluidos = agendamentos.filter((ag) => ag.status === 'concluido');
    const gastoTotal = concluidos.reduce((sum, ag) => sum + (ag.preco || 0), 0);

    const estatisticas = {
      totalAgendamentos: agendamentos.length,
      agendamentosConcluidos: concluidos.length,
      agendamentosProximos: agendamentos.filter((ag) => ag.status === 'agendado').length,
      gastoTotal,
      gastoPorAgendamento: concluidos.length > 0 ? gastoTotal / concluidos.length : 0,
      ultimoAgendamento: agendamentos[0]?.dataAgendamento || null,
    };

    res.json({ sucesso: true, dados: estatisticas });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
};
