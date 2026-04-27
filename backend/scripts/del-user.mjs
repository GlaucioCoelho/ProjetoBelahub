import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

import mongoose from 'mongoose';
await mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection.db;
const result = await db.collection('usuarios').deleteOne({ email: 'glauciovenancio17@gmail.com' });
console.log('Deletados:', result.deletedCount);
await mongoose.disconnect();
