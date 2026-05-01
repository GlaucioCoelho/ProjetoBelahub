import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const authService = {
  // Registrar novo usuário
  registro: async (dados) => {
    try {
      const response = await axios.post(`${API_URL}/auth/registro`, dados);
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.usuario));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Fazer login
  login: async (email, senha) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        senha
      });
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.usuario));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Fazer logout
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  },

  // Obter usuário do localStorage
  obterUsuarioLocal: () => {
    const usuario = localStorage.getItem('userData');
    return usuario ? JSON.parse(usuario) : null;
  },

  // Obter token do localStorage
  obterToken: () => {
    return localStorage.getItem('authToken');
  },

  // Verificar se está autenticado
  estaAutenticado: () => {
    return !!localStorage.getItem('authToken');
  },

  // Obter usuário atual do backend (protegido)
  obterMeuPerfil: async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default authService;
