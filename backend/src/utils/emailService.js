import nodemailer from 'nodemailer';

let _transporter = null;
let _testAccount  = null;

async function getTransporter() {
  if (_transporter) return _transporter;

  if (process.env.RESEND_API_KEY) {
    // ── Produção: Resend via SMTP ──────────────────────────
    _transporter = nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: {
        user: 'resend',
        pass: process.env.RESEND_API_KEY,
      },
    });
    return _transporter;
  }

  // ── Desenvolvimento: Ethereal (captura e-mails sem enviar) ─
  if (!_testAccount) {
    _testAccount = await nodemailer.createTestAccount();
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║  📧  ETHEREAL EMAIL — captura de e-mails (dev)       ║');
    console.log(`║  Usuário : ${_testAccount.user.padEnd(42)}║`);
    console.log(`║  Senha   : ${_testAccount.pass.padEnd(42)}║`);
    console.log('║  Ver e-mails em: https://ethereal.email/messages      ║');
    console.log('╚══════════════════════════════════════════════════════╝');
  }
  _transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: _testAccount.user,
      pass: _testAccount.pass,
    },
  });
  return _transporter;
}

const FROM = process.env.EMAIL_FROM || '"BelaHub" <noreply@belahub.com>';

async function send({ to, subject, html }) {
  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({ from: FROM, to, subject, html });

    if (!process.env.RESEND_API_KEY) {
      // Mostra link para visualizar o e-mail capturado pelo Ethereal
      console.log(`[Email] Preview: ${nodemailer.getTestMessageUrl(info)}`);
    } else {
      console.log(`[Email] Enviado para ${to}: ${subject}`);
    }
  } catch (err) {
    console.error('[Email] Erro ao enviar:', err.message);
    throw err;
  }
}

export async function enviarBoasVindas({ nome, email, nomeEmpresa }) {
  await send({
    to:      email,
    subject: '🎉 Bem-vindo ao BelaHub!',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
        <div style="background:linear-gradient(135deg,#7c3aed,#e8185a);padding:32px 24px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:28px;letter-spacing:-0.5px">✂️ BelaHub</h1>
          <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px">Gestão inteligente para o seu salão</p>
        </div>
        <div style="padding:32px 24px">
          <h2 style="color:#1d1d1f;font-size:20px;margin:0 0 12px">Olá, ${nome}! 👋</h2>
          <p style="color:#555;line-height:1.6;margin:0 0 16px">
            Sua conta foi criada com sucesso${nomeEmpresa ? ` para o <strong>${nomeEmpresa}</strong>` : ''}.
            Estamos felizes em ter você no BelaHub!
          </p>
          <div style="background:#f8f5ff;border-radius:8px;padding:16px;margin-bottom:24px">
            <p style="margin:0;color:#7c3aed;font-size:13px;font-weight:600">🚀 Próximos passos</p>
            <ul style="color:#555;font-size:13px;line-height:1.8;margin:8px 0 0;padding-left:18px">
              <li>Cadastre seus colaboradores</li>
              <li>Adicione seus serviços</li>
              <li>Comece a agendar clientes</li>
            </ul>
          </div>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}"
             style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#e8185a);color:#fff;
                    text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px">
            Acessar o BelaHub →
          </a>
        </div>
        <div style="background:#f5f5f7;padding:16px 24px;text-align:center">
          <p style="color:#86868b;font-size:12px;margin:0">
            © ${new Date().getFullYear()} BelaHub · Este e-mail foi enviado para ${email}
          </p>
        </div>
      </div>
    `,
  });
}

export async function enviarResetSenha({ nome, email, link }) {
  await send({
    to:      email,
    subject: '🔐 Redefinição de senha — BelaHub',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
        <div style="background:linear-gradient(135deg,#7c3aed,#e8185a);padding:32px 24px;text-align:center;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;margin:0;font-size:28px">✂️ BelaHub</h1>
        </div>
        <div style="padding:32px 24px;background:#fff;border-radius:0 0 12px 12px">
          <h2 style="color:#1d1d1f;font-size:18px;margin:0 0 12px">Olá, ${nome}</h2>
          <p style="color:#555;line-height:1.6;margin:0 0 24px">
            Recebemos uma solicitação para redefinir a senha da sua conta.
            Clique no botão abaixo para criar uma nova senha.
          </p>
          <a href="${link}" style="display:inline-block;background:#7c3aed;color:#fff;
            text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px">
            Redefinir senha →
          </a>
          <p style="color:#86868b;font-size:12px;margin:24px 0 0">
            Se você não solicitou, ignore este e-mail. O link expira em 1 hora.
          </p>
        </div>
      </div>
    `,
  });
}
