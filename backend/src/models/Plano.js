import mongoose from 'mongoose';

const planoSchema = new mongoose.Schema({
  nome:        { type: String, required: true, trim: true },
  slug:        { type: String, required: true, unique: true, lowercase: true },
  preco:       { type: Number, required: true, min: 0 },
  precoAnual:  { type: Number, default: 0 },
  cor:         { type: String, default: '#7c3aed' },
  descricao:   { type: String, default: '' },
  destaque:    { type: Boolean, default: false },
  ativo:       { type: Boolean, default: true },
  limites: {
    funcionarios:      { type: Number, default: 5 },
    clientes:          { type: Number, default: 200 },
    agendamentosMes:   { type: Number, default: 500 },
  },
  recursos: { type: [String], default: [] },
}, { timestamps: true });

export default mongoose.model('Plano', planoSchema);
