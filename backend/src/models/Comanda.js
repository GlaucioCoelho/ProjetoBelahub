import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  nome:       { type: String, required: true },
  quantidade: { type: Number, default: 1, min: 1 },
  preco:      { type: Number, default: 0, min: 0 },
}, { _id: false });

const comandaSchema = new mongoose.Schema({
  empresa: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  numero:  { type: Number },
  nomeCliente:  { type: String, required: [true, 'Nome do cliente é obrigatório'] },
  profissional: { type: String, required: [true, 'Profissional é obrigatório'] },
  data:         { type: Date, default: Date.now },
  horarioAbertura: { type: String, default: () => new Date().toTimeString().substring(0, 5) },
  itens:        { type: [itemSchema], default: [] },
  status:       { type: String, enum: ['aberta', 'fechada'], default: 'aberta' },
  observacoes:  { type: String, maxlength: 500 },
}, { timestamps: true });

comandaSchema.pre('save', async function (next) {
  if (this.isNew && !this.numero) {
    const last = await this.constructor.findOne({ empresa: this.empresa }).sort({ numero: -1 }).select('numero');
    this.numero = (last?.numero || 0) + 1;
  }
  next();
});

comandaSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.total = obj.itens.reduce((sum, i) => sum + i.quantidade * i.preco, 0);
  obj.criadoEm = obj.createdAt;
  return obj;
};

export default mongoose.model('Comanda', comandaSchema);
