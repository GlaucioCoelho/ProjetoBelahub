import mongoose from 'mongoose';
import Pacote from '../models/Pacote.js';

export const criar = async (req, res) => {
  try {
    const pacote = new Pacote({ ...req.body, empresa: req.usuario.id });
    await pacote.save();
    res.status(201).json(pacote.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const listar = async (req, res) => {
  try {
    const { ativo, busca, limite = 100 } = req.query;
    const empresa = req.usuario.id;

    const filtro = { empresa };
    if (ativo !== undefined) filtro.ativo = ativo === 'true';
    if (busca) filtro.nome = { $regex: busca, $options: 'i' };

    const pacotes = await Pacote.find(filtro)
      .limit(parseInt(limite))
      .sort({ createdAt: -1 });

    const total = await Pacote.countDocuments(filtro);
    res.json({ pacotes: pacotes.map(p => p.toJSON()), total });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const obter = async (req, res) => {
  try {
    const pacote = await Pacote.findOne({ _id: req.params.id, empresa: req.usuario.id });
    if (!pacote) return res.status(404).json({ error: 'Pacote não encontrado' });
    res.json(pacote.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const atualizar = async (req, res) => {
  try {
    const pacote = await Pacote.findOneAndUpdate(
      { _id: req.params.id, empresa: req.usuario.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!pacote) return res.status(404).json({ error: 'Pacote não encontrado' });
    res.json(pacote.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deletar = async (req, res) => {
  try {
    const pacote = await Pacote.findOneAndDelete({ _id: req.params.id, empresa: req.usuario.id });
    if (!pacote) return res.status(404).json({ error: 'Pacote não encontrado' });
    res.json({ message: 'Pacote deletado com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const estatisticas = async (req, res) => {
  try {
    const empresa = req.usuario.id;
    const oid = new mongoose.Types.ObjectId(empresa);

    const [total, ativos, agg] = await Promise.all([
      Pacote.countDocuments({ empresa }),
      Pacote.countDocuments({ empresa, ativo: true }),
      Pacote.aggregate([
        { $match: { empresa: oid } },
        { $group: { _id: null, precoMedio: { $avg: '$preco' }, sessoesMedia: { $avg: '$sessoes' } } },
      ]),
    ]);

    const { precoMedio = 0, sessoesMedia = 0 } = agg[0] || {};
    res.json({ total, ativos, precoMedio: parseFloat(precoMedio.toFixed(2)), sessoesMedia: Math.round(sessoesMedia) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
