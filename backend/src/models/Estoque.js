import mongoose from 'mongoose';

const estoqueSchema = new mongoose.Schema(
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
    localizacao: {
      type: String,
      required: [true, 'Localização é obrigatória'],
      trim: true,
    },
    quantidadeAtual: {
      type: Number,
      required: [true, 'Quantidade é obrigatória'],
      default: 0,
      min: [0, 'Quantidade não pode ser negativa'],
    },
    quantidadeReservada: {
      type: Number,
      default: 0,
      min: [0, 'Quantidade reservada não pode ser negativa'],
    },
    quantidadeDisponivel: {
      type: Number,
      default: function () {
        return this.quantidadeAtual - this.quantidadeReservada;
      },
    },
    estoqueMinimoLocal: {
      type: Number,
      default: 5,
      min: [0, 'Estoque mínimo não pode ser negativo'],
    },
    estoqueMaximoLocal: {
      type: Number,
      min: [0, 'Estoque máximo não pode ser negativo'],
    },
    dataUltimaContagem: {
      type: Date,
    },
    observacoes: {
      type: String,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// Índices para melhor performance
estoqueSchema.index({ empresa: 1, produto: 1, localizacao: 1 }, { unique: true });
estoqueSchema.index({ empresa: 1, localizacao: 1 });
estoqueSchema.index({ empresa: 1, quantidadeAtual: 1 });

// Pre-save hook para atualizar quantidadeDisponivel
estoqueSchema.pre('save', function (next) {
  this.quantidadeDisponivel = this.quantidadeAtual - this.quantidadeReservada;
  next();
});

// Método estático para verificar disponibilidade
estoqueSchema.statics.verificarDisponibilidade = async function (produtoId, quantidade) {
  const estoque = await this.find({ produto: produtoId });
  const totalDisponivel = estoque.reduce((sum, e) => sum + e.quantidadeDisponivel, 0);
  return totalDisponivel >= quantidade;
};

// Método para adicionar quantidade
estoqueSchema.methods.adicionarQuantidade = function (quantidade) {
  this.quantidadeAtual += quantidade;
  this.quantidadeDisponivel = this.quantidadeAtual - this.quantidadeReservada;
};

// Método para remover quantidade
estoqueSchema.methods.removerQuantidade = function (quantidade) {
  if (this.quantidadeAtual < quantidade) {
    throw new Error('Quantidade insuficiente no estoque');
  }
  this.quantidadeAtual -= quantidade;
  this.quantidadeDisponivel = this.quantidadeAtual - this.quantidadeReservada;
};

// Método para reservar quantidade
estoqueSchema.methods.reservarQuantidade = function (quantidade) {
  if (this.quantidadeDisponivel < quantidade) {
    throw new Error('Quantidade disponível insuficiente para reservar');
  }
  this.quantidadeReservada += quantidade;
  this.quantidadeDisponivel = this.quantidadeAtual - this.quantidadeReservada;
};

// Método para liberar reserva
estoqueSchema.methods.liberarReserva = function (quantidade) {
  this.quantidadeReservada = Math.max(0, this.quantidadeReservada - quantidade);
  this.quantidadeDisponivel = this.quantidadeAtual - this.quantidadeReservada;
};

// Método para verificar se está com estoque baixo
estoqueSchema.methods.estaComEstoqueBaixo = function () {
  return this.quantidadeAtual <= this.estoqueMinimoLocal;
};

// Método para verificar se está acima do máximo
estoqueSchema.methods.estaAcimaDoMaximo = function () {
  if (!this.estoqueMaximoLocal) return false;
  return this.quantidadeAtual > this.estoqueMaximoLocal;
};

// Método para formatar resposta
estoqueSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.emEstoqueBaixo = this.estaComEstoqueBaixo();
  obj.acimaDoMaximo = this.estaAcimaDoMaximo();
  obj.atualizadoEm = this.updatedAt?.toLocaleDateString('pt-BR');
  return obj;
};

export default mongoose.model('Estoque', estoqueSchema);
