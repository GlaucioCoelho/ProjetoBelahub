import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection.db;

const agendamentos = await db.collection('agendamentos').find({ status: 'concluido' }).toArray();
const funcionarios = await db.collection('funcionarios').find({}).toArray();

console.log(`Agendamentos concluídos: ${agendamentos.length}`);
console.log(`Funcionários: ${funcionarios.length}`);

// Zerar todos os totais
await db.collection('funcionarios').updateMany({}, {
  $set: { totalAtendimentos: 0, totalFaturado: 0, totalComissoes: 0 }
});
console.log('Totais zerados.');

// Recalcular a partir dos agendamentos concluídos
for (const ag of agendamentos) {
  const preco = ag.preco || 0;
  const nomeProfissional = ag.profissional;
  if (!nomeProfissional) continue;

  const func = funcionarios.find(f => f.nome === nomeProfissional && String(f.empresa) === String(ag.empresa));
  if (!func) {
    console.log(`  Profissional não encontrado: ${nomeProfissional}`);
    continue;
  }

  const comissaoPerc = func.comissaoPercentual || 0;
  const comissaoValor = parseFloat(((preco * comissaoPerc) / 100).toFixed(2));

  await db.collection('funcionarios').updateOne(
    { _id: func._id },
    { $inc: { totalAtendimentos: 1, totalFaturado: preco, totalComissoes: comissaoValor } }
  );
  console.log(`  ${nomeProfissional}: +1 atend, +R$${preco} faturado, +R$${comissaoValor} comissão`);
}

// Resultado final
const result = await db.collection('funcionarios').find({}).toArray();
console.log('\nResultado final:');
result.forEach(f => {
  console.log(`  ${f.nome}: atend=${f.totalAtendimentos} | faturado=R$${f.totalFaturado} | comissao=R$${f.totalComissoes}`);
});

await mongoose.disconnect();
console.log('\nConcluído.');
