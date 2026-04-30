import React, { useState } from 'react';
import BasePage from './BasePage';
import s from './shared.module.css';
import { Settings, Save, AlertCircle, Check, Lock, Bell, CreditCard, Users } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';

const SettingsPage = () => {
  const { usuario } = useAuthStore();
  const [activeTab, setActiveTab] = useState('geral');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [geral, setGeral] = useState({
    nomeEmpresa: usuario?.nomeEmpresa || '',
    telefone: usuario?.telefone || '',
    cnpj: usuario?.metadados?.cnpj || '',
    cidade: usuario?.metadados?.cidade || '',
    estado: usuario?.metadados?.estado || '',
    tipoNegocio: usuario?.metadados?.tipoNegocio || 'salao',
  });

  const [notificacoes, setNotificacoes] = useState({
    emailLembretesAgendamento: true,
    emailNovoCliente: true,
    emailPagamento: true,
    notificacoesPush: false,
  });

  const [seguranca, setSeguranca] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: '',
  });

  const handleSalvarGeral = async () => {
    setLoading(true);
    try {
      await axios.put('/api/auth/perfil', {
        nomeEmpresa: geral.nomeEmpresa,
        telefone: geral.telefone,
        cnpj: geral.cnpj,
        cidade: geral.cidade,
        estado: geral.estado,
        tipoNegocio: geral.tipoNegocio,
      });
      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.mensagem || 'Erro ao salvar' });
    } finally {
      setLoading(false);
    }
  };

  const handleAlterarSenha = async () => {
    if (seguranca.novaSenha !== seguranca.confirmarSenha) {
      setMessage({ type: 'error', text: 'Senhas não conferem' });
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/auth/alterar-senha', {
        senhaAtual: seguranca.senhaAtual,
        senhaNova: seguranca.novaSenha,
        confirmarSenha: seguranca.confirmarSenha,
      });
      setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
      setSeguranca({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.mensagem || 'Erro ao alterar senha' });
    } finally {
      setLoading(false);
    }
  };

  const Tab = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        padding: '12px 16px',
        border: 'none',
        background: activeTab === id ? '#10b981' : '#f3f4f6',
        color: activeTab === id ? '#fff' : '#374151',
        borderRadius: 6,
        cursor: 'pointer',
        fontWeight: activeTab === id ? 600 : 500,
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        transition: 'all 0.2s'
      }}
    >
      <Icon size={16} />
      {label}
    </button>
  );

  const SectionCard = ({ children }) => (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 24, marginBottom: 20 }}>
      {children}
    </div>
  );

  return (
    <BasePage title="Configurações" description="Gerencie as configurações do seu salão" icon={Settings}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          <Tab id="geral" label="Geral" icon={Settings} />
          <Tab id="notificacoes" label="Notificações" icon={Bell} />
          <Tab id="seguranca" label="Segurança" icon={Lock} />
          <Tab id="assinatura" label="Assinatura" icon={CreditCard} />
        </div>

        {/* Message Alert */}
        {message.text && (
          <div style={{
            marginBottom: 20,
            padding: 12,
            borderRadius: 6,
            background: message.type === 'success' ? '#d1fae5' : '#fee2e2',
            color: message.type === 'success' ? '#065f46' : '#991b1b',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            {message.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </div>
        )}

        {/* GERAL TAB */}
        {activeTab === 'geral' && (
          <>
            <SectionCard>
              <h3 style={{ marginTop: 0, marginBottom: 16 }}>Informações da Empresa</h3>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
                  Nome da Empresa
                </label>
                <input
                  type="text"
                  value={geral.nomeEmpresa}
                  onChange={(e) => setGeral({ ...geral, nomeEmpresa: e.target.value })}
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
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={geral.telefone}
                    onChange={(e) => setGeral({ ...geral, telefone: e.target.value })}
                    placeholder="(11) 99999-9999"
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
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
                    CNPJ
                  </label>
                  <input
                    type="text"
                    value={geral.cnpj}
                    onChange={(e) => setGeral({ ...geral, cnpj: e.target.value })}
                    placeholder="00.000.000/0000-00"
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={geral.cidade}
                    onChange={(e) => setGeral({ ...geral, cidade: e.target.value })}
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
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
                    Estado
                  </label>
                  <input
                    type="text"
                    value={geral.estado}
                    onChange={(e) => setGeral({ ...geral, estado: e.target.value })}
                    placeholder="SP"
                    maxLength="2"
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

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
                  Tipo de Negócio
                </label>
                <select
                  value={geral.tipoNegocio}
                  onChange={(e) => setGeral({ ...geral, tipoNegocio: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: 14
                  }}
                >
                  <option value="salao">Salão de Beleza</option>
                  <option value="barbearia">Barbearia</option>
                  <option value="studio">Studio</option>
                  <option value="spa">Spa</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <button
                onClick={handleSalvarGeral}
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
                <Save size={16} />
                {loading ? 'Salvando...' : 'Salvar Configurações'}
              </button>
            </SectionCard>
          </>
        )}

        {/* NOTIFICAÇÕES TAB */}
        {activeTab === 'notificacoes' && (
          <SectionCard>
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>Preferências de Notificação</h3>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                <input
                  type="checkbox"
                  checked={notificacoes.emailLembretesAgendamento}
                  onChange={(e) => setNotificacoes({ ...notificacoes, emailLembretesAgendamento: e.target.checked })}
                />
                <span style={{ fontWeight: 600 }}>Email com lembretes de agendamento</span>
              </label>
              <p style={{ fontSize: 12, color: '#666', margin: '4px 0 0 0' }}>
                Receba confirmações de agendamentos criados no sistema
              </p>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                <input
                  type="checkbox"
                  checked={notificacoes.emailNovoCliente}
                  onChange={(e) => setNotificacoes({ ...notificacoes, emailNovoCliente: e.target.checked })}
                />
                <span style={{ fontWeight: 600 }}>Notificação de novo cliente</span>
              </label>
              <p style={{ fontSize: 12, color: '#666', margin: '4px 0 0 0' }}>
                Receba email quando um novo cliente for adicionado
              </p>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                <input
                  type="checkbox"
                  checked={notificacoes.emailPagamento}
                  onChange={(e) => setNotificacoes({ ...notificacoes, emailPagamento: e.target.checked })}
                />
                <span style={{ fontWeight: 600 }}>Relatório de pagamentos</span>
              </label>
              <p style={{ fontSize: 12, color: '#666', margin: '4px 0 0 0' }}>
                Receba resumo de pagamentos e transações
              </p>
            </div>

            <button
              style={{
                width: '100%',
                padding: '12px',
                background: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 14,
                marginTop: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <Save size={16} />
              Salvar Preferências
            </button>
          </SectionCard>
        )}

        {/* SEGURANÇA TAB */}
        {activeTab === 'seguranca' && (
          <SectionCard>
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>Alterar Senha</h3>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
                Senha Atual
              </label>
              <input
                type="password"
                value={seguranca.senhaAtual}
                onChange={(e) => setSeguranca({ ...seguranca, senhaAtual: e.target.value })}
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

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
                Nova Senha
              </label>
              <input
                type="password"
                value={seguranca.novaSenha}
                onChange={(e) => setSeguranca({ ...seguranca, novaSenha: e.target.value })}
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

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
                Confirmar Senha
              </label>
              <input
                type="password"
                value={seguranca.confirmarSenha}
                onChange={(e) => setSeguranca({ ...seguranca, confirmarSenha: e.target.value })}
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

            <button
              onClick={handleAlterarSenha}
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
              <Lock size={16} />
              {loading ? 'Atualizando...' : 'Alterar Senha'}
            </button>
          </SectionCard>
        )}

        {/* ASSINATURA TAB */}
        {activeTab === 'assinatura' && (
          <SectionCard>
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>Informações da Assinatura</h3>

            <div style={{ background: '#f0f9ff', border: '1px solid #0ea5e9', borderRadius: 6, padding: 16, marginBottom: 16 }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: '#0369a1' }}>Plano Atual</p>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0369a1' }}>
                {usuario?.plano?.toUpperCase() || 'STARTER'}
              </p>
              <p style={{ margin: '8px 0 0 0', fontSize: 12, color: '#0369a1' }}>
                Status: {usuario?.planoStatus || 'trial'}
              </p>
            </div>

            <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
              Para gerenciar sua assinatura, acessar histórico de faturas e fazer upgrade, acesse o portal de assinatura.
            </p>

            <button
              style={{
                width: '100%',
                padding: '12px',
                background: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 14
              }}
            >
              Acessar Portal de Assinatura
            </button>
          </SectionCard>
        )}
      </div>
    </BasePage>
  );
};

export default SettingsPage;
