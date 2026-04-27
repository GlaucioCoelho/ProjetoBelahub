import React, { useState, useEffect } from 'react';
import BasePage from './BasePage';
import s from './shared.module.css';
import cs from './ClientsPage.module.css';
import {
  Users, Search, Plus, X, Phone, Mail, MapPin,
  Calendar, Star, Edit2, Trash2, ChevronRight,
  AtSign, MessageCircle, Crown, Clock, Scissors,
  User, CreditCard, FileText, DollarSign
} from 'lucide-react';
import clienteService    from '../../services/clienteService';
import agendamentoService from '../../services/agendamentoService';
import funcionarioService from '../../services/funcionarioService';
import servicoService     from '../../services/servicoService';

const EMPTY_FORM = {
  name: '', phone: '', email: '', city: '', bday: '', note: '', instagram: '', tag: 'regular',
};

const EMPTY_APPT_FORM = {
  date: new Date().toISOString().substring(0, 10),
  time: '09:00', service: '', duration: 60, price: 0,
  profId: '', payment: 'Pix', status: 'scheduled', note: '',
};

const TAG_CFG = {
  vip:     { label: 'VIP',     cls: 'tagVip'     },
  regular: { label: 'Regular', cls: 'tagRegular' },
  new:     { label: 'Novo',    cls: 'tagNew'     },
};

const PAYMENT_OPTS = ['Pix', 'Cartão', 'Dinheiro', 'Transferência'];

const STATUS_APPT = {
  scheduled: 'Agendado',
  waiting:   'Aguardando',
  completed: 'Concluído',
  canceled:  'Cancelado',
};

export default function ClientsPage() {
  const [clients,       setClients]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState('');
  const [tagFilter,     setTagFilter]     = useState('all');
  const [selected,      setSelected]      = useState(null);
  const [modalOpen,     setModalOpen]     = useState(false);
  const [editClient,    setEditClient]    = useState(null);
  const [form,          setForm]          = useState(EMPTY_FORM);
  const [deleteId,      setDeleteId]      = useState(null);

  // — Agendamento modal —
  const [apptModal,     setApptModal]     = useState(false);
  const [apptForm,      setApptForm]      = useState(EMPTY_APPT_FORM);
  const [professionals, setProfessionals] = useState([]);
  const [servicesData,  setServicesData]  = useState([]);
  const [apptSaving,    setApptSaving]    = useState(false);

  useEffect(() => {
    clienteService.listar()
      .then(setClients)
      .catch(console.error)
      .finally(() => setLoading(false));

    funcionarioService.listar()
      .then(data => setProfessionals(
        data.filter(f => f.status === 'active').map(f => ({
          id:       f.name,
          name:     f.name,
          role:     f.role,
          color:    f.color,
          initials: f.initials,
        }))
      ))
      .catch(console.error);

    servicoService.listar({ ativo: true, limite: 200 })
      .then(setServicesData)
      .catch(console.error);
  }, []);

  // ── Filtered list ──
  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = c.name.toLowerCase().includes(q) ||
                        c.phone.includes(q) ||
                        c.email.toLowerCase().includes(q);
    const matchTag = tagFilter === 'all' || c.tag === tagFilter;
    return matchSearch && matchTag;
  });

  // ── Stats ──
  const total    = clients.length;
  const vips     = clients.filter(c => c.tag === 'vip').length;
  const newOnes  = clients.filter(c => c.tag === 'new').length;
  const avgSpent = clients.length > 0
    ? Math.round(clients.reduce((a, c) => a + (c.spent || 0), 0) / clients.length)
    : 0;

  // ── Open modal cliente ──
  const openNew = () => { setEditClient(null); setForm(EMPTY_FORM); setModalOpen(true); };

  const openEdit = (c) => {
    setEditClient(c);
    setForm({ name: c.name, phone: c.phone, email: c.email, city: c.city,
              bday: c.bday, note: c.note, instagram: c.instagram || '', tag: c.tag });
    setModalOpen(true);
  };

  // ── Open modal agendamento ──
  const openSchedule = (client) => {
    setApptForm({
      ...EMPTY_APPT_FORM,
      date:     new Date().toISOString().substring(0, 10),
      client:   client.name,
      clientId: client.id,
      profId:   professionals[0]?.id || '',
    });
    setApptModal(true);
  };

  // ── Save cliente ──
  const save = async () => {
    if (!form.name.trim()) return;
    try {
      if (editClient) {
        const saved = await clienteService.atualizar(editClient.id, form);
        setClients(prev => prev.map(c => c.id === saved.id ? saved : c));
        if (selected?.id === editClient.id) setSelected(saved);
      } else {
        const saved = await clienteService.criar(form);
        setClients(prev => [...prev, saved]);
      }
    } catch (err) { console.error(err); }
    setModalOpen(false);
  };

  // ── Save agendamento ──
  const saveAppt = async () => {
    if (!apptForm.time) return;
    setApptSaving(true);
    try {
      await agendamentoService.criar({
        ...apptForm,
        date: apptForm.date,
      });
      setApptModal(false);
    } catch (err) { console.error(err); }
    finally { setApptSaving(false); }
  };

  // ── Delete ──
  const confirmDelete = async (id) => {
    try {
      await clienteService.deletar(id);
      setClients(prev => prev.filter(c => c.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (err) { console.error(err); }
    setDeleteId(null);
  };

  return (
    <BasePage title="Clientes" description="Cadastro e histórico de clientes" icon={Users}>
      <div className={s.page}>

        {/* Stats */}
        <div className={s.statsStrip}>
          <div className={s.statBox}>
            <span className={s.statLabel}>Total de clientes</span>
            <span className={s.statValue}>{total}</span>
          </div>
          <div className={s.statBox}>
            <span className={s.statLabel}>Clientes VIP</span>
            <span className={s.statValue} style={{ color: '#f59e0b' }}>{vips}</span>
          </div>
          <div className={s.statBox}>
            <span className={s.statLabel}>Novos clientes</span>
            <span className={s.statValue} style={{ color: '#7c3aed' }}>{newOnes}</span>
          </div>
          <div className={s.statBox}>
            <span className={s.statLabel}>Ticket médio</span>
            <span className={s.statValue}>R$ {avgSpent.toLocaleString('pt-BR')}</span>
          </div>
        </div>

        {/* Main layout */}
        <div className={cs.layout}>

          {/* ── Left: list ── */}
          <div className={cs.listPane}>
            <div className={cs.listToolbar}>
              <div className={s.searchWrap} style={{ flex: 1 }}>
                <Search size={14}/>
                <input
                  className={`${s.inputBase} ${s.searchInput}`}
                  style={{ width: '100%' }}
                  placeholder="Buscar por nome, telefone..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className={cs.tagFilters}>
                {[['all','Todos'],['vip','VIP'],['regular','Regular'],['new','Novo']].map(([v,l]) => (
                  <button key={v}
                    className={`${cs.tagBtn} ${tagFilter === v ? cs.tagBtnActive : ''}`}
                    onClick={() => setTagFilter(v)}
                  >{l}</button>
                ))}
              </div>
              <button className={s.btnPrimary} onClick={openNew}>
                <Plus size={15}/> Novo cliente
              </button>
            </div>

            <div className={cs.clientList}>
              {loading && clients.length === 0 && (
                <div className={cs.empty}>Carregando...</div>
              )}
              {!loading && filtered.length === 0 && (
                <div className={cs.empty}>Nenhum cliente encontrado</div>
              )}
              {filtered.map(c => (
                <div key={c.id}
                  className={`${cs.clientCard} ${selected?.id === c.id ? cs.clientCardActive : ''}`}
                  onClick={() => setSelected(c)}
                >
                  <div className={cs.clientAvatar} style={{ background: c.color }}>{c.initials}</div>
                  <div className={cs.clientInfo}>
                    <div className={cs.clientName}>
                      {c.name}
                      {c.tag === 'vip' && <Crown size={12} className={cs.crownIcon}/>}
                    </div>
                    <div className={cs.clientMeta}><Phone size={11}/> {c.phone}</div>
                    <div className={cs.clientMeta}><Calendar size={11}/> Última visita: {c.lastVisit}</div>
                  </div>
                  <div className={cs.clientRight}>
                    <span className={`${cs.tag} ${cs[TAG_CFG[c.tag].cls]}`}>{TAG_CFG[c.tag].label}</span>
                    <div className={cs.clientSpent}>R$ {c.spent.toLocaleString('pt-BR')}</div>
                    <ChevronRight size={14} className={cs.chevron}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: detail panel ── */}
          {selected ? (
            <div className={cs.detailPane}>
              <div className={cs.detailHeader}>
                <div className={cs.detailAvatarWrap}>
                  <div className={cs.detailAvatar} style={{ background: selected.color }}>
                    {selected.initials}
                  </div>
                  {selected.tag === 'vip' && (
                    <div className={cs.vipBadge}><Crown size={12}/> VIP</div>
                  )}
                </div>
                <div className={cs.detailMeta}>
                  <h2 className={cs.detailName}>{selected.name}</h2>
                  <span className={`${cs.tag} ${cs[TAG_CFG[selected.tag].cls]}`}>
                    {TAG_CFG[selected.tag].label}
                  </span>
                </div>
                <div className={cs.detailActions}>
                  <button className={cs.iconBtn} onClick={() => openEdit(selected)} title="Editar">
                    <Edit2 size={15}/>
                  </button>
                  <button className={`${cs.iconBtn} ${cs.iconBtnDanger}`}
                    onClick={() => setDeleteId(selected.id)} title="Excluir">
                    <Trash2 size={15}/>
                  </button>
                </div>
              </div>

              {/* Stats row */}
              <div className={cs.detailStats}>
                <div className={cs.detailStat}>
                  <span className={cs.detailStatVal}>{selected.visits}</span>
                  <span className={cs.detailStatLbl}>Visitas</span>
                </div>
                <div className={cs.detailStat}>
                  <span className={cs.detailStatVal}>R$ {selected.spent.toLocaleString('pt-BR')}</span>
                  <span className={cs.detailStatLbl}>Total gasto</span>
                </div>
                <div className={cs.detailStat}>
                  <span className={cs.detailStatVal}>
                    R$ {selected.visits > 0 ? Math.round(selected.spent / selected.visits).toLocaleString('pt-BR') : '—'}
                  </span>
                  <span className={cs.detailStatLbl}>Ticket médio</span>
                </div>
              </div>

              {/* Contact */}
              <div className={cs.detailSection}>
                <div className={cs.detailSectionTitle}>Contato</div>
                <div className={cs.detailRow}><Phone size={14}/> {selected.phone}</div>
                <div className={cs.detailRow}><Mail size={14}/> {selected.email || '—'}</div>
                <div className={cs.detailRow}><MapPin size={14}/> {selected.city || '—'}</div>
                {selected.instagram && (
                  <div className={cs.detailRow}><AtSign size={14}/> {selected.instagram}</div>
                )}
              </div>

              {/* Dates */}
              <div className={cs.detailSection}>
                <div className={cs.detailSectionTitle}>Datas</div>
                <div className={cs.detailRow}>
                  <Calendar size={14}/>
                  Aniversário: {selected.bday
                    ? new Date(selected.bday + 'T00:00:00').toLocaleDateString('pt-BR')
                    : '—'}
                </div>
                <div className={cs.detailRow}>
                  <Star size={14}/>
                  Cliente desde: {new Date(selected.since + 'T00:00:00').toLocaleDateString('pt-BR')}
                </div>
                <div className={cs.detailRow}>
                  <MessageCircle size={14}/>
                  Última visita: {selected.lastVisit}
                </div>
              </div>

              {/* Note */}
              {selected.note && (
                <div className={cs.detailSection}>
                  <div className={cs.detailSectionTitle}>Observações</div>
                  <p className={cs.detailNote}>{selected.note}</p>
                </div>
              )}

              {/* Quick actions */}
              <div className={cs.detailQuickActions}>
                <button className={cs.quickActionBtn}>
                  <Phone size={16}/> Ligar
                </button>
                <button className={cs.quickActionBtn} style={{ '--qc': '#25d366' }}>
                  <MessageCircle size={16}/> WhatsApp
                </button>
                <button
                  className={cs.quickActionBtn}
                  style={{ '--qc': '#7c3aed' }}
                  onClick={() => openSchedule(selected)}
                >
                  <Calendar size={16}/> Agendar
                </button>
              </div>
            </div>
          ) : (
            <div className={cs.detailEmpty}>
              <Users size={40} strokeWidth={1.2}/>
              <p>Selecione um cliente<br/>para ver os detalhes</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal: novo/editar cliente ── */}
      {modalOpen && (
        <div className={cs.modalOverlay} onClick={() => setModalOpen(false)}>
          <div className={cs.modal} onClick={e => e.stopPropagation()}>
            <div className={cs.modalHeader}>
              <h3>{editClient ? 'Editar cliente' : 'Novo cliente'}</h3>
              <button className={cs.modalClose} onClick={() => setModalOpen(false)}><X size={18}/></button>
            </div>
            <div className={cs.modalBody}>
              <div className={cs.formGrid}>
                <div className={cs.formGroup}>
                  <label>Nome completo *</label>
                  <input className={cs.formInput} placeholder="Ex: Fernanda Lima"
                    value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}/>
                </div>
                <div className={cs.formGroup}>
                  <label>Telefone / WhatsApp</label>
                  <input className={cs.formInput} placeholder="(11) 99999-9999"
                    value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}/>
                </div>
                <div className={cs.formGroup}>
                  <label>E-mail</label>
                  <input className={cs.formInput} placeholder="email@exemplo.com" type="email"
                    value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}/>
                </div>
                <div className={cs.formGroup}>
                  <label>Cidade</label>
                  <input className={cs.formInput} placeholder="São Paulo"
                    value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}/>
                </div>
                <div className={cs.formGroup}>
                  <label>Data de aniversário</label>
                  <input className={cs.formInput} type="date"
                    value={form.bday} onChange={e => setForm(p => ({ ...p, bday: e.target.value }))}/>
                </div>
                <div className={cs.formGroup}>
                  <label>Instagram</label>
                  <input className={cs.formInput} placeholder="@usuario"
                    value={form.instagram} onChange={e => setForm(p => ({ ...p, instagram: e.target.value }))}/>
                </div>
                <div className={cs.formGroup}>
                  <label>Classificação</label>
                  <select className={cs.formInput}
                    value={form.tag} onChange={e => setForm(p => ({ ...p, tag: e.target.value }))}>
                    <option value="new">Novo</option>
                    <option value="regular">Regular</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>
                <div className={`${cs.formGroup} ${cs.formGroupFull}`}>
                  <label>Observações</label>
                  <textarea className={cs.formTextarea} rows={3}
                    placeholder="Preferências, alergias, anotações..."
                    value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))}/>
                </div>
              </div>
            </div>
            <div className={cs.modalFooter}>
              <button className={s.btnGhost} onClick={() => setModalOpen(false)}>Cancelar</button>
              <button className={s.btnPrimary} onClick={save}>
                {editClient ? 'Salvar alterações' : 'Cadastrar cliente'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: agendamento ── */}
      {apptModal && (
        <div className={cs.modalOverlay} onClick={() => setApptModal(false)}>
          <div className={cs.modal} onClick={e => e.stopPropagation()}>
            <div className={cs.modalHeader}>
              <h3><Calendar size={16}/> Agendar — {apptForm.client}</h3>
              <button className={cs.modalClose} onClick={() => setApptModal(false)}><X size={18}/></button>
            </div>
            <div className={cs.modalBody}>
              <div className={cs.formGrid}>
                {/* Data */}
                <div className={cs.formGroup}>
                  <label><Calendar size={12}/> Data</label>
                  <input type="date" className={cs.formInput}
                    value={apptForm.date}
                    onChange={e => setApptForm(p => ({ ...p, date: e.target.value }))}/>
                </div>
                {/* Horário */}
                <div className={cs.formGroup}>
                  <label><Clock size={12}/> Horário</label>
                  <input type="time" className={cs.formInput}
                    value={apptForm.time}
                    onChange={e => setApptForm(p => ({ ...p, time: e.target.value }))}/>
                </div>
                {/* Serviço */}
                <div className={cs.formGroup}>
                  <label><Scissors size={12}/> Serviço</label>
                  <select className={cs.formInput} value={apptForm.service}
                    onChange={e => {
                      const svc = servicesData.find(sv => sv.nome === e.target.value) || {};
                      setApptForm(p => ({ ...p, service: e.target.value, duration: svc.duracao || 60, price: svc.preco || 0 }));
                    }}>
                    <option value="">Selecione o serviço</option>
                    {servicesData.map(sv => (
                      <option key={sv.id} value={sv.nome}>
                        {sv.nome} — R$ {Number(sv.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({sv.duracao}min)
                      </option>
                    ))}
                  </select>
                </div>
                {/* Profissional */}
                <div className={cs.formGroup}>
                  <label><User size={12}/> Profissional</label>
                  <select className={cs.formInput} value={apptForm.profId}
                    onChange={e => setApptForm(p => ({ ...p, profId: e.target.value }))}>
                    <option value="">Selecione o profissional</option>
                    {professionals.map(p => (
                      <option key={p.id} value={p.id}>{p.name} — {p.role}</option>
                    ))}
                  </select>
                </div>
                {/* Pagamento */}
                <div className={cs.formGroup}>
                  <label><CreditCard size={12}/> Pagamento</label>
                  <select className={cs.formInput} value={apptForm.payment}
                    onChange={e => setApptForm(p => ({ ...p, payment: e.target.value }))}>
                    {PAYMENT_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                {/* Status */}
                <div className={cs.formGroup}>
                  <label><DollarSign size={12}/> Status</label>
                  <select className={cs.formInput} value={apptForm.status}
                    onChange={e => setApptForm(p => ({ ...p, status: e.target.value }))}>
                    {Object.entries(STATUS_APPT).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                {/* Observações */}
                <div className={`${cs.formGroup} ${cs.formGroupFull}`}>
                  <label><FileText size={12}/> Observações</label>
                  <textarea className={cs.formTextarea} rows={2}
                    placeholder="Preferências, observações..."
                    value={apptForm.note}
                    onChange={e => setApptForm(p => ({ ...p, note: e.target.value }))}/>
                </div>
              </div>
              {/* Preview */}
              {apptForm.service && (
                <div className={cs.apptPreview}>
                  <span>Duração: <strong>{apptForm.duration}min</strong></span>
                  <span>Valor: <strong>R$ {Number(apptForm.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
                </div>
              )}
            </div>
            <div className={cs.modalFooter}>
              <button className={s.btnGhost} onClick={() => setApptModal(false)}>Cancelar</button>
              <button className={s.btnPrimary} onClick={saveAppt} disabled={apptSaving}>
                {apptSaving ? 'Salvando...' : 'Confirmar agendamento'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm delete ── */}
      {deleteId && (
        <div className={cs.modalOverlay} onClick={() => setDeleteId(null)}>
          <div className={cs.confirmBox} onClick={e => e.stopPropagation()}>
            <Trash2 size={28} style={{ color: '#dc2626', marginBottom: 12 }}/>
            <h3>Excluir cliente?</h3>
            <p>Esta ação não pode ser desfeita.</p>
            <div className={cs.confirmActions}>
              <button className={s.btnGhost} onClick={() => setDeleteId(null)}>Cancelar</button>
              <button className={cs.btnDanger} onClick={() => confirmDelete(deleteId)}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </BasePage>
  );
}
