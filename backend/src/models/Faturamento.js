import mongoose from 'mongoose';

const faturamentoSchema = new mongoose.Schema(
  {
    empresa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'Empresa é obrigatória'],
    },
    numeroNota: {
      type: String,
      required: [true, 'Número da nota é obrigatório'],
      unique: true,
    },
    dataEmissao: {
      type: Date,
      required: [true, 'Data de emissão é obrigatória'],
      default: Date.now,
    },
    cliente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cliente',
      required: [true, 'Cliente é obrigatório'],
    },
    itens: [
      {
        descricao: String,
        quantidade: Number,
        valorUnitario: Number,
        valorTotal: Number,
        agendamento: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Agendamento',
        },
      },
    ],
    valorTotal: {
      type: Number,
      required: [true, 'Valor total é obrigatório'],
    },
    desconto: {
      type: Number,
      default: 0,
    },
    impostos: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['rascunho', 'emitida', 'paga', 'cancelada'],
      default: 'rascunho',
    },
    dataPagamento: {
      type: Date,
    },
    metodo: {
      type: String,
      enum: ['cartao', 'dinheiro', 'transferencia', 'pix'],
    },
    referencia: {
      type: String,
    },
    observacoes: {
      type: String,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

faturamentoSchema.index({ empresa: 1, dataEmissao: 1 });
faturamentoSchema.index({ cliente: 1 });
faturamentoSchema.index({ status: 1 });
faturamentoSchema.index({ numeroNota: 1 });

faturamentoSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.dataEmissaoFormatada = new Date(this.dataEmissao).toLocaleDateString('pt-BR');
  obj.valorTotalFormatado = this.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  return obj;
};

export default mongoose.model('Faturamento', faturamentoSchema);
