import cron from 'node-cron';
import Agendamento from '../models/Agendamento.js';
import Cliente     from '../models/Cliente.js';
import Usuario     from '../models/Usuario.js';
import { enviarLembreteAgendamento } from '../utils/emailService.js';

// Runs every hour — finds appointments starting in 23–25h and sends a reminder once.
export function iniciarJobLembrete() {
  cron.schedule('0 * * * *', async () => {
    try {
      const agora = new Date();
      const inicio = new Date(agora.getTime() + 23 * 60 * 60 * 1000);
      const fim    = new Date(agora.getTime() + 25 * 60 * 60 * 1000);

      const agendamentos = await Agendamento.find({
        status:          { $in: ['agendado', 'aguardando'] },
        lembreteEnviado: false,
        dataAgendamento: { $gte: inicio, $lte: fim },
        cliente:         { $exists: true, $ne: null },
      });

      for (const ag of agendamentos) {
        const [cliente, empresa] = await Promise.all([
          Cliente.findById(ag.cliente).select('nome email'),
          Usuario.findById(ag.empresa).select('nomeEmpresa'),
        ]);

        if (cliente?.email) {
          const data = new Date(ag.dataAgendamento).toLocaleDateString('pt-BR');
          await enviarLembreteAgendamento({
            nome:        cliente.nome,
            email:       cliente.email,
            servico:     ag.servico,
            profissional: ag.profissional,
            data,
            horario:     ag.horarioInicio,
            nomeEmpresa: empresa?.nomeEmpresa,
          }).catch(err => console.warn('[Email] Lembrete falhou:', err.message));
        }

        await Agendamento.findByIdAndUpdate(ag._id, { lembreteEnviado: true });
      }

      if (agendamentos.length > 0) {
        console.log(`[Lembrete] ${agendamentos.length} lembrete(s) enviado(s)`);
      }
    } catch (err) {
      console.error('[Lembrete] Erro no job:', err.message);
    }
  });

  console.log('[Lembrete] Job de lembretes de agendamento iniciado (a cada hora)');
}
