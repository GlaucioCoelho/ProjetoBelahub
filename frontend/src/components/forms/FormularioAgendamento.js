import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import axios from 'axios';
import { MESSAGES } from '../../constants/messages';

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

const Select = styled(Input).attrs({ as: 'select' })`
  cursor: pointer;
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

  &:active { transform: translateY(0); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
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
  cliente: '',
  profissional: '',
  servico: '',
  dataAgendamento: '',
  horarioInicio: '',
  duracao: 60,
  preco: '',
  notas: '',
};

export default function FormularioAgendamento({ onSucesso }) {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({ defaultValues });
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [apiErro, setApiErro] = useState('');

  const profissional = watch('profissional');
  const dataAgendamento = watch('dataAgendamento');

  useEffect(() => {
    if (!profissional || !dataAgendamento) return;
    const token = localStorage.getItem('authToken');
    axios
      .get(`/api/agendamentos/disponibilidade?profissional=${profissional}&data=${dataAgendamento}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setHorariosDisponiveis(res.data.dados || []))
      .catch(() => setHorariosDisponiveis([]));
  }, [profissional, dataAgendamento]);

  const onSubmit = async (data) => {
    setCarregando(true);
    setApiErro('');
    setMensagem('');
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.post('/api/agendamentos', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.sucesso) {
        setMensagem(MESSAGES.SUCCESS.APPOINTMENT_CREATED);
        reset(defaultValues);
        setHorariosDisponiveis([]);
        setTimeout(() => onSucesso(), 1500);
      }
    } catch (err) {
      setApiErro(err.response?.data?.mensagem || err.message || 'Erro ao criar agendamento');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <FormContainer>
      <h2>Novo Agendamento</h2>

      {mensagem && <Mensagem>{mensagem}</Mensagem>}
      {apiErro && <Mensagem erro>{apiErro}</Mensagem>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid>
          <FormGroup>
            <Label>Cliente *</Label>
            <Input
              type="text"
              placeholder="Nome do cliente"
              $erro={!!errors.cliente}
              {...register('cliente', { required: MESSAGES.VALIDATION.REQUIRED_FIELD })}
            />
            {errors.cliente && <ErrMsg>{errors.cliente.message}</ErrMsg>}
          </FormGroup>

          <FormGroup>
            <Label>Profissional *</Label>
            <Input
              type="text"
              placeholder="Nome do profissional"
              $erro={!!errors.profissional}
              {...register('profissional', { required: MESSAGES.VALIDATION.REQUIRED_FIELD })}
            />
            {errors.profissional && <ErrMsg>{errors.profissional.message}</ErrMsg>}
          </FormGroup>

          <FormGroup>
            <Label>Serviço *</Label>
            <Input
              type="text"
              placeholder="Ex: Corte de cabelo"
              $erro={!!errors.servico}
              {...register('servico', { required: MESSAGES.VALIDATION.REQUIRED_FIELD })}
            />
            {errors.servico && <ErrMsg>{errors.servico.message}</ErrMsg>}
          </FormGroup>

          <FormGroup>
            <Label>Data *</Label>
            <Input
              type="date"
              $erro={!!errors.dataAgendamento}
              {...register('dataAgendamento', { required: MESSAGES.VALIDATION.REQUIRED_FIELD })}
            />
            {errors.dataAgendamento && <ErrMsg>{errors.dataAgendamento.message}</ErrMsg>}
          </FormGroup>

          <FormGroup>
            <Label>Horário *</Label>
            <Select
              $erro={!!errors.horarioInicio}
              {...register('horarioInicio', { required: MESSAGES.VALIDATION.REQUIRED_FIELD })}
            >
              <option value="">Selecione um horário</option>
              {horariosDisponiveis.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </Select>
            {errors.horarioInicio && <ErrMsg>{errors.horarioInicio.message}</ErrMsg>}
          </FormGroup>

          <FormGroup>
            <Label>Duração (minutos)</Label>
            <Input
              type="number"
              min="15"
              max="480"
              step="15"
              {...register('duracao', { valueAsNumber: true })}
            />
          </FormGroup>

          <FormGroup>
            <Label>Preço</Label>
            <Input
              type="number"
              placeholder="0.00"
              step="0.01"
              min="0"
              {...register('preco', { valueAsNumber: true })}
            />
          </FormGroup>
        </Grid>

        <FormGroup>
          <Label>Notas</Label>
          <TextArea
            placeholder="Observações sobre o agendamento..."
            {...register('notas')}
          />
        </FormGroup>

        <ButtonGroup>
          <Botao type="submit" primary disabled={carregando}>
            {carregando ? 'Criando...' : 'Criar Agendamento'}
          </Botao>
        </ButtonGroup>
      </form>
    </FormContainer>
  );
}
