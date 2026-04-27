import mongoose from 'mongoose';

const movimentacaoSchema = new mongoose.Schema(
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
      enum: ['entrada', 'saida', 'ajuste', 'devolucao', 'perda'],
      required: [true, 'Tipo de movimentação é obrigatório'],
    },
    quantidade: {
      type: Number,
      required: [true, 'Quantidade é obrigatória'],
      min: [0, 'Quantidade não pode ser negativa'],
    },
    motivo: {
      type: String,
      enum: ['compra', 'devolucao_fornecedor', 'transferencia_interna', 'contagem', 'venda', 'uso_interno', 'devolucao_cliente', 'correcao_estoque', 'ajuste_fisico', 'reconciliacao', 'defeituoso', 'vencido', 'cliente_insatisfeito', 'roubo', 'dano', 'obsoleto', 'outro'],
      required: [true, 'Motivo é obrigatório'],
    },
    referencia: {
      agendamento: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agendamento',
      },
      notaFiscal: {
        type: String,
      },
      documentoInterno: {
        type: String,
      },
    },
    usuarioResponsavel: {
      type: String,
      required: [true, 'Usuário responsável é obrigatório'],
    },
    observacoes: {
      type: String,
      maxlength: 500,
    },
    dataPlanejada: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['planejada', 'realizada', 'cancelada'],
      default: 'realizada',
    },
  },
  { timestamps: true }
);

// Índices para melhor performance
movimentacaoSchema.index({ empresa: 1, produto: 1, createdAt: -1 });
movimentacaoSchema.index({ empresa: 1, estoque: 1, createdAt: -1 });
movimentacaoSchema.index({ empresa: 1, tipo: 1, createdAt: -1 });
movimentacaoSchema.index({ empresa: 1, status: 1 });
movimentacaoSchema.index({ 'referencia.agendamento': 1 });

// Método estático para listar movimentações com filtros
movimentacaoSchema.statics.listarComFiltros = async function (empresa, filtros = {}) {
  const {
    produto,
    tipo,
    motivo,
    status,
    dataInicio,
    dataFim,
    pagina = 1,
    limite = 20,
  } = filtros;

  const query = { empresa };
  if (produto) query.produto = produto;
  if (tipo) query.tipo = tipo;
  if (motivo) query.motivo = motivo;
  if (status) query.status = status;

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

  const paginaNum = parseInt(pagina);
  const limiteNum = parseInt(limite);
  const skip = (paginaNum - 1) * limiteNum;

  const movimentacoes = await this.find(query)
    .populate('produto', 'nome sku categoria')
    .limit(limiteNum)
    .skip(skip)
    .sort({ createdAt: -1 });

  const total = await this.countDocuments(query);

  return {
    movimentacoes,
    total,
    paginas: Math.ceil(total / limiteNum),
    paginaAtual: paginaNum,
  };
};

// Método para obter resumo de movimentações
movimentacaoSchema.statics.obterResumo = async function (empresa, dataInicio, dataFim) {
  const query = { empresa, status: 'realizada' };

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

  const resumo = await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$tipo',
        totalQuantidade: { $sum: '$quantidade' },
        totalMovimentacoes: { $sum: 1 },
      },
    },
  ]);

  return resumo;
};

// Método para formatar resposta
movimentacaoSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.dataMov = this.createdAt?.toLocaleDateString('pt-BR');
  obj.horaMov = this.createdAt?.toLocaleTimeString('pt-BR');
  return obj;
};

export default mongoose.model('Movimentacao', movimentacaoSchema);
