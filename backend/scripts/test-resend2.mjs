import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

const { data, error } = await resend.emails.send({
  from: 'BelaHub <onboarding@resend.dev>',
  to:   'glauciovenancio17@gmail.com',
  subject: 'Teste BelaHub',
  html: '<p>Teste de envio</p>',
});

if (error) {
  console.log('ERRO:', JSON.stringify(error, null, 2));
} else {
  console.log('OK - ID:', data.id);
}
