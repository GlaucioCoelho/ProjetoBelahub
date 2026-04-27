import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DashboardFinanceiro = ({ empresaId }) => {
  const [dados, setDados] = useState({
    totalEntradas: 0,
    totalSaidas: 0,
    totalComissoes: 0,
    fluxoLiquido: 0,
    margem: 0,
    totalEmitidas: 0,
    totalPagas: 0,
    totalPendente: 0,
  });
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    carregarDados();
  }, [empresaId]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const tokenJWT = localStorage.getItem('authToken');

      // Obter resumo financeiro
      const resTransacao = await axios.get('/api/transacoes/resumo/financeiro', {
        headers: { Authorization: `Bearer ${tokenJWT}` },
      });

      // Obter relatório de faturamento
      const resFaturamento = await axios.get('/api/faturamento/relatorio/vendas', {
        headers: { Authorization: `Bearer ${tokenJWT}` },
      });

      setDados({
        ...resTransacao.data,
        ...resFaturamento.data.resumo,
      });
      setErro(null);
    } catch (erro) {
      console.error('Erro ao carregar dados financeiros:', erro);
      const msg = erro.response?.data?.mensagem || erro.message || 'Erro ao carregar dados';
      setErro(msg);
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor || 0);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Carregando dados financeiros...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '30px', color: '#333' }}>📊 Dashboard Financeiro</h2>

      {erro && (
        <div
          style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '20px',
          }}
        >
          {erro}
        </div>
      )}

      {/* Métricas Principais */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '40px',
        }}
      >
        {/* Entradas */}
        <div
          style={{
            backgroundColor: '#e8f5e9',
            border: '2px solid #4CAF50',
            borderRadius: '8px',
            padding: '20px',
          }}
        >
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            Entradas (Receitas)
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#4CAF50' }}>
            {formatarMoeda(dados.totalEntradas)}
          </div>
        </div>

        {/* Saídas */}
        <div
          style={{
            backgroundColor: '#ffebee',
            border: '2px solid #F44336',
            borderRadius: '8px',
            padding: '20px',
          }}
        >
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            Saídas (Despesas)
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#F44336' }}>
            {formatarMoeda(dados.totalSaidas)}
          </div>
        </div>

        {/* Comissões */}
        <div
          style={{
            backgroundColor: '#fff3e0',
            border: '2px solid #FF9800',
            borderRadius: '8px',
            padding: '20px',
          }}
        >
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            Comissões Pendentes
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#FF9800' }}>
            {formatarMoeda(dados.totalComissoes)}
          </div>
        </div>

        {/* Fluxo Líquido */}
        <div
          style={{
            backgroundColor: '#e3f2fd',
            border: '2px solid #2196F3',
            borderRadius: '8px',
            padding: '20px',
            gridColumn: 'span 1',
          }}
        >
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            Fluxo Líquido
          </div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: dados.fluxoLiquido >= 0 ? '#2196F3' : '#F44336',
            }}
          >
            {formatarMoeda(dados.fluxoLiquido)}
          </div>
        </div>

        {/* Margem */}
        <div
          style={{
            backgroundColor: '#f3e5f5',
            border: '2px solid #9C27B0',
            borderRadius: '8px',
            padding: '20px',
          }}
        >
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            Margem de Lucro
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#9C27B0' }}>
            {(dados.margem || 0).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Faturamento */}
      <div
        style={{
          backgroundColor: '#f5f5f5',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '20px',
          marginTop: '30px',
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>
          📄 Resumo de Faturamento
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
          }}
        >
          {/* Notas Emitidas */}
          <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '4px' }}>
            <div style={{ fontSize: '13px', color: '#999', marginBottom: '8px' }}>
              Notas Emitidas
            </div>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#333' }}>
              {formatarMoeda(dados.totalEmitidas)}
            </div>
          </div>

          {/* Notas Pagas */}
          <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '4px' }}>
            <div style={{ fontSize: '13px', color: '#999', marginBottom: '8px' }}>
              Notas Pagas
            </div>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#4CAF50' }}>
              {formatarMoeda(dados.totalPagas)}
            </div>
          </div>

          {/* Notas Pendentes */}
          <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '4px' }}>
            <div style={{ fontSize: '13px', color: '#999', marginBottom: '8px' }}>
              Notas Pendentes
            </div>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#FF9800' }}>
              {formatarMoeda(dados.totalPendente)}
            </div>
          </div>
        </div>
      </div>

      {/* Botão de Atualizar */}
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button
          onClick={carregarDados}
          style={{
            padding: '10px 24px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#1976D2')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#2196F3')}
        >
          🔄 Atualizar Dados
        </button>
      </div>
    </div>
  );
};

export default DashboardFinanceiro;
