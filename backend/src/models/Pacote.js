import mongoose from 'mongoose';

const pacoteSchema = new mongoose.Schema(
  {
    empresa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },
    nome: {
      type: String,
      required: [true, 'Nome do pacote é obrigatório'],
      trim: true,
    },
    descricao: {
      type: String,
      maxlength: 600,
    },
    servicos: [
      {
        nome:       { type: String, required: true },
        quantidade: { type: Number, default: 1, min: 1 },
      },
    ],
    preco: {
      type: Number,
      required: [true, 'Preço é obrigatório'],
      min: [0, 'Preço não pode ser negativo'],
    },
    precoOriginal: {
      type: Number,
      min: [0, 'Preço original não pode ser negativo'],
    },
    validadeDias: {
      type: Number,
      default: 90,
      min: [1, 'Validade mínima é 1 dia'],
    },
    sessoes: {
      type: Number,
      default: 1,
      min: [1, 'Sessões mínimas é 1'],
    },
    ativo: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

pacoteSchema.index({ empresa: 1, ativo: 1 });

pacoteSchema.methods.toJSON = function () {
  const obj = this.toObject();
  const desconto = obj.precoOriginal > 0
    ? Math.round((1 - obj.preco / obj.precoOriginal) * 100)
    : 0;
  obj.desconto  = desconto;
  obj.criadoEm  = this.createdAt?.toLocaleDateString('pt-BR');
  return obj;
};

export default mongoose.model('Pacote', pacoteSchema);
