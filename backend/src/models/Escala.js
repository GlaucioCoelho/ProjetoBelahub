import mongoose from 'mongoose';

const escalaSchema = new mongoose.Schema(
  {
    funcionario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Funcionario',
      required: [true, 'Funcionário é obrigatório'],
    },
    empresa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'Empresa é obrigatória'],
    },
    data: {
      type: Date,
      required: [true, 'Data é obrigatória'],
    },
    horarioInicio: {
      type: String,
      required: [true, 'Horário de início é obrigatório'],
      match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'],
    },
    horarioFim: {
      type: String,
      required: [true, 'Horário de término é obrigatório'],
      match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'],
    },
    tipo: {
      type: String,
      enum: ['trabalho', 'folga', 'pausa', 'feriado', 'afastamento'],
      default: 'trabalho',
    },
    observacoes: {
      type: String,
      maxlength: 200,
    },
  },
  { timestamps: true }
);

escalaSchema.index({ funcionario: 1, data: 1 });
escalaSchema.index({ empresa: 1, data: 1 });
escalaSchema.index({ funcionario: 1, 'data': 1, 'horarioInicio': 1, 'horarioFim': 1 });

escalaSchema.statics.verificarConflito = async function (
  funcionario,
  data,
  horarioInicio,
  horarioFim,
  excludeId = null
) {
  const [hInicio, mInicio] = horarioInicio.split(':').map(Number);
  const [hFim, mFim] = horarioFim.split(':').map(Number);
  const inicioMs = hInicio * 60 + mInicio;
  const fimMs = hFim * 60 + mFim;

  const dataInicio = new Date(data);
  dataInicio.setHours(0, 0, 0, 0);
  const dataFim = new Date(data);
  dataFim.setHours(23, 59, 59, 999);

  const conflitos = await this.find({
    funcionario,
    data: {
      $gte: dataInicio,
      $lte: dataFim,
    },
    tipo: { $in: ['trabalho', 'pausa'] },
  });

  for (const escala of conflitos) {
    if (excludeId && escala._id.equals(excludeId)) continue;

    const [h1, m1] = escala.horarioInicio.split(':').map(Number);
    const [h2, m2] = escala.horarioFim.split(':').map(Number);
    const existeInicio = h1 * 60 + m1;
    const existeFim = h2 * 60 + m2;

    if (inicioMs < existeFim && fimMs > existeInicio) {
      return true;
    }
  }

  return false;
};

escalaSchema.methods.calcularDuracao = function () {
  const [hInicio, mInicio] = this.horarioInicio.split(':').map(Number);
  const [hFim, mFim] = this.horarioFim.split(':').map(Number);
  const inicioMs = hInicio * 60 + mInicio;
  const fimMs = hFim * 60 + mFim;
  return fimMs - inicioMs;
};

escalaSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.dataFormatada = new Date(this.data).toLocaleDateString('pt-BR');
  obj.diadasemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'][new Date(this.data).getDay()];
  obj.duracao = this.calcularDuracao();
  return obj;
};

export default mongoose.model('Escala', escalaSchema);
