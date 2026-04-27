import { useState } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import axios from 'axios';
import { MESSAGES, VALIDATION_PATTERNS } from '../../constants/messages';

const FormContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  color: #333;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 2px solid ${(props) => (props.$erro ? '#ef4444' : '#e0e0e0')};
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #FF6B9D;
    box-shadow: 0 0 0 3px rgba(255, 107, 157, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 0.8rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  min-height: 80px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #FF6B9D;
  }
`;

const SecaoEndereco = styled.div`
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid #e0e0e0;

  h3 {
    margin: 0 0 1rem 0;
    color: #333;
    font-size: 1rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const Botao = styled.button`
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.95rem;

  ${(props) =>
    props.primary
      ? `
    background: linear-gradient(135deg, #FF6B9D, #C44569);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(196, 69, 105, 0.3);
    }
  `
      : `
    background: #f0f0f0;
    color: #333;

    &:hover {
      background: #e0e0e0;
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Mensagem = styled.div`
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  color: white;
  background: ${(props) => (props.erro ? '#ff5252' : '#4caf50')};
`;

const ErrMsg = styled.span`
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
`;

const defaultValues = {
  nome: '',
  email: '',
  telefone: '',
  dataNascimento: '',
  endereco: { rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '' },
  observacoes: '',
};

export default function FormularioCliente({ onSucesso }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues });
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [apiErro, setApiErro] = useState('');

  const onSubmit = async (data) => {
    setCarregando(true);
    setApiErro('');
    setMensagem('');
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.post('/api/clientes', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.sucesso) {
        setMensagem(MESSAGES.SUCCESS.CLIENT_CREATED);
        reset(defaultValues);
        setTimeout(() => onSucesso(), 1500);
      }
    } catch (err) {
      setApiErro(err.response?.data?.mensagem || err.message || 'Erro ao criar cliente');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <FormContainer>
      <h2>Novo Cliente</h2>

      {mensagem && <Mensagem>{mensagem}</Mensagem>}
      {apiErro && <Mensagem erro>{apiErro}</Mensagem>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid>
          <FormGroup>
            <Label>Nome *</Label>
            <Input
              type="text"
              placeholder="Nome completo"
              $erro={!!errors.nome}
              {...register('nome', { required: MESSAGES.VALIDATION.REQUIRED_FIELD })}
            />
            {errors.nome && <ErrMsg>{errors.nome.message}</ErrMsg>}
          </FormGroup>

          <FormGroup>
            <Label>Email *</Label>
            <Input
              type="email"
              placeholder="email@example.com"
              $erro={!!errors.email}
              {...register('email', {
                required: MESSAGES.VALIDATION.REQUIRED_FIELD,
                pattern: { value: VALIDATION_PATTERNS.EMAIL, message: MESSAGES.VALIDATION.INVALID_EMAIL },
              })}
            />
            {errors.email && <ErrMsg>{errors.email.message}</ErrMsg>}
          </FormGroup>

          <FormGroup>
            <Label>Telefone *</Label>
            <Input
              type="tel"
              placeholder="(11) 99999-9999"
              $erro={!!errors.telefone}
              {...register('telefone', {
                required: MESSAGES.VALIDATION.REQUIRED_FIELD,
                pattern: { value: VALIDATION_PATTERNS.PHONE, message: MESSAGES.VALIDATION.INVALID_PHONE },
              })}
            />
            {errors.telefone && <ErrMsg>{errors.telefone.message}</ErrMsg>}
          </FormGroup>

          <FormGroup>
            <Label>Data de Nascimento</Label>
            <Input type="date" {...register('dataNascimento')} />
          </FormGroup>
        </Grid>

        <SecaoEndereco>
          <h3>📍 Endereço (Opcional)</h3>
          <Grid>
            <FormGroup>
              <Label>Rua</Label>
              <Input type="text" placeholder="Nome da rua" {...register('endereco.rua')} />
            </FormGroup>
            <FormGroup>
              <Label>Número</Label>
              <Input type="text" placeholder="Nº" {...register('endereco.numero')} />
            </FormGroup>
            <FormGroup>
              <Label>Complemento</Label>
              <Input type="text" placeholder="Apto, sala..." {...register('endereco.complemento')} />
            </FormGroup>
            <FormGroup>
              <Label>Bairro</Label>
              <Input type="text" placeholder="Bairro" {...register('endereco.bairro')} />
            </FormGroup>
            <FormGroup>
              <Label>Cidade</Label>
              <Input type="text" placeholder="Cidade" {...register('endereco.cidade')} />
            </FormGroup>
            <FormGroup>
              <Label>Estado</Label>
              <Input
                type="text"
                placeholder="SP"
                maxLength="2"
                {...register('endereco.estado')}
              />
            </FormGroup>
            <FormGroup>
              <Label>CEP</Label>
              <Input
                type="text"
                placeholder="00000-000"
                $erro={!!errors.endereco?.cep}
                {...register('endereco.cep', {
                  pattern: { value: VALIDATION_PATTERNS.CEP, message: MESSAGES.VALIDATION.INVALID_CEP },
                })}
              />
              {errors.endereco?.cep && <ErrMsg>{errors.endereco.cep.message}</ErrMsg>}
            </FormGroup>
          </Grid>
        </SecaoEndereco>

        <FormGroup>
          <Label>Observações</Label>
          <TextArea
            placeholder="Preferências, alergias, observações..."
            {...register('observacoes')}
          />
        </FormGroup>

        <ButtonGroup>
          <Botao type="submit" primary disabled={carregando}>
            {carregando ? 'Criando...' : 'Criar Cliente'}
          </Botao>
        </ButtonGroup>
      </form>
    </FormContainer>
  );
}
