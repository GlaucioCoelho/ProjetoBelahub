import AlertaEstoque from '../models/AlertaEstoque.js';
import Estoque from '../models/Estoque.js';

export const listarAlertas = async (req, res) => {
  try {
    const { ativo, lido, tipo, severidade, pagina = 1, limite = 20 } = req.query;
    const empresa = req.usuario.id;

    const filtro = { empresa };
    if (ativo !== undefined) filtro.ativo = ativo === 'true';
    if (lido !== undefined) filtro.lido = lido === 'true';
    if (tipo) filtro.tipo = tipo;
    if (severidade) filtro.severidade = severidade;

    const paginaNum = parseInt(pagina);
    const limiteNum = parseInt(limite);
    const skip = (paginaNum - 1) * limiteNum;

    const alertas = await AlertaEstoque.find(filtro)
      .populate('produto', 'nome sku categoria')
      .populate('estoque', 'localizacao quantidadeAtual')
      .limit(limiteNum)
      .skip(skip)
      .sort({ severidade: -1, createdAt: -1 });

    const total = await AlertaEstoque.countDocuments(filtro);

    res.json({
      alertas: alertas.map((a) => a.toJSON()),
      total,
      paginas: Math.ceil(total / limiteNum),
      paginaAtual: paginaNum,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const obterAlerta = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa = req.usuario.id;

    const alerta = await AlertaEstoque.findOne({ _id: id, empresa })
      .populate('produto', 'nome sku categoria precoUnitario')
      .populate('estoque', 'localizacao quantidadeAtual quantidadeDisponivel');

    if (!alerta) {
      return res.status(404).json({ error: 'Alerta não encontrado' });
    }

    res.json(alerta.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const marcarComoLido = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa = req.usuario.id;

    const alerta = await AlertaEstoque.findOne({ _id: id, empresa });
    if (!alerta) {
      return res.status(404).json({ error: 'Alerta não encontrado' });
    }

    await alerta.marcarComoLido();

    res.json(alerta.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const marcarVariosComoLidos = async (req, res) => {
  try {
    const { alertaIds } = req.body;
    const empresa = req.usuario.id;

    if (!Array.isArray(alertaIds) || alertaIds.length === 0) {
      return res.status(400).json({ error: 'Nenhum alerta fornecido' });
    }

    const resultado = await AlertaEstoque.updateMany(
      { _id: { $in: alertaIds }, empresa },
      {
        lido: true,
        dataLeitura: new Date(),
      }
    );

    res.json({
      modificados: resultado.modifiedCount,
      total: alertaIds.length,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const registrarAcao = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo, descricao, usuarioResponsavel } = req.body;
    const empresa = req.usuario.id;

    const alerta = await AlertaEstoque.findOne({ _id: id, empresa });
    if (!alerta) {
      return res.status(404).json({ error: 'Alerta não encontrado' });
    }

    await alerta.registrarAcao(tipo, descricao, usuarioResponsavel);

    res.json(alerta.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const obterNaoLidos = async (req, res) => {
  try {
    const empresa = req.usuario.id;

    const alertas = await AlertaEstoque.obterNaoLidos(empresa);

    res.json(alertas.map((a) => a.toJSON()));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const obterResumo = async (req, res) => {
  try {
    const empresa = req.usuario.id;

    const resumo = await AlertaEstoque.obterResumo(empresa);

    // Calcular totais
    const totais = {
      total: 0,
      critica: 0,
      alta: 0,
      media: 0,
      baixa: 0,
    };

    resumo.forEach((item) => {
      const chave = item._id.severidade;
      if (totais.hasOwnProperty(chave)) {
        totais[chave] = item.total;
      }
      totais.total += item.total;
    });

    // Contar alertas não lidos
    const naoLidos = await AlertaEstoque.countDocuments({
      empresa,
      ativo: true,
      lido: false,
    });

    res.json({
      totais,
      naoLidos,
      detalhes: resumo,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const criarAlertaManual = async (req, res) => {
  try {
    const { produto, estoque, tipo, severidade, descricao } = req.body;
    const empresa = req.usuario.id;

    // Validar estoque
    const estoqueExistente = await Estoque.findOne({ _id: estoque, empresa });
    if (!estoqueExistente) {
      return res.status(404).json({ error: 'Estoque não encontrado' });
    }

    const alerta = await AlertaEstoque.create({
      empresa,
      produto,
      estoque,
      tipo,
      severidade,
      descricao,
      quantidadeAtual: estoqueExistente.quantidadeAtual,
      quantidadeLimite: estoqueExistente.estoqueMinimoLocal,
    });

    res.status(201).json(alerta.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const desativarAlerta = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa = req.usuario.id;

    const alerta = await AlertaEstoque.findOneAndUpdate(
      { _id: id, empresa },
      { ativo: false },
      { new: true }
    );

    if (!alerta) {
      return res.status(404).json({ error: 'Alerta não encontrado' });
    }

    res.json(alerta.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const desativarVariosAlertas = async (req, res) => {
  try {
    const { alertaIds } = req.body;
    const empresa = req.usuario.id;

    if (!Array.isArray(alertaIds) || alertaIds.length === 0) {
      return res.status(400).json({ error: 'Nenhum alerta fornecido' });
    }

    const resultado = await AlertaEstoque.updateMany(
      { _id: { $in: alertaIds }, empresa },
      { ativo: false }
    );

    res.json({
      modificados: resultado.modifiedCount,
      total: alertaIds.length,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const obterAlertsporProduto = async (req, res) => {
  try {
    const { produtoId } = req.params;
    const empresa = req.usuario.id;

    const alertas = await AlertaEstoque.find({
      empresa,
      produto: produtoId,
      ativo: true,
    })
      .populate('estoque', 'localizacao quantidadeAtual')
      .sort({ severidade: -1, createdAt: -1 });

    res.json(alertas.map((a) => a.toJSON()));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const obterHistoricoAlertas = async (req, res) => {
  try {
    const { produtoId, dataInicio, dataFim, pagina = 1, limite = 10 } = req.query;
    const empresa = req.usuario.id;

    const filtro = { empresa };
    if (produtoId) filtro.produto = produtoId;

    if (dataInicio || dataFim) {
      filtro.createdAt = {};
      if (dataInicio) {
        const inicio = new Date(dataInicio);
        inicio.setHours(0, 0, 0, 0);
        filtro.createdAt.$gte = inicio;
      }
      if (dataFim) {
        const fim = new Date(dataFim);
        fim.setHours(23, 59, 59, 999);
        filtro.createdAt.$lte = fim;
      }
    }

    const paginaNum = parseInt(pagina);
    const limiteNum = parseInt(limite);
    const skip = (paginaNum - 1) * limiteNum;

    const historico = await AlertaEstoque.find(filtro)
      .populate('produto', 'nome sku')
      .populate('estoque', 'localizacao')
      .limit(limiteNum)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await AlertaEstoque.countDocuments(filtro);

    res.json({
      alertas: historico.map((a) => a.toJSON()),
      total,
      paginas: Math.ceil(total / limiteNum),
      paginaAtual: paginaNum,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const obterEstatisticas = async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;
    const empresa = req.usuario.id;

    const filtro = { empresa };

    if (dataInicio || dataFim) {
      filtro.createdAt = {};
      if (dataInicio) {
        const inicio = new Date(dataInicio);
        inicio.setHours(0, 0, 0, 0);
        filtro.createdAt.$gte = inicio;
      }
      if (dataFim) {
        const fim = new Date(dataFim);
        fim.setHours(23, 59, 59, 999);
        filtro.createdAt.$lte = fim;
      }
    }

    // Alertas por tipo
    const porTipo = await AlertaEstoque.aggregate([
      { $match: filtro },
      {
        $group: {
          _id: '$tipo',
          total: { $sum: 1 },
        },
      },
    ]);

    // Alertas por severidade
    const porSeveridade = await AlertaEstoque.aggregate([
      { $match: filtro },
      {
        $group: {
          _id: '$severidade',
          total: { $sum: 1 },
        },
      },
    ]);

    // Taxa de resolução (alertas com ação tomada)
    const resolvidos = await AlertaEstoque.countDocuments({
      ...filtro,
      'acaoTomada.tipo': { $ne: 'nenhuma' },
    });

    const totalAlertas = await AlertaEstoque.countDocuments(filtro);

    res.json({
      periodo: {
        inicio: dataInicio,
        fim: dataFim,
      },
      resumo: {
        totalAlertas,
        alertasResolvidos: resolvidos,
        taxaResolucao: totalAlertas > 0 ? ((resolvidos / totalAlertas) * 100).toFixed(2) + '%' : '0%',
      },
      porTipo,
      porSeveridade,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
