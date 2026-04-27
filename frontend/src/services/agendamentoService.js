import api from './api';

// MongoDB status → UI status key (English, matches STATUS_CFG in AppointmentsPage)
const STATUS_TO_UI = {
  agendado:       'scheduled',
  concluido:      'completed',
  cancelado:      'canceled',
  aguardando:     'waiting',
  nao_compareceu: 'canceled',
};

// UI status key / Portuguese label → MongoDB status
const STATUS_REVERSE = {
  // English keys (used by page STATUS_CFG)
  scheduled:      'agendado',
  waiting:        'aguardando',
  completed:      'concluido',
  canceled:       'cancelado',
  // Portuguese labels (backwards-compat)
  'Agendado':     'agendado',
  'Concluído':    'concluido',
  'Cancelado':    'cancelado',
  'Aguardando':   'aguardando',
};

const toUI = (a) => ({
  id:           a._id,
  client:       a.nomeCliente || a.cliente?.nome || 'Cliente',
  clientId:     typeof a.cliente === 'object' ? a.cliente?._id : a.cliente,
  time:         a.horarioInicio || '00:00',
  service:      a.servico || '',
  serviceId:    null,               // appointments store service name, not a static ID
  professional: a.profissional || '',
  profId:       a.profissional || '',  // used to look up professional in PROFESSIONALS list
  duration:     a.duracao || 60,
  price:        a.preco || 0,
  payment:      a.pagamento || 'Cartão',
  status:       STATUS_TO_UI[a.status] || 'scheduled',
  statusRaw:    a.status || 'agendado',
  note:         a.notas || '',
  notes:        a.notas || '',
  date:         a.dataAgendamento
                  ? (typeof a.dataAgendamento === 'string'
                      ? a.dataAgendamento.substring(0,10)
                      : new Date(a.dataAgendamento).toISOString().substring(0,10))
                  : new Date().toISOString().substring(0,10),
});

const agendamentoService = {
  async listar(date) {
    // Use local date (not UTC) to avoid off-by-one on timezone boundaries
    const toLocal = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    const iso = date instanceof Date ? toLocal(date) : date;
    const params = {
      dataInicio: iso,
      dataFim:    iso,
      limite:     100,
    };
    const { data } = await api.get('/agendamentos', { params });
    const lista = data.agendamentos || data.dados || [];
    return lista.map(toUI);
  },

  async criar(form) {
    const today = new Date().toISOString().substring(0,10);
    const body = {
      nomeCliente:     form.client,
      profissional:    form.profId    || form.professional || '',
      servico:         form.service   || form.serviceId    || '',
      dataAgendamento: form.date      || today,
      horarioInicio:   form.time,
      duracao:         Number(form.duration) || 60,
      preco:           Number(form.price)    || 0,
      pagamento:       form.payment || 'Cartão',
      status:          STATUS_REVERSE[form.status] || 'agendado',
      notas:           form.note || form.notes || '',
      cliente:         form.clientId || '000000000000000000000000',
    };
    const { data } = await api.post('/agendamentos', body);
    return toUI(data.dados || data);
  },

  async atualizar(id, form) {
    const body = {
      nomeCliente:     form.client,
      profissional:    form.profId    || form.professional || '',
      servico:         form.service   || form.serviceId    || '',
      dataAgendamento: form.date,
      horarioInicio:   form.time,
      duracao:         Number(form.duration) || 60,
      preco:           Number(form.price)    || 0,
      pagamento:       form.payment || 'Cartão',
      status:          STATUS_REVERSE[form.status] || form.statusRaw || 'agendado',
      notas:           form.note || form.notes || '',
    };
    const { data } = await api.put(`/agendamentos/${id}`, body);
    return toUI(data.dados || data);
  },

  async atualizarStatus(id, novoStatus) {
    const statusRaw = STATUS_REVERSE[novoStatus] || novoStatus;
    const { data } = await api.put(`/agendamentos/${id}`, { status: statusRaw });
    return toUI(data.dados || data);
  },

  async deletar(id) {
    await api.delete(`/agendamentos/${id}`);
  },

  async listarVendas(period = 'week') {
    const hoje = new Date();
    const dataFim = hoje.toISOString().substring(0, 10);
    let dataInicio;
    if (period === 'today') {
      dataInicio = dataFim;
    } else if (period === 'month') {
      const d = new Date(hoje); d.setDate(d.getDate() - 30);
      dataInicio = d.toISOString().substring(0, 10);
    } else {
      const d = new Date(hoje); d.setDate(d.getDate() - 7);
      dataInicio = d.toISOString().substring(0, 10);
    }
    const { data } = await api.get('/agendamentos', {
      params: { dataInicio, dataFim, limite: 500 },
    });
    const lista = data.agendamentos || data.dados || [];
    return lista
      .filter(a => a.status === 'concluido' || a.status === 'aguardando')
      .map(a => ({
        id:      a._id,
        date:    a.dataAgendamento
                   ? new Date(a.dataAgendamento).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit' })
                   : '--',
        time:    a.horarioInicio || '--:--',
        client:  a.nomeCliente || 'Cliente',
        items:   [a.servico].filter(Boolean),
        total:   a.preco || 0,
        payment: a.pagamento || 'Cartão',
        status:  a.status === 'concluido' ? 'paid' : 'pending',
      }));
  },
};

export default agendamentoService;
