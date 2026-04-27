import mongoose from 'mongoose';

const comissaoSchema = new mongoose.Schema(
  {
    empresa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'Empresa é obrigatória'],
    },
    funcionario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Funcionario',
      required: [true, 'Funcionário é obrigatório'],
    },
    agendamento: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agendamento',
      required: [true, 'Agendamento é obrigatório'],
    },
    percentualComissao: {
      type: Number,
      required: [true, 'Percentual de comissão é obrigatório'],
      min: [0, 'Percentual não pode ser negativo'],
      max: [100, 'Percentual não pode ser maior que 100'],
    },
    valorServico: {
      type: Number,
      required: [true, 'Valor do serviço é obrigatório'],
    },
    valorComissao: {
      type: Number,
      required: [true, 'Valor da comissão é obrigatório'],
    },
    status: {
      type: String,
      enum: ['pendente', 'processada', 'paga', 'cancelada'],
      default: 'pendente',
    },
    dataPagamento: {
      type: Date,
    },
    mes: {
      type: String,
      required: true,
    },
    transacao: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transacao',
    },
    observacoes: {
      type: String,
      maxlength: 200,
    },
  },
  { timestamps: true }
);

comissaoSchema.index({ empresa: 1, funcionario: 1, mes: 1 });
comissaoSchema.index({ status: 1 });
comissaoSchema.index({ createdAt: 1 });

comissaoSchema.statics.calcularComissoesPorMes = async function (funcionarioId, mes) {
  const agendamentos = await mongoose.model('Agendamento').find({
    profissional: funcionarioId,
    status: 'concluido',
  });

  const funcionario = await mongoose.model('Funcionario').findById(funcionarioId);
  if (!funcionario) return null;

  const totalComissoes = agendamentos.reduce((sum, a) => {
    const comissao = a.preco * (funcionario.comissaoPercentual / 100);
    return sum + comissao;
  }, 0);

  return {
    funcionarioId,
    mes,
    agendamentos: agendamentos.length,
    totalServicos: agendamentos.reduce((sum, a) => sum + (a.preco || 0), 0),
    percentualComissao: funcionario.comissaoPercentual,
    totalComissoes,
  };
};

comissaoSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.dataPagamentoFormatada = this.dataPagamento ? new Date(this.dataPagamento).toLocaleDateString('pt-BR') : null;
  obj.valorComissaoFormatado = this.valorComissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  return obj;
};

export default mongoose.model('Comissao', comissaoSchema);
