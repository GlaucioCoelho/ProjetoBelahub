import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));

// Carrega dotenv antes de tudo
import dotenv from 'dotenv';
dotenv.config({ path: join(__dirname, '../.env') });

const { enviarBoasVindas } = await import('../src/utils/emailService.js');

console.log('Configurado:', !!process.env.SMTP_PASS);
try {
  await enviarBoasVindas({
    nome: 'Glaucio Coelho',
    email: 'glauciovenancio17@gmail.com',
    nomeEmpresa: 'BelaHub Studio'
  });
  console.log('OK - Verifique sua caixa de entrada!');
} catch(e) {
  console.error('ERRO:', e.message);
}
