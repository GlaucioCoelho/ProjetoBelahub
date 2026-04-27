import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../.env') });

import mongoose from 'mongoose';
await mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection.db;
const r = await db.collection('usuarios').deleteOne({ email: 'franrosacoelho@gmail.com' });
console.log(r.deletedCount === 1 ? 'Conta apagada.' : 'Conta não encontrada.');
await mongoose.disconnect();
