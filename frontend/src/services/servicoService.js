import api from './api';

export const CATEGORY_CFG = {
  corte:      { label: 'Corte',       emoji: '✂️',  color: '#e8185a' },
  coloracao:  { label: 'Coloração',   emoji: '🎨',  color: '#7c3aed' },
  tratamento: { label: 'Tratamento',  emoji: '💆',  color: '#06b6d4' },
  estetica:   { label: 'Estética',    emoji: '💅',  color: '#f59e0b' },
  manicure:   { label: 'Manicure',    emoji: '💅',  color: '#22c55e' },
  barba:      { label: 'Barba',       emoji: '🪒',  color: '#64748b' },
  massagem:   { label: 'Massagem',    emoji: '🤲',  color: '#0ea5e9' },
  maquiagem:  { label: 'Maquiagem',   emoji: '💄',  color: '#a855f7' },
  depilacao:  { label: 'Depilação',   emoji: '🪷',  color: '#f43f5e' },
  outro:      { label: 'Outro',       emoji: '📋',  color: '#94a3b8' },
};

const toUI = (s) => ({
  id:         s._id,
  nome:       s.nome        || '',
  categoria:  s.categoria   || 'outro',
  duracao:    s.duracao     || 60,
  preco:      s.preco       || 0,
  comissao:   s.comissao    ?? 40,
  descricao:  s.descricao   || '',
  ativo:      s.ativo !== false,
  criadoEm:   s.criadoEm   || '',
});

const servicoService = {
  async listar(params = {}) {
    const { data } = await api.get('/servicos', { params });
    return (data.servicos || []).map(toUI);
  },

  async estatisticas() {
    const { data } = await api.get('/servicos/estatisticas/geral');
    return data;
  },

  async criar(form) {
    const { data } = await api.post('/servicos', form);
    return toUI(data);
  },

  async atualizar(id, form) {
    const { data } = await api.put(`/servicos/${id}`, form);
    return toUI(data);
  },

  async deletar(id) {
    await api.delete(`/servicos/${id}`);
  },
};

export default servicoService;
