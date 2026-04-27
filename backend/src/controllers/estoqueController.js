import Estoque from '../models/Estoque.js';
import Movimentacao from '../models/Movimentacao.js';
import AlertaEstoque from '../models/AlertaEstoque.js';
import Produto from '../models/Produto.js';

export const criar = async (req, res) => {
  try {
    const { produto, localizacao } = req.body;
    const empresa = req.usuario.id;

    // Verificar se já existe estoque para este produto nesta localização
    const estoqueExistente = await Estoque.findOne({
      empresa,
      produto,
      localizacao,
    });

    if (estoqueExistente) {
      return res.status(400).json({
        error: 'Já existe estoque para este produto nesta localização',
      });
    }

    // Verificar se produto existe
    const produtoExistente = await Produto.findOne({ _id: produto, empresa });
    if (!produtoExistente) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    const estoque = new Estoque({
      ...req.body,
      empresa,
    });

    await estoque.save();
    res.status(201).json(estoque.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const listar = async (req, res) => {
  try {
    const { localizacao, pagina = 1, limite = 20 } = req.query;
    const empresa = req.usuario.id;

    const filtro = { empresa };
    if (localizacao) filtro.localizacao = { $regex: localizacao, $options: 'i' };

    const paginaNum = parseInt(pagina);
    const limiteNum = parseInt(limite);
    const skip = (paginaNum - 1) * limiteNum;

    const estoques = await Estoque.find(filtro)
      .populate('produto', 'nome sku categoria precoUnitario')
      .limit(limiteNum)
      .skip(skip)
      .sort({ localizacao: 1 });

    const total = await Estoque.countDocuments(filtro);

    res.json({
      estoques: estoques.map((e) => e.toJSON()),
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

    const estoque = await Estoque.findOne({ _id: id, empresa })
      .populate('produto', 'nome sku categoria precoUnitario');

    if (!estoque) {
      return res.status(404).json({ error: 'Estoque não encontrado' });
    }

    // Obter movimentações recentes
    const movimentacoes = await Movimentacao.find({ estoque: id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('tipo quantidade motivo usuarioResponsavel createdAt');

    const resposta = estoque.toJSON();
    resposta.movimentacoesRecentes = movimentacoes;

    res.json(resposta);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa = req.usuario.id;

    const estoque = await Estoque.findOneAndUpdate(
      { _id: id, empresa },
      req.body,
      { new: true, runValidators: true }
    );

    if (!estoque) {
      return res.status(404).json({ error: 'Estoque não encontrado' });
    }

    res.json(estoque.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deletar = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa = req.usuario.id;

    const estoque = await Estoque.findOneAndDelete({ _id: id, empresa });
    if (!estoque) {
      return res.status(404).json({ error: 'Estoque não encontrado' });
    }

    // Deletar movimentações associadas
    await Movimentacao.deleteMany({ estoque: id });

    // Desativar alertas associados
    await AlertaEstoque.updateMany(
      { estoque: id },
      { ativo: false }
    );

    res.json({ message: 'Estoque deletado com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const adicionarQuantidade = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantidade, motivo, usuarioResponsavel, referencia } = req.body;
    const empresa = req.usuario.id;

    if (quantidade <= 0) {
      return res.status(400).json({ error: 'Quantidade deve ser maior que zero' });
    }

    const estoque = await Estoque.findOne({ _id: id, empresa });
    if (!estoque) {
      return res.status(404).json({ error: 'Estoque não encontrado' });
    }

    // Adicionar quantidade
    estoque.adicionarQuantidade(quantidade);
    estoque.dataUltimaMovimentacao = new Date();
    await estoque.save();

    // Registrar movimentação
    const movimentacao = await Movimentacao.create({
      empresa,
      produto: estoque.produto,
      estoque: id,
      tipo: 'entrada',
      quantidade,
      motivo,
      usuarioResponsavel,
      referencia: referencia || {},
      status: 'realizada',
    });

    // Verificar e desativar alertas se estoque volta ao normal
    await AlertaEstoque.updateMany(
      { estoque: id, tipo: 'estoque_baixo', ativo: true },
      { ativo: false }
    );

    res.json({
      estoque: estoque.toJSON(),
      movimentacao: movimentacao.toJSON(),
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const removerQuantidade = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantidade, motivo, usuarioResponsavel, referencia } = req.body;
    const empresa = req.usuario.id;

    if (quantidade <= 0) {
      return res.status(400).json({ error: 'Quantidade deve ser maior que zero' });
    }

    const estoque = await Estoque.findOne({ _id: id, empresa });
    if (!estoque) {
      return res.status(404).json({ error: 'Estoque não encontrado' });
    }

    // Verificar disponibilidade
    if (estoque.quantidadeDisponivel < quantidade) {
      return res.status(400).json({ error: 'Quantidade disponível insuficiente' });
    }

    // Remover quantidade
    estoque.removerQuantidade(quantidade);
    estoque.dataUltimaMovimentacao = new Date();
    await estoque.save();

    // Registrar movimentação
    const movimentacao = await Movimentacao.create({
      empresa,
      produto: estoque.produto,
      estoque: id,
      tipo: 'saida',
      quantidade,
      motivo,
      usuarioResponsavel,
      referencia: referencia || {},
      status: 'realizada',
    });

    // Verificar se deve criar alerta de estoque baixo
    if (estoque.estaComEstoqueBaixo()) {
      await AlertaEstoque.criarAlertaEstoque(
        empresa,
        estoque.produto,
        id,
        'estoque_baixo',
        estoque.quantidadeAtual,
        estoque.estoqueMinimoLocal
      );
    }

    res.json({
      estoque: estoque.toJSON(),
      movimentacao: movimentacao.toJSON(),
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const reservarQuantidade = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantidade, usuarioResponsavel } = req.body;
    const empresa = req.usuario.id;

    const estoque = await Estoque.findOne({ _id: id, empresa });
    if (!estoque) {
      return res.status(404).json({ error: 'Estoque não encontrado' });
    }

    estoque.reservarQuantidade(quantidade);
    await estoque.save();

    res.json(estoque.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const liberarReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantidade } = req.body;
    const empresa = req.usuario.id;

    const estoque = await Estoque.findOne({ _id: id, empresa });
    if (!estoque) {
      return res.status(404).json({ error: 'Estoque não encontrado' });
    }

    estoque.liberarReserva(quantidade);
    await estoque.save();

    res.json(estoque.toJSON());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const obterPorProduto = async (req, res) => {
  try {
    const { produtoId } = req.params;
    const empresa = req.usuario.id;

    const estoques = await Estoque.find({ produto: produtoId, empresa })
      .populate('produto', 'nome sku categoria precoUnitario');

    const totalQuantidade = estoques.reduce((sum, e) => sum + e.quantidadeAtual, 0);
    const totalDisponivel = estoques.reduce((sum, e) => sum + e.quantidadeDisponivel, 0);

    res.json({
      estoques: estoques.map((e) => e.toJSON()),
      resumo: {
        totalQuantidade,
        totalDisponivel,
        localizacoes: estoques.length,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const obterResumoEstoque = async (req, res) => {
  try {
    const empresa = req.usuario.id;

    // Total de itens em estoque
    const estoques = await Estoque.find({ empresa });

    const resumo = {
      totalProdutosUnicos: await Estoque.countDocuments({ empresa }),
      totalQuantidade: estoques.reduce((sum, e) => sum + e.quantidadeAtual, 0),
      totalDisponivel: estoques.reduce((sum, e) => sum + e.quantidadeDisponivel, 0),
      totalReservado: estoques.reduce((sum, e) => sum + e.quantidadeReservada, 0),
      localizacoes: [...new Set(estoques.map((e) => e.localizacao))].length,
    };

    // Produtos com baixo estoque
    const estoqueBaixo = estoques.filter((e) => e.estaComEstoqueBaixo());

    // Produtos acima do máximo
    const estoqueAlto = estoques.filter((e) => e.estaAcimaDoMaximo());

    res.json({
      resumo,
      alertas: {
        estoqueBaixo: estoqueBaixo.length,
        estoqueAlto: estoqueAlto.length,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
