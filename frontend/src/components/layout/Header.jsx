import React from 'react';

/**
 * Componente Header
 * Exibe o cabeçalho da aplicação com informações do usuário e botão de logout
 */
export default function Header({ usuario, onLogout }) {
  return (
    <header style={{
      height: '60px',
      background: '#fff',
      borderBottom: '1px solid #e0e0e0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingLeft: '20px',
      paddingRight: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {/* Logo/Título */}
      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#d946a6' }}>
        💅 BelaHub
      </div>

      {/* User Info e Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {usuario && (
          <span style={{ fontSize: '14px', color: '#666' }}>
            Bem-vindo, <strong>{usuario.nome || usuario.email}</strong>
          </span>
        )}
        <button
          onClick={onLogout}
          style={{
            padding: '8px 16px',
            background: '#d946a6',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Sair
        </button>
      </div>
    </header>
  );
}
