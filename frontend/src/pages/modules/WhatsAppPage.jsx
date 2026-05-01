import React, { useState } from 'react';
import BasePage from './BasePage';
import s from './shared.module.css';
import { MessageCircle, Check, AlertCircle } from 'lucide-react';

const WhatsAppPage = () => {
  const [settings, setSettings] = useState({
    businessPhone: '',
    sendReminders: false,
    reminderTiming: 24, // hours before appointment
    messageTemplate: 'Olá {cliente}! Lembrete: Seu agendamento de {servico} está confirmado para {data} às {hora}.',
    apiConfigured: false,
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    // In a real app, this would save to backend
    console.log('Saving WhatsApp settings:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <BasePage title="WhatsApp" description="Gerencie WhatsApp do seu salão" icon={MessageCircle}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px' }}>

        {/* Feature Overview */}
        <div style={{ background: '#f0f9ff', border: '1px solid #0ea5e9', borderRadius: 8, padding: 16, marginBottom: 24 }}>
          <h3 style={{ marginTop: 0, color: '#0369a1' }}>Recursos de WhatsApp</h3>
          <ul style={{ margin: '8px 0', paddingLeft: 20, fontSize: 14, color: '#333' }}>
            <li>✅ Clique no cliente → Botão WhatsApp abre conversa</li>
            <li>✅ Lembretes automáticos de agendamento</li>
            <li>✅ Mensagens personalizáveis</li>
            <li>📋 Integração com API (em breve)</li>
          </ul>
        </div>

        {/* Settings Form */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 24 }}>
          <h3 style={{ marginTop: 0 }}>Configurações</h3>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
              Telefone do Salão
            </label>
            <input
              type="tel"
              value={settings.businessPhone}
              onChange={(e) => handleChange('businessPhone', e.target.value)}
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
            <p style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              Usado para gerar links de contato direto via WhatsApp
            </p>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
              <input
                type="checkbox"
                checked={settings.sendReminders}
                onChange={(e) => handleChange('sendReminders', e.target.checked)}
              />
              <span style={{ fontWeight: 600 }}>Enviar lembretes de agendamento</span>
            </label>
            <p style={{ fontSize: 12, color: '#666', marginTop: 4, marginBottom: 0 }}>
              Requer integração com WhatsApp API
            </p>
          </div>

          {settings.sendReminders && (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
                  Enviar lembrete com antecedência
                </label>
                <select
                  value={settings.reminderTiming}
                  onChange={(e) => handleChange('reminderTiming', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: 14,
                  }}
                >
                  <option value={1}>1 hora antes</option>
                  <option value={24}>24 horas antes</option>
                  <option value={48}>48 horas antes</option>
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
                  Template de Mensagem
                </label>
                <textarea
                  value={settings.messageTemplate}
                  onChange={(e) => handleChange('messageTemplate', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: 14,
                    fontFamily: 'monospace',
                    minHeight: 100,
                    boxSizing: 'border-box',
                  }}
                />
                <p style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                  Variáveis disponíveis: {'{cliente}'}, {'{servico}'}, {'{data}'}, {'{hora}'}
                </p>
              </div>
            </>
          )}

          <button
            onClick={handleSave}
            style={{
              width: '100%',
              padding: '12px',
              background: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Salvar Configurações
          </button>

          {saved && (
            <div style={{ marginTop: 12, padding: 12, background: '#d1fae5', color: '#065f46', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
              <Check size={16} />
              Configurações salvas com sucesso!
            </div>
          )}
        </div>

        {/* API Status */}
        <div style={{ marginTop: 24, padding: 16, background: '#fef3c7', borderRadius: 8, border: '1px solid #f59e0b', display: 'flex', gap: 12 }}>
          <AlertCircle size={20} style={{ color: '#d97706', flexShrink: 0 }} />
          <div style={{ fontSize: 14, color: '#92400e' }}>
            <strong>Funcionalidade limitada:</strong> Click-to-WhatsApp está ativo. Para lembretes automáticos, será necessário configurar a integração com WhatsApp API (em desenvolvimento).
          </div>
        </div>
      </div>
    </BasePage>
  );
};

export default WhatsAppPage;
