import Plano from '../models/Plano.js';
import Usuario from '../models/Usuario.js';
import Funcionario from '../models/Funcionario.js';
import Cliente from '../models/Cliente.js';
import Agendamento from '../models/Agendamento.js';

// Middleware para verificar se o tenant atingiu o limite de recursos do seu plano.
// Retorna 403 com mensagem de upgrade se o limite foi atingido.

export const verificarLimiteFuncionarios = async (req, res, next) => {
  try {
    const empresaId = req.usuario.id;

    // Fetch user to get plan
    const usuario = await Usuario.findById(empresaId).select('plano');
    if (!usuario) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Usuário não encontrado'
      });
    }

    // Fetch plan to get limits
    const plano = await Plano.findOne({ slug: usuario.plano });
    if (!plano) {
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Plano não encontrado'
      });
    }

    // Count existing funcionarios for this empresa
    const countFuncionarios = await Funcionario.countDocuments({ empresa: empresaId });

    // Check if adding one more would exceed limit
    if (countFuncionarios >= plano.limites.funcionarios) {
      return res.status(403).json({
        sucesso: false,
        mensagem: `Limite de ${plano.limites.funcionarios} funcionários atingido`,
        codigo: 'LIMITE_FUNCIONARIOS_ATINGIDO',
        limite: plano.limites.funcionarios,
        atual: countFuncionarios,
        upgradePath: '/pricing'
      });
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar limite de funcionários:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao verificar limite do plano'
    });
  }
};

export const verificarLimiteClientes = async (req, res, next) => {
  try {
    const empresaId = req.usuario.id;

    // Fetch user to get plan
    const usuario = await Usuario.findById(empresaId).select('plano');
    if (!usuario) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Usuário não encontrado'
      });
    }

    // Fetch plan to get limits
    const plano = await Plano.findOne({ slug: usuario.plano });
    if (!plano) {
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Plano não encontrado'
      });
    }

    // Count existing clientes for this empresa
    const countClientes = await Cliente.countDocuments({ empresa: empresaId });

    // Check if adding one more would exceed limit
    if (countClientes >= plano.limites.clientes) {
      return res.status(403).json({
        sucesso: false,
        mensagem: `Limite de ${plano.limites.clientes} clientes atingido`,
        codigo: 'LIMITE_CLIENTES_ATINGIDO',
        limite: plano.limites.clientes,
        atual: countClientes,
        upgradePath: '/pricing'
      });
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar limite de clientes:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao verificar limite do plano'
    });
  }
};

export const verificarLimiteAgendamentos = async (req, res, next) => {
  try {
    const empresaId = req.usuario.id;

    // Fetch user to get plan
    const usuario = await Usuario.findById(empresaId).select('plano');
    if (!usuario) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Usuário não encontrado'
      });
    }

    // Fetch plan to get limits
    const plano = await Plano.findOne({ slug: usuario.plano });
    if (!plano) {
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Plano não encontrado'
      });
    }

    // Count agendamentos created this month for this empresa
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const countAgendamentos = await Agendamento.countDocuments({
      empresa: empresaId,
      createdAt: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    });

    // Check if adding one more would exceed limit
    if (countAgendamentos >= plano.limites.agendamentosMes) {
      return res.status(403).json({
        sucesso: false,
        mensagem: `Limite de ${plano.limites.agendamentosMes} agendamentos por mês atingido`,
        codigo: 'LIMITE_AGENDAMENTOS_ATINGIDO',
        limite: plano.limites.agendamentosMes,
        atual: countAgendamentos,
        periodo: 'mensal',
        upgradePath: '/pricing'
      });
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar limite de agendamentos:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao verificar limite do plano'
    });
  }
};
