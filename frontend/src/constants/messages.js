/**
 * Mensagens de Erro e Sucesso Padronizadas
 * Centraliza todas as mensagens da aplicação
 */

export const MESSAGES = {
  // Erros de Autenticação
  AUTH: {
    LOGIN_ERROR: 'Erro ao fazer login',
    LOGOUT_SUCCESS: 'Desconectado com sucesso',
    REGISTER_ERROR: 'Erro ao registrar',
    TOKEN_INVALID: 'Token inválido ou expirado',
    UNAUTHORIZED: 'Você não tem permissão para acessar este recurso',
  },

  // Erros de Validação
  VALIDATION: {
    REQUIRED_FIELD: 'Este campo é obrigatório',
    INVALID_EMAIL: 'Email inválido',
    INVALID_PHONE: 'Telefone inválido (use: (XX) 9XXXX-XXXX)',
    INVALID_CPF: 'CPF inválido (use: XXX.XXX.XXX-XX)',
    INVALID_CEP: 'CEP inválido (use: XXXXX-XXX)',
    INVALID_DATE: 'Data inválida',
    WEAK_PASSWORD: 'Senha deve ter no mínimo 6 caracteres',
    PASSWORD_MISMATCH: 'As senhas não conferem',
    MIN_VALUE: (min) => `Valor deve ser no mínimo ${min}`,
    MAX_VALUE: (max) => `Valor não pode ser maior que ${max}`,
  },

  // Erros de Operações
  OPERATIONS: {
    LOAD_ERROR: 'Erro ao carregar dados',
    SAVE_ERROR: 'Erro ao salvar',
    DELETE_ERROR: 'Erro ao deletar',
    UPDATE_ERROR: 'Erro ao atualizar',
    CREATE_ERROR: 'Erro ao criar',
    LOAD_APPOINTMENTS: 'Erro ao carregar agendamentos',
    LOAD_CLIENTS: 'Erro ao carregar clientes',
    LOAD_HOURS: 'Erro ao carregar horários disponíveis',
    LOAD_FINANCIAL: 'Erro ao carregar dados financeiros',
    REGISTER_PAYMENT: 'Erro ao registrar pagamento',
    REGISTER_MOVEMENT: 'Erro ao registrar movimentação',
  },

  // Mensagens de Sucesso
  SUCCESS: {
    APPOINTMENT_CREATED: 'Agendamento criado com sucesso!',
    CLIENT_CREATED: 'Cliente criado com sucesso!',
    EMPLOYEE_CREATED: 'Funcionário criado com sucesso!',
    PRODUCT_SAVED: 'Produto salvo com sucesso!',
    PAYMENT_REGISTERED: 'Pagamento registrado com sucesso!',
    OPERATION_SUCCESS: 'Operação realizada com sucesso!',
    DELETION_SUCCESS: 'Deletado com sucesso!',
    UPDATE_SUCCESS: 'Atualizado com sucesso!',
  },

  // Confirmações
  CONFIRMATIONS: {
    DELETE_APPOINTMENT: 'Tem certeza que deseja cancelar este agendamento?',
    DELETE_CLIENT: 'Tem certeza que deseja deletar este cliente?',
    DELETE_PRODUCT: 'Tem certeza que deseja deletar este produto?',
    DELETE_EMPLOYEE: 'Tem certeza que deseja deletar este funcionário?',
  },

  // Estados de Carregamento
  LOADING: {
    LOADING: 'Carregando...',
    SAVING: 'Salvando...',
    DELETING: 'Deletando...',
    CREATING: 'Criando...',
  },

  // Mensagens Gerais
  GENERAL: {
    NO_DATA: 'Nenhum dado encontrado',
    NO_RESULTS: 'Nenhum resultado encontrado',
    EMPTY_STATE: 'Nada para exibir aqui',
    TRY_AGAIN: 'Tente novamente mais tarde',
    CONTACT_SUPPORT: 'Contacte o suporte para mais informações',
  },
};

/**
 * Padrões de Validação
 */
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\d\s\(\)\-\+]{8,20}$/,
  CPF: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  CEP: /^\d{5}-\d{3}$/,
  PHONE_UNMASKED: /^\d{11}$/,
};

/**
 * Validadores
 */
export const validators = {
  isValidEmail: (email) => VALIDATION_PATTERNS.EMAIL.test(email),
  isValidPhone: (phone) => VALIDATION_PATTERNS.PHONE.test(phone),
  isValidCPF: (cpf) => VALIDATION_PATTERNS.CPF.test(cpf),
  isValidCEP: (cep) => VALIDATION_PATTERNS.CEP.test(cep),
  isValidPassword: (password) => password && password.length >= 6,
  isNotEmpty: (value) => value && value.trim().length > 0,
};
