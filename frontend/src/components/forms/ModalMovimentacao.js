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

const MOTIVOS_LABEL = {
  compra:                '🛒 Compra',
  devolucao_fornecedor:  '↩️ Devolução Fornecedor',
  transferencia_interna: '🔄 Transferência Interna',
  contagem:              '📊 Contagem',
  venda:                 '💵 Venda',
  uso_interno:           '🔧 Uso Interno',
  devolucao_cliente:     '↩️ Devolução Cliente',
};

const MOTIVOS_ENTRADA = ['compra', 'devolucao_fornecedor', 'transferencia_interna', 'contagem'];
const MOTIVOS_SAIDA   = ['venda', 'uso_interno', 'transferencia_interna', 'devolucao_cliente'];

const getUserName = () => {
  try { return JSON.parse(localStorage.getItem('userData') || '{}').nome || ''; }
  catch { return ''; }
};

const ModalMovimentacao = ({ estoque, tipo, onSucesso, onCancelar }) => {
  const motivos = tipo === 'entrada' ? MOTIVOS_ENTRADA : MOTIVOS_SAIDA;
  const corBotao = tipo === 'entrada' ? '#4CAF50' : '#F44336';

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      quantidade: '',
      motivo: '',
      usuarioResponsavel: getUserName(),
      observacoes: '',
    },
  });
  const [loading, setLoading] = useState(false);
  const [apiErro, setApiErro] = useState(null);

  const onSubmit = async (data) => {
    setLoading(true);
    setApiErro(null);
    try {
      const token = localStorage.getItem('authToken');
      const endpoint = `/api/estoque/${estoque._id}/${tipo === 'entrada' ? 'adicionar' : 'remover'}`;
      const response = await axios.post(
        endpoint,
        { estoque: estoque._id, tipo, ...data },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      reset({ quantidade: '', motivo: '', usuarioResponsavel: getUserName(), observacoes: '' });
      if (onSucesso) onSucesso(response.data);
    } catch (err) {
      setApiErro(err.response?.data?.error || err.response?.data?.mensagem || err.message || 'Erro ao registrar movimentação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
      onClick={onCancelar}
    >
      <div
        style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '32px', maxWidth: '500px', width: '90%', boxShadow: '0 4px 32px rgba(0,0,0,0.2)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0, marginBottom: '24px', color: '#333' }}>
          {tipo === 'entrada' ? '📥 Entrada de Estoque' : '📤 Saída de Estoque'}
        </h2>

        <p style={{ color: '#999', fontSize: '14px', marginBottom: '16px' }}>
          Localização: <strong>{estoque.localizacao}</strong>
        </p>

        {apiErro && (
          <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '14px' }}>
            ⚠️ {apiErro}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Quantidade *</label>
            <input
              type="number"
              placeholder="0"
              min="1"
              style={errors.quantidade ? inputErrStyle : inputStyle}
              {...register('quantidade', {
                required: MESSAGES.VALIDATION.REQUIRED_FIELD,
                min: { value: 1, message: MESSAGES.VALIDATION.MIN_VALUE(1) },
                valueAsNumber: true,
              })}
            />
            {errors.quantidade && <span style={errStyle}>{errors.quantidade.message}</span>}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Motivo *</label>
            <select
              style={errors.motivo ? inputErrStyle : inputStyle}
              {...register('motivo', { required: MESSAGES.VALIDATION.REQUIRED_FIELD })}
            >
              <option value="">Selecione o motivo</option>
              {motivos.map((m) => (
                <option key={m} value={m}>{MOTIVOS_LABEL[m]}</option>
              ))}
            </select>
            {errors.motivo && <span style={errStyle}>{errors.motivo.message}</span>}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Responsável</label>
            <input
              type="text"
              placeholder="Nome do responsável"
              style={inputStyle}
              {...register('usuarioResponsavel')}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Observações</label>
            <textarea
              placeholder="Notas adicionais (opcional)"
              rows="3"
              style={inputStyle}
              {...register('observacoes')}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{ flex: 1, padding: '12px', backgroundColor: loading ? '#ccc' : corBotao, color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: 'bold' }}
            >
              {loading ? 'Processando...' : `✅ Confirmar ${tipo === 'entrada' ? 'Entrada' : 'Saída'}`}
            </button>
            <button
              type="button"
              onClick={onCancelar}
              disabled={loading}
              style={{ flex: 1, padding: '12px', backgroundColor: '#999', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: 'bold' }}
            >
              ❌ Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalMovimentacao;
