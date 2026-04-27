import mongoose from 'mongoose';

const funcionarioSchema = new mongoose.Schema(
  {
    empresa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'Empresa é obrigatória'],
    },
    nome: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
    },
    email: {
      type: String,
      sparse: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido'],
    },
    telefone: {
      type: String,
    },
    cargo: {
      type: String,
      enum: ['recepcionista', 'manicure', 'pedicure', 'cabeleireiro', 'esteticien', 'massagista', 'gerente', 'outro'],
      default: 'outro',
    },
    salarioBase: {
      type: Number,
      default: 0,
      min: [0, 'Salário não pode ser negativo'],
    },
    comissaoPercentual: {
      type: Number,
      default: 0,
      min: [0, 'Comissão não pode ser negativa'],
      max: [100, 'Comissão não pode ser maior que 100%'],
    },
    dataContratacao: {
      type: Date,
      default: Date.now,
    },
    dataDesligamento: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['ativo', 'inativo', 'afastado', 'demitido'],
      default: 'ativo',
    },
    documentos: {
      cpf: String,
      rg: String,
      pis: String,
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
    observacoes: {
      type: String,
      maxlength: 500,
    },
    totalAtendimentos: {
      type: Number,
      default: 0,
    },
    totalFaturado: {
      type: Number,
      default: 0,
    },
    comissoesPendentes: {
      type: Number,
      default: 0,
    },
    totalComissoes: {
      type: Number,
      default: 0,
    },
    // Campos adicionais para UI
    color: {
      type: String,
      default: '#7c3aed',
    },
    especialidades: {
      type: [String],
      default: [],
    },
    diasTrabalho: {
      type: [String],
      enum: ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'],
      default: ['seg', 'ter', 'qua', 'qui', 'sex'],
    },
    avaliacao: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    horarioTrabalho: {
      inicio: { type: String, default: '09:00' },
      fim:    { type: String, default: '18:00' },
    },
  },
  { timestamps: true }
);

funcionarioSchema.index({ empresa: 1, email: 1 });
funcionarioSchema.index({ cargo: 1, status: 1 });
funcionarioSchema.index({ dataContratacao: 1 });

funcionarioSchema.statics.verificarEmailUnico = async function (email, excludeId = null) {
  const filtro = { email: email.toLowerCase() };
  if (excludeId) filtro._id = { $ne: excludeId };
  const existe = await this.findOne(filtro);
  return !existe;
};

funcionarioSchema.methods.toJSON = function () {
  const obj = this.toObject();
  const dataFormatada = new Date(this.dataContratacao).toLocaleDateString('pt-BR');
  return {
    ...obj,
    dataFormatada,
  };
};

export default mongoose.model('Funcionario', funcionarioSchema);
