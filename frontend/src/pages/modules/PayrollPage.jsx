import React, { useState, useEffect, useCallback } from 'react';
import BasePage from './BasePage';
import s from './shared.module.css';
import { CreditCard, Plus, X, Edit2, CheckCircle } from 'lucide-react';
import funcionarioService from '../../services/funcionarioService';
import transacaoService   from '../../services/transacaoService';

function initials(name) { return name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase(); }

const EMPTY_FORM = { prof: '', type: 'Comissão', ref: '', value: '', status: 'pending' };

export default function PayrollPage() {
  const [period, setPeriod]       = useState('month');
  const [profs, setProfs]         = useState([]);
  const [pagamentos, setPagamentos] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editPag, setEditPag]     = useState(null);   // pagamento sendo editado
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  const load = useCallback(() => {
    setLoading(true);
    Promise.allSettled([
      funcionarioService.listar(),
      transacaoService.listar({ period, tipo: 'comissao' }),
    ]).then(([r1, r2]) => {
      setProfs(r1.status === 'fulfilled' ? r1.value : []);
      setPagamentos(r2.status === 'fulfilled' ? r2.value : []);
    }).finally(() => setLoading(false));
  }, [period]);

  useEffect(() => { load(); }, [load]);

  const profCards = profs.filter(p => p.status === 'active').map(p => {
    const commValue = p.thisMonth.commissionValue;
    // quanto já foi pago para este profissional no período
    const pago = pagamentos
      .filter(pg => pg.status === 'confirmed' && pg.desc.includes(p.name))
      .reduce((a, pg) => a + pg.value, 0);
    return {
      ...p,
      services:  p.thisMonth.services,
      revenue:   p.thisMonth.revenue,
      commValue,
      pago,
      saldo: Math.max(0, commValue - pago),
    };
  });

  // Total de comissões ganhas pelos profissionais (acumulado no banco)
  const totalComissoesGanhas = profCards.reduce((a, p) => a + p.commValue, 0);
  // Total já pago (transações de comissão confirmadas no período)
  const totalPaid    = pagamentos.filter(p => p.status === 'confirmed').reduce((a, p) => a + p.value, 0);
  // A pagar = total ganho − total já pago (nunca negativo)
  const totalPending = Math.max(0, totalComissoesGanhas - totalPaid);
  const totalServicos = profCards.reduce((a, p) => a + p.services, 0);

  // ── Abrir modal novo ──
  function openNew() {
    setEditPag(null);
    setForm({ ...EMPTY_FORM, prof: profs[0]?.name || '' });
    setError('');
    setShowModal(true);
  }

  // ── Abrir modal editar ──
  function openEdit(pag) {
    setEditPag(pag);
    setForm({
      prof:   pag.desc,
      type:   'Comissão',
      ref:    pag.date,
      value:  String(pag.value),
      status: pag.status === 'confirmed' ? 'paid' : 'pending',
    });
    setError('');
    setShowModal(true);
  }

  // ── Marcar como pago direto (sem abrir modal) ──
  async function markAsPaid(pag) {
    try {
      await transacaoService.atualizar(pag.id, {
        ...pag,
        status: 'confirmed',
        type:   'out',
        tipoRaw:'comissao',
        desc:    pag.desc,
        value:   pag.value,
        category:'Remuneração',
        dateISO: pag.dateISO,
      });
      load();
    } catch (e) {
      console.error(e);
    }
  }

  // ── Salvar (novo ou edição) ──
  async function save() {
    if (!form.prof)  return setError('Selecione o profissional.');
    if (!form.value) return setError('Informe o valor.');
    setSaving(true); setError('');
    try {
      const payload = {
        type:     'out',
        tipoRaw:  'comissao',
        desc:     `${form.type} – ${form.prof}${form.ref ? ` (${form.ref})` : ''}`,
        category: 'Remuneração',
        value:    form.value,
        status:   form.status === 'paid' ? 'confirmed' : 'pending',
        dateISO:  new Date().toISOString().substring(0, 10),
      };

      if (editPag) {
        await transacaoService.atualizar(editPag.id, payload);
      } else {
        await transacaoService.criar(payload);
      }
      setShowModal(false);
      load();
    } catch (e) {
      setError(e?.response?.data?.error || 'Erro ao salvar.');
    } finally { setSaving(false); }
  }

  const f = (v) => (v || 0).toLocaleString('pt-BR');

  return (
    <BasePage title="Remunerações" description="Comissões, bônus e pagamentos da equipe" icon={CreditCard}>
      <div className={s.page}>

        {/* Stats */}
        <div className={s.statsStrip}>
          <div className={s.statBox}>
            <span className={s.statLabel}>Total pago</span>
            <span className={s.statValue}>R$ {f(totalPaid)}</span>
          </div>
          <div className={s.statBox}>
            <span className={s.statLabel}>A pagar</span>
            <span className={s.statValue} style={{color:'#f59e0b'}}>R$ {f(totalPending)}</span>
          </div>
          <div className={s.statBox}>
            <span className={s.statLabel}>Profissionais ativos</span>
            <span className={s.statValue}>{profCards.length}</span>
          </div>
          <div className={s.statBox}>
            <span className={s.statLabel}>Serviços realizados</span>
            <span className={s.statValue}>{totalServicos}</span>
          </div>
        </div>

        {/* Cards por profissional */}
        {loading ? (
          <div className={s.emptyState}><p>Carregando...</p></div>
        ) : profCards.length === 0 ? (
          <div className={s.card} style={{padding:32}}>
            <div className={s.emptyState}>
              <CreditCard size={40} style={{opacity:0.3,marginBottom:8}}/>
              <p>Nenhum profissional ativo cadastrado.</p>
            </div>
          </div>
        ) : (
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:12}}>
            {profCards.map(p => {
              const pgPct = p.commValue > 0 ? Math.min(100, Math.round(p.pago / p.commValue * 100)) : 0;
              const quitado = p.saldo === 0 && p.commValue > 0;
              return (
                <div key={p.id} className={s.card} style={{padding:16}}>

                  {/* Cabeçalho */}
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
                    <div className={s.avatar} style={{background:p.color,width:36,height:36,fontSize:13}}>
                      {initials(p.name)}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:14,color:'var(--text-primary)'}}>{p.name}</div>
                      <div style={{fontSize:12,color:'var(--text-secondary)'}}>{p.role}</div>
                    </div>
                    {quitado && (
                      <span style={{fontSize:10,fontWeight:700,color:'#22c55e',background:'rgba(34,197,94,0.1)',
                        border:'1px solid rgba(34,197,94,0.25)',borderRadius:20,padding:'2px 8px'}}>
                        Quitado
                      </span>
                    )}
                  </div>

                  {/* Atendimentos + Faturado */}
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
                    <div>
                      <div style={{fontSize:11,color:'var(--text-secondary)'}}>Atendimentos</div>
                      <div style={{fontSize:16,fontWeight:700}}>{p.services}</div>
                    </div>
                    <div>
                      <div style={{fontSize:11,color:'var(--text-secondary)'}}>Faturado</div>
                      <div style={{fontSize:16,fontWeight:700}}>R$ {f(p.revenue)}</div>
                    </div>
                  </div>

                  {/* Comissão gerada */}
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:6}}>
                    <span style={{color:'var(--text-secondary)'}}>Comissão {p.commission}%</span>
                    <span style={{fontWeight:600}}>R$ {f(p.commValue)}</span>
                  </div>

                  {/* Barra de progresso de pagamento */}
                  <div style={{marginBottom:10}}>
                    <div className={s.progressBar}>
                      <div className={s.progressFill} style={{
                        width:`${pgPct}%`,
                        background: quitado ? '#22c55e' : p.color,
                        transition:'width 0.4s ease'
                      }}/>
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:10,
                      color:'var(--text-secondary)',marginTop:3}}>
                      <span>{pgPct}% pago</span>
                      <span>{100 - pgPct}% pendente</span>
                    </div>
                  </div>

                  {/* Breakdown pago / a pagar */}
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,
                    padding:'10px 0 0',borderTop:'1px solid var(--border)'}}>
                    <div>
                      <div style={{fontSize:11,color:'var(--text-secondary)'}}>Já pago</div>
                      <div style={{fontSize:14,fontWeight:700,color:'#22c55e'}}>R$ {f(p.pago)}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:11,color:'var(--text-secondary)'}}>Saldo devedor</div>
                      <div style={{fontSize:14,fontWeight:700,color: p.saldo > 0 ? '#e8185a' : '#22c55e'}}>
                        R$ {f(p.saldo)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Histórico de pagamentos */}
        <div className={s.card}>
          <div className={s.cardHeader}>
            <span className={s.cardTitle}>Histórico de pagamentos</span>
            <div className={s.toolbarRight}>
              <select className={s.select} value={period} onChange={e => setPeriod(e.target.value)}>
                <option value="week">Esta semana</option>
                <option value="month">Este mês</option>
              </select>
              <button className={s.btnPrimary} onClick={openNew}><Plus size={15}/> Lançar pagamento</button>
            </div>
          </div>

          {pagamentos.length === 0 ? (
            <div className={s.emptyState}>
              <p>Nenhum pagamento lançado no período.</p>
            </div>
          ) : (
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Profissional</th>
                  <th>Referência</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pagamentos.map(pag => (
                  <tr key={pag.id}>
                    <td style={{fontWeight:500}}>{pag.desc}</td>
                    <td style={{color:'var(--text-secondary)'}}>{pag.date}</td>
                    <td style={{fontWeight:600}}>R$ {f(pag.value)}</td>
                    <td>
                      <span className={`${s.badge} ${pag.status === 'confirmed' ? s.badgeGreen : s.badgeYellow}`}>
                        {pag.status === 'confirmed' ? 'Pago' : 'Pendente'}
                      </span>
                    </td>
                    <td>
                      <div style={{display:'flex',gap:6,justifyContent:'flex-end'}}>
                        {pag.status !== 'confirmed' && (
                          <button
                            title="Marcar como pago"
                            onClick={() => markAsPaid(pag)}
                            style={{display:'flex',alignItems:'center',gap:4,fontSize:12,fontWeight:600,
                              color:'#22c55e',background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.25)',
                              borderRadius:6,padding:'4px 10px',cursor:'pointer',fontFamily:'inherit'}}>
                            <CheckCircle size={13}/> Pago
                          </button>
                        )}
                        <button
                          title="Editar"
                          onClick={() => openEdit(pag)}
                          style={{display:'flex',alignItems:'center',justifyContent:'center',
                            width:28,height:28,borderRadius:6,border:'1px solid var(--border)',
                            background:'transparent',cursor:'pointer',color:'var(--text-secondary)'}}>
                          <Edit2 size={13}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Modal novo / editar ── */}
      {showModal && (
        <div className={s.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={s.modal} onClick={e => e.stopPropagation()} style={{maxWidth:440}}>
            <div className={s.modalHeader}>
              <h3 className={s.modalTitle}>{editPag ? 'Editar pagamento' : 'Lançar pagamento'}</h3>
              <button className={s.modalClose} onClick={() => setShowModal(false)}><X size={18}/></button>
            </div>
            <div style={{padding:'16px 24px 0'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>

                {/* Profissional (só no novo) */}
                {!editPag && (
                  <div className={s.formGroup} style={{gridColumn:'1/-1'}}>
                    <label className={s.label}>Profissional *</label>
                    <select className={s.select} value={form.prof}
                      onChange={e => setForm(f => ({...f, prof: e.target.value}))} style={{width:'100%'}}>
                      <option value="">Selecione...</option>
                      {profs.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                    </select>
                  </div>
                )}

                {/* Tipo */}
                <div className={s.formGroup}>
                  <label className={s.label}>Tipo</label>
                  <select className={s.select} value={form.type}
                    onChange={e => setForm(f => ({...f, type: e.target.value}))} style={{width:'100%'}}>
                    <option>Comissão</option>
                    <option>Bônus</option>
                    <option>Adiantamento</option>
                  </select>
                </div>

                {/* Valor */}
                <div className={s.formGroup}>
                  <label className={s.label}>Valor (R$) *</label>
                  <input className={s.inputBase} type="number" min={0} value={form.value}
                    onChange={e => setForm(f => ({...f, value: e.target.value}))}
                    placeholder="0" style={{width:'100%',boxSizing:'border-box'}}/>
                </div>

                {/* Referência */}
                <div className={s.formGroup} style={{gridColumn:'1/-1'}}>
                  <label className={s.label}>Referência</label>
                  <input className={s.inputBase} value={form.ref}
                    onChange={e => setForm(f => ({...f, ref: e.target.value}))}
                    placeholder="Ex: Semana 21/04" style={{width:'100%',boxSizing:'border-box'}}/>
                </div>

                {/* Status */}
                <div className={s.formGroup} style={{gridColumn:'1/-1'}}>
                  <label className={s.label}>Status</label>
                  <select className={s.select} value={form.status}
                    onChange={e => setForm(f => ({...f, status: e.target.value}))} style={{width:'100%'}}>
                    <option value="pending">Pendente</option>
                    <option value="paid">Pago</option>
                  </select>
                </div>
              </div>

              {error && <p style={{color:'#ff3b30',fontSize:13,marginBottom:8}}>{error}</p>}
            </div>
            <div className={s.modalFooter}>
              <button className={s.btnSecondary} onClick={() => setShowModal(false)}>Cancelar</button>
              <button className={s.btnPrimary} onClick={save} disabled={saving}>
                {saving ? 'Salvando...' : editPag ? 'Salvar alterações' : 'Lançar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </BasePage>
  );
}
