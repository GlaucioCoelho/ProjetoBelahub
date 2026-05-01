import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: 'Muitas tentativas de login/registro. Tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => ['test', 'development'].includes(process.env.NODE_ENV),
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 requests per windowMs
  message: 'Você excedeu o limite de requisições. Tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => ['test', 'development'].includes(process.env.NODE_ENV),
});
