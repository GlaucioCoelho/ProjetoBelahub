import { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const Cartao = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
`;

const Titulo = styled.h3`
  margin: 0;
  color: #333;
  font-size: 1.1rem;
`;

const Status = styled.span`
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
  background: ${(props) => {
    switch (props.status) {
      case 'agendado':
        return '#2196F3';
      case 'concluido':
        return '#4CAF50';
      case 'cancelado':
        return '#f44336';
      case 'nao_compareceu':
        return '#FF9800';
      default:
        return '#999';
    }
  }};
`;

const Info = styled.div`
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;

  p {
    margin: 0.5rem 0;
    color: #666;
    font-size: 0.95rem;

    strong {
      color: #333;
    }
  }
`;

const Data = styled.p`
  color: #FF6B9D;
  font-weight: 600;
`;

const Horario = styled.div`
  display: flex;
  gap: 1rem;
  margin: 0.5rem 0;
  font-size: 0.95rem;

  span {
    color: #666;
  }

  strong {
    color: #333;
  }
`;

const Botoes = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
`;

const Botao = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s;

  ${(props) =>
    props.primary
      ? `
    background: #FF6B9D;
    color: white;

    &:hover {
      background: #C44569;
    }
  `
      : `
    background: #f0f0f0;
    color: #333;

    &:hover {
      background: #e0e0e0;
    }
  `}

  ${(props) =>
    props.danger &&
    `
    background: #f44336;
    color: white;

    &:hover {
      background: #d32f2f;
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default function CartaoAgendamento({ agendamento, onAtualizar }) {
  const [carregando, setCarregando] = useState(false);

  const handleCancelar = async () => {
    if (!window.confirm('Deseja cancelar este agendamento?')) return;

    setCarregando(true);
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/agendamentos/${agendamento._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onAtualizar();
    } catch (erro) {
      const msg = erro.response?.data?.mensagem || erro.message || 'Erro ao cancelar agendamento';
      alert(msg);
    } finally {
      setCarregando(false);
    }
  };

  const handleConcluir = async () => {
    setCarregando(true);
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/agendamentos/${agendamento._id}`,
        { status: 'concluido' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onAtualizar();
    } catch (erro) {
      const msg = erro.response?.data?.mensagem || erro.message || 'Erro ao atualizar agendamento';
      alert(msg);
    } finally {
      setCarregando(false);
    }
  };

  const dataFormatada = new Date(agendamento.dataAgendamento).toLocaleDateString(
    'pt-BR',
    { weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit' }
  );

  return (
    <Cartao>
      <Header>
        <Titulo>{agendamento.servico}</Titulo>
        <Status status={agendamento.status}>{agendamento.status}</Status>
      </Header>

      <Info>
        <p>
          <strong>Cliente:</strong> {agendamento.cliente?.nome || 'N/A'}
        </p>
        <p>
          <strong>Profissional:</strong> {agendamento.profissional}
        </p>
        <Data>📅 {dataFormatada}</Data>
        <Horario>
          <strong>🕐</strong>
          <span>
            {agendamento.horarioInicio} - {agendamento.horarioFim}
          </span>
        </Horario>
        {agendamento.preco && (
          <p>
            <strong>Preço:</strong> R$ {agendamento.preco.toFixed(2)}
          </p>
        )}
        {agendamento.notas && (
          <p>
            <strong>Notas:</strong> {agendamento.notas}
          </p>
        )}
      </Info>

      <Botoes>
        {agendamento.status === 'agendado' && (
          <>
            <Botao primary onClick={handleConcluir} disabled={carregando}>
              Concluir
            </Botao>
            <Botao danger onClick={handleCancelar} disabled={carregando}>
              Cancelar
            </Botao>
          </>
        )}
      </Botoes>
    </Cartao>
  );
}
