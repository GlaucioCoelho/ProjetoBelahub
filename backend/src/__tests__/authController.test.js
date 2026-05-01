import { jest } from '@jest/globals';

// ── Mocks devem ser declarados ANTES do import dinâmico do controller ──
const mockFindOne   = jest.fn();
const mockCreate    = jest.fn();
const mockFindById  = jest.fn();

await jest.unstable_mockModule('../models/Usuario.js', () => ({
  default: {
    findOne:  mockFindOne,
    create:   mockCreate,
    findById: mockFindById,
  },
}));

const { registrar, login, obterMeuPerfil } = await import('../controllers/authController.js');

// ── Helpers ──────────────────────────────────────────────────────────────────
const mockReq = (body = {}, params = {}, extra = {}) => ({ body, params, ...extra });
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

// ── registrar ─────────────────────────────────────────────────────────────────
describe('authController › registrar', () => {
  beforeEach(() => jest.clearAllMocks());

  test('400 quando nome está faltando', async () => {
    const res = mockRes();
    await registrar(mockReq({ email: 'a@a.com', senha: '123456' }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ sucesso: false }));
  });

  test('400 quando email está faltando', async () => {
    const res = mockRes();
    await registrar(mockReq({ nome: 'Teste', senha: '123456' }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('400 quando senha está faltando', async () => {
    const res = mockRes();
    await registrar(mockReq({ nome: 'Teste', email: 'a@a.com' }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('400 quando email já existe', async () => {
    mockFindOne.mockResolvedValue({ _id: 'existente', email: 'a@a.com' });
    const res = mockRes();
    await registrar(mockReq({ nome: 'Teste', email: 'a@a.com', senha: '123456' }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ mensagem: 'Email já cadastrado' })
    );
  });

  test('201 + token quando dados são válidos', async () => {
    mockFindOne.mockResolvedValue(null);
    mockCreate.mockResolvedValue({
      _id: 'newid',
      nome: 'Teste',
      email: 'novo@a.com',
      toJSON: () => ({ _id: 'newid', nome: 'Teste', email: 'novo@a.com' }),
    });
    const res = mockRes();
    await registrar(mockReq({ nome: 'Teste', email: 'novo@a.com', senha: '123456' }), res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ sucesso: true, token: expect.any(String) })
    );
  });
});

// ── login ─────────────────────────────────────────────────────────────────────
describe('authController › login', () => {
  beforeEach(() => jest.clearAllMocks());

  test('400 quando email está faltando', async () => {
    const res = mockRes();
    await login(mockReq({ senha: '123456' }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('400 quando senha está faltando', async () => {
    const res = mockRes();
    await login(mockReq({ email: 'a@a.com' }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('401 quando usuário não existe', async () => {
    mockFindOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
    const res = mockRes();
    await login(mockReq({ email: 'naocadastrado@a.com', senha: '123456' }), res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ mensagem: 'Email ou senha inválidos' })
    );
  });

  test('401 quando senha é incorreta', async () => {
    mockFindOne.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: '1',
        email: 'a@a.com',
        ativo: true,
        compararSenha: jest.fn().mockResolvedValue(false),
        toJSON: () => ({}),
      }),
    });
    const res = mockRes();
    await login(mockReq({ email: 'a@a.com', senha: 'errada' }), res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('401 quando usuário está inativo', async () => {
    mockFindOne.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: '1',
        email: 'a@a.com',
        ativo: false,
        compararSenha: jest.fn().mockResolvedValue(true),
        toJSON: () => ({}),
      }),
    });
    const res = mockRes();
    await login(mockReq({ email: 'a@a.com', senha: '123456' }), res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ mensagem: 'Usuário inativo' })
    );
  });

  test('200 + token quando credenciais são válidas', async () => {
    const usuario = {
      _id: 'userid',
      email: 'a@a.com',
      ativo: true,
      ultimoAcesso: new Date(),
      compararSenha: jest.fn().mockResolvedValue(true),
      save: jest.fn().mockResolvedValue(true),
      toJSON: () => ({ _id: 'userid', email: 'a@a.com' }),
    };
    mockFindOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(usuario),
    });
    const res = mockRes();
    await login(mockReq({ email: 'a@a.com', senha: '123456' }), res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ sucesso: true, token: expect.any(String) })
    );
    expect(usuario.save).toHaveBeenCalled();
  });
});

// ── obterMeuPerfil ────────────────────────────────────────────────────────────
describe('authController › obterMeuPerfil', () => {
  beforeEach(() => jest.clearAllMocks());

  test('200 com dados do usuário autenticado', async () => {
    mockFindById.mockResolvedValue({
      _id: 'userid',
      nome: 'Teste',
      toJSON: () => ({ _id: 'userid', nome: 'Teste' }),
    });
    const req = mockReq({}, {}, { usuario: { id: 'userid' } });
    const res = mockRes();
    await obterMeuPerfil(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ sucesso: true, usuario: expect.any(Object) })
    );
  });
});
