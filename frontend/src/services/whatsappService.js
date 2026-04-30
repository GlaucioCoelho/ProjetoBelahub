// WhatsApp integration service
// Generates WhatsApp links and manages WhatsApp API interactions

const whatsappService = {
  // Generate a click-to-WhatsApp link
  // https://wa.me/PHONENUMBER?text=MESSAGE
  gerarLinkWhatsApp: (telefone, mensagem = '') => {
    if (!telefone) return null;

    // Remove non-numeric characters from phone
    const numeroLimpo = telefone.replace(/\D/g, '');

    // Ensure country code (Brazil = 55)
    let numeroFormatado = numeroLimpo;
    if (!numeroLimpo.startsWith('55')) {
      numeroFormatado = '55' + numeroLimpo;
    }

    const url = new URL('https://wa.me/' + numeroFormatado);
    if (mensagem) {
      url.searchParams.set('text', mensagem);
    }

    return url.toString();
  },

  // Generate a link to start a WhatsApp chat with a pre-filled message
  abrirWhatsApp: (telefone, mensagem = '') => {
    const link = whatsappService.gerarLinkWhatsApp(telefone, mensagem);
    if (link) {
      window.open(link, '_blank');
    }
  },

  // Generate a message for client communication
  gerarMensagemCliente: (nomeCliente, servico = '') => {
    let mensagem = `Olá ${nomeCliente}!`;
    if (servico) {
      mensagem += ` Gostaria de agendar um(a) ${servico}.`;
    }
    return mensagem;
  },

  // Generate a message for appointment reminder
  gerarMensagemLembreteAgendamento: (nomeCliente, servico, dataHora) => {
    const data = new Date(dataHora);
    const dataFormatada = data.toLocaleDateString('pt-BR');
    const horaFormatada = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return `Olá ${nomeCliente}! 📅 Lembrete: Seu agendamento de ${servico} está confirmado para ${dataFormatada} às ${horaFormatada}. Qualquer dúvida, entre em contato.`;
  },

  // Get WhatsApp status from backend (if connected)
  async obterStatusWhatsApp() {
    try {
      const response = await fetch('/api/whatsapp/status');
      return response.ok ? await response.json() : null;
    } catch (error) {
      console.error('Erro ao obter status WhatsApp:', error);
      return null;
    }
  },
};

export default whatsappService;
