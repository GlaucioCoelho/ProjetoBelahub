import api from './api';

const CARGO_LABEL = {
  cabeleireiro: 'Cabeleireira',
  manicure:     'Manicure',
  pedicure:     'Pedicure',
  esteticien:   'Esteticista',
  massagista:   'Massagista',
  recepcionista:'Recepcionista',
  gerente:      'Gerente',
  outro:        'Profissional',
};

// Backend stores lowercase day codes; UI uses capitalised Portuguese abbreviations
const DAY_TO_UI  = { seg:'Seg', ter:'Ter', qua:'Qua', qui:'Qui', sex:'Sex', sab:'Sáb', dom:'Dom' };
const DAY_TO_API = { Seg:'seg', Ter:'ter', Qua:'qua', Qui:'qui', Sex:'sex', 'Sáb':'sab', Dom:'dom' };

const getInitials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0,2).map(w => w[0].toUpperCase()).join('');

const toUI = (f) => {
  const isActive = f.status === 'ativo';
  return {
    id:         f._id,
    name:       f.nome || '',
    role:       CARGO_LABEL[f.cargo] || f.cargo || 'Profissional',
    cargo:      f.cargo || 'outro',
    color:      f.color || '#7c3aed',
    phone:      f.telefone || '',
    email:      f.email || '',
    commission: f.comissaoPercentual || 40,
    since:      f.dataContratacao ? f.dataContratacao.substring(0,10) : '',
    workHours:  `${f.horarioTrabalho?.inicio || '09:00'} – ${f.horarioTrabalho?.fim || '18:00'}`,
    status:     isActive ? 'active' : 'inactive',
    workDays:   (f.diasTrabalho || ['seg','ter','qua','qui','sex']).map(d => DAY_TO_UI[d] || d),
    specialties: f.especialidades || [],
    initials:   getInitials(f.nome || ''),
    thisMonth: {
      services:        f.totalAtendimentos || 0,
      revenue:         f.totalFaturado     || 0,
      commissionValue: f.totalComissoes    || 0,
      rating:          f.avaliacao         || 5.0,
    },
  };
};

// mapeia label UI → chave do cargo no banco
const CARGO_REVERSE = Object.fromEntries(
  Object.entries(CARGO_LABEL).map(([k, v]) => [v, k])
);

const toAPI = (form) => {
  const body = {
    nome:               form.name,
    cargo:              CARGO_REVERSE[form.role] || form.cargo || 'outro',
    comissaoPercentual: Number(form.commission) || 40,
    status:             form.status === 'active' ? 'ativo' : 'inativo',
    color:              form.color || '#7c3aed',
    especialidades:     form.specialties || [],
    diasTrabalho:       (form.workDays || ['Seg','Ter','Qua','Qui','Sex']).map(d => DAY_TO_API[d] || d.toLowerCase()),
    avaliacao:          form.rating || 5.0,
    horarioTrabalho: {
      inicio: (form.workHours || '09:00 – 18:00').split('–')[0].trim(),
      fim:    (form.workHours || '09:00 – 18:00').split('–')[1]?.trim() || '18:00',
    },
  };
  if (form.email?.trim())  body.email    = form.email.trim();
  if (form.phone?.trim())  body.telefone = form.phone.trim();
  if (form.since)          body.dataContratacao = form.since;
  return body;
};

const funcionarioService = {
  async listar(busca = '') {
    const params = { limite: 50 };
    if (busca) params.busca = busca;
    const { data } = await api.get('/funcionarios', { params });
    const lista = data.funcionarios || data.dados || [];
    return lista.map(toUI);
  },

  async obter(id) {
    const { data } = await api.get(`/funcionarios/${id}`);
    return toUI(data.dados || data.funcionario || data);
  },

  async criar(form) {
    const { data } = await api.post('/funcionarios', toAPI(form));
    return toUI(data.dados || data.funcionario || data);
  },

  async atualizar(id, form) {
    const { data } = await api.put(`/funcionarios/${id}`, toAPI(form));
    return toUI(data.dados || data.funcionario || data);
  },

  async deletar(id) {
    await api.delete(`/funcionarios/${id}`);
  },

  async toggleStatus(id, isActive) {
    // isActive = true means currently active → set to inactive, and vice-versa
    const novoStatus = isActive ? 'inativo' : 'ativo';
    const { data } = await api.put(`/funcionarios/${id}`, { status: novoStatus });
    const payload = data.dados || data.funcionario || data;
    return toUI(payload);
  },
};

export default funcionarioService;
