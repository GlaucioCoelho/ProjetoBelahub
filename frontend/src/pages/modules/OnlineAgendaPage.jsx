import React, { useState, useEffect } from 'react';
import BasePage from './BasePage';
import s from './shared.module.css';
import { Globe, Check, AlertCircle, Calendar, Clock, User, Mail, Phone } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const OnlineAgendaPage = () => {
  const { usuario } = useAuthStore();
  const [isPublic, setIsPublic] = useState(false);
  const [publicUrl, setPublicUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [servicos, setServicos] = useState([]);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);

  const [form, setForm] = useState({
    nomeCliente: '',
    emailCliente: '',
    telefonecliente: '',
    servico: '',
    profissional: '',
    dataAgendamento: '',
    horarioInicio: '',
  });

  const salaoId = usuario?.id;

  useEffect(() => {
    if (salaoId) {
      carregarServicos();
      gerarUrlPublica();
    }
  }, [salaoId]);

  const carregarServicos = async () => {
    try {
      const res = await fetch(`/api/public/saloes/${salaoId}/servicos`);
      const data = await res.json();
      if (data.sucesso) {
        setServicos(data.dados);
      }
    } catch (err) {
      console.error('Erro ao carregar serviços:', err);
    }
  };

  const carregarHorarios = async (data, profissional) => {
    if (!data || !profissional) return;
    try {
      const duracao = servicos.find(s => s.nome === form.servico)?.duracao || 60;
      const res = await fetch(
        `/api/public/saloes/${salaoId}/horarios?data=${data}&profissional=${profissional}&duracao=${duracao}`
      );
      const dataRes = await res.json();
      if (dataRes.sucesso) {
        setHorariosDisponiveis(dataRes.dados || []);
      }
    } catch (err) {
      console.error('Erro ao carregar horários:', err);
    }
  };

  const gerarUrlPublica = () => {
    const origem = window.location.origin;
    setPublicUrl(`${origem}/public-booking/${salaoId}`);
  };

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleProxima = () => {
    if (step === 1 && !form.nomeCliente) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    if (step === 2 && !form.servico) {
      setError('Selecione um serviço');
      return;
    }
    if (step === 3 && !form.dataAgendamento) {
      setError('Selecione uma data');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handleAnterior = () => {
    setStep(step - 1);
    setError('');
  };

  const handleAgendar = async () => {
    if (!form.horarioInicio) {
      setError('Selecione um horário');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/public/saloes/${salaoId}/agendamentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.sucesso) {
        setSuccess(true);
        setForm({
          nomeCliente: '',
          emailCliente: '',
          telefonecliente: '',
          servico: '',
          profissional: '',
          dataAgendamento: '',
          horarioInicio: '',
        });
        setStep(1);
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(data.mensagem || 'Erro ao agendar');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDataChange = (e) => {
    const data = e.target.value;
    handleInputChange('dataAgendamento', data);
    carregarHorarios(data, form.profissional);
  };

  const handleProfissionalChange = (e) => {
    const prof = e.target.value;
    handleInputChange('profissional', prof);
    carregarHorarios(form.dataAgendamento, prof);
  };

  return (
    <BasePage title="Agenda Online" description="Gerencie Agenda Online do seu salão" icon={Globe}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px' }}>

        {/* Settings Section */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 24, marginBottom: 24 }}>
          <h3 style={{ marginTop: 0 }}>Configurações de Reserva Online</h3>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <span style={{ fontWeight: 600 }}>Ativar Reserva Online</span>
            </label>
            <p style={{ fontSize: 12, color: '#666', marginTop: 8, marginBottom: 0 }}>
              Quando ativado, seus clientes podem agendar serviços diretamente
            </p>
          </div>

          {isPublic && (
            <div style={{
              background: '#f0f9ff',
              border: '1px solid #0ea5e9',
              borderRadius: 6,
              padding: 12,
              marginBottom: 16
            }}>
              <p style={{ margin: '0 0 8px 0', fontSize: 12, color: '#0369a1', fontWeight: 600 }}>
                Link para compartilhar:
              </p>
              <div style={{
                background: '#fff',
                border: '1px solid #0ea5e9',
                borderRadius: 4,
                padding: '8px 12px',
                fontSize: 12,
                wordBreak: 'break-all',
                fontFamily: 'monospace'
              }}>
                {publicUrl}
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(publicUrl)}
                style={{
                  marginTop: 8,
                  padding: '6px 12px',
                  background: '#0ea5e9',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 12,
                  cursor: 'pointer'
                }}
              >
                Copiar Link
              </button>
            </div>
          )}
        </div>

        {/* Booking Form Preview */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 24 }}>
          <h3 style={{ marginTop: 0 }}>Pré-visualização do Formulário</h3>

          {success && (
            <div style={{ marginBottom: 16, padding: 12, background: '#d1fae5', color: '#065f46', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Check size={16} />
              Agendamento realizado com sucesso!
            </div>
          )}

          {error && (
            <div style={{ marginBottom: 16, padding: 12, background: '#fee2e2', color: '#991b1b', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Step 1: Client Info */}
          {step === 1 && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
                <User size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Nome
              </label>
              <input
                type="text"
                value={form.nomeCliente}
                onChange={(e) => handleInputChange('nomeCliente', e.target.value)}
                placeholder="Seu nome"
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

              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
                <Mail size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Email
              </label>
              <input
                type="email"
                value={form.emailCliente}
                onChange={(e) => handleInputChange('emailCliente', e.target.value)}
                placeholder="seu@email.com"
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

              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
                <Phone size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Telefone
              </label>
              <input
                type="tel"
                value={form.telefonecliente}
                onChange={(e) => handleInputChange('telefonecliente', e.target.value)}
                placeholder="(11) 99999-9999"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  fontSize: 14,
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          {/* Step 2: Service Selection */}
          {step === 2 && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
                Serviço
              </label>
              <select
                value={form.servico}
                onChange={(e) => handleInputChange('servico', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  fontSize: 14,
                }}
              >
                <option value="">Selecione um serviço</option>
                {servicos.map(s => (
                  <option key={s._id} value={s.nome}>
                    {s.nome} ({s.duracao}min) - R${s.preco?.toFixed(2) || '0.00'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Step 3: Date Selection */}
          {step === 3 && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
                <Calendar size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Data
              </label>
              <input
                type="date"
                value={form.dataAgendamento}
                onChange={handleDataChange}
                min={new Date().toISOString().split('T')[0]}
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

              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
                Profissional
              </label>
              <input
                type="text"
                value={form.profissional}
                onChange={handleProfissionalChange}
                placeholder="Nome do profissional"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  fontSize: 14,
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          {/* Step 4: Time Selection */}
          {step === 4 && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 12, fontSize: 14 }}>
                <Clock size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Horário Disponível
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                gap: 8
              }}>
                {horariosDisponiveis.length === 0 ? (
                  <p style={{ color: '#666', fontSize: 14 }}>Nenhum horário disponível</p>
                ) : (
                  horariosDisponiveis.map(horario => (
                    <button
                      key={horario}
                      onClick={() => handleInputChange('horarioInicio', horario)}
                      style={{
                        padding: '10px 12px',
                        border: form.horarioInicio === horario ? '2px solid #10b981' : '1px solid #d1d5db',
                        background: form.horarioInicio === horario ? '#d1fae5' : '#fff',
                        borderRadius: 6,
                        fontSize: 14,
                        cursor: 'pointer',
                        fontWeight: form.horarioInicio === horario ? '600' : '400'
                      }}
                    >
                      {horario}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            {step > 1 && (
              <button
                onClick={handleAnterior}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  borderRadius: 6,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Anterior
              </button>
            )}

            {step < 4 ? (
              <button
                onClick={handleProxima}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#0ea5e9',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Próxima
              </button>
            ) : (
              <button
                onClick={handleAgendar}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: loading ? '#ccc' : '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Agendando...' : 'Confirmar Agendamento'}
              </button>
            )}
          </div>

          {/* Step Indicator */}
          <div style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: '#666' }}>
            Passo {step} de 4
          </div>
        </div>
      </div>
    </BasePage>
  );
};

export default OnlineAgendaPage;
