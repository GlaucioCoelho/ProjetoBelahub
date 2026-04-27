import React, { useState, useEffect } from 'react';
import BasePage from './BasePage';
import s from './shared.module.css';
import { Receipt, Plus, Search } from 'lucide-react';
import despesaService from '../../services/despesaService';

const CATEGORY_COLOR = {
  'Infraestrutura': '#f59e0b',
  'Produtos':       '#0ea5e9',
  'Remuneração':    '#a855f7',
  'Suprimentos':    '#86868b',
  'Software':       '#30d158',
  'Manutenção':     '#e8185a',
};

const ALL_CATEGORIES = ['Todas', ...Object.keys(CATEGORY_COLOR)];

export default function ExpensesPage() {
  const [expenses,  setExpenses]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [category,  setCategory]  = useState('Todas');
  const [period,    setPeriod]    = useState('month');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [form,      setForm]      = useState({ desc: '', category: 'Infraestrutura', value: 0, payment: '', status: 'pending', recurrent: false, date: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    setLoading(true);
    despesaService.listar({ busca: search, categoria: category, periodo: period })
      .then(setExpenses)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, category, period]);

  const rows = expenses;

  const totalAll     = expenses.reduce((a, r) => a + r.value, 0);
  const totalPaid    = expenses.filter(r => r.status === 'paid').reduce((a, r) => a + r.value, 0);
  const totalPending = expenses.filter(r => r.status === 'pending').reduce((a, r) => a + r.value, 0);
  const categories   = new Set(expenses.map(r => r.category)).size;

  const handleSave = async () => {
    try {
      if (editingExpense) {
        const saved = await despesaService.atualizar(editingExpense.id, form);
        setExpenses(prev => prev.map(e => e.id === saved.id ? saved : e));
      } else {
        const saved = await despesaService.criar(form);
        setExpenses(prev => [saved, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }
    setModalOpen(false);
    setEditingExpense(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await despesaService.deletar(deleteTarget.id);
      setExpenses(prev => prev.filter(e => e.id !== deleteTarget.id));
    } catch (err) {
      console.error(err);
    }
    setDeleteTarget(null);
  };

  return (
    <BasePage title="Despesas" description="Controle de despesas e custos operacionais" icon={Receipt}>
      <div className={s.page}>
        <div className={s.statsStrip}>
          <div className={s.statBox}>
            <span className={s.statLabel}>Total do período</span>
            <span className={s.statValue}>R$ {totalAll.toLocaleString('pt-BR')}</span>
          </div>
          <div className={s.statBox}>
            <span className={s.statLabel}>Pagas</span>
            <span className={s.statValue} style={{color:'#30d158'}}>R$ {totalPaid.toLocaleString('pt-BR')}</span>
          </div>
          <div className={s.statBox}>
            <span className={s.statLabel}>Pendentes</span>
            <span className={s.statValue} style={{color:'#f59e0b'}}>R$ {totalPending.toLocaleString('pt-BR')}</span>
          </div>
          <div className={s.statBox}>
            <span className={s.statLabel}>Categorias</span>
            <span className={s.statValue}>{categories}</span>
          </div>
        </div>

        {/* Category summary cards */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12}}>
          {Object.entries(CATEGORY_COLOR).map(([cat, color]) => {
            const total = expenses.filter(r => r.category === cat).reduce((a, r) => a + r.value, 0);
            if (!total) return null;
            const pct = Math.round(total / totalAll * 100);
            return (
              <div key={cat} className={s.card} style={{padding:14}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10}}>
                  <span style={{fontSize:12, fontWeight:600, color:'#3a3a3c'}}>{cat}</span>
                  <span style={{fontSize:11, color:'#86868b'}}>{pct}%</span>
                </div>
                <div style={{fontSize:18, fontWeight:700, marginBottom:8}}>R$ {total.toLocaleString('pt-BR')}</div>
                <div className={s.progressBar}>
                  <div className={s.progressFill} style={{width:`${pct}%`, background:color}}/>
                </div>
              </div>
            );
          })}
        </div>

        {/* Expenses table */}
        <div className={s.card}>
          <div className={s.cardHeader}>
            <span className={s.cardTitle}>Lançamentos</span>
            <div className={s.toolbarRight}>
              <div className={s.searchWrap}>
                <Search size={14}/>
                <input
                  className={`${s.inputBase} ${s.searchInput}`}
                  placeholder="Buscar despesa..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <select className={s.select} value={category} onChange={e => setCategory(e.target.value)}>
                {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className={s.select} value={period} onChange={e => setPeriod(e.target.value)}>
                <option value="week">Esta semana</option>
                <option value="month">Este mês</option>
                <option value="quarter">Trimestre</option>
              </select>
              <button className={s.btnPrimary}><Plus size={15}/> Nova despesa</button>
            </div>
          </div>
          <table className={s.table}>
            <thead>
              <tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Pagamento</th><th>Valor</th><th>Recorrente</th><th>Status</th></tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={7} style={{textAlign:'center', padding:48, color:'#86868b'}}>Nenhuma despesa encontrada</td></tr>
              ) : rows.map(r => (
                <tr key={r.id}>
                  <td style={{color:'#86868b', whiteSpace:'nowrap'}}>{r.date}</td>
                  <td style={{fontWeight:500}}>{r.desc}</td>
                  <td>
                    <span style={{
                      display:'inline-flex', alignItems:'center', gap:5,
                      fontSize:13, color: CATEGORY_COLOR[r.category]||'#86868b', fontWeight:500
                    }}>
                      <span style={{width:6, height:6, borderRadius:'50%', background: CATEGORY_COLOR[r.category]||'#86868b', display:'inline-block'}}/>
                      {r.category}
                    </span>
                  </td>
                  <td style={{color:'#86868b', fontSize:13}}>{r.payment}</td>
                  <td><span className={s.amountNeg}>- R$ {r.value.toLocaleString('pt-BR')}</span></td>
                  <td>
                    {r.recurrent
                      ? <span className={`${s.badge} ${s.badgeBlue}`}>Recorrente</span>
                      : <span className={`${s.badge} ${s.badgeGray}`}>Avulsa</span>
                    }
                  </td>
                  <td>
                    <span className={`${s.badge} ${r.status === 'paid' ? s.badgeGreen : s.badgeYellow}`}>
                      {r.status === 'paid' ? 'Paga' : 'Pendente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </BasePage>
  );
}
