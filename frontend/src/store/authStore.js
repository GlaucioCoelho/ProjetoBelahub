import { create } from 'zustand';
import authService from '../services/authService';

export const useAuthStore = create((set) => ({
  usuario: authService.obterUsuarioLocal(),
  estaAutenticado: authService.estaAutenticado(),
  carregando: false,
  erro: null,

  // Fazer login
  login: async (email, senha) => {
    set({ carregando: true, erro: null });
    try {
      const result = await authService.login(email, senha);
      set({
        usuario: result.usuario,
        estaAutenticado: true,
        carregando: false,
        erro: null
      });
      return result;
    } catch (error) {
      const msg = error.response?.data?.mensagem || error.message || 'Erro ao fazer login';
      set({
        carregando: false,
        erro: msg
      });
      throw error;
    }
  },

  // Registrar novo usuário
  registro: async (dados) => {
    set({ carregando: true, erro: null });
    try {
      const result = await authService.registro(dados);
      set({
        usuario: result.usuario,
        estaAutenticado: true,
        carregando: false,
        erro: null
      });
      return result;
    } catch (error) {
      const msg = error.response?.data?.mensagem || error.message || 'Erro ao registrar';
      set({
        carregando: false,
        erro: msg
      });
      throw error;
    }
  },

  // Fazer logout
  logout: () => {
    authService.logout();
    set({
      usuario: null,
      estaAutenticado: false,
      erro: null
    });
  },

  // Limpar erro
  limparErro: () => {
    set({ erro: null });
  }
}));
