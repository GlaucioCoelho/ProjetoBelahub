import React, { useState, useEffect } from 'react';
import BasePage from './BasePage';
import s from './shared.module.css';
import { Receipt, Plus, Search, X, Trash2, Edit2, Calendar, Tag, CreditCard, RefreshCw } from 'lucide-react';
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
const PAYMENT_OPTS   = ['Dinheiro', 'Cartão', 'Pix', 'Transferência', 'Boleto'];

const EMPTY_FORM = {
  desc: '', category: 'Infraestrutura', value: 0,
  payment: 'Pix', status: 'pending', recurrent: false,
  date: new Date().toISOString().substring(0, 10),
};

export default function ExpensesPage() {
  const [expenses,      setExpenses]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState('');
  const [category,      setCategory]      = useState('Todas');
  const [period,        setPeriod]        = useState('month');
  const [modalOpen,     setModalOpen]     = useState(false);
  const [editingExpense,setEditingExpense] = useState(null);
  const [form,          setForm]          = useState(EMPTY_FORM);
  const [deleteTarget,  setDeleteTarget]  = useState(null);

  useEffect(() => {
    setLoading(true);
    despesaService.listar({ busca: search, categoria: category, periodo: period })
      .then(setExpenses)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, category, period]);

  const totalAll     = expenses.reduce((a, r) => a + r.value, 0);
  const totalPaid    = expenses.filter(r => r.status === 'paid').reduce((a, r) => a + r.value, 0);
  const totalPending = expenses.filter(r => r.status === 'pending').reduce((a, r) => a + r.value, 0);
  const categories   = new Set(expenses.map(r => r.category)).size;

  function openNew() {
    setEditingExpense(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(exp) {
    setEditingExpense(exp);
    setForm({
      desc: exp.desc, category: exp.category, value: exp.value,
      payment: exp.payment, status: exp.status, recurrent: exp.recurrent,
      date: exp.date || EMPTY_FORM.date,
    });
    setModalOpen(true);
  }

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
    } catch (err) { console.error(err); }
    setDeleteTarget(null);
  };

  const setF = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <BasePage title="Despesas" description="Controle de despesas e custos operacionais" icon={Receipt}>
      <div className={s.page}>

        {/* ── Stats ── */}
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

        {/* ── Category cards ── */}
        {totalAll > 0 && (
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:10}}>
            {Object.entries(CATEGORY_COLOR).map(([cat, color]) => {
              const total = expenses.filter(r => r.category === cat).reduce((a, r) => a + r.value, 0);
              if (!total) return null;
              const pct = Math.round(total / totalAll * 100);
              return (
                <div key={cat} className={s.card} style={{padding:14}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
                    <span style={{fontSize:12, fontWeight:600, color:'#3a3a3c'}}>{cat}</span>
                    <span style={{fontSize:11, color:'#86868b'}}>{pct}%</span>
                  </div>
                  <div style={{fontSize:16, fontWeight:700, marginBottom:8}}>R$ {total.toLocaleString('pt-BR')}</div>
                  <div className={s.progressBar}>
                    <div className={s.progressFill} style={{width:`${pct}%`, background:color}}/>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Expenses list ── */}
        <div className={s.card}>

          {/* Header — desktop */}
          <div className={s.cardHeader} style={{flexWrap:'wrap', gap:10}}>
            <span className={s.cardTitle}>Lançamentos</span>
            <div style={{display:'flex', gap:8, flex:1, flexWrap:'wrap', justifyContent:'flex-end'}}>
              <div className={s.searchWrap}>
                <Search size={14}/>
                <input className={`${s.inputBase} ${s.searchInput}`}
                  placeholder="Buscar despesa..."
                  value={search} onChange={e => setSearch(e.target.value)}/>
              </div>
              <select className={s.select} value={category} onChange={e => setCategory(e.target.value)}>
                {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className={s.select} value={period} onChange={e => setPeriod(e.target.value)}>
                <option value="week">Esta semana</option>
                <option value="month">Este mês</option>
                <option value="quarter">Trimestre</option>
              </select>
              <button className={s.btnPrimary} onClick={openNew}><Plus size={15}/> Nova despesa</button>
            </div>
          </div>

          {/* ── Mobile cards ── */}
          <div className="expMobileList">
            {loading ? (
              <p style={{textAlign:'center', padding:'32px 0', color:'var(--text-tertiary)', fontSize:14}}>Carregando...</p>
            ) : expenses.length === 0 ? (
              <div className={s.emptyState}>
                <Receipt size={36} style={{opacity:0.25, marginBottom:6}}/>
                <p>Nenhuma despesa encontrada</p>
              </div>
            ) : expenses.map(r => (
              <div key={r.id} style={{
                borderBottom: '1px solid rgba(124,58,237,0.06)',
                padding: '14px 16px',
                display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700, fontSize:14, color:'var(--text-primary)', marginBottom:2}}>{r.desc}</div>
                    <div style={{display:'flex', alignItems:'center', gap:6, flexWrap:'wrap'}}>
                      <span style={{
                        display:'inline-flex', alignItems:'center', gap:4,
                        fontSize:12, fontWeight:600, color: CATEGORY_COLOR[r.category]||'#86868b'
                      }}>
                        <span style={{width:6,height:6,borderRadius:'50%',background:CATEGORY_COLOR[r.category]||'#86868b',display:'inline-block'}}/>
                        {r.category}
                      </span>
                      <span style={{fontSize:12, color:'var(--text-tertiary)'}}>·</span>
                      <span style={{fontSize:12, color:'var(--text-tertiary)'}}>{r.date}</span>
                    </div>
                  </div>
                  <span className={s.amountNeg} style={{fontSize:15, flexShrink:0}}>
                    - R$ {r.value.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
                  <span className={`${s.badge} ${r.status === 'paid' ? s.badgeGreen : s.badgeYellow}`}>
                    {r.status === 'paid' ? 'Paga' : 'Pendente'}
                  </span>
                  {r.recurrent && <span className={`${s.badge} ${s.badgeBlue}`}>Recorrente</span>}
                  <span style={{fontSize:12, color:'var(--text-tertiary)', marginLeft:'auto'}}>{r.payment}</span>
                  <button className={s.btnIconSm} onClick={() => openEdit(r)} title="Editar"><Edit2 size={13}/></button>
                  <button className={s.btnIconSm} onClick={() => setDeleteTarget(r)} title="Excluir" style={{color:'#dc2626'}}><Trash2 size={13}/></button>
                </div>
              </div>
            ))}
          </div>

          {/* ── Desktop table ── */}
          <div className="expDesktopTable">
            <table className={s.table}>
              <thead>
                <tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Pagamento</th><th>Valor</th><th>Recorrente</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{textAlign:'center', padding:48, color:'#86868b'}}>Carregando...</td></tr>
                ) : expenses.length === 0 ? (
                  <tr><td colSpan={8} style={{textAlign:'center', padding:48, color:'#86868b'}}>Nenhuma despesa encontrada</td></tr>
                ) : expenses.map(r => (
                  <tr key={r.id}>
                    <td style={{color:'#86868b', whiteSpace:'nowrap'}}>{r.date}</td>
                    <td style={{fontWeight:500}}>{r.desc}</td>
                    <td>
                      <span style={{display:'inline-flex', alignItems:'center', gap:5, fontSize:13, color: CATEGORY_COLOR[r.category]||'#86868b', fontWeight:500}}>
                        <span style={{width:6,height:6,borderRadius:'50%',background:CATEGORY_COLOR[r.category]||'#86868b',display:'inline-block'}}/>
                        {r.category}
                      </span>
                    </td>
                    <td style={{color:'#86868b', fontSize:13}}>{r.payment}</td>
                    <td><span className={s.amountNeg}>- R$ {r.value.toLocaleString('pt-BR')}</span></td>
                    <td>
                      {r.recurrent
                        ? <span className={`${s.badge} ${s.badgeBlue}`}>Recorrente</span>
                        : <span className={`${s.badge} ${s.badgeGray}`}>Avulsa</span>}
                    </td>
                    <td>
                      <span className={`${s.badge} ${r.status === 'paid' ? s.badgeGreen : s.badgeYellow}`}>
                        {r.status === 'paid' ? 'Paga' : 'Pendente'}
                      </span>
                    </td>
                    <td>
                      <div className={s.actionBtns}>
                        <button className={s.btnIconSm} onClick={() => openEdit(r)} title="Editar">✏️</button>
                        <button className={s.btnIconSm} onClick={() => setDeleteTarget(r)} title="Excluir" style={{color:'#dc2626'}}><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Modal nova/editar despesa ── */}
      {modalOpen && (
        <div className={s.modalOverlay} onClick={() => setModalOpen(false)}>
          <div className={s.modal} onClick={e => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h3 className={s.modalTitle}>{editingExpense ? 'Editar despesa' : 'Nova despesa'}</h3>
              <button className={s.modalClose} onClick={() => setModalOpen(false)}><X size={18}/></button>
            </div>
            <div className={s.formGrid}>
              <div className={s.formGroup} style={{gridColumn:'1/-1'}}>
                <label className={s.label}>Descrição *</label>
                <input className={s.inputBase} style={{width:'100%',boxSizing:'border-box'}}
                  placeholder="Ex: Aluguel do espaço"
                  value={form.desc} onChange={e => setF('desc', e.target.value)}/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}><Tag size={11}/> Categoria</label>
                <select className={s.select} style={{width:'100%'}} value={form.category} onChange={e => setF('category', e.target.value)}>
                  {Object.keys(CATEGORY_COLOR).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}><CreditCard size={11}/> Pagamento</label>
                <select className={s.select} style={{width:'100%'}} value={form.payment} onChange={e => setF('payment', e.target.value)}>
                  {PAYMENT_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Valor (R$) *</label>
                <input className={s.inputBase} style={{width:'100%',boxSizing:'border-box'}}
                  type="number" min={0} step="0.01" placeholder="0,00"
                  value={form.value} onChange={e => setF('value', parseFloat(e.target.value) || 0)}/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}><Calendar size={11}/> Data</label>
                <input className={s.inputBase} style={{width:'100%',boxSizing:'border-box'}}
                  type="date" value={form.date} onChange={e => setF('date', e.target.value)}/>
              </div>
              <div className={s.formGroup}>
                <label className={s.label}>Status</label>
                <select className={s.select} style={{width:'100%'}} value={form.status} onChange={e => setF('status', e.target.value)}>
                  <option value="pending">Pendente</option>
                  <option value="paid">Paga</option>
                </select>
              </div>
              <div className={s.formGroup} style={{gridColumn:'1/-1'}}>
                <label className={s.label} style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}>
                  <input type="checkbox" checked={form.recurrent} onChange={e => setF('recurrent', e.target.checked)}/>
                  <RefreshCw size={11}/> Despesa recorrente (mensal)
                </label>
              </div>
            </div>
            <div className={s.modalFooter}>
              <button className={s.btnGhost} onClick={() => setModalOpen(false)}>Cancelar</button>
              <button className={s.btnPrimary} onClick={handleSave}>
                {editingExpense ? 'Salvar' : 'Criar despesa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm delete ── */}
      {deleteTarget && (
        <div className={s.modalOverlay} onClick={() => setDeleteTarget(null)}>
          <div className={s.modal} style={{maxWidth:360, padding:32, textAlign:'center'}} onClick={e => e.stopPropagation()}>
            <Trash2 size={32} style={{color:'#dc2626', marginBottom:12}}/>
            <h3 style={{fontSize:17, fontWeight:800, marginBottom:8}}>Excluir despesa?</h3>
            <p style={{fontSize:13, color:'var(--text-secondary)', marginBottom:20}}>
              "{deleteTarget.desc}" será removida permanentemente.
            </p>
            <div style={{display:'flex', gap:10, justifyContent:'center'}}>
              <button className={s.btnGhost} onClick={() => setDeleteTarget(null)}>Cancelar</button>
              <button className={s.btnPrimary} style={{background:'#dc2626'}} onClick={handleDelete}>Excluir</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .expMobileList  { display: none; }
        .expDesktopTable { display: block; }
        @media (max-width: 640px) {
          .expMobileList   { display: block; }
          .expDesktopTable { display: none; }
        }
      `}</style>
    </BasePage>
  );
}
