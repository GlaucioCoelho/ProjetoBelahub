import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

import mongoose from 'mongoose';
await mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection.db;
const users = await db.collection('usuarios').find(
  { email: 'glauciovenancio17@gmail.com' },
  { projection: { _id:1, nome:1, email:1, createdAt:1 } }
).toArray();
console.log(JSON.stringify(users));
await mongoose.disconnect();
