import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { MESSAGES, VALIDATION_PATTERNS } from '../../constants/messages';

const inputStyle = {
  width: '100%',
  padding: '10px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  boxSizing: 'border-box',
};

const inputErrStyle = {
  ...inputStyle,
  border: '1px solid #ef4444',
};

const errStyle = { color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' };

const defaultValues = {
  nome: '',
  email: '',
  telefone: '',
  cargo: 'outro',
  salarioBase: '',
  comissaoPercentual: 0,
  dataContratacao: '',
  status: 'ativo',
  documentos: { cpf: '', rg: '', pis: '' },
  endereco: { rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '' },
  observacoes: '',
};

const FormularioFuncionario = ({ funcionario = null, onSubmit: submitCallback }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues });
  const [apiErro, setApiErro] = useState('');

  useEffect(() => {
    if (funcionario) {
      reset({
        ...funcionario,
        dataContratacao: funcionario.dataContratacao
          ? funcionario.dataContratacao.split('T')[0]
          : '',
      });
    }
  }, [funcionario, reset]);

  const onSubmit = (data) => {
    setApiErro('');
    submitCallback(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <h2 style={{ marginTop: 0 }}>{funcionario ? '✏️ Editar Funcionário' : '➕ Novo Funcionário'}</h2>

      {apiErro && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '4px', fontSize: '14px' }}>
          ⚠️ {apiErro}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nome *</label>
          <input
            type="text"
            style={errors.nome ? inputErrStyle : inputStyle}
            {...register('nome', { required: MESSAGES.VALIDATION.REQUIRED_FIELD })}
          />
          {errors.nome && <span style={errStyle}>{errors.nome.message}</span>}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email *</label>
          <input
            type="email"
            style={errors.email ? inputErrStyle : inputStyle}
            {...register('email', {
              required: MESSAGES.VALIDATION.REQUIRED_FIELD,
              pattern: { value: VALIDATION_PATTERNS.EMAIL, message: MESSAGES.VALIDATION.INVALID_EMAIL },
            })}
          />
          {errors.email && <span style={errStyle}>{errors.email.message}</span>}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Telefone</label>
          <input
            type="tel"
            placeholder="(XX) 9XXXX-XXXX"
            style={errors.telefone ? inputErrStyle : inputStyle}
            {...register('telefone', {
              pattern: { value: VALIDATION_PATTERNS.PHONE, message: MESSAGES.VALIDATION.INVALID_PHONE },
            })}
          />
          {errors.telefone && <span style={errStyle}>{errors.telefone.message}</span>}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Cargo *</label>
          <select
            style={inputStyle}
            {...register('cargo', { required: MESSAGES.VALIDATION.REQUIRED_FIELD })}
          >
            <option value="recepcionista">Recepcionista</option>
            <option value="manicure">Manicure</option>
            <option value="pedicure">Pedicure</option>
            <option value="cabeleireiro">Cabeleireiro</option>
            <option value="esteticien">Esteticien</option>
            <option value="massagista">Massagista</option>
            <option value="gerente">Gerente</option>
            <option value="outro">Outro</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Salário Base *</label>
          <input
            type="number"
            min="0"
            step="0.01"
            style={errors.salarioBase ? inputErrStyle : inputStyle}
            {...register('salarioBase', {
              required: MESSAGES.VALIDATION.REQUIRED_FIELD,
              min: { value: 0.01, message: MESSAGES.VALIDATION.MIN_VALUE(0.01) },
              valueAsNumber: true,
            })}
          />
          {errors.salarioBase && <span style={errStyle}>{errors.salarioBase.message}</span>}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Comissão (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            style={inputStyle}
            {...register('comissaoPercentual', {
              min: { value: 0, message: MESSAGES.VALIDATION.MIN_VALUE(0) },
              max: { value: 100, message: MESSAGES.VALIDATION.MAX_VALUE(100) },
              valueAsNumber: true,
            })}
          />
          {errors.comissaoPercentual && <span style={errStyle}>{errors.comissaoPercentual.message}</span>}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Data de Contratação *</label>
          <input
            type="date"
            style={errors.dataContratacao ? inputErrStyle : inputStyle}
            {...register('dataContratacao', { required: MESSAGES.VALIDATION.REQUIRED_FIELD })}
          />
          {errors.dataContratacao && <span style={errStyle}>{errors.dataContratacao.message}</span>}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Status *</label>
          <select
            style={inputStyle}
            {...register('status', { required: MESSAGES.VALIDATION.REQUIRED_FIELD })}
          >
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
            <option value="afastado">Afastado</option>
            <option value="demitido">Demitido</option>
          </select>
        </div>
      </div>

      <div style={{ borderTop: '2px solid #f0f0f0', paddingTop: '20px' }}>
        <h3>📋 Documentos</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>CPF</label>
            <input
              type="text"
              placeholder="XXX.XXX.XXX-XX"
              style={errors.documentos?.cpf ? inputErrStyle : inputStyle}
              {...register('documentos.cpf', {
                pattern: { value: VALIDATION_PATTERNS.CPF, message: MESSAGES.VALIDATION.INVALID_CPF },
              })}
            />
            {errors.documentos?.cpf && <span style={errStyle}>{errors.documentos.cpf.message}</span>}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>RG</label>
            <input type="text" style={inputStyle} {...register('documentos.rg')} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>PIS</label>
            <input type="text" style={inputStyle} {...register('documentos.pis')} />
          </div>
        </div>
      </div>

      <div style={{ borderTop: '2px solid #f0f0f0', paddingTop: '20px' }}>
        <h3>📍 Endereço</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Rua</label>
            <input type="text" style={inputStyle} {...register('endereco.rua')} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Número</label>
            <input type="text" style={inputStyle} {...register('endereco.numero')} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Complemento</label>
            <input type="text" style={inputStyle} {...register('endereco.complemento')} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Bairro</label>
            <input type="text" style={inputStyle} {...register('endereco.bairro')} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Cidade</label>
            <input type="text" style={inputStyle} {...register('endereco.cidade')} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>UF</label>
            <input type="text" maxLength="2" style={inputStyle} {...register('endereco.estado')} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>CEP</label>
            <input
              type="text"
              placeholder="XXXXX-XXX"
              style={errors.endereco?.cep ? inputErrStyle : inputStyle}
              {...register('endereco.cep', {
                pattern: { value: VALIDATION_PATTERNS.CEP, message: MESSAGES.VALIDATION.INVALID_CEP },
              })}
            />
            {errors.endereco?.cep && <span style={errStyle}>{errors.endereco.cep.message}</span>}
          </div>
        </div>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Observações</label>
        <textarea
          rows="3"
          style={{ ...inputStyle, fontFamily: 'Arial, sans-serif' }}
          {...register('observacoes')}
        />
      </div>

      <button
        type="submit"
        style={{
          padding: '12px 24px',
          background: 'linear-gradient(135deg, #FF6B9D 0%, #C44569 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '16px',
          marginTop: '10px',
        }}
      >
        {funcionario ? '✅ Atualizar' : '✅ Criar'} Funcionário
      </button>
    </form>
  );
};

export default FormularioFuncionario;
