import Usuario from '../models/Usuario.js';
import Plano from '../models/Plano.js';
import AuditLog from '../models/AuditLog.js';
import Cliente from '../models/Cliente.js';
import Funcionario from '../models/Funcionario.js';
import Agendamento from '../models/Agendamento.js';
import Transacao from '../models/Transacao.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

const PLAN_PRICE = { starter: 0, pro: 149, enterprise: 349 };

async function getTenantUsage(empresaId) {
  const [clientes, funcionarios, agendamentos, transacoes] = await Promise.all([
    Cliente.countDocuments({ empresa: empresaId }),
    Funcionario.countDocuments({ empresa: empresaId }),
    Agendamento.countDocuments({ empresa: empresaId }),
    Transacao.countDocuments({ empresa: empresaId }),
  ]);
  return { clientes, funcionarios, agendamentos, transacoes };
}

// ── Dashboard ──────────────────────────────────────────────────────────────
export const getDashboard = async (req, res) => {
  try {
    const [total, ativos, porPlano, recentes] = await Promise.all([
      Usuario.countDocuments({ role: { $ne: 'super_admin' } }),
      Usuario.countDocuments({ role: { $ne: 'super_admin' }, ativo: true }),
      Usuario.aggregate([
        { $match: { role: { $ne: 'super_admin' } } },
        { $group: { _id: '$plano', total: { $sum: 1 }, ativos: { $sum: { $cond: ['$ativo', 1, 0] } } } },
      ]),
      Usuario.find({ role: { $ne: 'super_admin' } })
        .sort({ createdAt: -1 }).limit(5)
        .select('nome nomeEmpresa email plano planoStatus ativo createdAt'),
    ]);

    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const novosMes = await Usuario.countDocuments({ role: { $ne: 'super_admin' }, createdAt: { $gte: inicioMes } });

    // Simulated MRR
    const mrr = await Usuario.aggregate([
      { $match: { role: { $ne: 'super_admin' }, ativo: true, planoStatus: 'ativo' } },
      { $group: { _id: '$plano', total: { $sum: 1 } } },
    ]);
    const mrrTotal = mrr.reduce((sum, r) => sum + (PLAN_PRICE[r._id] || 0) * r.total, 0);

    res.json({ total, ativos, inativos: total - ativos, novosMes, mrrTotal, porPlano, recentes });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: err.message });
  }
};

// ── Tenants ────────────────────────────────────────────────────────────────
export const listarTenants = async (req, res) => {
  try {
    const { busca, plano, status, pagina = 1, limite = 20 } = req.query;
    const filtro = { role: { $ne: 'super_admin' } };
    if (plano)  filtro.plano = plano;
    if (status === 'ativo')    filtro.ativo = true;
    if (status === 'inativo')  filtro.ativo = false;
    if (busca) {
      filtro.$or = [
        { nome: { $regex: busca, $options: 'i' } },
        { nomeEmpresa: { $regex: busca, $options: 'i' } },
        { email: { $regex: busca, $options: 'i' } },
      ];
    }

    const skip = (Number(pagina) - 1) * Number(limite);
    const [tenants, total] = await Promise.all([
      Usuario.find(filtro).sort({ createdAt: -1 }).skip(skip).limit(Number(limite))
        .select('-senha'),
      Usuario.countDocuments(filtro),
    ]);

    // Batch usage counts
    const ids = tenants.map(t => t._id);
    const [cliCounts, funcCounts] = await Promise.all([
      Cliente.aggregate([{ $match: { empresa: { $in: ids } } }, { $group: { _id: '$empresa', total: { $sum: 1 } } }]),
      Funcionario.aggregate([{ $match: { empresa: { $in: ids } } }, { $group: { _id: '$empresa', total: { $sum: 1 } } }]),
    ]);
    const cliMap  = Object.fromEntries(cliCounts.map(r => [String(r._id), r.total]));
    const funcMap = Object.fromEntries(funcCounts.map(r => [String(r._id), r.total]));

    const lista = tenants.map(t => ({
      ...t.toJSON(),
      uso: {
        clientes:     cliMap[String(t._id)]  || 0,
        funcionarios: funcMap[String(t._id)] || 0,
      },
    }));

    res.json({ sucesso: true, tenants: lista, total, paginas: Math.ceil(total / Number(limite)) });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: err.message });
  }
};

export const obterTenant = async (req, res) => {
  try {
    const tenant = await Usuario.findById(req.params.id).select('-senha');
    if (!tenant) return res.status(404).json({ sucesso: false, mensagem: 'Empresa não encontrada' });
    const uso = await getTenantUsage(tenant._id);
    res.json({ sucesso: true, tenant: { ...tenant.toJSON(), uso } });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: err.message });
  }
};

export const atualizarTenant = async (req, res) => {
  try {
    const campos = ['plano', 'planoStatus', 'ativo', 'nomeEmpresa', 'telefone', 'metadados'];
    const update = {};
    campos.forEach(c => { if (req.body[c] !== undefined) update[c] = req.body[c]; });

    const tenant = await Usuario.findByIdAndUpdate(req.params.id, update, { new: true }).select('-senha');
    if (!tenant) return res.status(404).json({ sucesso: false, mensagem: 'Empresa não encontrada' });

    await AuditLog.create({
      usuario: req.usuario.id,
      acao: 'atualizar_tenant',
      modelo: 'Usuario',
      registroId: tenant._id,
      descricao: `Tenant ${tenant.nomeEmpresa} atualizado`,
      metadados: update,
    });

    res.json({ sucesso: true, tenant });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: err.message });
  }
};

export const suspenderTenant = async (req, res) => {
  try {
    const tenant = await Usuario.findByIdAndUpdate(req.params.id, { ativo: false, planoStatus: 'suspenso' }, { new: true }).select('-senha');
    if (!tenant) return res.status(404).json({ sucesso: false, mensagem: 'Empresa não encontrada' });
    await AuditLog.create({ usuario: req.usuario.id, acao: 'suspender', modelo: 'Usuario', registroId: tenant._id, descricao: `Tenant ${tenant.nomeEmpresa} suspenso` });
    res.json({ sucesso: true, tenant });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: err.message });
  }
};

export const reativarTenant = async (req, res) => {
  try {
    const tenant = await Usuario.findByIdAndUpdate(req.params.id, { ativo: true, planoStatus: 'ativo' }, { new: true }).select('-senha');
    if (!tenant) return res.status(404).json({ sucesso: false, mensagem: 'Empresa não encontrada' });
    await AuditLog.create({ usuario: req.usuario.id, acao: 'reativar', modelo: 'Usuario', registroId: tenant._id, descricao: `Tenant ${tenant.nomeEmpresa} reativado` });
    res.json({ sucesso: true, tenant });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: err.message });
  }
};

// ── Planos ─────────────────────────────────────────────────────────────────
export const listarPlanos = async (req, res) => {
  try {
    const planos = await Plano.find().sort({ preco: 1 });
    // Count tenants per plan
    const counts = await Usuario.aggregate([
      { $match: { role: { $ne: 'super_admin' } } },
      { $group: { _id: '$plano', total: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map(r => [r._id, r.total]));
    const lista = planos.map(p => ({ ...p.toObject(), tenants: countMap[p.slug] || 0 }));
    res.json({ sucesso: true, planos: lista });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: err.message });
  }
};

export const criarPlano = async (req, res) => {
  try {
    const plano = await Plano.create(req.body);
    res.status(201).json({ sucesso: true, plano });
  } catch (err) {
    res.status(400).json({ sucesso: false, mensagem: err.message });
  }
};

export const atualizarPlano = async (req, res) => {
  try {
    const plano = await Plano.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!plano) return res.status(404).json({ sucesso: false, mensagem: 'Plano não encontrado' });
    res.json({ sucesso: true, plano });
  } catch (err) {
    res.status(400).json({ sucesso: false, mensagem: err.message });
  }
};

export const deletarPlano = async (req, res) => {
  try {
    const plano = await Plano.findByIdAndDelete(req.params.id);
    if (!plano) return res.status(404).json({ sucesso: false, mensagem: 'Plano não encontrado' });
    res.json({ sucesso: true });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: err.message });
  }
};

// ── Audit Log ──────────────────────────────────────────────────────────────
export const listarAuditLog = async (req, res) => {
  try {
    const { empresa, acao, pagina = 1, limite = 50 } = req.query;
    const filtro = {};
    if (empresa) filtro.empresa = empresa;
    if (acao)    filtro.acao = acao;
    const skip = (Number(pagina) - 1) * Number(limite);
    const [logs, total] = await Promise.all([
      AuditLog.find(filtro).sort({ createdAt: -1 }).skip(skip).limit(Number(limite))
        .populate('empresa', 'nomeEmpresa email')
        .populate('usuario', 'nome email role'),
      AuditLog.countDocuments(filtro),
    ]);
    res.json({ sucesso: true, logs, total, paginas: Math.ceil(total / Number(limite)) });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: err.message });
  }
};

// ── Seed super admin ───────────────────────────────────────────────────────
export const seedSuperAdmin = async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ sucesso: false, mensagem: 'JWT_SECRET environment variable is not set' });
    }

    const existe = await Usuario.findOne({ role: 'super_admin' });
    if (existe) return res.status(400).json({ sucesso: false, mensagem: 'Super admin já existe.' });

    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ sucesso: false, mensagem: 'nome, email e senha são obrigatórios.' });

    const usuario = await Usuario.create({ nome, email, senha, role: 'super_admin', nomeEmpresa: 'BelaHub Admin', planoStatus: 'ativo' });
    const token = jwt.sign({ id: usuario._id, role: 'super_admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ sucesso: true, mensagem: 'Super admin criado.', token });
  } catch (err) {
    res.status(500).json({ sucesso: false, mensagem: err.message });
  }
};
