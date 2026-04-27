import api from './api';

const CATEGORIES_COLOR = {
  'Serviços':       '#30d158',
  'Produtos':       '#0ea5e9',
  'Remuneração':    '#a855f7',
  'Infraestrutura': '#f59e0b',
  'Suprimentos':    '#86868b',
  'Outros':         '#6b7280',
};
export { CATEGORIES_COLOR };

function dateRange(period) {
  const now = new Date();
  const today = now.toISOString().substring(0, 10);
  if (period === 'today') return { dataInicio: today, dataFim: today };
  if (period === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { dataInicio: start.toISOString().substring(0, 10), dataFim: today };
  }
  // week (default): last 7 days
  const d = new Date(now); d.setDate(d.getDate() - 7);
  return { dataInicio: d.toISOString().substring(0, 10), dataFim: today };
}

const toUI = (t) => ({
  id:        t._id,
  date:      t.data
               ? new Date(t.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
               : '--',
  dateISO:   t.data
               ? (typeof t.data === 'string' ? t.data.substring(0, 10) : new Date(t.data).toISOString().substring(0, 10))
               : new Date().toISOString().substring(0, 10),
  desc:      t.descricao || '',
  category:  t.categoria || 'Outros',
  type:      t.tipo === 'receita' ? 'in' : 'out',
  tipoRaw:   t.tipo || 'despesa',
  value:     t.valor || 0,
  status:    t.status === 'concluida' ? 'confirmed' : 'pending',
  statusRaw: t.status || 'pendente',
});

const toAPI = (form) => ({
  tipo:      form.type === 'in' ? 'receita' : (form.tipoRaw || 'despesa'),
  descricao: form.desc,
  valor:     Number(form.value) || 0,
  categoria: form.category || 'Outros',
  status:    form.status === 'confirmed' ? 'concluida' : 'pendente',
  data:      form.dateISO || form.date || new Date().toISOString().substring(0, 10),
});

const transacaoService = {
  CATEGORIES_COLOR,

  async listar({ period = 'week', tipo } = {}) {
    const params = { limite: 300, ...dateRange(period) };
    if (tipo) params.tipo = tipo;
    const { data } = await api.get('/transacoes', { params });
    return (data.transacoes || []).map(toUI);
  },

  async criar(form) {
    const { data } = await api.post('/transacoes', toAPI(form));
    return toUI(data.dados || data.transacao || data);
  },

  async atualizar(id, form) {
    const { data } = await api.put(`/transacoes/${id}`, toAPI(form));
    return toUI(data.dados || data.transacao || data);
  },

  async deletar(id) {
    await api.delete(`/transacoes/${id}`);
  },
};

export default transacaoService;
