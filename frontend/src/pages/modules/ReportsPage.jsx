import React, { useState, useEffect, useCallback } from 'react';
import BasePage from './BasePage';
import s from './shared.module.css';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, FileText, RefreshCw } from 'lucide-react';
import api from '../../services/api';

const f = (v) => `R$ ${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
const pct = (v) => `${Number(v || 0).toFixed(1)}%`;

function dateRange(period) {
  const now = new Date();
  const today = now.toISOString().substring(0, 10);
  if (period === 'today') return { dataInicio: today, dataFim: today };
  if (period === 'week') {
    const d = new Date(now); d.setDate(d.getDate() - 7);
    return { dataInicio: d.toISOString().substring(0, 10), dataFim: today };
  }
  if (period === 'quarter') {
    const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    return { dataInicio: qStart.toISOString().substring(0, 10), dataFim: today };
  }
  // month (default)
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return { dataInicio: start.toISOString().substring(0, 10), dataFim: today };
}

const PERIOD_LABEL = { today: 'Hoje', week: 'Últimos 7 dias', month: 'Este mês', quarter: 'Este trimestre' };

export default function ReportsPage() {
  const [period, setPeriod]       = useState('month');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [financial, setFinancial] = useState(null);   // transacoes/resumo/financeiro
  const [invoices, setInvoices]   = useState(null);   // faturamento/relatorio/vendas
  const [stock, setStock]         = useState(null);   // movimentacoes/resumo/geral
  const [topTx, setTopTx]         = useState([]);     // recent transactions

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    const range = dateRange(period);

    Promise.allSettled([
      api.get('/transacoes/resumo/financeiro', { params: range }),
      api.get('/faturamento/relatorio/vendas', { params: range }),
      api.get('/movimentacoes/resumo/geral',   { params: range }),
      api.get('/transacoes', { params: { ...range, limite: 10 } }),
    ]).then(([r1, r2, r3, r4]) => {
      setFinancial(r1.status === 'fulfilled' ? r1.value.data : null);
      setInvoices(r2.status  === 'fulfilled' ? r2.value.data : null);
      setStock(r3.status    === 'fulfilled' ? r3.value.data : null);
      if (r4.status === 'fulfilled') {
        setTopTx((r4.value.data.transacoes || []).slice(0, 8).map(t => ({
          id:    t._id,
          desc:  t.descricao || '—',
          tipo:  t.tipo,
          valor: t.valor || 0,
          data:  t.data ? new Date(t.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '—',
          cat:   t.categoria || 'Outros',
        })));
      }
    }).catch(() => setError('Erro ao carregar relatórios.'))
      .finally(() => setLoading(false));
  }, [period]);

  useEffect(() => { load(); }, [load]);

  const entradas   = financial?.totalEntradas   || 0;
  const saidas     = financial?.totalSaidas     || 0;
  const comissoes  = financial?.totalComissoes  || 0;
  const fluxo      = financial?.fluxoLiquido    || 0;
  const margem     = financial?.margem          || 0;

  const notasEmitidas = invoices?.totalEmitidas || 0;
  const notasPagas    = invoices?.totalPagas    || 0;
  const notasPendente = invoices?.totalPendente || 0;

  const stockResumo = stock?.resumo || {};

  return (
    <BasePage title="Relatórios" description="Visão consolidada do desempenho do seu salão" icon={BarChart3}>
      <div className={s.page}>
        {/* Period selector */}
        <div className={s.toolbar}>
          <div className={s.toolbarLeft}>
            {Object.entries(PERIOD_LABEL).map(([key, label]) => (
              <button
                key={key}
                className={period === key ? s.btnPrimary : s.btnGhost}
                onClick={() => setPeriod(key)}
                style={{ height: 32, padding: '0 14px', fontSize: 13 }}
              >
                {label}
              </button>
            ))}
          </div>
          <button className={s.btnGhost} onClick={load} style={{ height: 32 }}>
            <RefreshCw size={14} />
            Atualizar
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 16px', color: '#dc2626', fontSize: 14 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className={s.emptyState}>Carregando relatórios…</div>
        ) : (
          <>
            {/* Financial KPIs */}
            <div className={s.statsStrip}>
              <div className={s.statBox}>
                <span className={s.statLabel}>Receitas</span>
                <span className={s.statValue} style={{ fontSize: 20, color: '#22c55e' }}>{f(entradas)}</span>
                <span className={s.statSub}>Entradas no período</span>
              </div>
              <div className={s.statBox}>
                <span className={s.statLabel}>Despesas</span>
                <span className={s.statValue} style={{ fontSize: 20, color: '#e8185a' }}>{f(saidas)}</span>
                <span className={s.statSub}>Saídas no período</span>
              </div>
              <div className={s.statBox}>
                <span className={s.statLabel}>Comissões pagas</span>
                <span className={s.statValue} style={{ fontSize: 20, color: '#a855f7' }}>{f(comissoes)}</span>
                <span className={s.statSub}>Remunerações</span>
              </div>
              <div className={s.statBox}>
                <span className={s.statLabel}>Fluxo líquido</span>
                <span className={s.statValue} style={{ fontSize: 20, color: fluxo >= 0 ? '#22c55e' : '#e8185a' }}>
                  {f(fluxo)}
                </span>
                <span className={s.statSub}>Margem: {pct(margem)}</span>
              </div>
            </div>

            {/* Two columns: Invoices + Stock */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Invoices summary */}
              <div className={s.card}>
                <div className={s.cardHeader}>
                  <span className={s.cardTitle}>Notas Fiscais</span>
                  <FileText size={16} style={{ color: 'var(--text-tertiary)' }} />
                </div>
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Emitidas</span>
                    <span style={{ fontWeight: 700, color: '#1d4ed8' }}>{f(notasEmitidas)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Pagas</span>
                    <span style={{ fontWeight: 700, color: '#16a34a' }}>{f(notasPagas)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Pendente</span>
                    <span style={{ fontWeight: 700, color: '#b45309' }}>{f(notasPendente)}</span>
                  </div>
                  {notasEmitidas > 0 && (
                    <>
                      <div className={s.progressBar} style={{ marginTop: 4 }}>
                        <div
                          className={s.progressFill}
                          style={{ width: `${Math.min(100, (notasPagas / notasEmitidas) * 100)}%` }}
                        />
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                        {pct((notasPagas / notasEmitidas) * 100)} recebido
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Stock movements */}
              <div className={s.card}>
                <div className={s.cardHeader}>
                  <span className={s.cardTitle}>Movimentações de Estoque</span>
                </div>
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { key: 'entrada',   label: 'Entradas',   color: '#22c55e' },
                    { key: 'saida',     label: 'Saídas',     color: '#e8185a' },
                    { key: 'ajuste',    label: 'Ajustes',    color: '#f59e0b' },
                    { key: 'devolucao', label: 'Devoluções', color: '#0ea5e9' },
                    { key: 'perda',     label: 'Perdas',     color: '#6b7280' },
                  ].map(({ key, label, color }) => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
                      <span style={{ fontWeight: 700, color }}>{stockResumo[key] ?? 0} un.</span>
                    </div>
                  ))}
                  {!stock && <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Sem dados para o período.</span>}
                </div>
              </div>
            </div>

            {/* Recent transactions */}
            <div className={s.card}>
              <div className={s.cardHeader}>
                <span className={s.cardTitle}>Últimas Transações</span>
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{PERIOD_LABEL[period]}</span>
              </div>
              {topTx.length === 0 ? (
                <div className={s.emptyState}>Nenhuma transação no período.</div>
              ) : (
                <table className={s.table}>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Descrição</th>
                      <th>Categoria</th>
                      <th>Tipo</th>
                      <th style={{ textAlign: 'right' }}>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topTx.map(t => (
                      <tr key={t.id}>
                        <td style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>{t.data}</td>
                        <td>{t.desc}</td>
                        <td>
                          <span className={`${s.badge} ${s.badgeGray}`}>{t.cat}</span>
                        </td>
                        <td>
                          <span className={`${s.badge} ${t.tipo === 'receita' ? s.badgeGreen : t.tipo === 'comissao' ? s.badgePink : s.badgeRed}`}>
                            {t.tipo === 'receita' ? 'Receita' : t.tipo === 'comissao' ? 'Comissão' : 'Despesa'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className={t.tipo === 'receita' ? s.amountPos : s.amountNeg}>
                            {t.tipo === 'receita' ? '+' : '-'}{f(t.valor)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </BasePage>
  );
}
