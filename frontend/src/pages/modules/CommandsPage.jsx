import React, { useState, useEffect, useCallback } from 'react';
import BasePage from './BasePage';
import s from './shared.module.css';
import { Receipt, Plus, ChevronDown, ChevronRight, X, Trash2 } from 'lucide-react';
import comandaService from '../../services/comandaService';

const PROF_COLORS = ['#e8185a','#7c3aed','#0ea5e9','#f59e0b','#10b981','#ef4444'];
function profColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return PROF_COLORS[Math.abs(h) % PROF_COLORS.length];
}
function initials(name) { return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(); }

const EMPTY_FORM = { client: '', professional: '', opened: '', items: [], observacoes: '' };
const EMPTY_ITEM = { name: '', qty: 1, price: '' };

export default function CommandsPage() {
  const [comandas,     setComandas]     = useState([]);
  const [fechadasHoje, setFechadasHoje] = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [expanded,     setExpanded]     = useState(null);
  const [filter,       setFilter]       = useState('all');
  const [showModal,    setShowModal]    = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [newItem,      setNewItem]      = useState(EMPTY_ITEM);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState('');

  const load = useCallback(() => {
    setLoading(true);
    comandaService.listar()
      .then(({ comandas: list, fechadasHoje: fh }) => {
        setComandas(list);
        setFechadasHoje(fh);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const rows      = comandas.filter(r => filter === 'all' || r.status === (filter === 'open' ? 'open' : 'closed'));
  const open      = comandas.filter(r => r.status === 'open').length;
  const totalOpen = comandas.filter(r => r.status === 'open').reduce((a, r) => a + r.total, 0);

  function openNew() {
    setEditTarget(null);
    const now = new Date().toTimeString().substring(0, 5);
    setForm({ ...EMPTY_FORM, opened: now });
    setNewItem(EMPTY_ITEM);
    setError('');
    setShowModal(true);
  }

  function openEdit(e, c) {
    e.stopPropagation();
    setEditTarget(c.id);
    setForm({ client: c.client, professional: c.professional, opened: c.opened, items: [...c.items], observacoes: c.observacoes });
    setNewItem(EMPTY_ITEM);
    setError('');
    setShowModal(true);
  }

  function addItem() {
    if (!newItem.name.trim() || !newItem.price) return;
    setForm(f => ({ ...f, items: [...f.items, { name: newItem.name.trim(), qty: Number(newItem.qty) || 1, price: Number(newItem.price) }] }));
    setNewItem(EMPTY_ITEM);
  }

  function removeItem(i) { setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) })); }

  async function save() {
    if (!form.client.trim())       return setError('Informe o nome do cliente.');
    if (!form.professional.trim()) return setError('Informe o profissional.');
    setSaving(true); setError('');
    try {
      if (editTarget) await comandaService.atualizar(editTarget, form);
      else             await comandaService.criar(form);
      setShowModal(false);
      load();
    } catch (e) {
      setError(e?.response?.data?.mensagem || 'Erro ao salvar.');
    } finally { setSaving(false); }
  }

  async function fechar(e, id) {
    e.stopPropagation();
    await comandaService.fechar(id).catch(() => {});
    load();
  }

  async function deletar(e, id) {
    e.stopPropagation();
    if (!window.confirm('Excluir esta comanda?')) return;
    await comandaService.deletar(id).catch(() => {});
    load();
  }

  return (
    <BasePage title="Comandas" description="Controle de comandas abertas e fechadas" icon={Receipt}>
      <div className={s.page}>
        <div className={s.statsStrip}>
          <div className={s.statBox}>
            <span className={s.statLabel}>Abertas</span>
            <span className={s.statValue} style={{color:'#0ea5e9'}}>{open}</span>
          </div>
          <div className={s.statBox}>
            <span className={s.statLabel}>Fechadas hoje</span>
            <span className={s.statValue} style={{color:'#30d158'}}>{fechadasHoje}</span>
          </div>
          <div className={s.statBox}>
            <span className={s.statLabel}>Valor em aberto</span>
            <span className={s.statValue}>R$ {totalOpen.toLocaleString('pt-BR')}</span>
          </div>
          <div className={s.statBox}>
            <span className={s.statLabel}>Total comandas</span>
            <span className={s.statValue}>{comandas.length}</span>
          </div>
        </div>

        <div className={s.card}>
          <div className={s.cardHeader}>
            <span className={s.cardTitle}>Comandas</span>
            <div className={s.toolbarRight}>
              <select className={s.select} value={filter} onChange={e => setFilter(e.target.value)}>
                <option value="all">Todas</option>
                <option value="open">Abertas</option>
                <option value="closed">Fechadas</option>
              </select>
              <button className={s.btnPrimary} onClick={openNew}><Plus size={15}/> Nova comanda</button>
            </div>
          </div>

          {loading ? (
            <div className={s.emptyState}><p>Carregando...</p></div>
          ) : rows.length === 0 ? (
            <div className={s.emptyState}>
              <Receipt size={40} style={{opacity:0.3, marginBottom:8}}/>
              <p>Nenhuma comanda encontrada.</p>
            </div>
          ) : (
            <table className={s.table}>
              <thead>
                <tr><th></th><th>Comanda</th><th>Cliente</th><th>Profissional</th><th>Aberta às</th><th>Itens</th><th>Total</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {rows.map(r => {
                  const isExp = expanded === r.id;
                  return (
                    <React.Fragment key={r.id}>
                      <tr style={{cursor:'pointer'}} onClick={() => setExpanded(isExp ? null : r.id)}>
                        <td style={{width:32, color:'#86868b'}}>
                          {isExp ? <ChevronDown size={15}/> : <ChevronRight size={15}/>}
                        </td>
                        <td style={{fontWeight:700, color:'#e8185a'}}>#{r.numero}</td>
                        <td style={{fontWeight:500}}>{r.client}</td>
                        <td>
                          <div className={s.avatarRow}>
                            <div className={s.avatar} style={{background: profColor(r.professional)}}>
                              {initials(r.professional)}
                            </div>
                            {r.professional}
                          </div>
                        </td>
                        <td style={{color:'#86868b'}}>{r.opened}</td>
                        <td style={{color:'#86868b'}}>{r.items.length} item(s)</td>
                        <td style={{fontWeight:600}}>R$ {r.total.toLocaleString('pt-BR')}</td>
                        <td>
                          <span className={`${s.badge} ${r.status === 'open' ? s.badgeBlue : s.badgeGreen}`}>
                            {r.status === 'open' ? 'Aberta' : 'Fechada'}
                          </span>
                        </td>
                        <td onClick={e => e.stopPropagation()}>
                          <div className={s.actionBtns}>
                            <button className={s.btnIconSm} onClick={e => openEdit(e, r)} title="Editar">✏️</button>
                            {r.status === 'open' && (
                              <button className={s.btnIconSm} onClick={e => fechar(e, r.id)} title="Fechar comanda" style={{color:'#30d158'}}>✓</button>
                            )}
                            <button className={s.btnIconSm} onClick={e => deletar(e, r.id)} title="Excluir" style={{color:'#ff3b30'}}><Trash2 size={13}/></button>
                          </div>
                        </td>
                      </tr>
                      {isExp && r.items.length > 0 && (
                        <tr>
                          <td colSpan={9} style={{padding:0, background:'#fafafa'}}>
                            <table style={{width:'100%', borderCollapse:'collapse'}}>
                              <thead>
                                <tr>
                                  {['Item','Qtd','Preço unit.','Subtotal'].map(h => (
                                    <th key={h} style={{padding:'8px 20px', fontSize:11, color:'#86868b', textAlign:'left', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid #f2f2f5'}}>
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {r.items.map((item, i) => (
                                  <tr key={i}>
                                    <td style={{padding:'8px 20px', fontSize:13}}>{item.name}</td>
                                    <td style={{padding:'8px 20px', fontSize:13, color:'#86868b'}}>{item.qty}x</td>
                                    <td style={{padding:'8px 20px', fontSize:13, color:'#86868b'}}>R$ {item.price.toLocaleString('pt-BR')}</td>
                                    <td style={{padding:'8px 20px', fontSize:13, fontWeight:600}}>R$ {(item.qty * item.price).toLocaleString('pt-BR')}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className={s.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={s.modal} onClick={e => e.stopPropagation()} style={{maxWidth:560}}>
            <div className={s.modalHeader}>
              <h3 className={s.modalTitle}>{editTarget ? 'Editar comanda' : 'Nova comanda'}</h3>
              <button className={s.modalClose} onClick={() => setShowModal(false)}><X size={18}/></button>
            </div>

            <div style={{padding:'0 24px'}}>
              <div className={s.formGrid} style={{padding:0, marginTop:16}}>
                <div className={s.formGroup} style={{gridColumn:'1/-1'}}>
                  <label className={s.label}>Cliente *</label>
                  <input className={s.inputBase} value={form.client} onChange={e => setForm(f => ({...f, client: e.target.value}))} placeholder="Nome do cliente" style={{width:'100%', boxSizing:'border-box'}}/>
                </div>
                <div className={s.formGroup}>
                  <label className={s.label}>Profissional *</label>
                  <input className={s.inputBase} value={form.professional} onChange={e => setForm(f => ({...f, professional: e.target.value}))} placeholder="Nome do profissional" style={{width:'100%', boxSizing:'border-box'}}/>
                </div>
                <div className={s.formGroup}>
                  <label className={s.label}>Horário de abertura</label>
                  <input className={s.inputBase} type="time" value={form.opened} onChange={e => setForm(f => ({...f, opened: e.target.value}))} style={{width:'100%', boxSizing:'border-box'}}/>
                </div>
              </div>

              <div style={{marginTop:16}}>
                <label className={s.label}>Itens da comanda</label>
                {form.items.map((item, i) => (
                  <div key={i} style={{display:'flex', gap:8, alignItems:'center', marginBottom:6, marginTop:6}}>
                    <span style={{flex:1, fontSize:13}}>{item.name}</span>
                    <span style={{fontSize:13, color:'#86868b'}}>{item.qty}x</span>
                    <span style={{fontSize:13, color:'#86868b'}}>R$ {item.price}</span>
                    <button className={s.btnIconSm} onClick={() => removeItem(i)} style={{color:'#ff3b30'}}><X size={12}/></button>
                  </div>
                ))}
                <div style={{display:'flex', gap:8, marginTop:8}}>
                  <input className={s.inputBase} placeholder="Item" style={{flex:2}} value={newItem.name} onChange={e => setNewItem(n => ({...n, name: e.target.value}))}/>
                  <input className={s.inputBase} placeholder="Qtd" type="number" min={1} style={{width:60}} value={newItem.qty} onChange={e => setNewItem(n => ({...n, qty: e.target.value}))}/>
                  <input className={s.inputBase} placeholder="Preço" type="number" min={0} style={{width:90}} value={newItem.price} onChange={e => setNewItem(n => ({...n, price: e.target.value}))}/>
                  <button className={s.btnSecondary} onClick={addItem} type="button">+ Add</button>
                </div>
              </div>

              <div className={s.formGroup} style={{marginTop:12}}>
                <label className={s.label}>Observações</label>
                <textarea className={s.inputBase} rows={2} value={form.observacoes} onChange={e => setForm(f => ({...f, observacoes: e.target.value}))} style={{resize:'vertical', width:'100%', boxSizing:'border-box', height:'auto', padding:'8px 12px'}}/>
              </div>

              {error && <p style={{color:'#ff3b30', fontSize:13, marginTop:8}}>{error}</p>}
            </div>

            <div className={s.modalFooter}>
              <button className={s.btnSecondary} onClick={() => setShowModal(false)}>Cancelar</button>
              <button className={s.btnPrimary} onClick={save} disabled={saving}>{saving ? 'Salvando...' : editTarget ? 'Salvar' : 'Criar comanda'}</button>
            </div>
          </div>
        </div>
      )}
    </BasePage>
  );
}
