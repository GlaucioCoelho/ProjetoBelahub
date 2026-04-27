import api from './api';

const toItem = (i) => ({ name: i.nome, qty: i.quantidade ?? 1, price: i.preco ?? 0 });

const toUI = (c) => ({
  id:           c._id,
  numero:       String(c.numero || '').padStart(3, '0'),
  client:       c.nomeCliente || '',
  professional: c.profissional || '',
  opened:       c.horarioAbertura || '--:--',
  items:        (c.itens || []).map(toItem),
  total:        c.total ?? (c.itens || []).reduce((s, i) => s + (i.quantidade || 1) * (i.preco || 0), 0),
  status:       c.status === 'fechada' ? 'closed' : 'open',
  observacoes:  c.observacoes || '',
});

const toBody = (form) => ({
  nomeCliente:     form.client,
  profissional:    form.professional,
  horarioAbertura: form.opened,
  itens:           (form.items || []).map(i => ({ nome: i.name, quantidade: i.qty, preco: i.price })),
  observacoes:     form.observacoes || '',
});

const comandaService = {
  async listar(params = {}) {
    const { data } = await api.get('/comandas', { params });
    return {
      comandas:     (data.comandas || []).map(toUI),
      fechadasHoje: data.fechadasHoje || 0,
    };
  },

  async criar(form) {
    const { data } = await api.post('/comandas', toBody(form));
    return toUI(data.comanda);
  },

  async atualizar(id, form) {
    const { data } = await api.put(`/comandas/${id}`, toBody(form));
    return toUI(data.comanda);
  },

  async fechar(id) {
    const { data } = await api.patch(`/comandas/${id}/fechar`);
    return toUI(data.comanda);
  },

  async deletar(id) {
    await api.delete(`/comandas/${id}`);
  },
};

export default comandaService;
