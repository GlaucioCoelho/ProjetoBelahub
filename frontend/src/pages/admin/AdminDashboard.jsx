import React, { useState, useEffect } from 'react';
import s from './admin.module.css';
import { Building2, TrendingUp, Users, DollarSign, Plus, Activity } from 'lucide-react';
import adminService from '../../services/adminService';

const PLAN_LABEL = { starter: 'Starter', pro: 'Pro', enterprise: 'Enterprise' };
const PLAN_COLOR = { starter: '#6b7280', pro: '#7c3aed', enterprise: '#e8185a' };
const PLAN_PRICE = { starter: 0, pro: 149, enterprise: 349 };
const STATUS_CFG = {
  ativo:     { label: 'Ativo',    cls: 'badgeGreen'  },
  trial:     { label: 'Trial',    cls: 'badgeBlue'   },
  suspenso:  { label: 'Suspenso', cls: 'badgeRed'    },
  cancelado: { label: 'Cancelado',cls: 'badgeGray'   },
};

export default function AdminDashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboard()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={s.emptyState}><p>Carregando...</p></div>;
  if (!data)   return <div className={s.emptyState}><p>Erro ao carregar dados.</p></div>;

  const planMap = {};
  (data.porPlano || []).forEach(r => { planMap[r._id] = r; });

  return (
    <div>
      {/* KPI Strip */}
      <div className={s.statsGrid}>
        <div className={s.statCard}>
          <div className={s.statCardIcon} style={{background:'rgba(59,130,246,0.1)'}}>🏢</div>
          <div className={s.statLabel}>Total de empresas</div>
          <div className={s.statValue}>{data.total}</div>
          <div className={`${s.statDelta} ${s.deltaPos}`}>+{data.novosMes} este mês</div>
        </div>
        <div className={s.statCard}>
          <div className={s.statCardIcon} style={{background:'rgba(34,197,94,0.1)'}}>✅</div>
          <div className={s.statLabel}>Empresas ativas</div>
          <div className={s.statValue} style={{color:'#16a34a'}}>{data.ativos}</div>
          <div className={`${s.statDelta} ${s.deltaNeg}`}>{data.inativos} inativas</div>
        </div>
        <div className={s.statCard}>
          <div className={s.statCardIcon} style={{background:'rgba(124,58,237,0.1)'}}>💰</div>
          <div className={s.statLabel}>MRR estimado</div>
          <div className={s.statValue} style={{color:'#7c3aed'}}>R$ {data.mrrTotal.toLocaleString('pt-BR')}</div>
          <div className={s.statLabel} style={{marginTop:2}}>receita recorrente mensal</div>
        </div>
        <div className={s.statCard}>
          <div className={s.statCardIcon} style={{background:'rgba(245,158,11,0.1)'}}>📅</div>
          <div className={s.statLabel}>Novos este mês</div>
          <div className={s.statValue} style={{color:'#b45309'}}>{data.novosMes}</div>
        </div>
      </div>

      <div className={s.twoCol} style={{marginBottom:24}}>
        {/* Plans distribution */}
        <div className={s.card}>
          <div className={s.cardHeader}>
            <div>
              <div className={s.cardTitle}>Distribuição por plano</div>
              <div className={s.cardSub}>Empresas por tipo de assinatura</div>
            </div>
          </div>
          <div style={{padding:'16px 20px'}}>
            {['starter','pro','enterprise'].map(slug => {
              const count = planMap[slug]?.total || 0;
              const pct   = data.total > 0 ? Math.round(count / data.total * 100) : 0;
              const mrr   = (planMap[slug]?.ativos || 0) * PLAN_PRICE[slug];
              return (
                <div key={slug} style={{marginBottom:16}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span className={`${s.badge} ${slug === 'starter' ? s.planStarter : slug === 'pro' ? s.planPro : s.planEnterprise}`}>
                        {PLAN_LABEL[slug]}
                      </span>
                      <span style={{fontSize:13,color:'#4b5563',fontWeight:600}}>{count} empresa{count !== 1 ? 's':''}</span>
                    </div>
                    <span style={{fontSize:12,color:'#8892a4'}}>MRR R$ {mrr.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className={s.progressWrap}>
                    <div className={s.progressFill} style={{width:`${pct}%`,background:PLAN_COLOR[slug]}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent signups */}
        <div className={s.card}>
          <div className={s.cardHeader}>
            <div>
              <div className={s.cardTitle}>Cadastros recentes</div>
              <div className={s.cardSub}>Últimas 5 empresas</div>
            </div>
          </div>
          <table className={s.table}>
            <thead>
              <tr><th>Empresa</th><th>Plano</th><th>Status</th></tr>
            </thead>
            <tbody>
              {(data.recentes || []).map(t => {
                const st = STATUS_CFG[t.planoStatus] || STATUS_CFG.trial;
                return (
                  <tr key={t._id}>
                    <td>
                      <div style={{fontWeight:600,fontSize:13}}>{t.nomeEmpresa || t.nome}</div>
                      <div style={{fontSize:11,color:'#8892a4'}}>{t.email}</div>
                    </td>
                    <td>
                      <span className={`${s.badge} ${t.plano === 'starter' ? s.planStarter : t.plano === 'pro' ? s.planPro : s.planEnterprise}`}>
                        {PLAN_LABEL[t.plano] || 'Starter'}
                      </span>
                    </td>
                    <td><span className={`${s.badge} ${s[st.cls]}`}>{st.label}</span></td>
                  </tr>
                );
              })}
              {(!data.recentes || data.recentes.length === 0) && (
                <tr><td colSpan={3} style={{textAlign:'center',color:'#9ca3af',padding:24}}>Sem cadastros ainda</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revenue breakdown */}
      <div className={s.card}>
        <div className={s.cardHeader}>
          <div className={s.cardTitle}>Projeção de receita</div>
        </div>
        <div style={{padding:'16px 20px',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16}}>
          {[
            { label: 'MRR atual',   value: `R$ ${data.mrrTotal.toLocaleString('pt-BR')}`,   color: '#7c3aed' },
            { label: 'ARR projetado', value: `R$ ${(data.mrrTotal * 12).toLocaleString('pt-BR')}`, color: '#e8185a' },
            { label: 'Ticket médio', value: data.ativos > 0 ? `R$ ${Math.round(data.mrrTotal/data.ativos).toLocaleString('pt-BR')}` : 'R$ 0', color: '#0ea5e9' },
            { label: 'Taxa ativação', value: data.total > 0 ? `${Math.round(data.ativos/data.total*100)}%` : '0%', color: '#22c55e' },
          ].map(m => (
            <div key={m.label} style={{textAlign:'center',padding:'16px 8px',borderRadius:10,background:'#f8f9fd'}}>
              <div style={{fontSize:22,fontWeight:900,color:m.color,letterSpacing:'-0.03em'}}>{m.value}</div>
              <div style={{fontSize:11,color:'#8892a4',marginTop:4,fontWeight:500}}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
