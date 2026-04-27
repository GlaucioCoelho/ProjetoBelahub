import React from 'react';

const CartaoProduto = ({ produto, onEditar, onDeletar, onVerEstoque }) => {
  const getCategoriaEmoji = (categoria) => {
    const emojis = {
      higiene: '🧼',
      cosmetico: '💄',
      ferramenta: '🔧',
      uniforme: '👕',
      acessorio: '👜',
      outro: '📦',
    };
    return emojis[categoria] || '📦';
  };

  const getCategoriaLabel = (categoria) => {
    const labels = {
      higiene: 'Higiene',
      cosmetico: 'Cosmético',
      ferramenta: 'Ferramenta',
      uniforme: 'Uniforme',
      acessorio: 'Acessório',
      outro: 'Outro',
    };
    return labels[categoria] || 'Produto';
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor || 0);
  };

  const calcularMargem = () => {
    if (!produto.precoCusto) return 0;
    return ((produto.precoUnitario - produto.precoCusto) / produto.precoUnitario * 100).toFixed(1);
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
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
          <div>
            <h3 style={{ margin: '0 0 4px 0', color: '#333', fontSize: '18px' }}>
              {produto.nome}
            </h3>
            <p style={{ margin: 0, color: '#999', fontSize: '12px' }}>
              SKU: {produto.sku}
            </p>
          </div>
          <span
            style={{
              backgroundColor: produto.ativo ? '#e8f5e9' : '#ffebee',
              color: produto.ativo ? '#2e7d32' : '#c62828',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            {produto.ativo ? '✓ Ativo' : '✗ Inativo'}
          </span>
        </div>

        {/* Categoria */}
        <span
          style={{
            display: 'inline-block',
            backgroundColor: '#f0f0f0',
            padding: '6px 12px',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#666',
            marginTop: '8px',
          }}
        >
          {getCategoriaEmoji(produto.categoria)} {getCategoriaLabel(produto.categoria)}
        </span>
      </div>

      {/* Descrição */}
      {produto.descricao && (
        <p
          style={{
            fontSize: '13px',
            color: '#666',
            margin: '0 0 12px 0',
            lineHeight: '1.4',
          }}
        >
          {produto.descricao.substring(0, 100)}
          {produto.descricao.length > 100 ? '...' : ''}
        </p>
      )}

      {/* Preços */}
      <div
        style={{
          backgroundColor: '#f9f9f9',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', color: '#666' }}>Preço Unit.</span>
          <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#2196F3' }}>
            {formatarMoeda(produto.precoUnitario)}
          </span>
        </div>

        {produto.precoCusto && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#666' }}>Preço Custo</span>
              <span style={{ fontSize: '14px', color: '#999' }}>
                {formatarMoeda(produto.precoCusto)}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '8px',
                borderTop: '1px solid #e0e0e0',
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#666' }}>
                Margem
              </span>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#4CAF50' }}>
                {calcularMargem()}%
              </span>
            </div>
          </>
        )}
      </div>

      {/* Info Fornecedor */}
      {produto.fornecedor && (
        <div style={{ marginBottom: '12px', fontSize: '12px', color: '#999' }}>
          📦 {produto.fornecedor}
        </div>
      )}

      {/* Ações */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => onVerEstoque(produto._id)}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: '#9C27B0',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 'bold',
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#7B1FA2')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#9C27B0')}
        >
          📊 Estoque
        </button>

        <button
          onClick={() => onEditar(produto)}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 'bold',
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#1976D2')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#2196F3')}
        >
          ✏️ Editar
        </button>

        <button
          onClick={() => onDeletar(produto._id)}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 'bold',
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#da190b')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#f44336')}
        >
          🗑️ Deletar
        </button>
      </div>
    </div>
  );
};

export default CartaoProduto;
