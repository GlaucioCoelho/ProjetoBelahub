import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { MESSAGES } from '../../constants/messages';

const inputStyle = {
  width: '100%',
  padding: '10px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '14px',
  boxSizing: 'border-box',
  fontFamily: 'Arial, sans-serif',
};

const inputErrStyle = { ...inputStyle, border: '1px solid #ef4444' };
const errStyle = { color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' };

const metodos = [
  { value: 'cartao',       label: '💳 Cartão de Crédito' },
  { value: 'dinheiro',     label: '💵 Dinheiro' },
  { value: 'transferencia', label: '🏦 Transferência' },
  { value: 'pix',          label: '📱 PIX' },
];

const tipos = [
  { value: 'receita',   label: '📥 Receita' },
  { value: 'despesa',   label: '📤 Despesa' },
  { value: 'devolucao', label: '↩️ Devolução' },
];

const PaymentForm = ({ agendamento, onSucesso, onCancelar }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      tipo: 'receita',
      descricao: agendamento?.servico || '',
      valor: agendamento?.valor || '',
      metodo: 'cartao',
      referencia: '',
      cliente: agendamento?.cliente || '',
    },
  });
  const [loading, setLoading] = useState(false);
  const [apiErro, setApiErro] = useState(null);
  const [sucesso, setSucesso] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    setApiErro(null);
    setSucesso(false);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        '/api/transacoes',
        { ...data, status: 'concluida' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSucesso(true);
      reset();
      if (onSucesso) onSucesso(response.data);
      setTimeout(() => setSucesso(false), 3000);
    } catch (err) {
      setApiErro(err.response?.data?.error || err.response?.data?.mensagem || err.message || 'Erro ao registrar pagamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginTop: 0, marginBottom: '24px', color: '#333' }}>💰 Registrar Pagamento</h2>

      {apiErro && (
        <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '14px' }}>
          ⚠️ {apiErro}
        </div>
      )}
      {sucesso && (
        <div style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '14px' }}>
          ✅ {MESSAGES.SUCCESS.PAYMENT_REGISTERED}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Tipo</label>
          <select style={inputStyle} {...register('tipo')}>
            {tipos.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Descrição</label>
          <input
            type="text"
            placeholder="Ex: Serviço de manicure"
            style={inputStyle}
            {...register('descricao')}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Valor *</label>
          <input
            type="number"
            placeholder="0.00"
            step="0.01"
            min="0.01"
            style={errors.valor ? inputErrStyle : inputStyle}
            {...register('valor', {
              required: MESSAGES.VALIDATION.REQUIRED_FIELD,
              min: { value: 0.01, message: MESSAGES.VALIDATION.MIN_VALUE(0.01) },
              valueAsNumber: true,
            })}
          />
          {errors.valor && <span style={errStyle}>{errors.valor.message}</span>}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Método de Pagamento *</label>
          <select
            style={errors.metodo ? inputErrStyle : inputStyle}
            {...register('metodo', { required: MESSAGES.VALIDATION.REQUIRED_FIELD })}
          >
            {metodos.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          {errors.metodo && <span style={errStyle}>{errors.metodo.message}</span>}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Referência / ID Transação</label>
          <input
            type="text"
            placeholder="Ex: Últimos dígitos do cartão ou ID do PIX"
            style={inputStyle}
            {...register('referencia')}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{ flex: 1, padding: '12px', backgroundColor: loading ? '#ccc' : '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: 'bold' }}
          >
            {loading ? 'Processando...' : '✅ Confirmar Pagamento'}
          </button>
          <button
            type="button"
            onClick={onCancelar}
            disabled={loading}
            style={{ flex: 1, padding: '12px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: 'bold' }}
          >
            ❌ Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
