import jwt from 'jsonwebtoken';

export const proteger = (req, res, next) => {
  try {
    let token;

    // Verificar se token está no header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Se não houver token
    if (!token) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Token não fornecido. Acesso negado.'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    console.error('Erro de autenticação:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Token expirado. Faça login novamente.'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Token inválido'
      });
    }

    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao verificar autenticação'
    });
  }
};

export const autorizar = (...rolesPermitidas) => {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidas.includes(req.usuario.role)) {
      return res.status(403).json({ sucesso: false, mensagem: 'Acesso negado. Permissão insuficiente.' });
    }
    next();
  };
};

export const superAdmin = [
  (req, res, next) => {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) token = req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).json({ sucesso: false, mensagem: 'Token não fornecido.' });
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.usuario = decoded;
      next();
    } catch {
      res.status(401).json({ sucesso: false, mensagem: 'Token inválido.' });
    }
  },
  (req, res, next) => {
    if (req.usuario?.role !== 'super_admin') {
      return res.status(403).json({ sucesso: false, mensagem: 'Acesso restrito ao painel administrativo.' });
    }
    next();
  },
];
