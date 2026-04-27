import React from 'react';

const CartaoEstoque = ({ estoque, onAdicionar, onRemover, onReservar }) => {
  const getStatusCor = (quantidade, minimo, maximo) => {
    if (quantidade <= minimo * 0.25) return '#F44336'; // Crítico
    if (quantidade <= minimo) return '#FF9800'; // Baixo
    if (maximo && quantidade > maximo) return '#2196F3'; // Acima do máximo
    return '#4CAF50'; // Normal
  };

  const getStatusTexto = (quantidade, minimo, maximo) => {
    if (quantidade === 0) return '🔴 Sem estoque';
    if (quantidade <= minimo * 0.25) return '⚠️ CRÍTICO';
    if (quantidade <= minimo) return '⚠️ Baixo';
    if (maximo && quantidade > maximo) return '📈 Acima máx';
    return '✓ Normal';
  };

  const percentualPreenchimento = Math.min(
    ((estoque.quantidadeAtual / (estoque.estoqueMinimoLocal * 5)) * 100),
    100
  );

  return (
    <div
      style={{
        backgroundColor: '#fff',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      {/* Cabeçalho */}
      <div style={{ marginBottom: '12px' }}>
        <h4 style={{ margin: '0 0 4px 0', color: '#333', fontSize: '16px' }}>
          {estoque.localizacao}
        </h4>
        <span
          style={{
            display: 'inline-block',
            backgroundColor: getStatusCor(
              estoque.quantidadeAtual,
              estoque.estoqueMinimoLocal,
              estoque.estoqueMaximoLocal
            ),
            color: 'white',
            padding: '4px 12px',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          {getStatusTexto(
            estoque.quantidadeAtual,
            estoque.estoqueMinimoLocal,
            estoque.estoqueMaximoLocal
          )}
        </span>
      </div>

      {/* Quantidades */}
      <div style={{ backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '4px', marginBottom: '12px' }}>
        {/* Barra de progresso */}
        <div style={{ marginBottom: '12px' }}>
          <div
            style={{
              height: '8px',
              backgroundColor: '#e0e0e0',
              borderRadius: '4px',
              overflow: 'hidden',
              marginBottom: '6px',
            }}
          >
            <div
              style={{
                height: '100%',
                backgroundColor: getStatusCor(
                  estoque.quantidadeAtual,
                  estoque.estoqueMinimoLocal,
                  estoque.estoqueMaximoLocal
                ),
                width: `${percentualPreenchimento}%`,
                transition: 'width 0.3s',
              }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#666',
            }}
          >
            <span>Quantidade atual:</span>
            <span style={{ fontWeight: 'bold', color: '#333' }}>
              {estoque.quantidadeAtual} {estoque.localizacao ? '' : 'un'}
            </span>
          </div>
        </div>

        {/* Linha 1: Atual e Disponível */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#999' }}>Atual</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#2196F3' }}>
              {estoque.quantidadeAtual}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#999' }}>Disponível</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#4CAF50' }}>
              {estoque.quantidadeDisponivel}
            </div>
          </div>
        </div>

        {/* Linha 2: Reservado e Mínimo */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#999' }}>Reservado</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#FF9800' }}>
              {estoque.quantidadeReservada}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#999' }}>Mínimo</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#F44336' }}>
              {estoque.estoqueMinimoLocal}
            </div>
          </div>
        </div>

        {/* Máximo (se houver) */}
        {estoque.estoqueMaximoLocal && (
          <div style={{ marginTop: '8px', fontSize: '11px', color: '#999' }}>
            Máximo: <span style={{ fontWeight: 'bold', color: '#333' }}>
              {estoque.estoqueMaximoLocal}
            </span>
          </div>
        )}
      </div>

      {/* Ações */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <button
          onClick={() => onAdicionar(estoque._id)}
          style={{
            padding: '8px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#45a049')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#4CAF50')}
        >
          ➕ Entrada
        </button>

        <button
          onClick={() => onRemover(estoque._id)}
          style={{
            padding: '8px',
            backgroundColor: '#F44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#da190b')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#F44336')}
        >
          ➖ Saída
        </button>

        {onReservar && (
          <button
            onClick={() => onReservar(estoque._id)}
            style={{
              padding: '8px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              gridColumn: 'span 2',
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#1976D2')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#2196F3')}
          >
            🔒 Reservar
          </button>
        )}
      </div>
    </div>
  );
};

export default CartaoEstoque;
