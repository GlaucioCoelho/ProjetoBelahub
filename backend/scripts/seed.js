/**
 * BelaHub – Seed Script
 * Popula o MongoDB com dados de demonstração realistas.
 * Uso: node backend/scripts/seed.js
 */

import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// ── Schemas inline para não depender de imports relativos ──────────────────

const usuarioSchema = new mongoose.Schema({
  nome: String, email: { type: String, unique: true, lowercase: true },
  senha: { type: String, select: false }, telefone: String, nomeEmpresa: String,
  role: { type: String, default: 'gerente' }, ativo: { type: Boolean, default: true },
}, { timestamps: true });
usuarioSchema.pre('save', async function (next) {
  if (this.isModified('senha')) this.senha = await bcryptjs.hash(this.senha, 10);
  next();
});
const Usuario = mongoose.models.Usuario || mongoose.model('Usuario', usuarioSchema);

const clienteSchema = new mongoose.Schema({
  empresa: mongoose.Schema.Types.ObjectId,
  nome: String, email: { type: String, lowercase: true },
  telefone: String, dataNascimento: Date,
  endereco: { cidade: String, estado: String },
  observacoes: String, instagram: String,
  tag: { type: String, enum: ['vip', 'regular', 'novo'], default: 'regular' },
  ativo: { type: Boolean, default: true },
}, { timestamps: true });
const Cliente = mongoose.models.Cliente || mongoose.model('Cliente', clienteSchema);

const funcionarioSchema = new mongoose.Schema({
  empresa: mongoose.Schema.Types.ObjectId,
  nome: String, email: { type: String, unique: true, lowercase: true },
  telefone: String,
  cargo: { type: String, default: 'outro' },
  salarioBase: { type: Number, default: 1500 },
  comissaoPercentual: { type: Number, default: 40 },
  dataContratacao: Date,
  status: { type: String, default: 'ativo' },
  color: { type: String, default: '#7c3aed' },
  especialidades: [String],
  diasTrabalho: { type: [String], default: ['seg','ter','qua','qui','sex'] },
  avaliacao: { type: Number, default: 5.0 },
  horarioTrabalho: { inicio: { type: String, default: '09:00' }, fim: { type: String, default: '18:00' } },
}, { timestamps: true });
const Funcionario = mongoose.models.Funcionario || mongoose.model('Funcionario', funcionarioSchema);

const agendamentoSchema = new mongoose.Schema({
  empresa: mongoose.Schema.Types.ObjectId,
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente' },
  nomeCliente: String,
  profissional: String,
  servico: String,
  dataAgendamento: Date,
  horarioInicio: String,
  duracao: { type: Number, default: 60 },
  status: { type: String, default: 'agendado' },
  preco: Number,
  notas: String,
  pagamento: { type: String, default: 'Cartão' },
}, { timestamps: true });
const Agendamento = mongoose.models.Agendamento || mongoose.model('Agendamento', agendamentoSchema);

const transacaoSchema = new mongoose.Schema({
  empresa: mongoose.Schema.Types.ObjectId,
  tipo: { type: String, enum: ['receita', 'despesa', 'comissao', 'devolucao'] },
  descricao: String,
  valor: Number,
  status: { type: String, default: 'concluida' },
  data: { type: Date, default: Date.now },
  metodo: { type: String, default: 'pix' },
  categoria: { type: String, default: 'Outros' },
  recorrente: { type: Boolean, default: false },
}, { timestamps: true });
const Transacao = mongoose.models.Transacao || mongoose.model('Transacao', transacaoSchema);

// ── Dados de seed ──────────────────────────────────────────────────────────

const SEED_EMAIL   = 'admin@belahub.com';
const SEED_SENHA   = '123456';

const FUNCIONARIOS_DATA = [
  {
    nome: 'Ana Silva', email: 'ana@belahub.com', telefone: '11992345678',
    cargo: 'cabeleireiro', salarioBase: 2000, comissaoPercentual: 40,
    dataContratacao: new Date('2022-03-01'),
    color: '#7c3aed', avaliacao: 4.9,
    especialidades: ['Corte Feminino', 'Coloração', 'Hidratação'],
    diasTrabalho: ['seg','ter','qua','qui','sex','sab'],
    horarioTrabalho: { inicio: '09:00', fim: '18:00' },
  },
  {
    nome: 'Maria Santos', email: 'maria@belahub.com', telefone: '11981234567',
    cargo: 'manicure', salarioBase: 1800, comissaoPercentual: 45,
    dataContratacao: new Date('2021-07-15'),
    color: '#e8185a', avaliacao: 4.8,
    especialidades: ['Manicure', 'Pedicure', 'Nail Art'],
    diasTrabalho: ['seg','ter','qua','qui','sex'],
    horarioTrabalho: { inicio: '09:00', fim: '18:00' },
  },
  {
    nome: 'Carol Lima', email: 'carol@belahub.com', telefone: '11976543210',
    cargo: 'esteticien', salarioBase: 2200, comissaoPercentual: 38,
    dataContratacao: new Date('2023-01-10'),
    color: '#06b6d4', avaliacao: 5.0,
    especialidades: ['Escova Progressiva', 'Botox Capilar', 'Tratamento'],
    diasTrabalho: ['seg','ter','qua','qui','sex','sab'],
    horarioTrabalho: { inicio: '09:00', fim: '18:00' },
  },
  {
    nome: 'Bianca Rocha', email: 'bianca@belahub.com', telefone: '11965432109',
    cargo: 'cabeleireiro', salarioBase: 1600, comissaoPercentual: 40,
    dataContratacao: new Date('2023-09-05'),
    status: 'inativo',
    color: '#f59e0b', avaliacao: 4.7,
    especialidades: ['Corte Feminino', 'Peinado'],
    diasTrabalho: ['seg','ter','qua','qui','sex'],
    horarioTrabalho: { inicio: '09:00', fim: '18:00' },
  },
];

const CLIENTES_DATA = [
  {
    nome: 'Fernanda Lima', email: 'fernanda@email.com', telefone: '1199234-5678',
    dataNascimento: new Date('1992-03-15'),
    endereco: { cidade: 'São Paulo', estado: 'SP' },
    instagram: '@ferlima', tag: 'vip',
    observacoes: 'Prefere horários pela manhã. Alérgica à amônia.',
  },
  {
    nome: 'Carol Lima', email: 'carol.cliente@email.com', telefone: '1191234-5678',
    dataNascimento: new Date('1988-07-22'),
    endereco: { cidade: 'São Paulo', estado: 'SP' },
    tag: 'regular',
  },
  {
    nome: 'Patrícia Nunes', email: 'patricia@email.com', telefone: '2198765-4321',
    dataNascimento: new Date('1995-11-30'),
    endereco: { cidade: 'Rio de Janeiro', estado: 'RJ' },
    tag: 'novo',
  },
  {
    nome: 'Camila Ferreira', email: 'camila@email.com', telefone: '1197654-3210',
    dataNascimento: new Date('1990-05-14'),
    endereco: { cidade: 'São Paulo', estado: 'SP' },
    tag: 'novo',
  },
  {
    nome: 'Larissa Melo', email: 'larissa@email.com', telefone: '1194321-8765',
    dataNascimento: new Date('1985-09-08'),
    endereco: { cidade: 'Campinas', estado: 'SP' },
    instagram: '@larimelo', tag: 'vip',
  },
  {
    nome: 'Roberto Alves', email: 'roberto@email.com', telefone: '1195432-1098',
    dataNascimento: new Date('1982-12-01'),
    endereco: { cidade: 'São Paulo', estado: 'SP' },
    tag: 'regular',
  },
];

const today = new Date();
const fmt   = (d) => new Date(d);
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };

// ── Main ───────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Conectando ao MongoDB Atlas…');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/belahub');
  console.log('✅ Conectado');

  // Limpar dados existentes (mantém índices)
  await Promise.all([
    Usuario.deleteMany({}),
    Cliente.deleteMany({}),
    Funcionario.deleteMany({}),
    Agendamento.deleteMany({}),
    Transacao.deleteMany({}),
  ]);
  console.log('🗑  Dados antigos removidos');

  // ── Usuário admin ──────────────────────────────────────────────────────
  const usuario = new Usuario({
    nome: 'Admin BelaHub',
    email: SEED_EMAIL,
    senha: SEED_SENHA,
    telefone: '11999999999',
    nomeEmpresa: 'BelaHub Studio',
    role: 'gerente',
  });
  await usuario.save();
  const empresaId = usuario._id;
  console.log(`👤 Usuário criado: ${SEED_EMAIL} / ${SEED_SENHA}`);

  // ── Funcionários ───────────────────────────────────────────────────────
  const funcs = await Funcionario.insertMany(
    FUNCIONARIOS_DATA.map((f) => ({ ...f, empresa: empresaId }))
  );
  console.log(`👩‍💼 ${funcs.length} funcionários criados`);
  const [ana, maria, carol, bianca] = funcs;

  // ── Clientes ───────────────────────────────────────────────────────────
  const clients = await Cliente.insertMany(
    CLIENTES_DATA.map((c) => ({ ...c, empresa: empresaId }))
  );
  console.log(`🧑‍🤝‍🧑 ${clients.length} clientes criados`);
  const [fernanda, carolC, patricia, camila, larissa, roberto] = clients;

  // ── Agendamentos ───────────────────────────────────────────────────────
  const agendamentosData = [
    { cliente: fernanda._id, nomeCliente: fernanda.nome, profissional: ana.nome,   servico: 'Corte Feminino',       horarioInicio: '08:00', duracao: 60,  preco: 80,  status: 'concluido',  pagamento: 'Cartão',    dataAgendamento: daysAgo(0) },
    { cliente: roberto._id,  nomeCliente: roberto.nome,  profissional: maria.nome, servico: 'Manicure',             horarioInicio: '09:30', duracao: 45,  preco: 35,  status: 'concluido',  pagamento: 'Pix',       dataAgendamento: daysAgo(0) },
    { cliente: patricia._id, nomeCliente: patricia.nome, profissional: ana.nome,   servico: 'Coloração',            horarioInicio: '10:30', duracao: 120, preco: 180, status: 'aguardando', pagamento: 'Dinheiro',  dataAgendamento: daysAgo(0) },
    { cliente: patricia._id, nomeCliente: patricia.nome, profissional: carol.nome, servico: 'Escova Progressiva',   horarioInicio: '12:00', duracao: 90,  preco: 220, status: 'aguardando', pagamento: 'Cartão',    dataAgendamento: daysAgo(0) },
    { cliente: camila._id,   nomeCliente: camila.nome,   profissional: maria.nome, servico: 'Pedicure',             horarioInicio: '14:00', duracao: 50,  preco: 45,  status: 'agendado',   pagamento: 'Pix',       dataAgendamento: daysAgo(0) },
    { cliente: larissa._id,  nomeCliente: larissa.nome,  profissional: ana.nome,   servico: 'Hidratação',           horarioInicio: '15:30', duracao: 60,  preco: 95,  status: 'cancelado',  pagamento: 'Cartão',    dataAgendamento: daysAgo(0) },
    { cliente: carolC._id,   nomeCliente: carolC.nome,   profissional: carol.nome, servico: 'Sobrancelha',          horarioInicio: '16:30', duracao: 30,  preco: 40,  status: 'agendado',   pagamento: 'Dinheiro',  dataAgendamento: daysAgo(0) },
    { cliente: fernanda._id, nomeCliente: fernanda.nome, profissional: maria.nome, servico: 'Nail Art',             horarioInicio: '09:00', duracao: 90,  preco: 120, status: 'concluido',  pagamento: 'Pix',       dataAgendamento: daysAgo(1) },
    { cliente: larissa._id,  nomeCliente: larissa.nome,  profissional: ana.nome,   servico: 'Corte + Escova',       horarioInicio: '14:00', duracao: 90,  preco: 150, status: 'concluido',  pagamento: 'Cartão',    dataAgendamento: daysAgo(2) },
    { cliente: roberto._id,  nomeCliente: roberto.nome,  profissional: carol.nome, servico: 'Botox Capilar',        horarioInicio: '10:00', duracao: 120, preco: 280, status: 'concluido',  pagamento: 'Pix',       dataAgendamento: daysAgo(3) },
    { cliente: camila._id,   nomeCliente: camila.nome,   profissional: ana.nome,   servico: 'Coloração',            horarioInicio: '13:00', duracao: 120, preco: 200, status: 'concluido',  pagamento: 'Cartão',    dataAgendamento: daysAgo(4) },
    { cliente: patricia._id, nomeCliente: patricia.nome, profissional: maria.nome, servico: 'Manicure + Pedicure',  horarioInicio: '11:00', duracao: 90,  preco: 80,  status: 'concluido',  pagamento: 'Dinheiro',  dataAgendamento: daysAgo(5) },
    // Amanhã
    { cliente: fernanda._id, nomeCliente: fernanda.nome, profissional: carol.nome, servico: 'Escova Progressiva',   horarioInicio: '10:00', duracao: 90,  preco: 220, status: 'agendado',   pagamento: 'Cartão',    dataAgendamento: (() => { const d = new Date(); d.setDate(d.getDate()+1); return d; })() },
    { cliente: larissa._id,  nomeCliente: larissa.nome,  profissional: ana.nome,   servico: 'Hidratação + Brilho',  horarioInicio: '14:00', duracao: 60,  preco: 110, status: 'agendado',   pagamento: 'Pix',       dataAgendamento: (() => { const d = new Date(); d.setDate(d.getDate()+1); return d; })() },
  ];

  const agendamentos = await Agendamento.insertMany(
    agendamentosData.map((a) => ({ ...a, empresa: empresaId }))
  );
  console.log(`📅 ${agendamentos.length} agendamentos criados`);

  // ── Despesas (Transações tipo=despesa) ─────────────────────────────────
  const despesasData = [
    { descricao: 'Aluguel do espaço',        valor: 1200, categoria: 'Infraestrutura', metodo: 'transferencia', recorrente: true,  status: 'concluida', data: daysAgo(15) },
    { descricao: 'Fornecedor L\'Oréal',      valor: 340,  categoria: 'Produtos',       metodo: 'cartao',        recorrente: false, status: 'pendente',  data: daysAgo(14) },
    { descricao: 'Comissão Ana Silva',        valor: 576,  categoria: 'Remuneração',    metodo: 'pix',           recorrente: false, status: 'concluida', data: daysAgo(14) },
    { descricao: 'Conta de água e luz',       valor: 180,  categoria: 'Infraestrutura', metodo: 'dinheiro',      recorrente: true,  status: 'concluida', data: daysAgo(13) },
    { descricao: 'Comissão Maria Santos',     valor: 220,  categoria: 'Remuneração',    metodo: 'pix',           recorrente: false, status: 'concluida', data: daysAgo(13) },
    { descricao: 'Material de limpeza',       valor: 85,   categoria: 'Suprimentos',    metodo: 'dinheiro',      recorrente: false, status: 'concluida', data: daysAgo(12) },
    { descricao: 'Sistema de agendamento',    valor: 99,   categoria: 'Software',       metodo: 'cartao',        recorrente: true,  status: 'concluida', data: daysAgo(12) },
    { descricao: 'Manutenção equipamentos',   valor: 250,  categoria: 'Manutenção',     metodo: 'dinheiro',      recorrente: false, status: 'pendente',  data: daysAgo(10) },
    { descricao: 'Produtos Wella',            valor: 480,  categoria: 'Produtos',       metodo: 'cartao',        recorrente: false, status: 'concluida', data: daysAgo(8)  },
    { descricao: 'Internet fibra',            valor: 120,  categoria: 'Infraestrutura', metodo: 'transferencia', recorrente: true,  status: 'concluida', data: daysAgo(7)  },
  ];

  await Transacao.insertMany(
    despesasData.map((d) => ({ ...d, tipo: 'despesa', empresa: empresaId }))
  );
  console.log(`💸 ${despesasData.length} despesas criadas`);

  // ── Receitas ───────────────────────────────────────────────────────────
  const receitasData = [
    { descricao: 'Serviço – Fernanda Lima',   valor: 80,   metodo: 'cartao',   data: daysAgo(0)  },
    { descricao: 'Serviço – Roberto Alves',   valor: 35,   metodo: 'pix',      data: daysAgo(0)  },
    { descricao: 'Serviço – Larissa Melo',    valor: 150,  metodo: 'cartao',   data: daysAgo(2)  },
    { descricao: 'Serviço – Roberto Alves',   valor: 280,  metodo: 'pix',      data: daysAgo(3)  },
    { descricao: 'Serviço – Camila Ferreira', valor: 200,  metodo: 'cartao',   data: daysAgo(4)  },
    { descricao: 'Serviço – Patricia Nunes',  valor: 80,   metodo: 'dinheiro', data: daysAgo(5)  },
    { descricao: 'Serviço – Fernanda Lima',   valor: 120,  metodo: 'pix',      data: daysAgo(1)  },
  ];

  await Transacao.insertMany(
    receitasData.map((r) => ({ ...r, tipo: 'receita', status: 'concluida', empresa: empresaId }))
  );
  console.log(`💰 ${receitasData.length} receitas criadas`);

  await mongoose.disconnect();
  console.log('\n✅ Seed concluído com sucesso!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔑 Credenciais de acesso:');
  console.log(`   Email: ${SEED_EMAIL}`);
  console.log(`   Senha: ${SEED_SENHA}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

seed().catch((err) => {
  console.error('❌ Seed falhou:', err.message);
  process.exit(1);
});
