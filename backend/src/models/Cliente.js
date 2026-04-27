import mongoose from 'mongoose';

const clienteSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
      minlength: [3, 'Nome deve ter pelo menos 3 caracteres'],
    },
    email: {
      type: String,
      lowercase: true,
      sparse: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email inválido'],
    },
    telefone: {
      type: String,
    },
    dataNascimento: {
      type: Date,
    },
    endereco: {
      rua: String,
      numero: String,
      complemento: String,
      bairro: String,
      cidade: String,
      estado: String,
      cep: String,
    },
    empresa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },
    ativo: {
      type: Boolean,
      default: true,
    },
    observacoes: {
      type: String,
      maxlength: 500,
    },
    tag: {
      type: String,
      enum: ['vip', 'regular', 'new'],
      default: 'regular',
    },
    instagram: {
      type: String,
      default: '',
    },
    ultimoAgendamento: {
      type: Date,
    },
    totalAgendamentos: {
      type: Number,
      default: 0,
    },
    gastoTotal: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Índices para performance
clienteSchema.index({ empresa: 1, email: 1 }, { sparse: true });
clienteSchema.index({ empresa: 1, nome: 'text' });

// Método: Atualizar total de gastos
clienteSchema.statics.atualizarGastoTotal = async function (clienteId) {
  const Agendamento = mongoose.model('Agendamento');
  const agendamentos = await Agendamento.find({
    cliente: clienteId,
    status: 'concluido',
  });

  const gastoTotal = agendamentos.reduce((sum, ag) => sum + (ag.preco || 0), 0);
  
  return await this.findByIdAndUpdate(
    clienteId,
    {
      gastoTotal,
      totalAgendamentos: agendamentos.length,
      ultimoAgendamento: agendamentos.length > 0 
        ? agendamentos[agendamentos.length - 1].dataAgendamento 
        : null,
    },
    { new: true }
  );
};

// Método: Formatar para resposta
clienteSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

export default mongoose.model('Cliente', clienteSchema);
