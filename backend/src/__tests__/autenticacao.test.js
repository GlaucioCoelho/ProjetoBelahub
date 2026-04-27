import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';

const { proteger } = await import('../middlewares/autenticacao.js');

const JWT_SECRET = 'belahub-jwt-secret-key-production-2024-secure';

const mockReq = (authHeader) => ({
  headers: { authorization: authHeader },
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

describe('middleware › proteger', () => {
  test('401 quando nenhum token é fornecido', () => {
    const res  = mockRes();
    const next = jest.fn();
    proteger(mockReq(undefined), res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ mensagem: 'Token não fornecido. Acesso negado.' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('401 quando token é inválido', () => {
    const res  = mockRes();
    const next = jest.fn();
    proteger(mockReq('Bearer tokeninvalido'), res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('401 quando token está expirado', () => {
    const tokenExpirado = jwt.sign({ id: 'user1' }, JWT_SECRET, { expiresIn: '-1s' });
    const res  = mockRes();
    const next = jest.fn();
    proteger(mockReq(`Bearer ${tokenExpirado}`), res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ mensagem: 'Token expirado. Faça login novamente.' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('chama next() e injeta req.usuario com token válido', () => {
    const tokenValido = jwt.sign({ id: 'user123' }, JWT_SECRET, { expiresIn: '1h' });
    const req  = mockReq(`Bearer ${tokenValido}`);
    const res  = mockRes();
    const next = jest.fn();
    proteger(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(req.usuario).toBeDefined();
    expect(req.usuario.id).toBe('user123');
  });
});
