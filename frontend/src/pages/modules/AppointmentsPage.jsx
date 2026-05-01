import React, { useState, useEffect } from 'react';
import BasePage from './BasePage';
import s from './shared.module.css';
import ap from './AppointmentsPage.module.css';
import {
  Calendar, Plus, Search, Clock, ChevronLeft, ChevronRight,
  X, Check, Ban, LayoutList, CalendarDays, Edit2, Trash2,
  User, Scissors, DollarSign, CreditCard, FileText, UserPlus
} from 'lucide-react';
import agendamentoService from '../../services/agendamentoService';
import funcionarioService from '../../services/funcionarioService';
import clienteService from '../../services/clienteService';
import servicoService from '../../services/servicoService';

// ── Constants ─────────────────────────────────────────────
const STATUS_CFG = {
  scheduled: { label:'Agendado',   color:'#3b82f6', bg:'rgba(59,130,246,0.1)'  },
  waiting:   { label:'Aguardando', color:'#f59e0b', bg:'rgba(245,158,11,0.1)'  },
  completed: { label:'Concluído',  color:'#22c55e', bg:'rgba(34,197,94,0.1)'   },
  canceled:  { label:'Cancelado',  color:'#ef4444', bg:'rgba(239,68,68,0.1)'   },
};


const PAYMENT_OPTS = ['Pix','Cartão','Dinheiro','Transferência'];

const localDateISO = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const EMPTY_FORM = {
  date:'', time:'09:00', client:'', clientId:'',
  service:'', duration:60, price:0,
  profId:'', payment:'Pix', status:'scheduled', note:'',
};

const timeToMin = t => { const [h,m] = t.split(':').map(Number); return h*60+m; };

const HOURS = Array.from({ length:13 }, (_,i) => `${(i+8).toString().padStart(2,'0')}:00`);

function fmtDate(d) {
  return d.toLocaleDateString('pt-BR', { weekday:'short', day:'numeric', month:'short', year:'numeric' });
}

// ── Component ─────────────────────────────────────────────
export default function AppointmentsPage() {
  const [appts,           setAppts]           = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [professionalsData, setProfessionalsData] = useState([]);
  const [clientsData,     setClientsData]     = useState([]);
  const [servicesData,    setServicesData]    = useState([]);
  const [date,            setDate]            = useState(new Date());
  const [view,            setView]            = useState('list');   // 'list' | 'timeline'
  const [search,          setSearch]          = useState('');
  const [filterProf,      setFilterProf]      = useState('all');
  const [filterSt,        setFilterSt]        = useState('all');
  const [modal,           setModal]           = useState(false);
  const [editId,          setEditId]          = useState(null);
  const [form,            setForm]            = useState(EMPTY_FORM);
  const [deleteId,        setDeleteId]        = useState(null);
  const [statusMenu,      setStatusMenu]      = useState(null);
  const [saveError,       setSaveError]       = useState('');
  const [newClientModal,  setNewClientModal]  = useState(false);
  const [clientForm,      setClientForm]      = useState({ name:'', phone:'', email:'' });
  const [clientSaving,    setClientSaving]    = useState(false);

  const PROFESSIONALS = professionalsData.length > 0
    ? professionalsData
    : [...new Set(appts.map(a => a.professional))].map(name => ({ name, color: '#7c3aed', role: '' }));

  const getProf = (id) => PROFESSIONALS.find(p => p.id === id) || {};

  useEffect(() => {
    // Carregar profissionais ativos
    funcionarioService.listar()
      .then(data => setProfessionalsData(
        data
          .filter(f => f.status === 'active')
          .map(f => ({
            id:       f.name,   // profissional é armazenado como nome no MongoDB
            name:     f.name,
            color:    f.color,
            role:     f.role,
            initials: (f.name || '').split(' ').filter(Boolean).slice(0,2).map(w => w[0].toUpperCase()).join(''),
          }))
      ))
      .catch(console.error);

    // Carregar clientes reais
    clienteService.listar()
      .then(setClientsData)
      .catch(console.error);

    // Carregar serviços cadastrados
    servicoService.listar({ ativo: true, limite: 200 })
      .then(setServicesData)
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    agendamentoService.listar(date)
      .then(setAppts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [date]);

  // ── Date nav ──────────────────────────────────────────
  const prevDay = () => setDate(d => { const n = new Date(d); n.setDate(n.getDate()-1); return n; });
  const nextDay = () => setDate(d => { const n = new Date(d); n.setDate(n.getDate()+1); return n; });
  const goToday = () => setDate(new Date());

  // ── Stats ─────────────────────────────────────────────
  const total     = appts.length;
  const completed = appts.filter(a => a.status==='completed').length;
  const scheduled = appts.filter(a => a.status==='scheduled'||a.status==='waiting').length;
  const revenue   = appts.filter(a => a.status==='completed')
                         .reduce((acc,a) => acc+(a.price ?? 0), 0);

  // ── Filtered ──────────────────────────────────────────
  const filtered = appts
    .filter(a => filterSt  ==='all' || a.status  ===filterSt)
    .filter(a => filterProf==='all' || a.profId  ===filterProf)
    .filter(a => {
      const q = search.toLowerCase();
      return a.client.toLowerCase().includes(q) ||
             (a.service||'').toLowerCase().includes(q);
    })
    .sort((a,b) => timeToMin(a.time) - timeToMin(b.time));

  // ── Cadastrar cliente rápido ──────────────────────────
  const saveNewClient = async () => {
    if (!clientForm.name.trim()) return;
    setClientSaving(true);
    try {
      const saved = await clienteService.criar(clientForm);
      setClientsData(prev => [...prev, saved]);
      setForm(p => ({ ...p, client: saved.name, clientId: saved.id }));
      setNewClientModal(false);
      setClientForm({ name: '', phone: '', email: '' });
    } catch (err) {
      alert(err.response?.data?.mensagem || 'Erro ao cadastrar cliente');
    } finally {
      setClientSaving(false);
    }
  };

  // ── CRUD ──────────────────────────────────────────────
  const openNew = () => {
    setEditId(null);
    setSaveError('');
    setForm({ ...EMPTY_FORM, date: localDateISO(date), profId: PROFESSIONALS[0]?.id || '' });
    setModal(true);
  };

  const openEdit = (a) => {
    setEditId(a.id);
    setSaveError('');
    const svc = servicesData.find(s => s.nome === a.service) || {};
    setForm({
      date:     a.date || localDateISO(date),
      time:     a.time,
      client:   a.client,
      clientId: a.clientId || '',
      service:  a.service,
      duration: svc.duracao || a.duration || 60,
      price:    svc.preco   ?? a.price    ?? 0,
      profId:   a.profId,
      payment:  a.payment,
      status:   a.status,
      note:     a.note,
    });
    setModal(true);
  };

  const save = async () => {
    setSaveError('');
    if (!form.client.trim()) { setSaveError('Selecione o cliente.'); return; }
    if (!form.service)       { setSaveError('Selecione o serviço.'); return; }
    if (!form.profId)        { setSaveError('Selecione o profissional.'); return; }
    if (!form.time)          { setSaveError('Informe o horário.'); return; }
    if (!form.date)          { setSaveError('Informe a data.'); return; }
    try {
      if (editId) {
        const saved = await agendamentoService.atualizar(editId, form);
        setAppts(prev => prev.map(a => a.id === saved.id ? saved : a));
        setModal(false);
      } else {
        const saved = await agendamentoService.criar(form);
        if (saved.date === localDateISO(date)) {
          setAppts(prev => [...prev, saved].sort((a, b) => a.time.localeCompare(b.time)));
        }
        setModal(false);
      }
    } catch (err) {
      const msg = err.response?.data?.mensagem || err.message || 'Erro ao salvar.';
      setSaveError(msg);
    }
  };

  const changeStatus = async (id, novoStatus) => {
    try {
      const updated = await agendamentoService.atualizarStatus(id, novoStatus);
      setAppts(prev => prev.map(a => a.id === updated.id ? updated : a));
    } catch (err) {
      console.error(err);
    }
    setStatusMenu(null);
  };

  const deleteAppt = async (id) => {
    try {
      await agendamentoService.deletar(id);
      setAppts(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
    }
    setDeleteId(null);
    setStatusMenu(null);
  };

  // ── Render ────────────────────────────────────────────
  return (
    <BasePage title="Atendimentos" description="Agendamentos e controle de atendimentos" icon={Calendar}>
      <div className={s.page}>

        {/* ── Date Navigator ── */}
        <div className={ap.dateNav}>
          <button className={ap.navBtn} onClick={prevDay}><ChevronLeft size={18}/></button>
          <div className={ap.dateInfo}>
            <span className={ap.dateLabel}>{fmtDate(date)}</span>
            <input
              type="date"
              className={ap.datePicker}
              value={`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}
              onChange={e => {
                const [y,m,d] = e.target.value.split('-').map(Number);
                setDate(new Date(y, m-1, d));
              }}
            />
            <button className={ap.todayBtn} onClick={goToday}>Hoje</button>
          </div>
          <button className={ap.navBtn} onClick={nextDay}><ChevronRight size={18}/></button>
          <div className={ap.viewToggle}>
            <button className={`${ap.viewBtn} ${view==='list'     ? ap.viewBtnActive : ''}`} onClick={() => setView('list')}>
              <LayoutList size={16}/>
            </button>
            <button className={`${ap.viewBtn} ${view==='timeline' ? ap.viewBtnActive : ''}`} onClick={() => setView('timeline')}>
              <CalendarDays size={16}/>
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className={s.statsStrip}>
          <div className={s.statBox}>
            <span className={s.statLabel}>Total do dia</span>
            <span className={s.statValue}>{total}</span>
          </div>
          <div className={s.statBox}>
            <span className={s.statLabel}>Concluídos</span>
            <span className={s.statValue} style={{color:'#22c55e'}}>{completed}</span>
          </div>
          <div className={s.statBox}>
            <span className={s.statLabel}>Pendentes</span>
            <span className={s.statValue} style={{color:'#f59e0b'}}>{scheduled}</span>
          </div>
          <div className={s.statBox}>
            <span className={s.statLabel}>Faturado</span>
            <span className={s.statValue}>R$ {revenue.toLocaleString('pt-BR')}</span>
            <span className={s.statUp}>↑ 12% vs ontem</span>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className={ap.toolbar}>
          <div className={s.searchWrap} style={{flex:1, maxWidth:280}}>
            <Search size={14}/>
            <input className={`${s.inputBase} ${s.searchInput}`} style={{width:'100%'}}
              placeholder="Buscar cliente ou serviço..."
              value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
          <div className={ap.toolbarFilters}>
            <select className={s.select} value={filterProf} onChange={e => setFilterProf(e.target.value)}>
              <option value="all">Todos profissionais</option>
              {PROFESSIONALS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select className={s.select} value={filterSt} onChange={e => setFilterSt(e.target.value)}>
              <option value="all">Todos status</option>
              {Object.entries(STATUS_CFG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <button className={s.btnPrimary} onClick={openNew}><Plus size={15}/> Novo atendimento</button>
        </div>

        {/* ── LIST VIEW ── */}
        {view === 'list' && (
          <div className={s.card}>

            {/* Cards — mobile only */}
            <div className={ap.mobileList}>
              {filtered.length === 0 ? (
                <p style={{textAlign:'center',padding:'32px 0',color:'var(--text-tertiary)',fontSize:14}}>
                  Nenhum atendimento encontrado
                </p>
              ) : filtered.map(a => {
                const prof = getProf(a.profId);
                const st   = STATUS_CFG[a.status];
                return (
                  <div key={a.id} className={ap.apptCard}>
                    <div className={ap.apptCardTop}>
                      <span className={ap.apptCardTime}>
                        <Clock size={12}/>{a.time}
                      </span>
                      <button className={ap.statusBadge}
                        style={{color:st.color, background:st.bg}}
                        onClick={() => setStatusMenu(statusMenu===a.id ? null : a.id)}>
                        {st.label} <ChevronRight size={11} style={{transform:'rotate(90deg)'}}/>
                      </button>
                      {statusMenu===a.id && (
                        <div className={ap.statusDropdown}>
                          {Object.entries(STATUS_CFG).map(([k,v]) => (
                            <button key={k} className={`${ap.statusOption} ${a.status===k ? ap.statusOptionActive : ''}`}
                              onClick={() => changeStatus(a.id,k)}>
                              <span style={{width:7,height:7,borderRadius:'50%',background:v.color,display:'inline-block'}}/>
                              {v.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className={ap.apptCardBody}>
                      <span className={ap.apptCardClient}>{a.client}</span>
                      <span className={ap.apptCardService}>{a.service} · {a.duration}min</span>
                    </div>
                    <div className={ap.apptCardMeta}>
                      <div className={ap.apptCardProf}>
                        <div className={ap.apptCardProfAvatar} style={{background: prof.color || '#7c3aed'}}>
                          {prof.initials || a.profId?.[0]?.toUpperCase() || '?'}
                        </div>
                        {prof.name || a.profId}
                      </div>
                      <span className={ap.apptCardPrice}>R$ {a.price}</span>
                    </div>
                    <div className={ap.apptCardActions}>
                      {a.status==='scheduled' && (
                        <button className={ap.actionBtn} style={{'--ac':'#22c55e'}} title="Confirmar chegada"
                          onClick={() => changeStatus(a.id,'waiting')}>
                          <Check size={13}/>
                        </button>
                      )}
                      {a.status==='waiting' && (
                        <button className={ap.actionBtn} style={{'--ac':'#22c55e'}} title="Concluir"
                          onClick={() => changeStatus(a.id,'completed')}>
                          <Check size={13}/>
                        </button>
                      )}
                      <button className={ap.actionBtn} title="Editar" onClick={() => openEdit(a)}>
                        <Edit2 size={13}/>
                      </button>
                      <button className={`${ap.actionBtn} ${ap.actionBtnDanger}`} title="Excluir"
                        onClick={() => setDeleteId(a.id)}>
                        <Trash2 size={13}/>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tabela — desktop only */}
            <div className={ap.desktopTable}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Horário</th><th>Cliente</th><th>Serviço</th>
                  <th>Profissional</th><th>Duração</th>
                  <th>Valor</th><th>Pagamento</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} style={{textAlign:'center',padding:48,color:'var(--text-tertiary)'}}>
                    Nenhum atendimento encontrado
                  </td></tr>
                ) : filtered.map(a => {
                  const prof = getProf(a.profId);
                  const st   = STATUS_CFG[a.status];
                  return (
                    <tr key={a.id}>
                      <td>
                        <span style={{display:'flex',alignItems:'center',gap:5,fontWeight:700,fontSize:13}}>
                          <Clock size={12} style={{color:'var(--text-tertiary)'}}/>{a.time}
                        </span>
                      </td>
                      <td style={{fontWeight:600}}>{a.client}</td>
                      <td style={{color:'var(--text-secondary)',fontSize:13}}>{a.service}</td>
                      <td>
                        <div className={s.avatarRow}>
                          <div className={s.avatar} style={{background:prof.color,width:26,height:26,fontSize:10,borderRadius:8}}>
                            {prof.initials}
                          </div>
                          <span style={{fontSize:13}}>{prof.name}</span>
                        </div>
                      </td>
                      <td style={{color:'var(--text-tertiary)',fontSize:13}}>{a.duration}min</td>
                      <td style={{fontWeight:700}}>R$ {a.price}</td>
                      <td style={{color:'var(--text-tertiary)',fontSize:13}}>{a.payment}</td>
                      <td>
                        <button className={ap.statusBadge}
                          style={{color:st.color,background:st.bg}}
                          onClick={() => setStatusMenu(statusMenu===a.id ? null : a.id)}>
                          {st.label} <ChevronRight size={11} style={{transform:'rotate(90deg)'}}/>
                        </button>
                        {statusMenu===a.id && (
                          <div className={ap.statusDropdown}>
                            {Object.entries(STATUS_CFG).map(([k,v]) => (
                              <button key={k} className={`${ap.statusOption} ${a.status===k ? ap.statusOptionActive : ''}`}
                                onClick={() => changeStatus(a.id,k)}>
                                <span style={{width:7,height:7,borderRadius:'50%',background:v.color,display:'inline-block'}}/>
                                {v.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                      <td>
                        <div className={ap.rowActions}>
                          {a.status==='scheduled'&&(
                            <button className={ap.actionBtn} style={{'--ac':'#22c55e'}} title="Confirmar chegada"
                              onClick={() => changeStatus(a.id,'waiting')}>
                              <Check size={13}/>
                            </button>
                          )}
                          {a.status==='waiting'&&(
                            <button className={ap.actionBtn} style={{'--ac':'#22c55e'}} title="Concluir"
                              onClick={() => changeStatus(a.id,'completed')}>
                              <Check size={13}/>
                            </button>
                          )}
                          <button className={ap.actionBtn} title="Editar" onClick={() => openEdit(a)}>
                            <Edit2 size={13}/>
                          </button>
                          <button className={`${ap.actionBtn} ${ap.actionBtnDanger}`} title="Cancelar/Excluir"
                            onClick={() => setDeleteId(a.id)}>
                            <Trash2 size={13}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>{/* /desktopTable */}
          </div>
        )}

        {/* ── TIMELINE VIEW ── */}
        {view === 'timeline' && (
          <div className={ap.timeline}>
            {/* Prof headers */}
            <div className={ap.timelineHeader}>
              <div className={ap.timelineGutter}/>
              {PROFESSIONALS.filter(p => filterProf==='all' || p.id===filterProf).map(p => (
                <div key={p.id} className={ap.timelineCol}>
                  <div className={ap.timelineProfAvatar} style={{background:p.color}}>{p.initials}</div>
                  <div>
                    <div className={ap.timelineProfName}>{p.name}</div>
                    <div className={ap.timelineProfRole}>{p.role}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* Time grid */}
            <div className={ap.timelineGrid}>
              {HOURS.map(hr => {
                const profList = PROFESSIONALS.filter(p => filterProf==='all' || p.id===filterProf);
                return (
                  <div key={hr} className={ap.timelineRow}>
                    <div className={ap.timelineTime}>{hr}</div>
                    {profList.map(p => {
                      const slots = appts.filter(a => a.profId===p.id && a.time===hr);
                      return (
                        <div key={p.id} className={ap.timelineCell}>
                          {slots.map(slot => {
                            const st = STATUS_CFG[slot.status] || STATUS_CFG.scheduled;
                            return (
                              <div key={slot.id} className={ap.timelineAppt}
                                style={{borderLeftColor: p.color, background: st.bg}}>
                                <div className={ap.timelineApptName}>{slot.client}</div>
                                <div className={ap.timelineApptSvc}>{slot.service}</div>
                                <span className={ap.timelineApptBadge} style={{color:st.color}}>{st.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Modal new/edit ── */}
      {modal && (
        <div className={ap.overlay} onClick={() => setModal(false)}>
          <div className={ap.modal} onClick={e => e.stopPropagation()}>
            <div className={ap.modalHeader}>
              <h3>{editId ? 'Editar atendimento' : 'Novo atendimento'}</h3>
              <button className={ap.modalClose} onClick={() => setModal(false)}><X size={18}/></button>
            </div>
            <div className={ap.modalBody}>
              <div className={ap.formGrid}>
                {/* Client */}
                <div className={ap.formGroup}>
                  <label style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span><User size={12}/> Cliente</span>
                    <button type="button" className={ap.addClientBtn}
                      onClick={() => { setNewClientModal(true); setClientForm({ name:'', phone:'', email:'' }); }}>
                      <UserPlus size={12}/> Novo cliente
                    </button>
                  </label>
                  <select className={ap.formInput} value={form.client}
                    onChange={e => {
                      const cl = clientsData.find(c => c.name === e.target.value);
                      setForm(p => ({...p, client: e.target.value, clientId: cl?.id || ''}));
                    }}>
                    <option value="">Selecione o cliente</option>
                    {clientsData.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                {/* Date */}
                <div className={ap.formGroup}>
                  <label><Calendar size={12}/> Data</label>
                  <input type="date" className={ap.formInput} value={form.date}
                    onChange={e => setForm(p => ({...p, date: e.target.value}))}/>
                </div>
                {/* Time */}
                <div className={ap.formGroup}>
                  <label><Clock size={12}/> Horário</label>
                  <input type="time" className={ap.formInput} value={form.time}
                    onChange={e => setForm(p => ({...p, time: e.target.value}))}/>
                </div>
                {/* Service */}
                <div className={ap.formGroup}>
                  <label><Scissors size={12}/> Serviço</label>
                  <select className={ap.formInput} value={form.service}
                    onChange={e => {
                      const svc = servicesData.find(sv => sv.nome === e.target.value) || {};
                      setForm(p => ({...p, service: e.target.value, duration: svc.duracao || 60, price: svc.preco || 0}));
                    }}>
                    <option value="">Selecione o serviço</option>
                    {servicesData.map(sv => (
                      <option key={sv.id} value={sv.nome}>
                        {sv.nome} — R$ {Number(sv.preco).toLocaleString('pt-BR',{minimumFractionDigits:2})} ({sv.duracao}min)
                      </option>
                    ))}
                  </select>
                </div>
                {/* Professional */}
                <div className={ap.formGroup}>
                  <label><User size={12}/> Profissional</label>
                  <select className={ap.formInput} value={form.profId}
                    onChange={e => setForm(p => ({...p, profId: e.target.value}))}>
                    {PROFESSIONALS.map(p => (
                      <option key={p.id} value={p.id}>{p.name} – {p.role}</option>
                    ))}
                  </select>
                </div>
                {/* Payment */}
                <div className={ap.formGroup}>
                  <label><CreditCard size={12}/> Pagamento</label>
                  <select className={ap.formInput} value={form.payment}
                    onChange={e => setForm(p => ({...p, payment: e.target.value}))}>
                    {PAYMENT_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                {/* Status */}
                <div className={ap.formGroup}>
                  <label><DollarSign size={12}/> Status</label>
                  <select className={ap.formInput} value={form.status}
                    onChange={e => setForm(p => ({...p, status: e.target.value}))}>
                    {Object.entries(STATUS_CFG).map(([k,v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                {/* Notes */}
                <div className={`${ap.formGroup} ${ap.formGroupFull}`}>
                  <label><FileText size={12}/> Observações</label>
                  <textarea className={ap.formTextarea} rows={2}
                    placeholder="Preferências, observações..."
                    value={form.note} onChange={e => setForm(p => ({...p, note: e.target.value}))}/>
                </div>
              </div>
              {/* Preview */}
              {form.service && (
                <div className={ap.formPreview}>
                  <span>Duração: <strong>{form.duration}min</strong></span>
                  <span>Valor: <strong>R$ {form.price}</strong></span>
                  {form.time && <span>Término prev.: <strong>{
                    (() => {
                      const [h,m] = form.time.split(':').map(Number);
                      const total = h*60+m+(form.duration||0);
                      return `${Math.floor(total/60).toString().padStart(2,'0')}:${(total%60).toString().padStart(2,'0')}`;
                    })()
                  }</strong></span>}
                </div>
              )}
            </div>
            {saveError && (
              <div className={ap.saveError}>{saveError}</div>
            )}
            <div className={ap.modalFooter}>
              <button className={s.btnGhost} onClick={() => { setModal(false); setSaveError(''); }}>Cancelar</button>
              <button className={s.btnPrimary} onClick={save}>
                {editId ? 'Salvar alterações' : 'Criar atendimento'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: cadastro rápido de cliente ── */}
      {newClientModal && (
        <div className={ap.overlay} style={{ zIndex: 1100 }} onClick={() => setNewClientModal(false)}>
          <div className={ap.modal} style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className={ap.modalHeader}>
              <h3><UserPlus size={16}/> Cadastrar cliente</h3>
              <button className={ap.modalClose} onClick={() => setNewClientModal(false)}><X size={18}/></button>
            </div>
            <div className={ap.modalBody}>
              <div className={ap.formGrid}>
                <div className={`${ap.formGroup} ${ap.formGroupFull}`}>
                  <label><User size={12}/> Nome *</label>
                  <input className={ap.formInput} placeholder="Nome completo"
                    value={clientForm.name} autoFocus
                    onChange={e => setClientForm(p => ({ ...p, name: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && saveNewClient()}/>
                </div>
                <div className={ap.formGroup}>
                  <label>Telefone / WhatsApp</label>
                  <input className={ap.formInput} placeholder="(11) 99999-9999"
                    value={clientForm.phone}
                    onChange={e => setClientForm(p => ({ ...p, phone: e.target.value }))}/>
                </div>
                <div className={ap.formGroup}>
                  <label>E-mail</label>
                  <input className={ap.formInput} placeholder="email@exemplo.com" type="email"
                    value={clientForm.email}
                    onChange={e => setClientForm(p => ({ ...p, email: e.target.value }))}/>
                </div>
              </div>
            </div>
            <div className={ap.modalFooter}>
              <button className={s.btnGhost} onClick={() => setNewClientModal(false)}>Cancelar</button>
              <button className={s.btnPrimary} onClick={saveNewClient} disabled={clientSaving}>
                {clientSaving ? 'Salvando...' : 'Cadastrar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm delete ── */}
      {deleteId && (
        <div className={ap.overlay} onClick={() => setDeleteId(null)}>
          <div className={ap.confirmBox} onClick={e => e.stopPropagation()}>
            <Trash2 size={28} style={{color:'#dc2626',marginBottom:12}}/>
            <h3>Excluir atendimento?</h3>
            <p>Esta ação não pode ser desfeita.</p>
            <div className={ap.confirmActions}>
              <button className={s.btnGhost} onClick={() => setDeleteId(null)}>Cancelar</button>
              <button className={ap.btnDanger} onClick={() => deleteAppt(deleteId)}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </BasePage>
  );
}
