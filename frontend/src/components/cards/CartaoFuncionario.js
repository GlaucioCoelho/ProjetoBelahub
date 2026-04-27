import React, { useState } from 'react';

const CartaoFuncionario = ({ funcionario, onEditar, onDeletar }) => {
  const [mostraEscalas, setMostraEscalas] = useState(false);

  const getStatusCor = (status) => {
    const cores = {
      ativo: '#4CAF50',
      inativo: '#FFC107',
      afastado: '#FF9800',
      demitido: '#F44336',
    };
    return cores[status] || '#999';
  };

  const getCargoCor = (cargo) => {
    const cores = {
      recepcionista: '#2196F3',
      manicure: '#E91E63',
      pedicure: '#9C27B0',
      cabeleireiro: '#FF5722',
      esteticien: '#00BCD4',
      massagista: '#673AB7',
      gerente: '#F57C00',
    };
    return cores[cargo] || '#666';
  };

  return (
    <div
      style={{
        backgroundColor: '#fff',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      }}
    >
      {/* Cabeçalho */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
          <h3 style={{ margin: 0, color: '#333' }}>{funcionario.nome}</h3>
          <span
            style={{
              padding: '4px 12px',
              backgroundColor: getStatusCor(funcionario.status),
              color: 'white',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
            }}
          >
            {funcionario.status}
          </span>
        </div>

        <span
          style={{
            display: 'inline-block',
            padding: '4px 12px',
            backgroundColor: getCargoCor(funcionario.cargo),
            color: 'white',
            borderRadius: '4px',
            fontSize: '12px',
            marginBottom: '10px',
            textTransform: 'capitalize',
          }}
        >
          {funcionario.cargo}
        </span>
      </div>

      {/* Informações Básicas */}
      <div style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
        <p style={{ margin: '5px 0' }}>📧 {funcionario.email}</p>
        {funcionario.telefone && <p style={{ margin: '5px 0' }}>📱 {funcionario.telefone}</p>}
        <p style={{ margin: '5px 0' }}>💰 R$ {funcionario.salarioBase.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
      </div>

      {/* Comissão e Estatísticas */}
      <div
        style={{
          backgroundColor: '#f5f5f5',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '15px',
          fontSize: '13px',
        }}
      >
        {funcionario.comissaoPercentual > 0 && (
          <p style={{ margin: '5px 0', color: '#FF6B9D', fontWeight: 'bold' }}>
            🎯 Comissão: {funcionario.comissaoPercentual}%
          </p>
        )}
        {funcionario.dataFormatada && (
          <p style={{ margin: '5px 0', color: '#999' }}>
            📅 Contratado em: {funcionario.dataFormatada}
          </p>
        )}
      </div>

      {/* Botões */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <button
          onClick={() => {
            onEditar();
          }}
          style={{
            padding: '10px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '13px',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#1976D2')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#2196F3')}
        >
          ✏️ Editar
        </button>

        <button
          onClick={() => {
            if (window.confirm(`Deletar ${funcionario.nome}?`)) {
              onDeletar();
            }
          }}
          style={{
            padding: '10px',
            backgroundColor: '#F44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '13px',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#D32F2F')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#F44336')}
        >
          🗑️ Deletar
        </button>
      </div>

      {/* Botão Extra - Escalas (futuro) */}
      <button
        onClick={() => setMostraEscalas(!mostraEscalas)}
        style={{
          width: '100%',
          padding: '10px',
          marginTop: '10px',
          backgroundColor: '#673AB7',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '13px',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = '#5E35B1')}
        onMouseLeave={(e) => (e.target.style.backgroundColor = '#673AB7')}
      >
        📅 {mostraEscalas ? 'Ocultar' : 'Ver'} Escalas
      </button>

      {mostraEscalas && (
        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
          <p style={{ fontSize: '12px', color: '#999', textAlign: 'center' }}>
            🔄 Escalas próximas (integração completa em progresso)
          </p>
        </div>
      )}
    </div>
  );
};

export default CartaoFuncionario;
