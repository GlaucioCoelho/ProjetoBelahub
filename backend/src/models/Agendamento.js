import mongoose from 'mongoose';

const agendamentoSchema = new mongoose.Schema(
  {
    empresa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
    },
    cliente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cliente',
    },
    nomeCliente: {
      type: String,
    },
    profissional: {
      type: String,
      required: [true, 'Profissional é obrigatório'],
    },
    servico: {
      type: String,
      required: [true, 'Serviço é obrigatório'],
    },
    dataAgendamento: {
      type: Date,
      required: [true, 'Data do agendamento é obrigatória'],
    },
    horarioInicio: {
      type: String,
      required: [true, 'Horário de início é obrigatório'],
      match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'],
    },
    duracao: {
      type: Number,
      required: [true, 'Duração é obrigatória'],
      min: 15,
      max: 480,
      default: 60,
    },
    status: {
      type: String,
      enum: ['agendado', 'concluido', 'cancelado', 'nao_compareceu', 'aguardando'],
      default: 'agendado',
    },
    preco: {
      type: Number,
      min: 0,
    },
    notas: {
      type: String,
      maxlength: 500,
    },
    telefoneProfissional: {
      type: String,
    },
    pagamento: {
      type: String,
      enum: ['Cartão', 'Dinheiro', 'PIX', 'Transferência', 'Pix'],
      default: 'Cartão',
    },
    lembreteEnviado: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

agendamentoSchema.index({ profissional: 1, dataAgendamento: 1, horarioInicio: 1 });

agendamentoSchema.statics.verificarConflito = async function (
  profissional,
  dataAgendamento,
  horarioInicio,
  duracao,
  excludeId = null
) {
  const [horas, minutos] = horarioInicio.split(':').map(Number);
  const inicioMs = horas * 60 + minutos;
  const fimMs = inicioMs + duracao;

  const conflitos = await this.find({
    profissional,
    dataAgendamento: {
      $gte: new Date(dataAgendamento).setHours(0, 0, 0, 0),
      $lt: new Date(dataAgendamento).setHours(23, 59, 59, 999),
    },
    status: { $in: ['agendado', 'concluido'] },
  });

  for (const agendamento of conflitos) {
    if (excludeId && agendamento._id.equals(excludeId)) continue;

    const [h, m] = agendamento.horarioInicio.split(':').map(Number);
    const existeInicio = h * 60 + m;
    const existeFim = existeInicio + agendamento.duracao;

    if (inicioMs < existeFim && fimMs > existeInicio) {
      return true;
    }
  }

  return false;
};

agendamentoSchema.methods.obterHorarioFim = function () {
  const [horas, minutos] = this.horarioInicio.split(':').map(Number);
  const fimMs = horas * 60 + minutos + this.duracao;
  const h = Math.floor(fimMs / 60);
  const m = fimMs % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

agendamentoSchema.methods.estaNoPassado = function () {
  const agora = new Date();
  return this.dataAgendamento < agora;
};

agendamentoSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.horarioFim = this.obterHorarioFim();
  obj.dataFormatada = new Date(this.dataAgendamento).toLocaleDateString('pt-BR');
  return obj;
};

export default mongoose.model('Agendamento', agendamentoSchema);
