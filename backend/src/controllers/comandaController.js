import Comanda from '../models/Comanda.js';

export const listar = async (req, res) => {
  try {
    const { status, limite = 200 } = req.query;
    const filtro = {};
    if (req.usuario?.id) filtro.empresa = req.usuario.id;
    if (status) filtro.status = status;

    const comandas = await Comanda.find(filtro)
      .limit(Number(limite))
      .sort({ numero: -1 });

    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const fechadasHoje = comandas.filter(c => c.status === 'fechada' && new Date(c.data) >= hoje).length;

    res.json({ sucesso: true, comandas, fechadasHoje });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: err.message });
  }
};

export const obter = async (req, res) => {
  try {
    const comanda = await Comanda.findOne({ _id: req.params.id, empresa: req.usuario?.id });
    if (!comanda) return res.status(404).json({ sucesso: false, mensagem: 'Comanda não encontrada' });
    res.json({ sucesso: true, comanda });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: err.message });
  }
};

export const criar = async (req, res) => {
  try {
    const { nomeCliente, profissional, horarioAbertura, itens, observacoes } = req.body;
    if (!nomeCliente || !profissional) {
      return res.status(400).json({ sucesso: false, mensagem: 'Nome do cliente e profissional são obrigatórios' });
    }
    const comanda = await Comanda.create({
      empresa: req.usuario?.id,
      nomeCliente,
      profissional,
      horarioAbertura: horarioAbertura || new Date().toTimeString().substring(0, 5),
      itens: itens || [],
      observacoes,
    });
    res.status(201).json({ sucesso: true, comanda });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: err.message });
  }
};

export const atualizar = async (req, res) => {
  try {
    const comanda = await Comanda.findOneAndUpdate(
      { _id: req.params.id, empresa: req.usuario?.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!comanda) return res.status(404).json({ sucesso: false, mensagem: 'Comanda não encontrada' });
    res.json({ sucesso: true, comanda });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: err.message });
  }
};

export const fechar = async (req, res) => {
  try {
    const comanda = await Comanda.findOneAndUpdate(
      { _id: req.params.id, empresa: req.usuario?.id },
      { status: 'fechada' },
      { new: true }
    );
    if (!comanda) return res.status(404).json({ sucesso: false, mensagem: 'Comanda não encontrada' });
    res.json({ sucesso: true, comanda });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: err.message });
  }
};

export const deletar = async (req, res) => {
  try {
    const comanda = await Comanda.findOneAndDelete({ _id: req.params.id, empresa: req.usuario?.id });
    if (!comanda) return res.status(404).json({ sucesso: false, mensagem: 'Comanda não encontrada' });
    res.json({ sucesso: true });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: err.message });
  }
};
