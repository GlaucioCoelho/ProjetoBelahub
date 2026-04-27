import mongoose from 'mongoose';

const servicoSchema = new mongoose.Schema(
  {
    empresa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'Empresa é obrigatória'],
    },
    nome: {
      type: String,
      required: [true, 'Nome do serviço é obrigatório'],
      trim: true,
    },
    categoria: {
      type: String,
      enum: ['corte', 'coloracao', 'tratamento', 'estetica', 'manicure', 'barba', 'massagem', 'maquiagem', 'depilacao', 'outro'],
      default: 'outro',
    },
    duracao: {
      type: Number,
      required: [true, 'Duração é obrigatória'],
      min: [5, 'Duração mínima é 5 minutos'],
    },
    preco: {
      type: Number,
      required: [true, 'Preço é obrigatório'],
      min: [0, 'Preço não pode ser negativo'],
    },
    comissao: {
      type: Number,
      default: 40,
      min: [0, 'Comissão não pode ser negativa'],
      max: [100, 'Comissão não pode ultrapassar 100%'],
    },
    descricao: {
      type: String,
      maxlength: 500,
    },
    ativo: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

servicoSchema.index({ empresa: 1, categoria: 1 });
servicoSchema.index({ empresa: 1, ativo: 1 });

servicoSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.criadoEm = this.createdAt?.toLocaleDateString('pt-BR');
  return obj;
};

export default mongoose.model('Servico', servicoSchema);
