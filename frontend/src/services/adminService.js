import api from './api';

const adminService = {
  // Dashboard
  async getDashboard() {
    const { data } = await api.get('/admin/dashboard');
    return data;
  },

  // Tenants
  async listarTenants(params = {}) {
    const { data } = await api.get('/admin/tenants', { params });
    return data;
  },
  async obterTenant(id) {
    const { data } = await api.get(`/admin/tenants/${id}`);
    return data.tenant;
  },
  async atualizarTenant(id, body) {
    const { data } = await api.put(`/admin/tenants/${id}`, body);
    return data.tenant;
  },
  async suspenderTenant(id) {
    const { data } = await api.post(`/admin/tenants/${id}/suspender`);
    return data.tenant;
  },
  async reativarTenant(id) {
    const { data } = await api.post(`/admin/tenants/${id}/reativar`);
    return data.tenant;
  },

  // Plans
  async listarPlanos() {
    const { data } = await api.get('/admin/planos');
    return data.planos;
  },
  async criarPlano(body) {
    const { data } = await api.post('/admin/planos', body);
    return data.plano;
  },
  async atualizarPlano(id, body) {
    const { data } = await api.put(`/admin/planos/${id}`, body);
    return data.plano;
  },
  async deletarPlano(id) {
    await api.delete(`/admin/planos/${id}`);
  },

  // Audit log
  async listarAuditLog(params = {}) {
    const { data } = await api.get('/admin/audit', { params });
    return data;
  },

  // Bootstrap
  async seedSuperAdmin(body) {
    const { data } = await api.post('/admin/seed', body);
    return data;
  },
};

export default adminService;
