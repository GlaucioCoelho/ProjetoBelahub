import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/belahub';

async function fixEmailIndex() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const col = db.collection('clientes');

  const indexes = await col.indexes();
  console.log('Índices atuais:', indexes.map(i => i.name));

  // Remove índice único antigo de email (sem sparse)
  for (const idx of indexes) {
    if (idx.key?.email !== undefined && idx.unique && !idx.sparse) {
      console.log(`Removendo índice: ${idx.name}`);
      await col.dropIndex(idx.name);
    }
  }

  // Cria índice correto: único apenas quando email não é null (sparse)
  await col.createIndex(
    { email: 1 },
    { unique: true, sparse: true, background: true }
  );
  console.log('✅ Índice email_1 recriado como unique + sparse');

  await mongoose.disconnect();
  console.log('Concluído.');
}

fixEmailIndex().catch(err => { console.error(err); process.exit(1); });
