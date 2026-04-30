import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';
import AuditLog from '../models/AuditLog.js';
import { enviarBoasVindas } from '../utils/emailService.js';

// Gerar JWT Token
const gerarToken = (usuario) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return jwt.sign({ id: usuario._id, role: usuario.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Registrar novo usuário
export const registrar = async (req, res) => {
  try {
    const { nome, email, senha, telefone, nomeEmpresa } = req.body;

    // Validações básicas
    if (!nome || !email || !senha) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Nome, email e senha são obrigatórios'
      });
    }

    // Verificar se usuário já existe
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Email já cadastrado'
      });
    }

    // Criar novo usuário
    const usuario = await Usuario.create({
      nome,
      email,
      senha,
      telefone,
      nomeEmpresa
    });

    // Gerar token
    const token = gerarToken(usuario);

    // Enviar e-mail de boas-vindas (não bloqueia o registro se falhar)
    enviarBoasVindas({ nome, email, nomeEmpresa }).catch(err =>
      console.warn('[Email] Falha ao enviar boas-vindas:', err.message)
    );

    // Responder com sucesso
    res.status(201).json({
      sucesso: true,
      mensagem: 'Usuário registrado com sucesso',
      token,
      usuario: usuario.toJSON()
    });
  } catch (error) {
    console.error('Erro ao registrar:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      sucesso: false,
      mensagem: error.message || 'Erro ao registrar usuário',
      erro: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login do usuário
export const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Validações
    if (!email || !senha) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Email e senha são obrigatórios'
      });
    }

    // Buscar usuário com a senha (normalmente não retorna)
    const usuario = await Usuario.findOne({ email }).select('+senha');

    if (!usuario) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Email ou senha inválidos'
      });
    }

    // Comparar senhas
    const senhaValida = await usuario.compararSenha(senha);

    if (!senhaValida) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Email ou senha inválidos'
      });
    }

    // Verificar se usuário está ativo
    if (!usuario.ativo) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Usuário inativo'
      });
    }

    // Atualizar último acesso
    usuario.ultimoAcesso = new Date();
    await usuario.save();

    // Audit log
    AuditLog.create({ empresa: usuario._id, usuario: usuario._id, acao: 'login', descricao: `Login: ${usuario.email}`, ip: req.ip }).catch(() => {});

    const token = gerarToken(usuario);

    res.status(200).json({
      sucesso: true,
      mensagem: 'Login realizado com sucesso',
      token,
      usuario: usuario.toJSON()
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: error.message || 'Erro ao fazer login'
    });
  }
};

// Obter usuário atual (protegido)
export const obterMeuPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id);

    if (!usuario) {
      return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado' });
    }

    res.status(200).json({
      sucesso: true,
      usuario: usuario.toJSON()
    });
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: error.message || 'Erro ao obter perfil'
    });
  }
};

export const completarOnboarding = async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndUpdate(
      req.usuario.id,
      { onboardingCompleted: true },
      { new: true }
    );

    if (!usuario) {
      return res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado' });
    }

    res.status(200).json({
      sucesso: true,
      mensagem: 'Onboarding completado',
      usuario: usuario.toJSON()
    });
  } catch (error) {
    console.error('Erro ao completar onboarding:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: error.message || 'Erro ao completar onboarding'
    });
  }
};

// Fazer logout (frontend remove o token)
export const logout = async (req, res) => {
  res.status(200).json({
    sucesso: true,
    mensagem: 'Logout realizado com sucesso'
  });
};
