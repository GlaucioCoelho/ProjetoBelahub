import mongoose from 'mongoose';

const alertaEstoqueSchema = new mongoose.Schema(
  {
    empresa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'Empresa é obrigatória'],
    },
    produto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produto',
      required: [true, 'Produto é obrigatório'],
    },
    estoque: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Estoque',
      required: [true, 'Estoque é obrigatório'],
    },
    tipo: {
      type: String,
      enum: ['estoque_baixo', 'estoque_critico', 'estoque_maximo_excedido', 'produto_vencido'],
      required: [true, 'Tipo de alerta é obrigatório'],
    },
    severidade: {
      type: String,
      enum: ['baixa', 'media', 'alta', 'critica'],
      default: 'media',
    },
    quantidadeAtual: {
      type: Number,
      required: [true, 'Quantidade atual é obrigatória'],
    },
    quantidadeLimite: {
      type: Number,
      required: [true, 'Quantidade limite é obrigatória'],
    },
    descricao: {
      type: String,
      maxlength: 500,
    },
    ativo: {
      type: Boolean,
      default: true,
    },
    lido: {
      type: Boolean,
      default: false,
    },
    dataLeitura: {
      type: Date,
    },
    acaoTomada: {
      tipo: {
        type: String,
        enum: ['pedido_compra', 'transferencia', 'pausa_venda', 'ignorado', 'nenhuma'],
        default: 'nenhuma',
      },
      descricao: String,
      data: Date,
      usuarioResponsavel: String,
    },
  },
  { timestamps: true }
);

// Índices para melhor performance
alertaEstoqueSchema.index({ empresa: 1, ativo: 1, lido: 1 });
alertaEstoqueSchema.index({ empresa: 1, tipo: 1, severidade: 1 });
alertaEstoqueSchema.index({ empresa: 1, produto: 1, createdAt: -1 });
alertaEstoqueSchema.index({ ativo: 1, lido: 1, createdAt: -1 });

// Método estático para criar alerta automático
alertaEstoqueSchema.statics.criarAlertaEstoque = async function (
  empresa,
  produto,
  estoque,
  tipo,
  quantidadeAtual,
  quantidadeLimite
) {
  // Verificar se já existe um alerta ativo para este estoque
  const alertaExistente = await this.findOne({
    empresa,
    estoque,
    tipo,
    ativo: true,
  });

  if (alertaExistente) {
    // Atualizar alerta existente
    alertaExistente.quantidadeAtual = quantidadeAtual;
    await alertaExistente.save();
    return alertaExistente;
  }

  // Criar novo alerta
  const severidade = this.determinarSeveridade(tipo, quantidadeAtual, quantidadeLimite);

  const descricao = this.obterDescricaoAlerta(tipo, quantidadeAtual, quantidadeLimite);

  return this.create({
    empresa,
    produto,
    estoque,
    tipo,
    severidade,
    quantidadeAtual,
    quantidadeLimite,
    descricao,
  });
};

// Método estático para determinar severidade
alertaEstoqueSchema.statics.determinarSeveridade = function (tipo, quantidade, limite) {
  if (tipo === 'estoque_critico') return 'critica';

  if (tipo === 'estoque_maximo_excedido') {
    const percentualExcesso = ((quantidade - limite) / limite) * 100;
    return percentualExcesso > 50 ? 'alta' : 'media';
  }

  if (tipo === 'estoque_baixo') {
    if (quantidade === 0) return 'critica';
    if (quantidade <= limite * 0.25) return 'alta';
    return 'media';
  }

  return 'media';
};

// Método estático para obter descrição do alerta
alertaEstoqueSchema.statics.obterDescricaoAlerta = function (tipo, quantidade, limite) {
  const descricoes = {
    estoque_baixo: `Estoque baixo: ${quantidade} unidades (mínimo: ${limite})`,
    estoque_critico: `⚠️ ESTOQUE CRÍTICO: ${quantidade} unidades (mínimo: ${limite})`,
    estoque_maximo_excedido: `Estoque acima do máximo: ${quantidade} unidades (máximo: ${limite})`,
    produto_vencido: `Produto com vencimento próximo ou vencido`,
  };
  return descricoes[tipo] || 'Alerta de estoque';
};

// Método para marcar como lido
alertaEstoqueSchema.methods.marcarComoLido = function () {
  this.lido = true;
  this.dataLeitura = new Date();
  return this.save();
};

// Método para registrar ação tomada
alertaEstoqueSchema.methods.registrarAcao = function (tipo, descricao, usuarioResponsavel) {
  this.acaoTomada = {
    tipo,
    descricao,
    data: new Date(),
    usuarioResponsavel,
  };
  this.ativo = false;
  return this.save();
};

// Método estático para listar alertas não lidos
alertaEstoqueSchema.statics.obterNaoLidos = function (empresa) {
  return this.find({ empresa, ativo: true, lido: false })
    .populate('produto', 'nome sku categoria')
    .populate('estoque', 'localizacao quantidadeAtual')
    .sort({ severidade: -1, createdAt: -1 });
};

// Método estático para obter resumo de alertas
alertaEstoqueSchema.statics.obterResumo = function (empresa) {
  return this.aggregate([
    { $match: { empresa: new mongoose.Types.ObjectId(empresa), ativo: true } },
    {
      $group: {
        _id: {
          tipo: '$tipo',
          severidade: '$severidade',
        },
        total: { $sum: 1 },
      },
    },
    { $sort: { '_id.severidade': -1 } },
  ]);
};

// Método para formatar resposta
alertaEstoqueSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.criadoEm = this.createdAt?.toLocaleDateString('pt-BR');
  obj.leitura = this.dataLeitura?.toLocaleDateString('pt-BR');
  return obj;
};

export default mongoose.model('AlertaEstoque', alertaEstoqueSchema);
