import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

const { enviarBoasVindas } = await import('../src/utils/emailService.js');

console.log('Resend configurado:', !!process.env.RESEND_API_KEY);
await enviarBoasVindas({
  nome: 'Glaucio Coelho',
  email: 'glauciovenancio17@gmail.com',
  nomeEmpresa: 'BelaHub Studio'
});
console.log('Pronto!');
