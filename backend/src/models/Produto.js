import mongoose from 'mongoose';

const produtoSchema = new mongoose.Schema(
  {
    empresa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'Empresa é obrigatória'],
    },
    sku: {
      type: String,
      required: [true, 'SKU é obrigatório'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    nome: {
      type: String,
      required: [true, 'Nome do produto é obrigatório'],
      trim: true,
    },
    descricao: {
      type: String,
      maxlength: 1000,
    },
    categoria: {
      type: String,
      enum: ['higiene', 'cosmetico', 'ferramenta', 'uniforme', 'acessorio', 'outro'],
      default: 'outro',
    },
    precoUnitario: {
      type: Number,
      required: [true, 'Preço unitário é obrigatório'],
      min: [0, 'Preço não pode ser negativo'],
    },
    precoCusto: {
      type: Number,
      min: [0, 'Preço de custo não pode ser negativo'],
    },
    unidade: {
      type: String,
      enum: ['un', 'ml', 'g', 'l', 'kg'],
      default: 'un',
    },
    ativo: {
      type: Boolean,
      default: true,
    },
    fornecedor: {
      type: String,
    },
    codigoFornecedor: {
      type: String,
    },
    estoqueMinimoAlerta: {
      type: Number,
      default: 5,
      min: [0, 'Estoque mínimo não pode ser negativo'],
    },
    localizacao: {
      type: String,
      maxlength: 100,
    },
    dataUltimaMovimentacao: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Índices para melhor performance
produtoSchema.index({ empresa: 1, sku: 1 });
produtoSchema.index({ empresa: 1, categoria: 1 });
produtoSchema.index({ empresa: 1, ativo: 1 });
produtoSchema.index({ sku: 1 });

// Validação de SKU único por empresa
produtoSchema.statics.verificarSkuUnico = async function (sku, excludeId = null) {
  const query = { sku: sku.toUpperCase() };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  const existente = await this.findOne(query);
  return !existente;
};

// Método para calcular margem de lucro
produtoSchema.methods.calcularMargem = function () {
  if (!this.precoCusto) return 0;
  return ((this.precoUnitario - this.precoCusto) / this.precoUnitario) * 100;
};

// Método para formatar resposta
produtoSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.margem = this.calcularMargem();
  obj.criadoEm = this.createdAt?.toLocaleDateString('pt-BR');
  return obj;
};

export default mongoose.model('Produto', produtoSchema);
