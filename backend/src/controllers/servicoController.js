import mongoose from 'mongoose';
import Servico from '../models/Servico.js';

export const criar = async (req, res) => {
  try {
    const servico = new Servico({ ...req.body, empresa: req.usuario.id });
    await servico.save();
    res.status(201).json(servico.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const listar = async (req, res) => {
  try {
    const { categoria, ativo, busca, pagina = 1, limite = 100 } = req.query;
    const empresa = req.usuario.id;

    const filtro = { empresa };
    if (categoria) filtro.categoria = categoria;
    if (ativo !== undefined) filtro.ativo = ativo === 'true';
    if (busca) {
      filtro.$or = [
        { nome: { $regex: busca, $options: 'i' } },
        { descricao: { $regex: busca, $options: 'i' } },
      ];
    }

    const skip = (parseInt(pagina) - 1) * parseInt(limite);
    const servicos = await Servico.find(filtro)
      .limit(parseInt(limite))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Servico.countDocuments(filtro);

    res.json({ servicos: servicos.map(s => s.toJSON()), total });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const obter = async (req, res) => {
  try {
    const servico = await Servico.findOne({ _id: req.params.id, empresa: req.usuario.id });
    if (!servico) return res.status(404).json({ error: 'Serviço não encontrado' });
    res.json(servico.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const atualizar = async (req, res) => {
  try {
    const servico = await Servico.findOneAndUpdate(
      { _id: req.params.id, empresa: req.usuario.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!servico) return res.status(404).json({ error: 'Serviço não encontrado' });
    res.json(servico.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deletar = async (req, res) => {
  try {
    const servico = await Servico.findOneAndDelete({ _id: req.params.id, empresa: req.usuario.id });
    if (!servico) return res.status(404).json({ error: 'Serviço não encontrado' });
    res.json({ message: 'Serviço deletado com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const estatisticas = async (req, res) => {
  try {
    const empresa = req.usuario.id;

    const total = await Servico.countDocuments({ empresa });
    const ativos = await Servico.countDocuments({ empresa, ativo: true });

    const agg = await Servico.aggregate([
      { $match: { empresa: new mongoose.Types.ObjectId(empresa) } },
      {
        $group: {
          _id: null,
          precoMedio: { $avg: '$preco' },
          duracaoMedia: { $avg: '$duracao' },
        },
      },
    ]);

    const { precoMedio = 0, duracaoMedia = 0 } = agg[0] || {};

    res.json({
      total,
      ativos,
      precoMedio: parseFloat(precoMedio.toFixed(2)),
      duracaoMedia: Math.round(duracaoMedia),
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
