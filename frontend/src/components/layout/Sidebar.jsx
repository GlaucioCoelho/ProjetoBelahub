import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Componente Sidebar
 * Menu lateral com navegação entre as principais seções da aplicação
 */
export default function Sidebar({ menuItems = [], usuario, onLogout }) {
  return (
    <aside style={{
      width: '240px',
      height: 'calc(100vh - 60px)',
      background: '#fff',
      borderRight: '1px solid #e0e0e0',
      padding: '20px 0',
      overflowY: 'auto'
    }}>
      {/* Header do Sidebar */}
      {usuario && (
        <div style={{
          padding: '0 20px 20px',
          borderBottom: '1px solid #e0e0e0',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            Usuário:
          </div>
          <div style={{
            fontWeight: 'bold',
            color: '#333',
            fontSize: '14px',
            wordBreak: 'break-word'
          }}>
            {usuario.nome || usuario.email}
          </div>
        </div>
      )}

      {/* Menu Items */}
      <nav>
        {menuItems && menuItems.length > 0 ? (
          menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 20px',
                color: '#333',
                textDecoration: 'none',
                fontSize: '14px',
                transition: 'background 0.2s',
                borderLeft: '3px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f5f5f5';
                e.currentTarget.style.borderLeftColor = '#d946a6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderLeftColor = 'transparent';
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))
        ) : (
          <div style={{ padding: '20px', color: '#999', fontSize: '12px' }}>
            Nenhum menu disponível
          </div>
        )}
      </nav>

      {/* Logout Button at Bottom */}
      {onLogout && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '0',
          right: '0',
          padding: '0 20px'
        }}>
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              padding: '10px',
              background: '#f5f5f5',
              color: '#d946a6',
              border: '1px solid #d946a6',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#d946a6';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f5f5f5';
              e.currentTarget.style.color = '#d946a6';
            }}
          >
            Sair
          </button>
        </div>
      )}
    </aside>
  );
}
