import express from 'express';
import mongoose from 'mongoose';
import Agendamento from '../models/Agendamento.js';
import Servico from '../models/Servico.js';
import Usuario from '../models/Usuario.js';
import Cliente from '../models/Cliente.js';
import { enviarConfirmacaoAgendamento } from '../utils/emailService.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function sanitizeError(error) {
  if (process.env.NODE_ENV === 'development') {
    return error.message;
  }
  if (error.name === 'MongoError' || error.name === 'MongoServerError') {
    return 'Erro ao processar requisição';
  }
  return error.message || 'Erro desconhecido';
}

router.get('/saloes/:salaoId/servicos', async (req, res) => {
  try {
    const { salaoId } = req.params;

    if (!isValidObjectId(salaoId)) {
      return res.status(400).json({ sucesso: false, mensagem: 'ID de salão inválido' });
    }

    const salon = await Usuario.findById(salaoId).select('_id');
    if (!salon) {
      return res.status(404).json({ sucesso: false, mensagem: 'Salão não encontrado' });
    }

    const servicos = await Servico.find({ empresa: salaoId })
      .select('nome duracao preco descricao');

    res.json({ sucesso: true, dados: servicos });
  } catch (erro) {
    console.error('[PublicServicos]', erro);
    res.status(500).json({ sucesso: false, mensagem: sanitizeError(erro) });
  }
});

router.get('/saloes/:salaoId/horarios', async (req, res) => {
  try {
    const { salaoId } = req.params;
    const { data, profissional, duracao = 60 } = req.query;

    if (!isValidObjectId(salaoId)) {
      return res.status(400).json({ sucesso: false, mensagem: 'ID de salão inválido' });
    }

    if (!data) {
      return res.status(400).json({ sucesso: false, mensagem: 'Data é obrigatória' });
    }

    const salon = await Usuario.findById(salaoId).select('_id');
    if (!salon) {
      return res.status(404).json({ sucesso: false, mensagem: 'Salão não encontrado' });
    }

    const dataAgendamento = new Date(data);
    dataAgendamento.setHours(0, 0, 0, 0);

    const agendamentosDia = await Agendamento.find({
      empresa: salaoId,
      dataAgendamento,
      ...(profissional && { profissional }),
      status: { $in: ['agendado', 'aguardando', 'confirmado'] },
    }).select('horarioInicio duracao');

    const horariosOcupados = agendamentosDia.map(a => ({
      inicio: timeToMinutes(a.horarioInicio),
      fim: timeToMinutes(adicionarMinutos(a.horarioInicio, a.duracao || 60)),
    }));

    const horariosDisponiveis = gerarHorariosDisponiveis(horariosOcupados, parseInt(duracao));

    res.json({ sucesso: true, dados: horariosDisponiveis });
  } catch (erro) {
    console.error('[PublicHorarios]', erro);
    res.status(500).json({ sucesso: false, mensagem: sanitizeError(erro) });
  }
});

router.post('/saloes/:salaoId/agendamentos', authLimiter, async (req, res) => {
  try {
    const { salaoId } = req.params;
    const {
      nomeCliente, emailCliente, telefonecliente,
      profissional, servico, dataAgendamento, horarioInicio, duracao, notas,
    } = req.body;

    if (!isValidObjectId(salaoId)) {
      return res.status(400).json({ sucesso: false, mensagem: 'ID de salão inválido' });
    }

    if (!nomeCliente || !profissional || !servico || !dataAgendamento || !horarioInicio) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Nome do cliente, profissional, serviço, data e horário são obrigatórios'
      });
    }

    if (emailCliente && !isValidEmail(emailCliente)) {
      return res.status(400).json({ sucesso: false, mensagem: 'Email inválido' });
    }

    const salon = await Usuario.findById(salaoId).select('_id nomeEmpresa');
    if (!salon) {
      return res.status(404).json({ sucesso: false, mensagem: 'Salão não encontrado' });
    }

    const servicoData = await Servico.findOne({ empresa: salaoId, nome: servico }).select('preco duracao');
    if (!servicoData) {
      return res.status(404).json({ sucesso: false, mensagem: 'Serviço não encontrado' });
    }

    const temConflito = await Agendamento.verificarConflito(
      profissional, dataAgendamento, horarioInicio, duracao || servicoData.duracao || 60
    );
    if (temConflito) {
      return res.status(409).json({
        sucesso: false,
        mensagem: 'Horário não disponível para este profissional nesta data',
      });
    }

    let clienteId = null;
    if (emailCliente) {
      const clienteExistente = await Cliente.findOne({ empresa: salaoId, email: emailCliente });
      if (clienteExistente) {
        clienteId = clienteExistente._id;
      } else {
        const novoCliente = await Cliente.create({
          empresa: salaoId,
          nome: nomeCliente,
          email: emailCliente,
          telefone: telefonecliente || '',
        });
        clienteId = novoCliente._id;
      }
    }

    const agendamento = await Agendamento.create({
      empresa: salaoId,
      cliente: clienteId,
      nomeCliente,
      profissional,
      servico,
      dataAgendamento,
      horarioInicio,
      duracao: servicoData.duracao || 60,
      preco: servicoData.preco || 0,
      notas: notas || '',
      pagamento: 'Pendente',
      status: 'aguardando',
    });

    if (emailCliente) {
      const data = new Date(dataAgendamento).toLocaleDateString('pt-BR');
      enviarConfirmacaoAgendamento({
        nome: nomeCliente,
        email: emailCliente,
        servico,
        profissional,
        data,
        horario: horarioInicio,
        preco: agendamento.preco,
        nomeEmpresa: salon.nomeEmpresa || 'Salão',
      }).catch(err => console.warn('[Email] Confirmação:', err.message));
    }

    res.status(201).json({
      sucesso: true,
      mensagem: 'Agendamento criado com sucesso. Aguarde confirmação.',
      dados: agendamento
    });
  } catch (erro) {
    console.error('[PublicBooking]', erro);
    res.status(500).json({ sucesso: false, mensagem: sanitizeError(erro) });
  }
});

function timeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const [horas, mins] = timeStr.split(':').map(Number);
  return (horas || 0) * 60 + (mins || 0);
}

function adicionarMinutos(horario, minutos) {
  const [horas, mins] = horario.split(':').map(Number);
  const totalMinutos = horas * 60 + mins + minutos;
  const novasHoras = Math.floor(totalMinutos / 60) % 24;
  const novosMinutos = totalMinutos % 60;
  return `${String(novasHoras).padStart(2, '0')}:${String(novosMinutos).padStart(2, '0')}`;
}

function gerarHorariosDisponiveis(horariosOcupados, duracao) {
  const horarios = [];
  const HORARIO_INICIO = 8;
  const HORARIO_FIM = 18;

  for (let h = HORARIO_INICIO; h < HORARIO_FIM; h++) {
    for (let m = 0; m < 60; m += 30) {
      const horario = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const horarioInicioMin = timeToMinutes(horario);
      const horarioFimMin = horarioInicioMin + duracao;

      const temConflito = horariosOcupados.some(
        ocupado => horarioInicioMin < ocupado.fim && horarioFimMin > ocupado.inicio
      );

      if (!temConflito) {
        horarios.push(horario);
      }
    }
  }

  return horarios;
}

export default router;
