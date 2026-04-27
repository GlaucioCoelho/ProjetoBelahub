import api from './api';

const STATUS_MAP = {
  concluida:    'Paga',
  pendente:     'Pendente',
  processando:  'Processando',
  falha:        'Falha',
};

const METODO_MAP = {
  cartao:       'Cartão',
  dinheiro:     'Dinheiro',
  transferencia:'Transferência',
  pix:          'PIX',
};

const toUI = (t) => ({
  id:          t._id,
  date:        t.data
                ? (typeof t.data === 'string' ? t.data.substring(0,10) : new Date(t.data).toISOString().substring(0,10))
                : '',
  desc:        t.descricao || '',
  description: t.descricao || '',   // alias
  category:    t.categoria  || 'Outros',
  payment:     METODO_MAP[t.metodo] || t.metodo || 'Outros',
  value:       t.valor || 0,
  amount:      t.valor || 0,        // alias
  recurrent:   t.recorrente || false,
  status:      t.status === 'concluida' ? 'paid' : 'pending',
  statusRaw:   t.status || 'pendente',
});

const toAPI = (form) => ({
  tipo:        'despesa',
  descricao:   form.description,
  valor:       Number(form.amount) || 0,
  categoria:   form.category || 'Outros',
  metodo:      (() => {
    const m = (form.payment || '').toLowerCase();
    if (m.includes('cartão') || m.includes('cartao')) return 'cartao';
    if (m.includes('pix'))        return 'pix';
    if (m.includes('transfer'))   return 'transferencia';
    return 'dinheiro';
  })(),
  recorrente:  form.recurrent || false,
  status:      form.status === 'Paga' ? 'concluida' : 'pendente',
  data:        form.date || new Date().toISOString().substring(0,10),
});

const despesaService = {
  async listar({ busca, categoria, periodo } = {}) {
    const params = { tipo: 'despesa', limite: 100 };

    if (periodo) {
      const now = new Date();
      if (periodo === 'month' || periodo === 'Este mês') {
        params.dataInicio = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().substring(0,10);
        params.dataFim    = new Date(now.getFullYear(), now.getMonth()+1, 0).toISOString().substring(0,10);
      } else if (periodo === 'week') {
        const mon = new Date(now); mon.setDate(now.getDate() - now.getDay() + 1);
        const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
        params.dataInicio = mon.toISOString().substring(0,10);
        params.dataFim    = sun.toISOString().substring(0,10);
      } else if (periodo === 'quarter') {
        const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth()/3)*3, 1);
        const qEnd   = new Date(qStart.getFullYear(), qStart.getMonth()+3, 0);
        params.dataInicio = qStart.toISOString().substring(0,10);
        params.dataFim    = qEnd.toISOString().substring(0,10);
      } else if (periodo === 'Mês passado') {
        params.dataInicio = new Date(now.getFullYear(), now.getMonth()-1, 1).toISOString().substring(0,10);
        params.dataFim    = new Date(now.getFullYear(), now.getMonth(),   0).toISOString().substring(0,10);
      }
    }

    const { data } = await api.get('/transacoes', { params });
    let lista = (data.transacoes || []).map(toUI);

    if (busca) {
      const q = busca.toLowerCase();
      lista = lista.filter(d => d.description.toLowerCase().includes(q) || d.category.toLowerCase().includes(q));
    }
    if (categoria && categoria !== 'Todas') {
      lista = lista.filter(d => d.category === categoria);
    }

    return lista;
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

export default despesaService;
