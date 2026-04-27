import Faturamento from '../models/Faturamento.js';
import Agendamento from '../models/Agendamento.js';

export const criar = async (req, res) => {
  try {
    const { cliente, itens } = req.body;
    const empresa = req.usuario.id;

    if (!itens || itens.length === 0) {
      return res.status(400).json({ error: 'Nota deve ter pelo menos um item' });
    }

    const numeroNota = `NF-${Date.now()}`;
    const valorTotal = itens.reduce((sum, item) => sum + (item.valorTotal || 0), 0);

    const faturamento = new Faturamento({
      ...req.body,
      empresa,
      numeroNota,
      valorTotal,
      status: 'rascunho',
    });

    await faturamento.save();
    await faturamento.populate(['cliente', 'itens.agendamento']);

    res.status(201).json(faturamento.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const listar = async (req, res) => {
  try {
    const { status, cliente, dataInicio, dataFim, pagina = 1, limite = 15 } = req.query;
    const empresa = req.usuario.id;

    const filtro = { empresa };
    if (status) filtro.status = status;
    if (cliente) filtro.cliente = cliente;

    if (dataInicio || dataFim) {
      filtro.dataEmissao = {};
      if (dataInicio) {
        const inicio = new Date(dataInicio);
        inicio.setHours(0, 0, 0, 0);
        filtro.dataEmissao.$gte = inicio;
      }
      if (dataFim) {
        const fim = new Date(dataFim);
        fim.setHours(23, 59, 59, 999);
        filtro.dataEmissao.$lte = fim;
      }
    }

    const paginaNum = parseInt(pagina);
    const limiteNum = parseInt(limite);
    const skip = (paginaNum - 1) * limiteNum;

    const notas = await Faturamento.find(filtro)
      .populate(['cliente', 'itens.agendamento'])
      .limit(limiteNum)
      .skip(skip)
      .sort({ dataEmissao: -1 });

    const total = await Faturamento.countDocuments(filtro);

    res.json({
      notas: notas.map((n) => n.toJSON()),
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

    const faturamento = await Faturamento.findOne({ _id: id, empresa }).populate([
      'cliente',
      'itens.agendamento',
    ]);

    if (!faturamento) {
      return res.status(404).json({ error: 'Nota fiscal não encontrada' });
    }

    res.json(faturamento.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa = req.usuario.id;

    const faturamento = await Faturamento.findOneAndUpdate(
      { _id: id, empresa },
      req.body,
      { new: true, runValidators: true }
    ).populate(['cliente', 'itens.agendamento']);

    if (!faturamento) {
      return res.status(404).json({ error: 'Nota fiscal não encontrada' });
    }

    res.json(faturamento.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const emitir = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa = req.usuario.id;

    const faturamento = await Faturamento.findOne({ _id: id, empresa });

    if (!faturamento) {
      return res.status(404).json({ error: 'Nota fiscal não encontrada' });
    }

    if (faturamento.status !== 'rascunho') {
      return res.status(400).json({ error: 'Apenas rascunhos podem ser emitidos' });
    }

    faturamento.status = 'emitida';
    faturamento.dataEmissao = new Date();
    await faturamento.save();

    res.json({ message: 'Nota fiscal emitida com sucesso', faturamento: faturamento.toJSON() });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const marcarComoPaga = async (req, res) => {
  try {
    const { id } = req.params;
    const { metodo, referencia } = req.body;
    const empresa = req.usuario.id;

    const faturamento = await Faturamento.findOne({ _id: id, empresa });

    if (!faturamento) {
      return res.status(404).json({ error: 'Nota fiscal não encontrada' });
    }

    faturamento.status = 'paga';
    faturamento.dataPagamento = new Date();
    faturamento.metodo = metodo || 'cartao';
    faturamento.referencia = referencia;

    await faturamento.save();

    res.json({ message: 'Nota fiscal marcada como paga', faturamento: faturamento.toJSON() });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const obterRelatorio = async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;
    const empresa = req.usuario.id;

    const filtro = { empresa };

    if (dataInicio || dataFim) {
      filtro.dataEmissao = {};
      if (dataInicio) {
        const inicio = new Date(dataInicio);
        inicio.setHours(0, 0, 0, 0);
        filtro.dataEmissao.$gte = inicio;
      }
      if (dataFim) {
        const fim = new Date(dataFim);
        fim.setHours(23, 59, 59, 999);
        filtro.dataEmissao.$lte = fim;
      }
    }

    const relatorio = await Faturamento.aggregate([
      { $match: filtro },
      {
        $group: {
          _id: '$status',
          total: { $sum: '$valorTotal' },
          quantidade: { $sum: 1 },
        },
      },
    ]);

    const notas = await Faturamento.find(filtro).select('numeroNota cliente valorTotal status');

    const totalEmitidas = relatorio.find((r) => r._id === 'emitida')?.total || 0;
    const totalPagas = relatorio.find((r) => r._id === 'paga')?.total || 0;

    res.json({
      periodo: { dataInicio, dataFim },
      resumoPorStatus: relatorio,
      totalEmitidas,
      totalPagas,
      totalPendente: totalEmitidas - totalPagas,
      notas,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export default {
  criar,
  listar,
  obter,
  atualizar,
  emitir,
  marcarComoPaga,
  obterRelatorio,
};
