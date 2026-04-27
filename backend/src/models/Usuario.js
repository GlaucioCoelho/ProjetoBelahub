import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const usuarioSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
      maxLength: 100
    },
    email: {
      type: String,
      required: [true, 'Email é obrigatório'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
    },
    senha: {
      type: String,
      required: [true, 'Senha é obrigatória'],
      minLength: 6,
      select: false
    },
    telefone: {
      type: String,
      default: ''
    },
    nomeEmpresa: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'gerente', 'profissional'],
      default: 'gerente'
    },
    ativo: { type: Boolean, default: true },
    plano:       { type: String, enum: ['starter', 'pro', 'enterprise'], default: 'starter' },
    planoStatus: { type: String, enum: ['ativo', 'trial', 'suspenso', 'cancelado'], default: 'trial' },
    trialExpira: { type: Date },
    ultimoAcesso: { type: Date },
    metadados: {
      cnpj:        { type: String, default: '' },
      cidade:      { type: String, default: '' },
      estado:      { type: String, default: '' },
      tipoNegocio: { type: String, enum: ['salao', 'barbearia', 'studio', 'spa', 'outro'], default: 'salao' },
    },
  },
  { timestamps: true }
);

// Hash da senha antes de salvar
usuarioSchema.pre('save', async function(next) {
  if (!this.isModified('senha')) {
    return next();
  }

  try {
    const salt = await bcryptjs.genSalt(10);
    this.senha = await bcryptjs.hash(this.senha, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar senhas
usuarioSchema.methods.compararSenha = async function(senhaInserida) {
  return await bcryptjs.compare(senhaInserida, this.senha);
};

// Remover senha ao fazer toJSON
usuarioSchema.methods.toJSON = function() {
  const usuario = this.toObject();
  delete usuario.senha;
  return usuario;
};

export default mongoose.model('Usuario', usuarioSchema);
