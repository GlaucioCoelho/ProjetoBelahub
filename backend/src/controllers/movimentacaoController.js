import Movimentacao from '../models/Movimentacao.js';
import Estoque from '../models/Estoque.js';
import AlertaEstoque from '../models/AlertaEstoque.js';

export const criar = async (req, res) => {
  try {
    const { estoque, quantidade, tipo, motivo, usuarioResponsavel, referencia } = req.body;
    const empresa = req.usuario.id;

    // Validar estoque
    const estoqueExistente = await Estoque.findOne({ _id: estoque, empresa });
    if (!estoqueExistente) {
      return res.status(404).json({ error: 'Estoque não encontrado' });
    }

    // Validar quantidade para saídas
    if (['saida', 'devolucao'].includes(tipo)) {
      if (estoqueExistente.quantidadeDisponivel < quantidade) {
        return res.status(400).json({ error: 'Quantidade disponível insuficiente' });
      }
    }

    // Criar movimentação
    const movimentacao = new Movimentacao({
      empresa,
      produto: estoqueExistente.produto,
      estoque,
      quantidade,
      tipo,
      motivo,
      usuarioResponsavel,
      referencia: referencia || {},
      status: 'realizada',
    });

    await movimentacao.save();

    // Atualizar estoque baseado no tipo
    if (tipo === 'entrada') {
      estoqueExistente.adicionarQuantidade(quantidade);
    } else if (['saida', 'devolucao', 'perda'].includes(tipo)) {
      estoqueExistente.removerQuantidade(quantidade);
    } else if (tipo === 'ajuste') {
      // Para ajustes, quantity pode ser positivo ou negativo
      if (quantidade > 0) {
        estoqueExistente.adicionarQuantidade(quantidade);
      } else {
        estoqueExistente.removerQuantidade(Math.abs(quantidade));
      }
    }

    estoqueExistente.dataUltimaMovimentacao = new Date();
    await estoqueExistente.save();

    // Verificar alertas após movimentação
    if (estoqueExistente.estaComEstoqueBaixo()) {
      await AlertaEstoque.criarAlertaEstoque(
        empresa,
        estoqueExistente.produto,
        estoque,
        'estoque_baixo',
        estoqueExistente.quantidadeAtual,
        estoqueExistente.estoqueMinimoLocal
      );
    } else if (tipo === 'entrada') {
      // Desativar alerta se estoque voltou ao normal
      await AlertaEstoque.updateMany(
        { estoque, tipo: 'estoque_baixo', ativo: true },
        { ativo: false }
      );
    }

    res.status(201).json({
      movimentacao: movimentacao.toJSON(),
      estoque: estoqueExistente.toJSON(),
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const listar = async (req, res) => {
  try {
    const { tipo, motivo, status, estoque, dataInicio, dataFim, pagina = 1, limite = 20 } = req.query;
    const empresa = req.usuario.id;

    const filtro = { empresa };
    if (tipo) filtro.tipo = tipo;
    if (motivo) filtro.motivo = motivo;
    if (status) filtro.status = status;
    if (estoque) filtro.estoque = estoque;

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

    const movimentacoes = await Movimentacao.find(filtro)
      .populate('produto', 'nome sku')
      .populate('estoque', 'localizacao')
      .limit(limiteNum)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Movimentacao.countDocuments(filtro);

    res.json({
      movimentacoes: movimentacoes.map((m) => m.toJSON()),
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

    const movimentacao = await Movimentacao.findOne({ _id: id, empresa })
      .populate('produto', 'nome sku categoria')
      .populate('estoque', 'localizacao');

    if (!movimentacao) {
      return res.status(404).json({ error: 'Movimentação não encontrada' });
    }

    res.json(movimentacao.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa = req.usuario.id;

    const movimentacao = await Movimentacao.findOneAndUpdate(
      { _id: id, empresa },
      req.body,
      { new: true, runValidators: true }
    );

    if (!movimentacao) {
      return res.status(404).json({ error: 'Movimentação não encontrada' });
    }

    res.json(movimentacao.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deletar = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa = req.usuario.id;

    const movimentacao = await Movimentacao.findOneAndDelete({ _id: id, empresa });
    if (!movimentacao) {
      return res.status(404).json({ error: 'Movimentação não encontrada' });
    }

    res.json({ message: 'Movimentação deletada com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const obterResumo = async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;
    const empresa = req.usuario.id;

    const resultado = await Movimentacao.obterResumo(empresa, dataInicio, dataFim);

    // Formatar resposta
    const resumo = {
      entrada: 0,
      saida: 0,
      ajuste: 0,
      devolucao: 0,
      perda: 0,
    };

    resultado.forEach((item) => {
      resumo[item._id] = item.totalQuantidade;
    });

    res.json({
      resumo,
      periodo: {
        inicio: dataInicio,
        fim: dataFim,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const obterPorEstoque = async (req, res) => {
  try {
    const { estoqueId } = req.params;
    const { pagina = 1, limite = 10 } = req.query;
    const empresa = req.usuario.id;

    const paginaNum = parseInt(pagina);
    const limiteNum = parseInt(limite);
    const skip = (paginaNum - 1) * limiteNum;

    const movimentacoes = await Movimentacao.find({ estoque: estoqueId, empresa })
      .limit(limiteNum)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Movimentacao.countDocuments({ estoque: estoqueId, empresa });

    res.json({
      movimentacoes: movimentacoes.map((m) => m.toJSON()),
      total,
      paginas: Math.ceil(total / limiteNum),
      paginaAtual: paginaNum,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const obterRelatorioMensalPorTipo = async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;
    const empresa = req.usuario.id;

    const query = { empresa };

    if (dataInicio || dataFim) {
      query.createdAt = {};
      if (dataInicio) {
        const inicio = new Date(dataInicio);
        inicio.setHours(0, 0, 0, 0);
        query.createdAt.$gte = inicio;
      }
      if (dataFim) {
        const fim = new Date(dataFim);
        fim.setHours(23, 59, 59, 999);
        query.createdAt.$lte = fim;
      }
    }

    const relatorio = await Movimentacao.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            tipo: '$tipo',
            motivo: '$motivo',
          },
          quantidade: { $sum: '$quantidade' },
          movimentacoes: { $sum: 1 },
        },
      },
      { $sort: { 'quantidade': -1 } },
    ]);

    res.json({
      relatorio,
      periodo: {
        inicio: dataInicio,
        fim: dataFim,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const gerarMovimentacaoEmLote = async (req, res) => {
  try {
    const { movimentacoes } = req.body;
    const empresa = req.usuario.id;

    if (!Array.isArray(movimentacoes) || movimentacoes.length === 0) {
      return res.status(400).json({ error: 'Nenhuma movimentação fornecida' });
    }

    const resultados = [];
    const erros = [];

    for (const mov of movimentacoes) {
      try {
        const estoqueExistente = await Estoque.findOne({ _id: mov.estoque, empresa });
        if (!estoqueExistente) {
          erros.push({
            estoque: mov.estoque,
            erro: 'Estoque não encontrado',
          });
          continue;
        }

        const movimentacao = new Movimentacao({
          ...mov,
          empresa,
          produto: estoqueExistente.produto,
          status: 'realizada',
        });

        await movimentacao.save();

        // Atualizar estoque
        if (mov.tipo === 'entrada') {
          estoqueExistente.adicionarQuantidade(mov.quantidade);
        } else if (['saida', 'devolucao', 'perda'].includes(mov.tipo)) {
          estoqueExistente.removerQuantidade(mov.quantidade);
        }

        estoqueExistente.dataUltimaMovimentacao = new Date();
        await estoqueExistente.save();

        resultados.push({
          estoque: mov.estoque,
          sucesso: true,
          movimentacao: movimentacao.toJSON(),
        });
      } catch (erro) {
        erros.push({
          estoque: mov.estoque,
          erro: erro.message,
        });
      }
    }

    res.json({
      processadas: resultados.length,
      total: movimentacoes.length,
      erros,
      resultados,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
