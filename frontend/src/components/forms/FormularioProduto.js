import React, { useEffect, useState } from 'react';
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
};

const inputErrStyle = { ...inputStyle, border: '1px solid #ef4444' };
const errStyle = { color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' };

const categorias = [
  { value: 'higiene',    label: '🧼 Higiene' },
  { value: 'cosmetico',  label: '💄 Cosmético' },
  { value: 'ferramenta', label: '🔧 Ferramenta' },
  { value: 'uniforme',   label: '👕 Uniforme' },
  { value: 'acessorio',  label: '👜 Acessório' },
  { value: 'outro',      label: '📦 Outro' },
];

const unidades = [
  { value: 'un', label: 'Unidade' },
  { value: 'ml', label: 'Mililitros' },
  { value: 'g',  label: 'Gramas' },
  { value: 'l',  label: 'Litros' },
  { value: 'kg', label: 'Quilogramas' },
];

const defaultValues = {
  sku: '',
  nome: '',
  descricao: '',
  categoria: 'cosmetico',
  precoUnitario: '',
  precoCusto: '',
  unidade: 'un',
  fornecedor: '',
  estoqueMinimoAlerta: 5,
  ativo: true,
};

const FormularioProduto = ({ produto, onSalvar, onCancelar }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues });
  const [loading, setLoading] = useState(false);
  const [apiErro, setApiErro] = useState(null);

  useEffect(() => {
    if (produto) reset(produto);
  }, [produto, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    setApiErro(null);
    try {
      const token = localStorage.getItem('authToken');
      const headers = { Authorization: `Bearer ${token}` };
      if (produto?._id) {
        await axios.put(`/api/produtos/${produto._id}`, data, { headers });
      } else {
        await axios.post('/api/produtos', data, { headers });
      }
      if (onSalvar) onSalvar();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.mensagem || err.message || 'Erro ao salvar produto';
      setApiErro(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '24px', maxWidth: '700px', margin: '0 auto' }}>
      <h2 style={{ marginTop: 0, marginBottom: '24px', color: '#333' }}>
        {produto ? '✏️ Editar Produto' : '➕ Novo Produto'}
      </h2>

      {apiErro && (
        <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '14px' }}>
          ⚠️ {apiErro}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>SKU *</label>
          <input
            type="text"
            placeholder="Ex: PROD-001"
            disabled={!!produto}
            style={{ ...(errors.sku ? inputErrStyle : inputStyle), backgroundColor: produto ? '#f5f5f5' : '#fff' }}
            {...register('sku', { required: MESSAGES.VALIDATION.REQUIRED_FIELD })}
          />
          {errors.sku && <span style={errStyle}>{errors.sku.message}</span>}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Nome do Produto *</label>
          <input
            type="text"
            placeholder="Ex: Creme Facial Hidratante"
            style={errors.nome ? inputErrStyle : inputStyle}
            {...register('nome', { required: MESSAGES.VALIDATION.REQUIRED_FIELD })}
          />
          {errors.nome && <span style={errStyle}>{errors.nome.message}</span>}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Descrição</label>
          <textarea
            placeholder="Descrição do produto"
            rows="3"
            style={{ ...inputStyle, fontFamily: 'Arial, sans-serif' }}
            {...register('descricao')}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Categoria</label>
          <select style={{ ...inputStyle, fontFamily: 'Arial, sans-serif' }} {...register('categoria')}>
            {categorias.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Preço Unitário (R$) *</label>
          <input
            type="number"
            placeholder="0.00"
            step="0.01"
            min="0"
            style={errors.precoUnitario ? inputErrStyle : inputStyle}
            {...register('precoUnitario', {
              required: MESSAGES.VALIDATION.REQUIRED_FIELD,
              min: { value: 0, message: MESSAGES.VALIDATION.MIN_VALUE(0) },
              valueAsNumber: true,
            })}
          />
          {errors.precoUnitario && <span style={errStyle}>{errors.precoUnitario.message}</span>}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Preço de Custo (R$)</label>
          <input
            type="number"
            placeholder="0.00"
            step="0.01"
            min="0"
            style={inputStyle}
            {...register('precoCusto', { valueAsNumber: true })}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Unidade</label>
          <select style={{ ...inputStyle, fontFamily: 'Arial, sans-serif' }} {...register('unidade')}>
            {unidades.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Fornecedor</label>
          <input
            type="text"
            placeholder="Nome do fornecedor"
            style={inputStyle}
            {...register('fornecedor')}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Estoque Mínimo para Alerta</label>
          <input
            type="number"
            min="0"
            style={inputStyle}
            {...register('estoqueMinimoAlerta', { valueAsNumber: true, min: 0 })}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              {...register('ativo')}
            />
            <span style={{ fontWeight: 'bold' }}>Produto Ativo</span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{ flex: 1, padding: '12px', backgroundColor: loading ? '#ccc' : '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: 'bold' }}
          >
            {loading ? 'Salvando...' : '💾 Salvar Produto'}
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

export default FormularioProduto;
