import api from './api';

const AVATAR_COLORS = [
  '#7c3aed','#e8185a','#06b6d4','#f59e0b','#10b981','#ef4444','#8b5cf6','#ec4899',
];

const getColor = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const getInitials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');

// Normalise tag values coming from DB (may be stored as 'VIP', 'Novo', 'Regular', etc.)
const normaliseTag = (raw) => {
  const map = { vip: 'vip', regular: 'regular', new: 'new', novo: 'new' };
  return map[(raw || '').toLowerCase()] || 'regular';
};

const fmt = (iso) => iso ? iso.substring(0, 10) : '';

// Mapeia documento MongoDB → formato usado nas telas
const toUI = (c) => ({
  id:        c._id,
  name:      c.nome || '',
  phone:     c.telefone || '',
  email:     c.email || '',
  city:      c.endereco?.cidade || '',
  bday:      fmt(c.dataNascimento),
  instagram: c.instagram || '',
  tag:       normaliseTag(c.tag),
  note:      c.observacoes || '',
  since:     fmt(c.createdAt),
  lastVisit: c.ultimoAgendamento
    ? fmt(c.ultimoAgendamento)
    : fmt(c.updatedAt),
  spent:     c.gastoTotal    || 0,
  visits:    c.totalAgendamentos || 0,
  color:     getColor(c.nome || ''),
  initials:  getInitials(c.nome || ''),
});

// Mapeia formato UI → corpo da requisição
const toAPI = (f) => {
  const body = {
    nome:      f.name,
    tag:       f.tag || 'regular',
    observacoes: f.note || '',
    instagram: f.instagram || '',
    endereco:  { cidade: f.city || '' },
  };
  if (f.email?.trim())    body.email    = f.email.trim();
  if (f.phone?.trim())    body.telefone = f.phone.trim();
  if (f.bday)             body.dataNascimento = f.bday;
  return body;
};

const clienteService = {
  async listar(busca = '') {
    const params = busca ? { busca } : {};
    const { data } = await api.get('/clientes', { params });
    return (data.dados || []).map(toUI);
  },

  async obter(id) {
    const { data } = await api.get(`/clientes/${id}`);
    return toUI(data.dados);
  },

  async criar(form) {
    const { data } = await api.post('/clientes', toAPI(form));
    return toUI(data.dados);
  },

  async atualizar(id, form) {
    const { data } = await api.put(`/clientes/${id}`, toAPI(form));
    return toUI(data.dados);
  },

  async deletar(id) {
    await api.delete(`/clientes/${id}`);
  },

  async estatisticas(id) {
    const { data } = await api.get(`/clientes/${id}/estatisticas`);
    return data.dados;
  },
};

export default clienteService;
