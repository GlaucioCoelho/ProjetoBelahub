import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const colecoes = [
  'clientes',
  'funcionarios',
  'produtos',
  'estoques',
  'movimentacaos',
  'alertaestoques',
  'servicos',
  'pacotes',
  'transacaos',
  'faturamentos',
  'comissaos',
  'escalas',
  'agendamentos',
  'comandas',
];

async function limpar() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/belahub');
  console.log('✅ Conectado ao MongoDB\n');

  for (const col of colecoes) {
    try {
      const result = await mongoose.connection.collection(col).deleteMany({});
      console.log(`🗑  ${col.padEnd(20)} → ${result.deletedCount} documento(s) removido(s)`);
    } catch (err) {
      console.log(`⚠️  ${col.padEnd(20)} → erro: ${err.message}`);
    }
  }

  console.log('\n✅ Limpeza concluída. Usuários preservados.');
  await mongoose.disconnect();
  process.exit(0);
}

limpar().catch(err => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
