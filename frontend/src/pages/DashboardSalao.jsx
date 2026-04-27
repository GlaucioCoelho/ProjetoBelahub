import React, { useState, useEffect, useCallback } from 'react';
import s from './DashboardSalao.module.css';
import {
  Calendar, CheckCircle, DollarSign, Clock, TrendingUp,
  Users, Star, ArrowUpRight, Package, Zap, ChevronRight,
  Scissors, Sparkles
} from 'lucide-react';
import agendamentoService from '../services/agendamentoService';
import funcionarioService from '../services/funcionarioService';
import api from '../services/api';

const TODAY = new Date().toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
const HOUR = new Date().getHours();
const GREETING = HOUR < 12 ? 'Bom dia' : HOUR < 18 ? 'Boa tarde' : 'Boa noite';

const STATUS_CFG = {
  completed: { label:'Concluído', cls:'statusDone'   },
  waiting:   { label:'Aguardando',cls:'statusWait'   },
  scheduled: { label:'Agendado',  cls:'statusSched'  },
};

const QUICK_ACTIONS = [
  { icon:Calendar,   label:'Novo agendamento', color:'#7c3aed' },
  { icon:Users,      label:'Novo cliente',     color:'#e8185a' },
  { icon:DollarSign, label:'Lançar venda',     color:'#a855f7' },
  { icon:Package,    label:'Ver estoque',      color:'#f59e0b' },
];

const EMPTY_STATS = [
  { label:'Agendamentos', value:'--', sub:'carregando...', icon:Calendar,    trend:'none', color:'purple' },
  { label:'Concluídos',   value:'--', sub:'carregando...', icon:CheckCircle, trend:'none', color:'green'  },
  { label:'Faturamento',  value:'--', sub:'carregando...', icon:DollarSign,  trend:'none', color:'pink'   },
  { label:'Próximo',      value:'--', sub:'carregando...', icon:Clock,       trend:'none', color:'blue'   },
];

const EMPTY_WEEK = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(d => ({ day:d, value:0, pct:0 }));

const STATUS_TO_UI = {
  concluido:      'completed',
  aguardando:     'waiting',
  agendado:       'scheduled',
  cancelado:      'scheduled',
  nao_compareceu: 'scheduled',
};

const PROF_COLORS = ['#7c3aed','#e8185a','#a855f7','#f59e0b','#10b981','#06b6d4'];

export default function DashboardSalao() {
  const [activeDay, setActiveDay] = useState(6); // hoje = último item dos 7 dias
  const [stats, setStats]               = useState(EMPTY_STATS);
  const [weekData, setWeekData]         = useState(EMPTY_WEEK);
  const [weekTotal, setWeekTotal]       = useState(0);
  const [professionals, setProfessionals] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [alerts, setAlerts]             = useState([]);
  const [todayCount, setTodayCount]     = useState(0);

  const loadDashboard = useCallback(async () => {
    const todayISO = new Date().toISOString().substring(0, 10);

    // Últimos 7 dias
    const weekStartDate = new Date();
    weekStartDate.setDate(weekStartDate.getDate() - 6);
    const weekStartISO = weekStartDate.toISOString().substring(0, 10);

    const [todayRes, weekRes, funcsRes, alertsRes] = await Promise.allSettled([
      api.get('/agendamentos', { params: { dataInicio: todayISO, dataFim: todayISO, limite: 100 } }),
      api.get('/agendamentos', { params: { dataInicio: weekStartISO, dataFim: todayISO, limite: 500 } }),
      funcionarioService.listar(),
      api.get('/alertas/nao-lidos/listar'),
    ]);

    // ── Agendamentos de hoje ──────────────────────────────
    if (todayRes.status === 'fulfilled') {
      const lista = todayRes.value.data.agendamentos || todayRes.value.data.dados || [];
      const total       = lista.length;
      const concluidos  = lista.filter(a => a.status === 'concluido').length;
      const faturamento = lista
        .filter(a => a.status === 'concluido')
        .reduce((sum, a) => sum + (a.preco || 0), 0);
      const proximo = lista
        .filter(a => a.status === 'agendado' || a.status === 'aguardando')
        .sort((a, b) => (a.horarioInicio || '').localeCompare(b.horarioInicio || ''))
        [0];

      setTodayCount(total);

      setStats([
        {
          label: 'Agendamentos',
          value: String(total),
          sub:   total === 0 ? 'Nenhum hoje' : `${total} marcados`,
          icon:  Calendar,
          trend: total > 0 ? 'up' : 'none',
          color: 'purple',
        },
        {
          label: 'Concluídos',
          value: String(concluidos),
          sub:   total > 0 ? `${Math.round(concluidos / total * 100)}% do total` : '0% do total',
          icon:  CheckCircle,
          trend: concluidos > 0 ? 'up' : 'none',
          color: 'green',
        },
        {
          label: 'Faturamento',
          value: `R$ ${faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`,
          sub:   faturamento === 0 ? 'Sem movimentação' : 'de agendamentos',
          icon:  DollarSign,
          trend: faturamento > 0 ? 'up' : 'none',
          color: 'pink',
        },
        {
          label: 'Próximo',
          value: proximo?.horarioInicio || '--:--',
          sub:   proximo ? (proximo.nomeCliente || 'Cliente') : 'Sem agendamento',
          icon:  Clock,
          trend: 'none',
          color: 'blue',
        },
      ]);

      setAppointments(
        lista.slice(0, 8).map(a => ({
          time:    a.horarioInicio || '--:--',
          client:  a.nomeCliente  || 'Cliente',
          service: a.servico      || '',
          prof:    a.profissional || '',
          color:   '#7c3aed',
          status:  STATUS_TO_UI[a.status] || 'scheduled',
        }))
      );
    }

    // ── Agendamentos da semana (gráfico + profissionais) ──
    if (weekRes.status === 'fulfilled') {
      const weekList = weekRes.value.data.agendamentos || weekRes.value.data.dados || [];

      // Gráfico: agrupa por data, soma receita dos concluídos
      const dateRevenue = {};
      weekList
        .filter(a => a.status === 'concluido')
        .forEach(a => {
          const iso = a.dataAgendamento
            ? (typeof a.dataAgendamento === 'string'
                ? a.dataAgendamento.substring(0, 10)
                : new Date(a.dataAgendamento).toISOString().substring(0, 10))
            : null;
          if (iso) dateRevenue[iso] = (dateRevenue[iso] || 0) + (a.preco || 0);
        });

      const DAY_LABELS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().substring(0, 10);
      });

      const values = last7Days.map(iso => {
        const d = new Date(iso + 'T12:00:00');
        return { day: DAY_LABELS[d.getDay()], value: dateRevenue[iso] || 0 };
      });

      const maxVal = Math.max(...values.map(v => v.value), 1);
      const total  = values.reduce((s, v) => s + v.value, 0);

      setWeekTotal(total);
      setWeekData(values.map(v => ({
        day:   v.day,
        value: v.value,
        pct:   Math.round(v.value / maxVal * 100),
      })));

      // Top profissionais: soma receita por nome de profissional
      const profRevenue = {};
      weekList
        .filter(a => a.status === 'concluido' && a.profissional)
        .forEach(a => {
          profRevenue[a.profissional] = (profRevenue[a.profissional] || 0) + (a.preco || 0);
        });

      if (funcsRes.status === 'fulfilled') {
        const funcs = funcsRes.value;
        const ranked = funcs
          .filter(f => f.status === 'active')
          .map((f, i) => ({
            name:     f.name,
            role:     f.role,
            revenue:  profRevenue[f.name] || 0,
            rating:   f.thisMonth.rating || 5.0,
            color:    f.color || PROF_COLORS[i % PROF_COLORS.length],
            initials: f.initials,
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 4);

        setProfessionals(ranked);
      }
    }

    // ── Alertas de estoque ────────────────────────────────
    if (alertsRes.status === 'fulfilled') {
      const raw = alertsRes.value.data;
      const lista = Array.isArray(raw) ? raw : (raw.alertas || raw.dados || []);
      setAlerts(
        lista.slice(0, 3).map(al => ({
          name: al.produto?.nome || al.descricao || 'Produto',
          qty:  al.quantidadeAtual  ?? 0,
          min:  al.quantidadeLimite ?? 5,
        }))
      );
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  return (
    <div className={s.page}>

      {/* ── Header ── */}
      <div className={s.hero}>
        <div className={s.heroLeft}>
          <div className={s.greetingBadge}>
            <Sparkles size={12}/> {GREETING}
          </div>
          <h1 className={s.heroTitle}>Painel do Salão</h1>
          <p className={s.heroDate}>{TODAY}</p>
        </div>
        <div className={s.heroBadges}>
          <div className={s.heroPill}>
            <div className={s.pulseRing}/>
            <span className={s.pulseDoc}/>
            {todayCount} agendamento{todayCount !== 1 ? 's' : ''} hoje
          </div>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div className={s.statsGrid}>
        {stats.map((st, i) => {
          const Icon = st.icon;
          return (
            <div key={i} className={`${s.statCard} ${s['statCard_' + st.color]}`}
                 style={{ animationDelay: `${i * 0.08}s` }}>
              <div className={s.statTop}>
                <div className={`${s.statIcon} ${s['statIcon_' + st.color]}`}>
                  <Icon size={18}/>
                </div>
                {st.trend === 'up' && <ArrowUpRight size={14} className={s.trendUp}/>}
              </div>
              <div className={s.statValue}>{st.value}</div>
              <div className={s.statLabel}>{st.label}</div>
              <div className={s.statSub}>{st.sub}</div>
            </div>
          );
        })}
      </div>

      {/* ── Main grid ── */}
      <div className={s.mainGrid}>

        {/* ── Revenue Chart ── */}
        <div className={s.glassCard} style={{ animationDelay:'0.1s' }}>
          <div className={s.cardHead}>
            <div>
              <span className={s.cardTitle}>Faturamento semanal</span>
              <div className={s.cardSub}>
                <TrendingUp size={12}/> R$ {weekTotal.toLocaleString('pt-BR', { minimumFractionDigits: 0 })} esta semana
              </div>
            </div>
          </div>
          <div className={s.chartArea}>
            {weekData.map((d, i) => (
              <div key={i} className={s.barGroup} onClick={() => setActiveDay(i)}>
                <div className={s.barWrap}>
                  <div
                    className={`${s.bar} ${i === activeDay ? s.barActive : ''}`}
                    style={{ height: `${d.pct || 0}%` }}
                  />
                </div>
                <span className={`${s.barLabel} ${i === activeDay ? s.barLabelActive : ''}`}>
                  {d.day}
                </span>
                {i === activeDay && (
                  <div className={s.barTooltip}>R$ {d.value.toLocaleString('pt-BR')}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className={s.glassCard} style={{ animationDelay:'0.15s' }}>
          <div className={s.cardHead}>
            <span className={s.cardTitle}>Ações rápidas</span>
            <Zap size={15} style={{ color:'#f59e0b' }}/>
          </div>
          <div className={s.quickGrid}>
            {QUICK_ACTIONS.map((qa, i) => {
              const QIcon = qa.icon;
              return (
                <button key={i} className={s.quickBtn}
                        style={{ '--qa-color': qa.color }}>
                  <div className={s.quickIconWrap}>
                    <QIcon size={20} style={{ color: qa.color }}/>
                  </div>
                  <span className={s.quickLabel}>{qa.label}</span>
                </button>
              );
            })}
          </div>

          {/* Stock alerts mini */}
          <div className={s.alertBox}>
            <div className={s.alertHead}>
              <Package size={13} style={{ color:'#f59e0b' }}/>
              <span>Alertas de estoque</span>
            </div>
            {alerts.length === 0 ? (
              <div className={s.alertEmpty}>Nenhum alerta no momento</div>
            ) : alerts.map((al, i) => (
              <div key={i} className={s.alertRow}>
                <span className={s.alertName}>{al.name}</span>
                <span className={`${s.alertQty} ${al.qty < al.min ? s.alertLow : ''}`}>
                  {al.qty}/{al.min}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom grid ── */}
      <div className={s.bottomGrid}>

        {/* ── Agenda ── */}
        <div className={s.glassCard} style={{ animationDelay:'0.2s' }}>
          <div className={s.cardHead}>
            <span className={s.cardTitle}>Agenda de hoje</span>
            <button className={s.viewAllBtn}>Ver tudo <ChevronRight size={13}/></button>
          </div>
          <div className={s.apptList}>
            {appointments.length === 0 ? (
              <div className={s.emptyList}>
                <Calendar size={24} style={{ opacity: 0.3 }}/>
                <span>Nenhum agendamento hoje</span>
              </div>
            ) : appointments.map((ap, i) => {
              const cfg = STATUS_CFG[ap.status] || STATUS_CFG.scheduled;
              return (
                <div key={i} className={s.apptRow}>
                  <div className={s.apptTime}>{ap.time}</div>
                  <div className={s.apptAccent} style={{ background: ap.color }}/>
                  <div className={s.apptInfo}>
                    <div className={s.apptClient}>{ap.client}</div>
                    <div className={s.apptService}>{ap.service}{ap.prof ? ` · ${ap.prof}` : ''}</div>
                  </div>
                  <span className={`${s.apptStatus} ${s[cfg.cls]}`}>{cfg.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Top professionals ── */}
        <div className={s.glassCard} style={{ animationDelay:'0.25s' }}>
          <div className={s.cardHead}>
            <span className={s.cardTitle}>Top profissionais</span>
            <Star size={15} style={{ color:'#f59e0b', fill:'#f59e0b' }}/>
          </div>
          <div className={s.profList}>
            {professionals.length === 0 ? (
              <div className={s.emptyList}>
                <Users size={24} style={{ opacity: 0.3 }}/>
                <span>Nenhum profissional cadastrado</span>
              </div>
            ) : professionals.map((p, i) => {
              const maxRevenue = Math.max(...professionals.map(x => x.revenue), 1);
              const pct = Math.round(p.revenue / maxRevenue * 100);
              return (
                <div key={i} className={s.profRow}>
                  <div className={s.profRank}>{i + 1}</div>
                  <div className={s.profAvatar} style={{ background: p.color }}>
                    {p.initials}
                  </div>
                  <div className={s.profInfo}>
                    <div className={s.profName}>{p.name}</div>
                    <div className={s.profBar}>
                      <div className={s.profBarFill} style={{ width:`${pct}%`, background: p.color }}/>
                    </div>
                  </div>
                  <div className={s.profStats}>
                    <div className={s.profRevenue}>R$ {p.revenue.toLocaleString('pt-BR')}</div>
                    <div className={s.profRating}>
                      <Star size={10} style={{ fill:'#f59e0b', color:'#f59e0b' }}/>
                      {p.rating.toFixed(1)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
