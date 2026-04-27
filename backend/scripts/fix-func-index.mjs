import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
await mongoose.connect(process.env.MONGODB_URI);
const col = mongoose.connection.db.collection('funcionarios');
const idxs = await col.indexes();
for (const idx of idxs) {
  if (idx.key?.email !== undefined && idx.unique && !idx.sparse) {
    console.log('Removendo:', idx.name);
    await col.dropIndex(idx.name);
  }
}
await col.createIndex({ email: 1 }, { unique: true, sparse: true, background: true });
console.log('Índice email funcionários corrigido');
await mongoose.disconnect();
