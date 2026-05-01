import { jest } from '@jest/globals';

jest.unstable_mockModule('../models/Usuario.js', () => ({
  default: {
    findById: jest.fn()
  }
}));

jest.unstable_mockModule('../models/Plano.js', () => ({
  default: {
    findOne: jest.fn()
  }
}));

jest.unstable_mockModule('../models/Funcionario.js', () => ({
  default: {
    countDocuments: jest.fn()
  }
}));

jest.unstable_mockModule('../models/Cliente.js', () => ({
  default: {
    countDocuments: jest.fn()
  }
}));

jest.unstable_mockModule('../models/Agendamento.js', () => ({
  default: {
    countDocuments: jest.fn()
  }
}));

const {
  verificarLimiteFuncionarios,
  verificarLimiteClientes,
  verificarLimiteAgendamentos
} = await import('../middlewares/verificarLimitesPlano.js');

const { default: Usuario } = await import('../models/Usuario.js');
const { default: Plano } = await import('../models/Plano.js');
const { default: Funcionario } = await import('../models/Funcionario.js');
const { default: Cliente } = await import('../models/Cliente.js');
const { default: Agendamento } = await import('../models/Agendamento.js');

const mockReq = (usuarioId = 'user123') => ({
  usuario: { id: usuarioId },
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('middleware › verificarLimitesPlano', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('verificarLimiteFuncionarios', () => {
    test('chama next() quando limite não é excedido', async () => {
      const req = mockReq('user123');
      const res = mockRes();
      const next = jest.fn();

      Usuario.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ plano: 'starter' })
      });
      Plano.findOne.mockResolvedValue({
        limites: { funcionarios: 5 }
      });
      Funcionario.countDocuments.mockResolvedValue(3);

      await verificarLimiteFuncionarios(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('retorna 403 quando limite é excedido', async () => {
      const req = mockReq('user123');
      const res = mockRes();
      const next = jest.fn();

      Usuario.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ plano: 'starter' })
      });
      Plano.findOne.mockResolvedValue({
        limites: { funcionarios: 5 }
      });
      Funcionario.countDocuments.mockResolvedValue(5);

      await verificarLimiteFuncionarios(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          sucesso: false,
          codigo: 'LIMITE_FUNCIONARIOS_ATINGIDO',
          limite: 5,
          atual: 5,
          upgradePath: '/pricing'
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('retorna 404 quando usuário não é encontrado', async () => {
      const req = mockReq('user123');
      const res = mockRes();
      const next = jest.fn();

      Usuario.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await verificarLimiteFuncionarios(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          sucesso: false,
          mensagem: 'Usuário não encontrado'
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('retorna 500 quando plano não é encontrado', async () => {
      const req = mockReq('user123');
      const res = mockRes();
      const next = jest.fn();

      Usuario.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ plano: 'starter' })
      });
      Plano.findOne.mockResolvedValue(null);

      await verificarLimiteFuncionarios(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          sucesso: false,
          mensagem: 'Plano não encontrado'
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('trata erros corretamente', async () => {
      const req = mockReq('user123');
      const res = mockRes();
      const next = jest.fn();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      Usuario.findById.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await verificarLimiteFuncionarios(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          sucesso: false,
          mensagem: 'Erro ao verificar limite do plano'
        })
      );
      expect(next).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('verificarLimiteClientes', () => {
    test('chama next() quando limite não é excedido', async () => {
      const req = mockReq('user123');
      const res = mockRes();
      const next = jest.fn();

      Usuario.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ plano: 'pro' })
      });
      Plano.findOne.mockResolvedValue({
        limites: { clientes: 200 }
      });
      Cliente.countDocuments.mockResolvedValue(150);

      await verificarLimiteClientes(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('retorna 403 quando limite é excedido', async () => {
      const req = mockReq('user123');
      const res = mockRes();
      const next = jest.fn();

      Usuario.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ plano: 'starter' })
      });
      Plano.findOne.mockResolvedValue({
        limites: { clientes: 50 }
      });
      Cliente.countDocuments.mockResolvedValue(50);

      await verificarLimiteClientes(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          sucesso: false,
          codigo: 'LIMITE_CLIENTES_ATINGIDO',
          limite: 50,
          atual: 50
        })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('verificarLimiteAgendamentos', () => {
    test('chama next() quando limite mensal não é excedido', async () => {
      const req = mockReq('user123');
      const res = mockRes();
      const next = jest.fn();

      Usuario.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ plano: 'pro' })
      });
      Plano.findOne.mockResolvedValue({
        limites: { agendamentosMes: 500 }
      });
      Agendamento.countDocuments.mockResolvedValue(300);

      await verificarLimiteAgendamentos(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('retorna 403 quando limite mensal é excedido', async () => {
      const req = mockReq('user123');
      const res = mockRes();
      const next = jest.fn();

      Usuario.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ plano: 'starter' })
      });
      Plano.findOne.mockResolvedValue({
        limites: { agendamentosMes: 100 }
      });
      Agendamento.countDocuments.mockResolvedValue(100);

      await verificarLimiteAgendamentos(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          sucesso: false,
          codigo: 'LIMITE_AGENDAMENTOS_ATINGIDO',
          limite: 100,
          atual: 100,
          periodo: 'mensal'
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('contagem de agendamentos respeita período mensal', async () => {
      const req = mockReq('user123');
      const res = mockRes();
      const next = jest.fn();

      Usuario.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ plano: 'pro' })
      });
      Plano.findOne.mockResolvedValue({
        limites: { agendamentosMes: 500 }
      });
      Agendamento.countDocuments.mockResolvedValue(250);

      await verificarLimiteAgendamentos(req, res, next);

      const callArgs = Agendamento.countDocuments.mock.calls[0][0];
      expect(callArgs.empresa).toBe('user123');
      expect(callArgs.createdAt).toBeDefined();
      expect(callArgs.createdAt.$gte).toBeInstanceOf(Date);
      expect(callArgs.createdAt.$lte).toBeInstanceOf(Date);
      expect(next).toHaveBeenCalled();
    });
  });
});
