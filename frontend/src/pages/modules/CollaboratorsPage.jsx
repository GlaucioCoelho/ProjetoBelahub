import React, { useState, useEffect } from 'react';
import BasePage from './BasePage';
import s from './shared.module.css';
import co from './CollaboratorsPage.module.css';
import {
  UserCheck, Plus, Search, X, Edit2, Trash2,
  Phone, Mail, Star, TrendingUp, Calendar,
  DollarSign, Clock, Award, ChevronRight,
  ToggleRight, Scissors
} from 'lucide-react';
import funcionarioService from '../../services/funcionarioService';

const ROLES = ['Cabeleireira','Manicure','Pedicure','Esteticista','Massagista','Barbeiro','Recepcionista','Gerente','Profissional'];
const WEEK_DAYS = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];

const EMPTY_FORM = {
  name:'', role:'Cabeleireira', phone:'', email:'',
  commission:40, status:'active',
  workDays:['Seg','Ter','Qua','Qui','Sex'],
  workHours:'09:00 – 18:00', specialties:[], since:'',
  color:'#7c3aed', initials:'',
};

const COLORS = ['#e8185a','#7c3aed','#0ea5e9','#f59e0b','#22c55e','#a855f7','#f97316'];

export default function CollaboratorsPage() {
  const [collabs,   setCollabs]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [filterSt,  setFilterSt]  = useState('all');
  const [selected,  setSelected]  = useState(null);
  const [modal,     setModal]     = useState(false);
  const [editId,    setEditId]    = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [deleteId,  setDeleteId]  = useState(null);
  const [specInput, setSpecInput] = useState('');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    funcionarioService.listar()
      .then(setCollabs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Stats ──
  const active    = collabs.filter(c => c.status === 'active').length;
  const totalRev  = collabs.reduce((a, c) => a + c.thisMonth.revenue, 0);
  const avgRating = collabs.length > 0
    ? (collabs.reduce((a, c) => a + (c.thisMonth?.rating || 0), 0) / collabs.length).toFixed(1)
    : '0.0';
  const totalSvcs = collabs.reduce((a, c) => a + c.thisMonth.services, 0);

  // ── Filter ──
  const filtered = collabs
    .filter(c => filterSt === 'all' || c.status === filterSt)
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) ||
                 c.role.toLowerCase().includes(search.toLowerCase()));

  // ── Modal ──
  const openNew = () => {
    setEditId(null);
    setSaveError('');
    setForm({ ...EMPTY_FORM, color: COLORS[collabs.length % COLORS.length] });
    setSpecInput('');
    setModal(true);
  };

  const openEdit = (c) => {
    setSaveError('');
    setEditId(c.id);
    setForm({
      name: c.name, role: c.role, phone: c.phone, email: c.email,
      commission: c.commission, status: c.status,
      workDays: [...c.workDays], workHours: c.workHours,
      specialties: [...c.specialties], since: c.since,
      color: c.color, initials: c.initials,
    });
    setSpecInput('');
    setModal(true);
  };

  const save = async () => {
    setSaveError('');
    if (!form.name.trim()) { setSaveError('Nome é obrigatório.'); return; }
    try {
      if (editId) {
        const saved = await funcionarioService.atualizar(editId, form);
        setCollabs(prev => prev.map(c => c.id === saved.id ? saved : c));
        if (selected?.id === editId) setSelected(saved);
      } else {
        const saved = await funcionarioService.criar(form);
        setCollabs(prev => [...prev, saved]);
      }
      setModal(false);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.mensagem || err.message || 'Erro ao salvar.';
      setSaveError(msg);
    }
  };

  const toggleDay = (day) => {
    setForm(p => ({
      ...p,
      workDays: p.workDays.includes(day)
        ? p.workDays.filter(d => d !== day)
        : [...p.workDays, day],
    }));
  };

  const addSpec = () => {
    const v = specInput.trim();
    if (v && !form.specialties.includes(v)) {
      setForm(p => ({ ...p, specialties: [...p.specialties, v] }));
    }
    setSpecInput('');
  };

  const removeSpec = (sp) => setForm(p => ({ ...p, specialties: p.specialties.filter(x => x !== sp) }));

  const toggleStatus = async (id) => {
    const target = collabs.find(c => c.id === id);
    if (!target) return;
    try {
      const updated = await funcionarioService.toggleStatus(id, target.status === 'active');
      setCollabs(prev => prev.map(c => c.id === updated.id ? updated : c));
      if (selected?.id === id) setSelected(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const del = async (id) => {
    try {
      await funcionarioService.deletar(id);
      setCollabs(prev => prev.filter(c => c.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (err) {
      console.error(err);
    }
    setDeleteId(null);
  };

  return (
    <BasePage title="Colaboradores" description="Equipe e profissionais do salão" icon={UserCheck}>
      <div className={s.page}>

        {/* Stats */}
        <div className={s.statsStrip}>
          <div className={s.statBox}>
            <span className={s.statLabel}>Profissionais ativos</span>
            <span className={s.statValue}>{active}</span>
          </div>
          <div className={s.statBox}>
            <span className={s.statLabel}>Serviços este mês</span>
            <span className={s.statValue}>{totalSvcs}</span>
          </div>
          <div className={s.statBox}>
            <span className={s.statLabel}>Receita gerada</span>
            <span className={s.statValue}>R$ {totalRev.toLocaleString('pt-BR')}</span>
          </div>
          <div className={s.statBox}>
            <span className={s.statLabel}>Avaliação média</span>
            <span className={s.statValue} style={{color:'#f59e0b'}}>⭐ {avgRating}</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className={co.toolbar}>
          <div className={s.searchWrap} style={{flex:1, maxWidth:280}}>
            <Search size={14}/>
            <input className={`${s.inputBase} ${s.searchInput}`} style={{width:'100%'}}
              placeholder="Buscar profissional..."
              value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
          <div className={co.filterBtns}>
            {[['all','Todos'],['active','Ativos'],['inactive','Inativos']].map(([v,l]) => (
              <button key={v}
                className={`${co.filterBtn} ${filterSt===v ? co.filterBtnActive : ''}`}
                onClick={() => setFilterSt(v)}>{l}</button>
            ))}
          </div>
          <button className={s.btnPrimary} onClick={openNew}><Plus size={15}/> Novo colaborador</button>
        </div>

        {/* Main layout */}
        <div className={co.layout}>

          {/* Cards grid */}
          <div className={co.cardsPane}>
            {filtered.length === 0 && (
              <div className={co.empty}>Nenhum colaborador encontrado</div>
            )}
            {filtered.map(c => {
              const maxRev = Math.max(...collabs.map(x => x.thisMonth.revenue));
              const pct    = maxRev > 0 ? Math.round(c.thisMonth.revenue / maxRev * 100) : 0;
              return (
                <div key={c.id}
                  className={`${co.card} ${selected?.id === c.id ? co.cardActive : ''} ${c.status === 'inactive' ? co.cardInactive : ''}`}
                  onClick={() => setSelected(c)}>

                  {/* Status dot */}
                  <div className={`${co.statusDot} ${c.status==='active' ? co.dotActive : co.dotInactive}`}/>

                  {/* Avatar + info */}
                  <div className={co.cardTop}>
                    <div className={co.avatar} style={{background: c.color}}>{c.initials}</div>
                    <div className={co.cardInfo}>
                      <div className={co.cardName}>{c.name}</div>
                      <div className={co.cardRole}><Scissors size={11}/> {c.role}</div>
                      <div className={co.cardRating}>
                        <Star size={11} style={{fill:'#f59e0b',color:'#f59e0b'}}/>
                        {c.thisMonth.rating > 0 ? c.thisMonth.rating : '—'}
                        {c.since && <span className={co.cardSince}>desde {new Date(c.since+'T00:00:00').toLocaleDateString('pt-BR',{month:'short',year:'numeric'})}</span>}
                      </div>
                    </div>
                    <ChevronRight size={14} className={co.cardChevron}/>
                  </div>

                  {/* Month stats */}
                  <div className={co.cardStats}>
                    <div className={co.cardStat}>
                      <span className={co.cardStatVal}>{c.thisMonth.services}</span>
                      <span className={co.cardStatLbl}>Serviços</span>
                    </div>
                    <div className={co.cardStat}>
                      <span className={co.cardStatVal}>R$ {c.thisMonth.revenue.toLocaleString('pt-BR')}</span>
                      <span className={co.cardStatLbl}>Receita</span>
                    </div>
                    <div className={co.cardStat}>
                      <span className={co.cardStatVal}>{c.commission}%</span>
                      <span className={co.cardStatLbl}>Comissão</span>
                    </div>
                  </div>

                  {/* Revenue bar */}
                  <div className={s.progressBar} style={{marginTop:4}}>
                    <div className={s.progressFill} style={{width:`${pct}%`, background: c.color}}/>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail panel */}
          {selected ? (
            <div className={co.detailPane}>
              {/* Header */}
              <div className={co.detailHeader}>
                <div className={co.detailAvatarWrap}>
                  <div className={co.detailAvatar} style={{background: selected.color}}>{selected.initials}</div>
                  <div className={`${co.detailStatusBadge} ${selected.status==='active' ? co.detailBadgeActive : co.detailBadgeInactive}`}>
                    {selected.status === 'active' ? 'Ativo' : 'Inativo'}
                  </div>
                </div>
                <div className={co.detailMeta}>
                  <h2 className={co.detailName}>{selected.name}</h2>
                  <div className={co.detailRole}><Scissors size={13}/> {selected.role}</div>
                </div>
                <div className={co.detailActions}>
                  <button className={co.iconBtn} title="Editar" onClick={() => openEdit(selected)}><Edit2 size={15}/></button>
                  <button className={`${co.iconBtn} ${co.iconBtnDanger}`} title="Excluir" onClick={() => setDeleteId(selected.id)}><Trash2 size={15}/></button>
                </div>
              </div>

              {/* Month KPIs */}
              <div className={co.kpiGrid}>
                <div className={co.kpi}>
                  <TrendingUp size={16} style={{color:'var(--purple)'}}/>
                  <span className={co.kpiVal}>R$ {selected.thisMonth.revenue.toLocaleString('pt-BR')}</span>
                  <span className={co.kpiLbl}>Receita mês</span>
                </div>
                <div className={co.kpi}>
                  <Scissors size={16} style={{color:'#e8185a'}}/>
                  <span className={co.kpiVal}>{selected.thisMonth.services}</span>
                  <span className={co.kpiLbl}>Serviços</span>
                </div>
                <div className={co.kpi}>
                  <DollarSign size={16} style={{color:'#22c55e'}}/>
                  <span className={co.kpiVal}>R$ {(selected.thisMonth.commissionValue || 0).toLocaleString('pt-BR')}</span>
                  <span className={co.kpiLbl}>Comissão ({selected.commission}%)</span>
                </div>
                <div className={co.kpi}>
                  <Star size={16} style={{fill:'#f59e0b',color:'#f59e0b'}}/>
                  <span className={co.kpiVal}>{selected.thisMonth.rating || '—'}</span>
                  <span className={co.kpiLbl}>Avaliação</span>
                </div>
              </div>

              {/* Contact */}
              <div className={co.section}>
                <div className={co.sectionTitle}>Contato</div>
                <div className={co.infoRow}><Phone size={13}/> {selected.phone}</div>
                <div className={co.infoRow}><Mail size={13}/> {selected.email}</div>
                {selected.since && <div className={co.infoRow}><Calendar size={13}/> Desde: {new Date(selected.since+'T00:00:00').toLocaleDateString('pt-BR')}</div>}
                <div className={co.infoRow}><Clock size={13}/> {selected.workHours}</div>
              </div>

              {/* Work days */}
              <div className={co.section}>
                <div className={co.sectionTitle}>Dias de trabalho</div>
                <div className={co.dayPills}>
                  {WEEK_DAYS.map(d => (
                    <span key={d} className={`${co.dayPill} ${selected.workDays.includes(d) ? co.dayPillActive : ''}`}>{d}</span>
                  ))}
                </div>
              </div>

              {/* Specialties */}
              {selected.specialties.length > 0 && (
                <div className={co.section}>
                  <div className={co.sectionTitle}>Especialidades</div>
                  <div className={co.specTags}>
                    {selected.specialties.map(sp => (
                      <span key={sp} className={co.specTag}>{sp}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Toggle status */}
              <button className={`${co.toggleStatusBtn} ${selected.status==='active' ? co.toggleBtnOff : co.toggleBtnOn}`}
                onClick={() => toggleStatus(selected.id)}>
                <ToggleRight size={16}/>
                {selected.status === 'active' ? 'Desativar colaborador' : 'Reativar colaborador'}
              </button>
            </div>
          ) : (
            <div className={co.detailEmpty}>
              <UserCheck size={40} strokeWidth={1.2}/>
              <p>Selecione um colaborador<br/>para ver os detalhes</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      {modal && (
        <div className={co.overlay} onClick={() => setModal(false)}>
          <div className={co.modal} onClick={e => e.stopPropagation()}>
            <div className={co.modalHeader}>
              <h3>{editId ? 'Editar colaborador' : 'Novo colaborador'}</h3>
              <button className={co.modalClose} onClick={() => setModal(false)}><X size={18}/></button>
            </div>
            <div className={co.modalBody}>

              {/* Color picker */}
              <div className={co.colorRow}>
                <div className={co.colorPreview} style={{background: form.color}}>
                  {form.name ? form.name.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase() : '?'}
                </div>
                <div className={co.colorPicker}>
                  {COLORS.map(c => (
                    <button key={c} className={`${co.colorSwatch} ${form.color===c ? co.colorSwatchActive : ''}`}
                      style={{background:c}} onClick={() => setForm(p => ({...p, color:c}))}/>
                  ))}
                </div>
              </div>

              <div className={co.formGrid}>
                <div className={co.formGroup}>
                  <label>Nome completo *</label>
                  <input className={co.formInput} placeholder="Nome do profissional"
                    value={form.name} onChange={e => setForm(p => ({...p, name:e.target.value}))}/>
                </div>
                <div className={co.formGroup}>
                  <label>Função / Cargo</label>
                  <select className={co.formInput} value={form.role}
                    onChange={e => setForm(p => ({...p, role:e.target.value}))}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className={co.formGroup}>
                  <label>Telefone</label>
                  <input className={co.formInput} placeholder="(11) 99999-9999"
                    value={form.phone} onChange={e => setForm(p => ({...p, phone:e.target.value}))}/>
                </div>
                <div className={co.formGroup}>
                  <label>E-mail</label>
                  <input className={co.formInput} placeholder="email@exemplo.com" type="email"
                    value={form.email} onChange={e => setForm(p => ({...p, email:e.target.value}))}/>
                </div>
                <div className={co.formGroup}>
                  <label>Comissão (%)</label>
                  <input className={co.formInput} type="number" min="0" max="100"
                    value={form.commission} onChange={e => setForm(p => ({...p, commission:+e.target.value}))}/>
                </div>
                <div className={co.formGroup}>
                  <label>Horário de trabalho</label>
                  <input className={co.formInput} placeholder="09:00 – 18:00"
                    value={form.workHours} onChange={e => setForm(p => ({...p, workHours:e.target.value}))}/>
                </div>
                <div className={co.formGroup}>
                  <label>Data de entrada</label>
                  <input className={co.formInput} type="date"
                    value={form.since} onChange={e => setForm(p => ({...p, since:e.target.value}))}/>
                </div>
                <div className={co.formGroup}>
                  <label>Status</label>
                  <select className={co.formInput} value={form.status}
                    onChange={e => setForm(p => ({...p, status:e.target.value}))}>
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>

                {/* Work days */}
                <div className={`${co.formGroup} ${co.formGroupFull}`}>
                  <label>Dias de trabalho</label>
                  <div className={co.dayPillsEdit}>
                    {WEEK_DAYS.map(d => (
                      <button key={d} type="button"
                        className={`${co.dayPillEdit} ${form.workDays.includes(d) ? co.dayPillEditActive : ''}`}
                        onClick={() => toggleDay(d)}>{d}</button>
                    ))}
                  </div>
                </div>

                {/* Specialties */}
                <div className={`${co.formGroup} ${co.formGroupFull}`}>
                  <label>Especialidades</label>
                  <div className={co.specInput}>
                    <input className={co.formInput} placeholder="Ex: Coloração"
                      value={specInput} onChange={e => setSpecInput(e.target.value)}
                      onKeyDown={e => e.key==='Enter' && (e.preventDefault(), addSpec())}/>
                    <button type="button" className={s.btnGhost} onClick={addSpec}>Adicionar</button>
                  </div>
                  {form.specialties.length > 0 && (
                    <div className={co.specTags} style={{marginTop:8}}>
                      {form.specialties.map(sp => (
                        <span key={sp} className={co.specTagEdit}>
                          {sp}
                          <button onClick={() => removeSpec(sp)}><X size={10}/></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {saveError && (
              <div style={{margin:'0 24px 12px',padding:'10px 14px',background:'rgba(220,38,38,0.08)',border:'1px solid rgba(220,38,38,0.25)',borderRadius:8,color:'#dc2626',fontSize:13}}>
                {saveError}
              </div>
            )}
            <div className={co.modalFooter}>
              <button className={s.btnGhost} onClick={() => { setModal(false); setSaveError(''); }}>Cancelar</button>
              <button className={s.btnPrimary} onClick={save}>
                {editId ? 'Salvar alterações' : 'Cadastrar colaborador'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm delete ── */}
      {deleteId && (
        <div className={co.overlay} onClick={() => setDeleteId(null)}>
          <div className={co.confirmBox} onClick={e => e.stopPropagation()}>
            <Trash2 size={28} style={{color:'#dc2626',marginBottom:12}}/>
            <h3>Excluir colaborador?</h3>
            <p>Esta ação não pode ser desfeita.</p>
            <div className={co.confirmActions}>
              <button className={s.btnGhost} onClick={() => setDeleteId(null)}>Cancelar</button>
              <button className={co.btnDanger} onClick={() => del(deleteId)}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </BasePage>
  );
}
