import React from 'react';

/**
 * Componente Badge
 * Exibe um rótulo com cor de fundo
 */
export default function Badge({ children, type = 'default', color = '#d946a6' }) {
  const colors = {
    primary: '#d946a6',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    default: '#d946a6'
  };

  const bgColor = type && colors[type] ? colors[type] : color;

  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 12px',
      background: bgColor,
      color: '#fff',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      whiteSpace: 'nowrap'
    }}>
      {children}
    </span>
  );
}
