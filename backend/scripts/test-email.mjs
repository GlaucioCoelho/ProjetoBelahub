import dotenv from 'dotenv';
dotenv.config();
import { enviarBoasVindas } from '../src/utils/emailService.js';

console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS configurado:', !!process.env.SMTP_PASS);

try {
  await enviarBoasVindas({
    nome: 'Glaucio',
    email: 'glauciovenancio17@gmail.com',
    nomeEmpresa: 'BelaHub Studio'
  });
  console.log('E-mail enviado com sucesso!');
} catch (err) {
  console.error('Erro ao enviar:', err.message);
}
