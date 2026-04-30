import api from './api';

const STATUS_LABEL = {
  rascunho:  'Rascunho',
  emitida:   'Emitida',
  paga:      'Paga',
  cancelada: 'Cancelada',
};

const METODO_LABEL = {
  cartao:        'Cartão',
  dinheiro:      'Dinheiro',
  transferencia: 'Transferência',
  pix:           'PIX',
};

const toUI = (n) => ({
  id:          n._id,
  numero:      n.numeroNota || '',
  dataEmissao: n.dataEmissao
    ? new Date(n.dataEmissao).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '--',
  dataISO:     n.dataEmissao
    ? (typeof n.dataEmissao === 'string' ? n.dataEmissao.substring(0, 10) : new Date(n.dataEmissao).toISOString().substring(0, 10))
    : '',
  cliente:     n.cliente?.nome || n.cliente || '--',
  clienteId:   n.cliente?._id || n.cliente || '',
  itens:       (n.itens || []).map(i => ({
    descricao:     i.descricao || '',
    quantidade:    i.quantidade || 1,
    valorUnitario: i.valorUnitario || 0,
    valorTotal:    i.valorTotal || 0,
  })),
  valorTotal:    n.valorTotal || 0,
  desconto:      n.desconto || 0,
  impostos:      n.impostos || 0,
  status:        n.status || 'rascunho',
  statusLabel:   STATUS_LABEL[n.status] || n.status,
  metodo:        n.metodo || '',
  metodoLabel:   METODO_LABEL[n.metodo] || n.metodo || '--',
  dataPagamento: n.dataPagamento
    ? new Date(n.dataPagamento).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : null,
  observacoes:   n.observacoes || '',
});

const faturamentoService = {
  STATUS_LABEL,
  METODO_LABEL,

  async listar({ status, dataInicio, dataFim, pagina = 1, limite = 50 } = {}) {
    const params = { pagina, limite };
    if (status)     params.status     = status;
    if (dataInicio) params.dataInicio = dataInicio;
    if (dataFim)    params.dataFim    = dataFim;
    const { data } = await api.get('/faturamento', { params });
    return { notas: (data.notas || []).map(toUI), total: data.total || 0 };
  },

  async criar(payload) {
    const { data } = await api.post('/faturamento', payload);
    return toUI(data);
  },

  async emitir(id) {
    const { data } = await api.post(`/faturamento/${id}/emitir`);
    return toUI(data);
  },

  async marcarComoPaga(id, metodo) {
    const { data } = await api.post(`/faturamento/${id}/marcar-como-paga`, { metodo });
    return toUI(data);
  },

  async atualizar(id, payload) {
    const { data } = await api.put(`/faturamento/${id}`, payload);
    return toUI(data);
  },
};

export default faturamentoService;
