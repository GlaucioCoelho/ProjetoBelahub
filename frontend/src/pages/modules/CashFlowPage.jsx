import React, { useState, useEffect, useCallback } from 'react';
import BasePage from './BasePage';
import s from './shared.module.css';
import { TrendingUp, Plus, ArrowUpRight, ArrowDownRight, X, Trash2 } from 'lucide-react';
import transacaoService, { CATEGORIES_COLOR } from '../../services/transacaoService';

const CATEGORIES = ['Serviços','Produtos','Remuneração','Infraestrutura','Suprimentos','Outros'];

const EMPTY_FORM = {
  desc: '', category: 'Serviços', type: 'in',
  value: '', dateISO: new Date().toISOString().substring(0, 10), status: 'confirmed',
};

export default function CashFlowPage() {
  const [period, setPeriod]     = useState('week');
  const [typeFilter, setTypeFilter] = useState('all');
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const load = useCallback(() => {
    setLoading(true);
    transacaoService.listar({ period })
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [period]);

  useEffect(() => { load(); }, [load]);

  const rows     = items.filter(r => typeFilter === 'all' || r.type === typeFilter);
  const totalIn  = items.filter(r => r.type === 'in').reduce((a, r) => a + r.value, 0);
  const totalOut = items.filter(r => r.type === 'out').reduce((a, r) => a + r.value, 0);
  const balance  = totalIn - totalOut;

  function openNew() {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM, dateISO: new Date().toISOString().substring(0, 10) });
    setError('');
    setShowModal(true);
  }

  function openEdit(r) {
    setEditTarget(r.id);
    setForm({ desc: r.desc, category: r.category, type: r.type, value: r.value, dateISO: r.dateISO, status: r.status, tipoRaw: r.tipoRaw });
    setError('');
    setShowModal(true);
  }

  async function save() {
    if (!form.desc.trim())  return setError('Informe a descrição.');
    if (!form.value)        return setError('Informe o valor.');
    setSaving(true); setError('');
    try {
      if (editTarget) await transacaoService.atualizar(editTarget, form);
      else             await transacaoService.criar(form);
      setShowModal(false);
      load();
    } catch (e) {
      setError(e?.response?.data?.error || 'Erro ao salvar.');
    } finally { setSaving(false); }
  }

  async function deletar(id) {
    if (!window.confirm('Excluir este lançamento?')) return;
    await transacaoService.deletar(id).catch(() => {});
    load();
  }

  const f = (v) => v.toLocaleString('pt-BR');

  return (
    <BasePage title="Fluxo de Caixa" description="Entradas, saídas e saldo do período" icon={TrendingUp}>
      <div className={s.page}>
        <div className={s.statsStrip}>
          <div className={s.statBox}>
            <span className={s.statLabel}>Entradas</span>
            <span className={s.statValue} style={{color:'#30d158'}}>R$ {f(totalIn)}</span>
          </div>
          <div className={s.statBox}>
            <span className={s.statLabel}>Saídas</span>
            <span className={s.statValue} style={{color:'#e8185a'}}>R$ {f(totalOut)}</span>
          </div>
          <div className={s.statBox}>
            <span className={s.statLabel}>Saldo</span>
            <span className={s.statValue} style={{color: balance >= 0 ? '#30d158' : '#e8185a'}}>
              R$ {f(balance)}
            </span>
          </div>
          <div className={s.statBox}>
            <span className={s.statLabel}>Transações</span>
            <span className={s.statValue}>{items.length}</span>
          </div>
        </div>

        <div className={s.card}>
          <div className={s.cardHeader}>
            <span className={s.cardTitle}>Lançamentos</span>
            <div className={s.toolbarRight}>
              <select className={s.select} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                <option value="all">Todos</option>
                <option value="in">Entradas</option>
                <option value="out">Saídas</option>
              </select>
              <select className={s.select} value={period} onChange={e => setPeriod(e.target.value)}>
                <option value="week">Esta semana</option>
                <option value="month">Este mês</option>
              </select>
              <button className={s.btnPrimary} onClick={openNew}><Plus size={15}/> Lançamento</button>
            </div>
          </div>

          {loading ? (
            <div className={s.emptyState}><p>Carregando...</p></div>
          ) : rows.length === 0 ? (
            <div className={s.emptyState}>
              <TrendingUp size={40} style={{opacity:0.3, marginBottom:8}}/>
              <p>Nenhum lançamento no período.</p>
            </div>
          ) : (
            <table className={s.table}>
              <thead>
                <tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Tipo</th><th>Valor</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id}>
                    <td style={{color:'#86868b',whiteSpace:'nowrap'}}>{r.date}</td>
                    <td style={{fontWeight:500}}>{r.desc}</td>
                    <td>
                      <span style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:13,color:CATEGORIES_COLOR[r.category]||'#86868b',fontWeight:500}}>
                        <span style={{width:6,height:6,borderRadius:'50%',background:CATEGORIES_COLOR[r.category]||'#86868b',display:'inline-block'}}/>
                        {r.category}
                      </span>
                    </td>
                    <td>
                      <span style={{display:'flex',alignItems:'center',gap:4,color:r.type==='in'?'#30d158':'#e8185a',fontWeight:500,fontSize:13}}>
                        {r.type === 'in' ? <ArrowUpRight size={15}/> : <ArrowDownRight size={15}/>}
                        {r.type === 'in' ? 'Entrada' : 'Saída'}
                      </span>
                    </td>
                    <td>
                      <span className={r.type === 'in' ? s.amountPos : s.amountNeg}>
                        {r.type === 'in' ? '+' : '-'} R$ {f(r.value)}
                      </span>
                    </td>
                    <td>
                      <span className={`${s.badge} ${r.status === 'confirmed' ? s.badgeGreen : s.badgeYellow}`}>
                        {r.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                      </span>
                    </td>
                    <td>
                      <div className={s.actionBtns}>
                        <button className={s.btnIconSm} onClick={() => openEdit(r)} title="Editar">✏️</button>
                        <button className={s.btnIconSm} onClick={() => deletar(r.id)} title="Excluir" style={{color:'#ff3b30'}}><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className={s.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={s.modal} onClick={e => e.stopPropagation()} style={{maxWidth:480}}>
            <div className={s.modalHeader}>
              <h3 className={s.modalTitle}>{editTarget ? 'Editar lançamento' : 'Novo lançamento'}</h3>
              <button className={s.modalClose} onClick={() => setShowModal(false)}><X size={18}/></button>
            </div>
            <div style={{padding:'16px 24px 0'}}>
              <div className={s.formGroup} style={{marginBottom:12}}>
                <label className={s.label}>Descrição *</label>
                <input className={s.inputBase} value={form.desc} onChange={e => setForm(f => ({...f,desc:e.target.value}))} placeholder="Ex: Atendimentos do dia" style={{width:'100%',boxSizing:'border-box'}}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                <div className={s.formGroup}>
                  <label className={s.label}>Tipo</label>
                  <select className={s.select} value={form.type} onChange={e => setForm(f => ({...f,type:e.target.value}))} style={{width:'100%'}}>
                    <option value="in">Entrada</option>
                    <option value="out">Saída</option>
                  </select>
                </div>
                <div className={s.formGroup}>
                  <label className={s.label}>Valor (R$) *</label>
                  <input className={s.inputBase} type="number" min={0} value={form.value} onChange={e => setForm(f => ({...f,value:e.target.value}))} placeholder="0,00" style={{width:'100%',boxSizing:'border-box'}}/>
                </div>
                <div className={s.formGroup}>
                  <label className={s.label}>Categoria</label>
                  <select className={s.select} value={form.category} onChange={e => setForm(f => ({...f,category:e.target.value}))} style={{width:'100%'}}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className={s.formGroup}>
                  <label className={s.label}>Status</label>
                  <select className={s.select} value={form.status} onChange={e => setForm(f => ({...f,status:e.target.value}))} style={{width:'100%'}}>
                    <option value="confirmed">Confirmado</option>
                    <option value="pending">Pendente</option>
                  </select>
                </div>
              </div>
              <div className={s.formGroup} style={{marginBottom:12}}>
                <label className={s.label}>Data</label>
                <input className={s.inputBase} type="date" value={form.dateISO} onChange={e => setForm(f => ({...f,dateISO:e.target.value}))} style={{width:'100%',boxSizing:'border-box'}}/>
              </div>
              {error && <p style={{color:'#ff3b30',fontSize:13,marginBottom:8}}>{error}</p>}
            </div>
            <div className={s.modalFooter}>
              <button className={s.btnSecondary} onClick={() => setShowModal(false)}>Cancelar</button>
              <button className={s.btnPrimary} onClick={save} disabled={saving}>{saving?'Salvando...':editTarget?'Salvar':'Criar'}</button>
            </div>
          </div>
        </div>
      )}
    </BasePage>
  );
}
