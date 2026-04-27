import api from './api';

export const CATEGORY_CFG = {
  cosmetico:  { label: 'Cosmético',   emoji: '💄', color: '#e8185a' },
  higiene:    { label: 'Higiene',     emoji: '🧼', color: '#06b6d4' },
  ferramenta: { label: 'Ferramenta',  emoji: '🔧', color: '#f59e0b' },
  uniforme:   { label: 'Uniforme',    emoji: '👕', color: '#7c3aed' },
  acessorio:  { label: 'Acessório',   emoji: '👜', color: '#10b981' },
  outro:      { label: 'Outro',       emoji: '📦', color: '#64748b' },
};

export const UNIT_LABEL = { un: 'Unidade', ml: 'mL', g: 'g', l: 'L', kg: 'kg' };

const toUI = (p) => ({
  id:                  p._id,
  sku:                 p.sku        || '',
  nome:                p.nome       || '',
  descricao:           p.descricao  || '',
  categoria:           p.categoria  || 'outro',
  precoUnitario:       p.precoUnitario  || 0,
  precoCusto:          p.precoCusto     || 0,
  margem:              p.margem         ?? 0,
  unidade:             p.unidade        || 'un',
  fornecedor:          p.fornecedor     || '',
  estoqueMinimoAlerta: p.estoqueMinimoAlerta ?? 5,
  ativo:               p.ativo !== false,
  totalEstoque:        p.totalEstoque   ?? null,
  criadoEm:            p.criadoEm       || '',
});

const produtoService = {
  async listar(params = {}) {
    const { data } = await api.get('/produtos', { params });
    return (data.produtos || []).map(toUI);
  },

  async listarComEstoque() {
    const { data } = await api.get('/produtos/com-estoque/listar', { params: { limite: 100 } });
    return (data.produtos || []).map(toUI);
  },

  async estatisticas() {
    const { data } = await api.get('/produtos/estatisticas/geral');
    return data;
  },

  async criar(form) {
    const { data } = await api.post('/produtos', form);
    return toUI(data);
  },

  async atualizar(id, form) {
    const { data } = await api.put(`/produtos/${id}`, form);
    return toUI(data);
  },

  async deletar(id) {
    await api.delete(`/produtos/${id}`);
  },
};

export default produtoService;
