import mongoose from 'mongoose';

const transacaoSchema = new mongoose.Schema(
  {
    empresa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'Empresa é obrigatória'],
    },
    tipo: {
      type: String,
      enum: ['receita', 'despesa', 'comissao', 'devolucao'],
      required: [true, 'Tipo de transação é obrigatório'],
    },
    descricao: {
      type: String,
      required: [true, 'Descrição é obrigatória'],
    },
    valor: {
      type: Number,
      required: [true, 'Valor é obrigatório'],
      min: [0, 'Valor não pode ser negativo'],
    },
    status: {
      type: String,
      enum: ['pendente', 'processando', 'concluida', 'falha', 'reembolsada'],
      default: 'pendente',
    },
    data: {
      type: Date,
      required: [true, 'Data é obrigatória'],
      default: Date.now,
    },
    cliente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cliente',
    },
    funcionario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Funcionario',
    },
    agendamento: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agendamento',
    },
    stripeId: {
      type: String,
    },
    stripePaymentIntentId: {
      type: String,
    },
    metodo: {
      type: String,
      enum: ['cartao', 'dinheiro', 'transferencia', 'pix'],
      default: 'cartao',
    },
    notaFiscal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faturamento',
    },
    observacoes: {
      type: String,
      maxlength: 500,
    },
    categoria: {
      type: String,
      default: 'Outros',
    },
    recorrente: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

transacaoSchema.index({ empresa: 1, data: 1 });
transacaoSchema.index({ cliente: 1, data: 1 });
transacaoSchema.index({ tipo: 1, status: 1 });
transacaoSchema.index({ stripePaymentIntentId: 1 });

transacaoSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.dataFormatada = new Date(this.data).toLocaleDateString('pt-BR');
  obj.valorFormatado = this.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  return obj;
};

export default mongoose.model('Transacao', transacaoSchema);
