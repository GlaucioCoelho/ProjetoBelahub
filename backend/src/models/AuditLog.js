import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  empresa:    { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  usuario:    { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  acao:       { type: String, required: true }, // login, criar, atualizar, deletar, suspender, reativar
  modelo:     { type: String, default: '' },
  registroId: { type: mongoose.Schema.Types.ObjectId },
  descricao:  { type: String, default: '' },
  ip:         { type: String, default: '' },
  metadados:  { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

auditLogSchema.index({ empresa: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
