import mongoose from 'mongoose';

const notificacoesSchema = new mongoose.Schema(
  {
    empresa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
      unique: true
    },
    emailLembretesAgendamento: {
      type: Boolean,
      default: true
    },
    emailNovoCliente: {
      type: Boolean,
      default: true
    },
    emailPagamento: {
      type: Boolean,
      default: true
    },
    notificacoesPush: {
      type: Boolean,
      default: false
    },
  },
  { timestamps: true }
);

export default mongoose.model('Notificacoes', notificacoesSchema);
