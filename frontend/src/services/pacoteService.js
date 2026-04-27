import api from './api';

const toUI = (p) => ({
  id:            p._id,
  nome:          p.nome          || '',
  descricao:     p.descricao     || '',
  servicos:      p.servicos      || [],
  preco:         p.preco         ?? 0,
  precoOriginal: p.precoOriginal ?? 0,
  desconto:      p.desconto      ?? 0,
  validadeDias:  p.validadeDias  ?? 90,
  sessoes:       p.sessoes       ?? 1,
  ativo:         p.ativo !== false,
  criadoEm:      p.criadoEm     || '',
});

const pacoteService = {
  async listar(params = {}) {
    const { data } = await api.get('/pacotes', { params });
    return (data.pacotes || []).map(toUI);
  },

  async estatisticas() {
    const { data } = await api.get('/pacotes/estatisticas/geral');
    return data;
  },

  async criar(form) {
    const { data } = await api.post('/pacotes', form);
    return toUI(data);
  },

  async atualizar(id, form) {
    const { data } = await api.put(`/pacotes/${id}`, form);
    return toUI(data);
  },

  async deletar(id) {
    await api.delete(`/pacotes/${id}`);
  },
};

export default pacoteService;
