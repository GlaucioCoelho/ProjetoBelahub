import React, { useState, useEffect } from 'react';
import BasePage from './BasePage';
import s from './shared.module.css';
import { ShoppingBag, Search } from 'lucide-react';
import agendamentoService from '../../services/agendamentoService';

export default function SalesPage() {
  const [search, setSearch]   = useState('');
  const [period, setPeriod]   = useState('week');
  const [vendas, setVendas]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    agendamentoService.listarVendas(period)
      .then(setVendas)
      .catch(() => setVendas([]))
      .finally(() => setLoading(false));
  }, [period]);

  const rows       = vendas.filter(r => r.client.toLowerCase().includes(search.toLowerCase()));
  const totalRev   = vendas.reduce((a, r) => a + r.total, 0);
  const avgTicket  = vendas.length ? Math.round(totalRev / vendas.length) : 0;
  const maxSale    = vendas.length ? Math.max(...vendas.map(r => r.total)) : 0;
  const paid       = vendas.filter(r => r.status === 'paid').length;

  return (
    <BasePage title="Vendas" description="Histórico e resumo de todas as vendas" icon={ShoppingBag}>
      <div className={s.page}>
        <div className={s.statsStrip}>
          <div className={s.statBox}>
            <span className={s.statLabel}>Total do período</span>
            <span className={s.statValue}>R$ {totalRev.toLocaleString('pt-BR')}</span>
          </div>
          <div className={s.statBox}>
            <span className={s.statLabel}>Ticket médio</span>
            <span className={s.statValue}>R$ {avgTicket.toLocaleString('pt-BR')}</span>
          </div>
          <div className={s.statBox}>
            <span className={s.statLabel}>Maior venda</span>
            <span className={s.statValue}>R$ {maxSale.toLocaleString('pt-BR')}</span>
          </div>
          <div className={s.statBox}>
            <span className={s.statLabel}>Pagas</span>
            <span className={s.statValue} style={{color:'#30d158'}}>{paid}/{vendas.length}</span>
          </div>
        </div>

        <div className={s.card}>
          <div className={s.cardHeader}>
            <span className={s.cardTitle}>Vendas recentes</span>
            <div className={s.toolbarRight}>
              <div className={s.searchWrap}>
                <Search size={14}/>
                <input
                  className={`${s.inputBase} ${s.searchInput}`}
                  placeholder="Buscar cliente..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <select className={s.select} value={period} onChange={e => setPeriod(e.target.value)}>
                <option value="today">Hoje</option>
                <option value="week">Esta semana</option>
                <option value="month">Este mês</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className={s.emptyState}>
              <p>Carregando...</p>
            </div>
          ) : rows.length === 0 ? (
            <div className={s.emptyState}>
              <ShoppingBag size={40} style={{opacity:0.3, marginBottom:8}}/>
              <p>Nenhuma venda encontrada no período.</p>
              <p style={{fontSize:13,color:'#86868b'}}>Conclua atendimentos para que apareçam aqui.</p>
            </div>
          ) : (
            <table className={s.table}>
              <thead>
                <tr><th>Data</th><th>Cliente</th><th>Itens</th><th>Total</th><th>Pagamento</th><th>Status</th></tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id}>
                    <td style={{color:'#86868b',whiteSpace:'nowrap'}}>{r.date} · {r.time}</td>
                    <td style={{fontWeight:500}}>{r.client}</td>
                    <td>
                      {r.items.map((item, i) => (
                        <div key={i} style={{fontSize:13, color: i===0?'#1d1d1f':'#86868b'}}>{item}</div>
                      ))}
                    </td>
                    <td><span className={s.amountPos}>R$ {r.total.toLocaleString('pt-BR')}</span></td>
                    <td style={{color:'#86868b'}}>{r.payment}</td>
                    <td>
                      <span className={`${s.badge} ${r.status === 'paid' ? s.badgeGreen : s.badgeYellow}`}>
                        {r.status === 'paid' ? 'Pago' : 'Pendente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </BasePage>
  );
}
