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

const Nome = styled.h3`
  margin: 0;
  color: #333;
  font-size: 1.2rem;
`;

const Status = styled.span`
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
  background: ${(props) => (props.ativo ? '#4CAF50' : '#999')};
`;

const Info = styled.div`
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;

  p {
    margin: 0.5rem 0;
    color: #666;
    font-size: 0.9rem;

    strong {
      color: #333;
    }

    a {
      color: #FF6B9D;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

const Endereco = styled.div`
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 6px;
  margin: 1rem 0;
  font-size: 0.85rem;
  color: #666;

  p {
    margin: 0.3rem 0;
  }
`;

const Estatisticas = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin: 1rem 0;
  padding: 1rem 0;
  border-top: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
`;

const Stat = styled.div`
  text-align: center;

  .label {
    font-size: 0.8rem;
    color: #999;
  }

  .value {
    font-size: 1.3rem;
    font-weight: bold;
    color: #FF6B9D;
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

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;

  h2 {
    margin-top: 0;
    color: #333;
  }

  p {
    color: #666;
    line-height: 1.6;
  }
`;

const FecharBtn = styled.button`
  background: #f0f0f0;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 1rem;
`;

export default function CartaoCliente({ cliente, onAtualizar }) {
  const [carregando, setCarregando] = useState(false);
  const [mostraHistorico, setMostraHistorico] = useState(false);
  const [agendamentos, setAgendamentos] = useState([]);

  const handleDeletar = async () => {
    if (!window.confirm('Deseja deletar este cliente?')) return;

    setCarregando(true);
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/clientes/${cliente._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onAtualizar();
    } catch (erro) {
      const msg = erro.response?.data?.mensagem || erro.message || 'Erro ao deletar cliente';
      alert(msg);
    } finally {
      setCarregando(false);
    }
  };

  const handleVerHistorico = async () => {
    setCarregando(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/clientes/${cliente._id}/agendamentos`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAgendamentos(res.data.dados || []);
      setMostraHistorico(true);
    } catch (erro) {
      const msg = erro.response?.data?.mensagem || erro.message || 'Erro ao carregar histórico';
      alert(msg);
    } finally {
      setCarregando(false);
    }
  };

  const dataNasc = cliente.dataNascimento
    ? new Date(cliente.dataNascimento).toLocaleDateString('pt-BR')
    : 'Não informado';

  const temEndereco = cliente.endereco && Object.values(cliente.endereco).some((v) => v);

  return (
    <>
      <Cartao>
        <Header>
          <Nome>{cliente.nome}</Nome>
          <Status ativo={cliente.ativo}>{cliente.ativo ? 'Ativo' : 'Inativo'}</Status>
        </Header>

        <Info>
          <p>
            📧 <strong>Email:</strong>{' '}
            <a href={`mailto:${cliente.email}`}>{cliente.email}</a>
          </p>
          <p>
            📱 <strong>Telefone:</strong>{' '}
            <a href={`tel:${cliente.telefone}`}>{cliente.telefone}</a>
          </p>
          <p>
            🎂 <strong>Nascimento:</strong> {dataNasc}
          </p>
          {cliente.observacoes && (
            <p>
              📝 <strong>Notas:</strong> {cliente.observacoes}
            </p>
          )}
        </Info>

        {temEndereco && (
          <Endereco>
            <p>
              <strong>Endereço:</strong> {cliente.endereco.rua}, {cliente.endereco.numero}{' '}
              {cliente.endereco.complemento && `- ${cliente.endereco.complemento}`}
            </p>
            {cliente.endereco.bairro && <p>{cliente.endereco.bairro}</p>}
            {cliente.endereco.cidade && (
              <p>
                {cliente.endereco.cidade}, {cliente.endereco.estado}
              </p>
            )}
          </Endereco>
        )}

        <Estatisticas>
          <Stat>
            <div className="label">Agendamentos</div>
            <div className="value">{cliente.totalAgendamentos || 0}</div>
          </Stat>
          <Stat>
            <div className="label">Gasto Total</div>
            <div className="value">R$ {(cliente.gastoTotal || 0).toFixed(2)}</div>
          </Stat>
        </Estatisticas>

        <Botoes>
          <Botao onClick={handleVerHistorico} disabled={carregando}>
            📅 Histórico
          </Botao>
          <Botao danger onClick={handleDeletar} disabled={carregando}>
            🗑️ Deletar
          </Botao>
        </Botoes>
      </Cartao>

      {mostraHistorico && (
        <Modal onClick={() => setMostraHistorico(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h2>📅 Histórico de Agendamentos - {cliente.nome}</h2>

            {agendamentos.length === 0 ? (
              <p>Nenhum agendamento encontrado.</p>
            ) : (
              <div>
                {agendamentos.map((ag) => (
                  <div key={ag._id} style={{ marginBottom: '1rem', padding: '1rem', background: '#f9f9f9', borderRadius: '6px' }}>
                    <p>
                      <strong>{ag.servico}</strong> - {new Date(ag.dataAgendamento).toLocaleDateString('pt-BR')} às{' '}
                      {ag.horarioInicio}
                    </p>
                    <p>Profissional: {ag.profissional}</p>
                    <p>
                      Status:{' '}
                      <span
                        style={{
                          background: ag.status === 'concluido' ? '#4CAF50' : '#999',
                          color: 'white',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                        }}
                      >
                        {ag.status}
                      </span>
                    </p>
                    {ag.preco && <p>Preço: R$ {ag.preco.toFixed(2)}</p>}
                  </div>
                ))}
              </div>
            )}

            <FecharBtn onClick={() => setMostraHistorico(false)}>Fechar</FecharBtn>
          </ModalContent>
        </Modal>
      )}
    </>
  );
}
