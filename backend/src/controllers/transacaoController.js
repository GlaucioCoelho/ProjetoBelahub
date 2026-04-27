import Transacao from '../models/Transacao.js';
import Agendamento from '../models/Agendamento.js';

export const criar = async (req, res) => {
  try {
    const { tipo, valor, cliente, agendamento } = req.body;
    const empresa = req.usuario.id;

    if (!['receita', 'despesa', 'comissao', 'devolucao'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de transação inválido' });
    }

    if (valor < 0) {
      return res.status(400).json({ error: 'Valor não pode ser negativo' });
    }

    const transacao = new Transacao({
      ...req.body,
      empresa,
    });

    await transacao.save();
    await transacao.populate(['cliente', 'funcionario', 'agendamento']);

    res.status(201).json(transacao.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const listar = async (req, res) => {
  try {
    const { tipo, status, dataInicio, dataFim, cliente, pagina = 1, limite = 20 } = req.query;
    const empresa = req.usuario.id;

    const filtro = { empresa };
    if (tipo) filtro.tipo = tipo;
    if (status) filtro.status = status;
    if (cliente) filtro.cliente = cliente;

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

    const paginaNum = parseInt(pagina);
    const limiteNum = parseInt(limite);
    const skip = (paginaNum - 1) * limiteNum;

    const transacoes = await Transacao.find(filtro)
      .populate(['cliente', 'funcionario', 'agendamento'])
      .limit(limiteNum)
      .skip(skip)
      .sort({ data: -1 });

    const total = await Transacao.countDocuments(filtro);

    const totalPorTipo = await Transacao.aggregate([
      { $match: { ...filtro } },
      { $group: { _id: '$tipo', total: { $sum: '$valor' } } },
    ]);

    res.json({
      transacoes: transacoes.map((t) => t.toJSON()),
      total,
      paginas: Math.ceil(total / limiteNum),
      paginaAtual: paginaNum,
      resumoPorTipo: totalPorTipo,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const obter = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa = req.usuario.id;

    const transacao = await Transacao.findOne({ _id: id, empresa }).populate([
      'cliente',
      'funcionario',
      'agendamento',
    ]);

    if (!transacao) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    res.json(transacao.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa = req.usuario.id;

    const transacao = await Transacao.findOneAndUpdate(
      { _id: id, empresa },
      { ...req.body, empresa },
      { new: true, runValidators: true }
    ).populate(['cliente', 'funcionario', 'agendamento']);

    if (!transacao) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    res.json(transacao.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deletar = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa = req.usuario.id;

    const transacao = await Transacao.findOneAndDelete({ _id: id, empresa });

    if (!transacao) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    res.json({ message: 'Transação deletada com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const obterResumoFinanceiro = async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;
    const empresa = req.usuario.id;

    const filtro = { empresa };

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

    const resumo = await Transacao.aggregate([
      { $match: filtro },
      {
        $group: {
          _id: '$tipo',
          total: { $sum: '$valor' },
          quantidade: { $sum: 1 },
        },
      },
    ]);

    const totalEntradas = resumo.find((r) => r._id === 'receita')?.total || 0;
    const totalSaidas = resumo.find((r) => r._id === 'despesa')?.total || 0;
    const totalComissoes = resumo.find((r) => r._id === 'comissao')?.total || 0;

    const fluxo = totalEntradas - totalSaidas - totalComissoes;

    res.json({
      periodo: { dataInicio, dataFim },
      resumoPorTipo: resumo,
      totalEntradas,
      totalSaidas,
      totalComissoes,
      fluxoLiquido: fluxo,
      margem: totalEntradas > 0 ? ((fluxo / totalEntradas) * 100).toFixed(2) : 0,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
