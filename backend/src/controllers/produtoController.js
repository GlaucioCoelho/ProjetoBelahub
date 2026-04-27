import Produto from '../models/Produto.js';
import Estoque from '../models/Estoque.js';

export const criar = async (req, res) => {
  try {
    const { sku } = req.body;
    const empresa = req.usuario.id;

    const skuUnico = await Produto.verificarSkuUnico(sku);
    if (!skuUnico) {
      return res.status(400).json({ error: 'SKU já registrado' });
    }

    const produto = new Produto({
      ...req.body,
      empresa,
    });

    await produto.save();
    res.status(201).json(produto.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const listar = async (req, res) => {
  try {
    const { categoria, ativo, busca, pagina = 1, limite = 20 } = req.query;
    const empresa = req.usuario.id;

    const filtro = { empresa };
    if (categoria) filtro.categoria = categoria;
    if (ativo !== undefined) filtro.ativo = ativo === 'true';
    if (busca) {
      filtro.$or = [
        { nome: { $regex: busca, $options: 'i' } },
        { sku: { $regex: busca.toUpperCase(), $options: 'i' } },
        { descricao: { $regex: busca, $options: 'i' } },
      ];
    }

    const paginaNum = parseInt(pagina);
    const limiteNum = parseInt(limite);
    const skip = (paginaNum - 1) * limiteNum;

    const produtos = await Produto.find(filtro)
      .limit(limiteNum)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Produto.countDocuments(filtro);

    res.json({
      produtos: produtos.map((p) => p.toJSON()),
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

    const produto = await Produto.findOne({ _id: id, empresa });
    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Obter informações de estoque
    const estoques = await Estoque.find({ produto: id, empresa })
      .select('localizacao quantidadeAtual quantidadeReservada quantidadeDisponivel');

    const totalEstoque = estoques.reduce((sum, e) => sum + e.quantidadeAtual, 0);
    const totalDisponivel = estoques.reduce((sum, e) => sum + e.quantidadeDisponivel, 0);

    const resposta = produto.toJSON();
    resposta.estoqueLocalizacoes = estoques;
    resposta.totalEstoque = totalEstoque;
    resposta.totalDisponivel = totalDisponivel;

    res.json(resposta);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { sku } = req.body;
    const empresa = req.usuario.id;

    if (sku) {
      const skuUnico = await Produto.verificarSkuUnico(sku, id);
      if (!skuUnico) {
        return res.status(400).json({ error: 'SKU já registrado' });
      }
    }

    const produto = await Produto.findOneAndUpdate(
      { _id: id, empresa },
      req.body,
      { new: true, runValidators: true }
    );

    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json(produto.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deletar = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa = req.usuario.id;

    // Verificar se há estoque para este produto
    const estoques = await Estoque.find({ produto: id, empresa });
    const temEstoque = estoques.some((e) => e.quantidadeAtual > 0);

    if (temEstoque) {
      return res.status(400).json({
        error: 'Não é possível deletar produto com estoque. Limpar estoque primeiro.',
      });
    }

    const produto = await Produto.findOneAndDelete({ _id: id, empresa });
    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Deletar registros de estoque associados
    await Estoque.deleteMany({ produto: id, empresa });

    res.json({ message: 'Produto deletado com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const obterStatisticas = async (req, res) => {
  try {
    const empresa = req.usuario.id;

    const totalProdutos = await Produto.countDocuments({ empresa });
    const produtosAtivos = await Produto.countDocuments({ empresa, ativo: true });
    const produtosInativos = await Produto.countDocuments({ empresa, ativo: false });

    // Produtos com estoque baixo
    const estoquesBaixos = await Estoque.find({
      empresa,
      $expr: { $lte: ['$quantidadeAtual', '$estoqueMinimoLocal'] },
    }).populate('produto', 'nome sku');

    // Valor total de estoque em mãos
    const estoques = await Estoque.find({ empresa }).populate('produto', 'precoUnitario');
    const valorTotalEstoque = estoques.reduce((sum, e) => {
      return sum + (e.produto?.precoUnitario || 0) * e.quantidadeAtual;
    }, 0);

    // Produtos mais movimentados (top 5)
    const produtosMaisMovimentados = await Estoque.aggregate([
      { $match: { empresa: new mongoose.Types.ObjectId(empresa) } },
      {
        $group: {
          _id: '$produto',
          totalQuantidade: { $sum: '$quantidadeAtual' },
        },
      },
      { $sort: { totalQuantidade: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'produtos', localField: '_id', foreignField: '_id', as: 'produto' } },
    ]);

    // Distribuição por categoria
    const porCategoria = await Produto.aggregate([
      { $match: { empresa: new mongoose.Types.ObjectId(empresa) } },
      {
        $group: {
          _id: '$categoria',
          total: { $sum: 1 },
        },
      },
    ]);

    res.json({
      resumo: {
        totalProdutos,
        produtosAtivos,
        produtosInativos,
        valorTotalEstoque: parseFloat(valorTotalEstoque.toFixed(2)),
        produtosComEstoqueBaixo: estoquesBaixos.length,
      },
      estoquesBaixos: estoquesBaixos.slice(0, 10),
      produtosMaisMovimentados,
      distribuicaoPorCategoria: porCategoria,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const obterPorCategoria = async (req, res) => {
  try {
    const { categoria } = req.params;
    const empresa = req.usuario.id;

    const produtos = await Produto.find({
      empresa,
      categoria,
      ativo: true,
    }).sort({ nome: 1 });

    res.json(produtos.map((p) => p.toJSON()));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const listarComEstoque = async (req, res) => {
  try {
    const { pagina = 1, limite = 20 } = req.query;
    const empresa = req.usuario.id;

    const paginaNum = parseInt(pagina);
    const limiteNum = parseInt(limite);
    const skip = (paginaNum - 1) * limiteNum;

    const produtos = await Produto.find({ empresa, ativo: true })
      .limit(limiteNum)
      .skip(skip);

    const produtosComEstoque = await Promise.all(
      produtos.map(async (produto) => {
        const estoques = await Estoque.find({ produto: produto._id, empresa });
        const totalEstoque = estoques.reduce((sum, e) => sum + e.quantidadeAtual, 0);
        const totalDisponivel = estoques.reduce((sum, e) => sum + e.quantidadeDisponivel, 0);

        const obj = produto.toJSON();
        obj.totalEstoque = totalEstoque;
        obj.totalDisponivel = totalDisponivel;
        return obj;
      })
    );

    const total = await Produto.countDocuments({ empresa, ativo: true });

    res.json({
      produtos: produtosComEstoque,
      total,
      paginas: Math.ceil(total / limiteNum),
      paginaAtual: paginaNum,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
