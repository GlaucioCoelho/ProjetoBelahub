import { jest } from '@jest/globals';

// ── Mocks ─────────────────────────────────────────────────────────────────────
const mockClienteFindOne        = jest.fn();
const mockClienteFind           = jest.fn();
const mockClienteCreate         = jest.fn();
const mockClienteFindOneAndDelete = jest.fn();
const mockAgendamentoFind       = jest.fn();

await jest.unstable_mockModule('../models/Cliente.js', () => ({
  default: {
    findOne:           mockClienteFindOne,
    find:              mockClienteFind,
    create:            mockClienteCreate,
    findOneAndDelete:  mockClienteFindOneAndDelete,
  },
}));

await jest.unstable_mockModule('../models/Agendamento.js', () => ({
  default: { find: mockAgendamentoFind },
}));

const { criar, listar, obter, atualizar, deletar, obterEstatisticas } =
  await import('../controllers/clienteController.js');

// ── Helpers ───────────────────────────────────────────────────────────────────
const USUARIO_ID = 'empresa123';
const mockReq = (body = {}, params = {}, query = {}) => ({
  body,
  params,
  query,
  usuario: { id: USUARIO_ID },
});
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

const clienteBase = {
  _id: 'cli1',
  nome: 'Ana Silva',
  email: 'ana@test.com',
  telefone: '(11) 99999-9999',
  empresa: USUARIO_ID,
  save: jest.fn().mockResolvedValue(true),
};

// ── criar ─────────────────────────────────────────────────────────────────────
describe('clienteController › criar', () => {
  beforeEach(() => jest.clearAllMocks());

  test('400 quando nome está faltando', async () => {
    const res = mockRes();
    await criar(mockReq({ email: 'a@a.com', telefone: '(11) 99999-9999' }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ sucesso: false }));
  });

  test('400 quando email está faltando', async () => {
    const res = mockRes();
    await criar(mockReq({ nome: 'Ana', telefone: '(11) 99999-9999' }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('400 quando telefone está faltando', async () => {
    const res = mockRes();
    await criar(mockReq({ nome: 'Ana', email: 'a@a.com' }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('409 quando email já existe', async () => {
    mockClienteFindOne.mockResolvedValue({ email: 'ana@test.com' });
    const res = mockRes();
    await criar(mockReq({ nome: 'Ana', email: 'ana@test.com', telefone: '(11) 99999-9999' }), res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ mensagem: 'Email já cadastrado' })
    );
  });

  test('201 quando dados são válidos', async () => {
    mockClienteFindOne.mockResolvedValue(null);
    mockClienteCreate.mockResolvedValue(clienteBase);
    const res = mockRes();
    await criar(
      mockReq({ nome: 'Ana Silva', email: 'ana@test.com', telefone: '(11) 99999-9999' }),
      res
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ sucesso: true, dados: clienteBase })
    );
  });
});

// ── listar ────────────────────────────────────────────────────────────────────
describe('clienteController › listar', () => {
  beforeEach(() => jest.clearAllMocks());

  test('retorna lista de clientes da empresa', async () => {
    mockClienteFind.mockReturnValue({ sort: jest.fn().mockResolvedValue([clienteBase]) });
    const res = mockRes();
    await listar(mockReq(), res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ sucesso: true, dados: [clienteBase] })
    );
  });

  test('filtra pelo campo ativo=false', async () => {
    const sortMock = jest.fn().mockResolvedValue([]);
    mockClienteFind.mockReturnValue({ sort: sortMock });
    const res = mockRes();
    await listar(mockReq({}, {}, { ativo: 'false' }), res);
    expect(mockClienteFind).toHaveBeenCalledWith(
      expect.objectContaining({ ativo: false })
    );
  });
});

// ── obter ─────────────────────────────────────────────────────────────────────
describe('clienteController › obter', () => {
  beforeEach(() => jest.clearAllMocks());

  test('404 quando cliente não pertence à empresa', async () => {
    mockClienteFindOne.mockResolvedValue(null);
    const res = mockRes();
    await obter(mockReq({}, { id: 'naoexiste' }), res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ mensagem: 'Cliente não encontrado' })
    );
  });

  test('200 com dados do cliente', async () => {
    mockClienteFindOne.mockResolvedValue(clienteBase);
    const res = mockRes();
    await obter(mockReq({}, { id: 'cli1' }), res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ sucesso: true, dados: clienteBase })
    );
  });
});

// ── atualizar ─────────────────────────────────────────────────────────────────
describe('clienteController › atualizar', () => {
  beforeEach(() => jest.clearAllMocks());

  test('404 quando cliente não existe', async () => {
    mockClienteFindOne.mockResolvedValue(null);
    const res = mockRes();
    await atualizar(mockReq({ nome: 'Novo' }, { id: 'naoexiste' }), res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('409 quando novo email já pertence a outro cliente', async () => {
    const clienteAtual = { ...clienteBase, email: 'antigo@test.com', save: jest.fn() };
    mockClienteFindOne
      .mockResolvedValueOnce(clienteAtual)       // busca pelo id
      .mockResolvedValueOnce({ email: 'novo@test.com' }); // email já existe
    const res = mockRes();
    await atualizar(mockReq({ email: 'novo@test.com' }, { id: 'cli1' }), res);
    expect(res.status).toHaveBeenCalledWith(409);
  });

  test('200 quando atualização é válida', async () => {
    const clienteAtual = { ...clienteBase, save: jest.fn().mockResolvedValue(true) };
    mockClienteFindOne.mockResolvedValueOnce(clienteAtual).mockResolvedValueOnce(null);
    const res = mockRes();
    await atualizar(mockReq({ nome: 'Ana Atualizada' }, { id: 'cli1' }), res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ sucesso: true, mensagem: 'Cliente atualizado com sucesso' })
    );
  });
});

// ── deletar ───────────────────────────────────────────────────────────────────
describe('clienteController › deletar', () => {
  beforeEach(() => jest.clearAllMocks());

  test('404 quando cliente não existe', async () => {
    mockClienteFindOneAndDelete.mockResolvedValue(null);
    const res = mockRes();
    await deletar(mockReq({}, { id: 'naoexiste' }), res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('200 quando cliente é deletado', async () => {
    mockClienteFindOneAndDelete.mockResolvedValue(clienteBase);
    const res = mockRes();
    await deletar(mockReq({}, { id: 'cli1' }), res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ sucesso: true, mensagem: 'Cliente deletado com sucesso' })
    );
  });
});

// ── obterEstatisticas ─────────────────────────────────────────────────────────
describe('clienteController › obterEstatisticas', () => {
  beforeEach(() => jest.clearAllMocks());

  test('retorna estatísticas calculadas corretamente', async () => {
    mockAgendamentoFind.mockResolvedValue([
      { status: 'concluido', preco: 100 },
      { status: 'concluido', preco: 200 },
      { status: 'agendado',  preco: 150 },
    ]);
    const res = mockRes();
    await obterEstatisticas(mockReq({}, { id: 'cli1' }), res);
    const { dados } = res.json.mock.calls[0][0];
    expect(dados.totalAgendamentos).toBe(3);
    expect(dados.agendamentosConcluidos).toBe(2);
    expect(dados.gastoTotal).toBe(300);
    expect(dados.gastoPorAgendamento).toBe(150);
  });

  test('retorna gastoTotal 0 quando não há concluídos', async () => {
    mockAgendamentoFind.mockResolvedValue([]);
    const res = mockRes();
    await obterEstatisticas(mockReq({}, { id: 'cli1' }), res);
    const { dados } = res.json.mock.calls[0][0];
    expect(dados.gastoTotal).toBe(0);
    expect(dados.gastoPorAgendamento).toBe(0);
  });
});
