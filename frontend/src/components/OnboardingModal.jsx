import React, { useState } from 'react';
import { ChevronRight, CheckCircle, Zap } from 'lucide-react';
import axios from 'axios';

const OnboardingModal = ({ isOpen, onComplete, usuario }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [servico, setServico] = useState({ nome: '', duracao: 60, preco: 0 });
  const [profissional, setProfissional] = useState({ nome: '', comissaoPercentual: 10 });

  const handleAdicionarServico = async () => {
    if (!servico.nome.trim()) {
      setError('Nome do serviço é obrigatório');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await axios.post('/api/servicos', {
        nome: servico.nome,
        duracao: parseInt(servico.duracao),
        preco: parseFloat(servico.preco)
      });
      setStep(2);
      setServico({ nome: '', duracao: 60, preco: 0 });
    } catch (err) {
      setError(err.response?.data?.mensagem || 'Erro ao criar serviço');
    } finally {
      setLoading(false);
    }
  };

  const handleAdicionarProfissional = async () => {
    if (!profissional.nome.trim()) {
      setError('Nome do profissional é obrigatório');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await axios.post('/api/funcionarios', {
        nome: profissional.nome,
        comissaoPercentual: parseFloat(profissional.comissaoPercentual)
      });
      handleConcluirOnboarding();
    } catch (err) {
      setError(err.response?.data?.mensagem || 'Erro ao criar profissional');
    } finally {
      setLoading(false);
    }
  };

  const handleConcluirOnboarding = async () => {
    setLoading(true);
    try {
      await axios.post('/api/auth/onboarding-completo');
      onComplete?.();
    } catch (err) {
      setError('Erro ao completar onboarding');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: 32,
        maxWidth: 500,
        width: '90%',
        boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)'
      }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Zap size={32} style={{ color: '#f59e0b', marginBottom: 8 }} />
          <h1 style={{ margin: '8px 0 0 0', fontSize: 24, fontWeight: 700 }}>
            Bem-vindo ao BelaHub!
          </h1>
          <p style={{ margin: '8px 0 0 0', fontSize: 14, color: '#666' }}>
            Vamos configurar seu salão em {step === 1 ? '2' : '1'} minuto{step === 1 ? 's' : ''}
          </p>
        </div>

        {/* Step 1: Add Service */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#374151' }}>
              Passo 1: Adicione um Serviço
            </h2>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>
                Nome do Serviço *
              </label>
              <input
                type="text"
                value={servico.nome}
                onChange={(e) => setServico({ ...servico, nome: e.target.value })}
                placeholder="Ex: Corte de cabelo"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  fontSize: 14,
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>
                  Duração (min)
                </label>
                <input
                  type="number"
                  value={servico.duracao}
                  onChange={(e) => setServico({ ...servico, duracao: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>
                  Preço (R$)
                </label>
                <input
                  type="number"
                  value={servico.preco}
                  onChange={(e) => setServico({ ...servico, preco: e.target.value })}
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {error && (
              <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 16 }}>{error}</p>
            )}

            <button
              onClick={handleAdicionarServico}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: loading ? '#ccc' : '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              {loading ? 'Criando...' : <>
                Próximo <ChevronRight size={16} />
              </>}
            </button>
          </div>
        )}

        {/* Step 2: Add Professional */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#374151' }}>
              Passo 2: Adicione um Profissional
            </h2>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>
                Nome do Profissional *
              </label>
              <input
                type="text"
                value={profissional.nome}
                onChange={(e) => setProfissional({ ...profissional, nome: e.target.value })}
                placeholder="Ex: Maria"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  fontSize: 14,
                  boxSizing: 'border-box',
                  marginBottom: 12
                }}
              />

              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>
                Comissão (%)
              </label>
              <input
                type="number"
                value={profissional.comissaoPercentual}
                onChange={(e) => setProfissional({ ...profissional, comissaoPercentual: e.target.value })}
                step="0.1"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  fontSize: 14,
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {error && (
              <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 16 }}>{error}</p>
            )}

            <button
              onClick={handleAdicionarProfissional}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: loading ? '#ccc' : '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              {loading ? 'Completando...' : <>
                <CheckCircle size={16} /> Completar Configuração
              </>}
            </button>
          </div>
        )}

        {/* Skip option */}
        {step === 1 && (
          <button
            onClick={() => handleConcluirOnboarding()}
            style={{
              width: '100%',
              padding: '10px',
              background: 'none',
              border: 'none',
              color: '#666',
              fontSize: 13,
              cursor: 'pointer',
              marginTop: 12
            }}
          >
            Pular por enquanto
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingModal;
