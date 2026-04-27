import React, { useState, useEffect, useCallback } from 'react';
import s from './admin.module.css';
import { Search, X, ChevronRight, Pause, Play, Edit2, Building2 } from 'lucide-react';
import adminService from '../../services/adminService';

const PLAN_LABEL  = { starter: 'Starter', pro: 'Pro', enterprise: 'Enterprise' };
const PLAN_CLS    = { starter: 'planStarter', pro: 'planPro', enterprise: 'planEnterprise' };
const STATUS_CFG  = {
  ativo:     { label: 'Ativo',     cls: 'badgeGreen'  },
  trial:     { label: 'Trial',     cls: 'badgeBlue'   },
  suspenso:  { label: 'Suspenso',  cls: 'badgeRed'    },
  cancelado: { label: 'Cancelado', cls: 'badgeGray'   },
};
const TIPO_LABEL  = { salao:'Salão', barbearia:'Barbearia', studio:'Studio', spa:'Spa', outro:'Outro' };

function initials(name = '') { return name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase(); }
function hslColor(str) {
  let h = 0; for (const c of str) h = c.charCodeAt(0) + ((h<<5)-h);
  return `hsl(${Math.abs(h)%360},60%,50%)`;
}

const EMPTY_EDIT = { plano: 'starter', planoStatus: 'trial', nomeEmpresa: '', telefone: '' };

export default function AdminTenants() {
  const [tenants,   setTenants]   = useState([]);
  const [total,     setTotal]     = useState(0);
  const [paginas,   setPaginas]   = useState(1);
  const [pagina,    setPagina]    = useState(1);
  const [loading,   setLoading]   = useState(true);
  const [busca,     setBusca]     = useState('');
  const [planoF,    setPlanoF]    = useState('');
  const [statusF,   setStatusF]   = useState('');
  const [selected,  setSelected]  = useState(null);
  const [editMode,  setEditMode]  = useState(false);
  const [editForm,  setEditForm]  = useState(EMPTY_EDIT);
  const [saving,    setSaving]    = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    adminService.listarTenants({ busca, plano: planoF, status: statusF, pagina, limite: 15 })
      .then(r => { setTenants(r.tenants || []); setTotal(r.total || 0); setPaginas(r.paginas || 1); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [busca, planoF, statusF, pagina]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPagina(1); }, [busca, planoF, statusF]);

  function openEdit(t) {
    setEditForm({ plano: t.plano, planoStatus: t.planoStatus, nomeEmpresa: t.nomeEmpresa, telefone: t.telefone || '' });
    setEditMode(true);
  }

  async function saveEdit() {
    setSaving(true);
    try {
      await adminService.atualizarTenant(selected._id, editForm);
      setEditMode(false);
      load();
      // Refresh selected
      const updated = await adminService.obterTenant(selected._id);
      setSelected(updated);
    } catch {}
    setSaving(false);
  }

  async function toggleSuspend(t) {
    if (t.ativo) {
      if (!window.confirm(`Suspender ${t.nomeEmpresa || t.nome}?`)) return;
      await adminService.suspenderTenant(t._id).catch(() => {});
    } else {
      await adminService.reativarTenant(t._id).catch(() => {});
    }
    load();
    if (selected?._id === t._id) {
      const updated = await adminService.obterTenant(t._id).catch(() => null);
      if (updated) setSelected(updated);
    }
  }

  const t = selected;

  return (
    <div style={{display:'grid', gridTemplateColumns: t ? '1fr 340px' : '1fr', gap:20, alignItems:'start'}}>
      {/* List */}
      <div>
        {/* Toolbar */}
        <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap'}}>
          <div className={s.searchWrap}>
            <Search size={14}/>
            <input className={`${s.inputBase} ${s.searchInput}`} placeholder="Buscar empresa, email..."
              value={busca} onChange={e => setBusca(e.target.value)}/>
          </div>
          <select className={s.selectBase} value={planoF} onChange={e => setPlanoF(e.target.value)} style={{width:120}}>
            <option value="">Todos planos</option>
            <option value="starter">Starter</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <select className={s.selectBase} value={statusF} onChange={e => setStatusF(e.target.value)} style={{width:120}}>
            <option value="">Todos status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
          <span style={{fontSize:13,color:'#8892a4',marginLeft:'auto',alignSelf:'center'}}>{total} empresa{total!==1?'s':''}</span>
        </div>

        <div className={s.card}>
          {loading ? (
            <div className={s.emptyState}><p>Carregando...</p></div>
          ) : tenants.length === 0 ? (
            <div className={s.emptyState}><Building2 size={36} style={{opacity:.25,marginBottom:8}}/><p>Nenhuma empresa encontrada.</p></div>
          ) : (
            <table className={s.table}>
              <thead>
                <tr><th>Empresa</th><th>Plano</th><th>Status</th><th>Uso</th><th>Acesso</th><th></th></tr>
              </thead>
              <tbody>
                {tenants.map(ten => {
                  const st  = STATUS_CFG[ten.planoStatus] || STATUS_CFG.trial;
                  const uso = ten.uso || {};
                  const lastAccess = ten.ultimoAcesso
                    ? new Date(ten.ultimoAcesso).toLocaleDateString('pt-BR')
                    : '—';
                  return (
                    <tr key={ten._id} style={{cursor:'pointer'}} onClick={() => setSelected(ten)}>
                      <td>
                        <div className={s.avatarRow}>
                          <div className={s.avatar} style={{background: hslColor(ten.nomeEmpresa||ten.nome||'?')}}>
                            {initials(ten.nomeEmpresa || ten.nome)}
                          </div>
                          <div>
                            <div style={{fontWeight:700,fontSize:13}}>{ten.nomeEmpresa || ten.nome}</div>
                            <div style={{fontSize:11,color:'#8892a4'}}>{ten.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`${s.badge} ${s[PLAN_CLS[ten.plano] || 'planStarter']}`}>
                          {PLAN_LABEL[ten.plano] || 'Starter'}
                        </span>
                      </td>
                      <td><span className={`${s.badge} ${s[st.cls]}`}>{st.label}</span></td>
                      <td style={{fontSize:12,color:'#6b7280'}}>
                        <div>{uso.clientes || 0} clientes</div>
                        <div>{uso.funcionarios || 0} profis.</div>
                      </td>
                      <td style={{fontSize:12,color:'#8892a4'}}>{lastAccess}</td>
                      <td onClick={e => e.stopPropagation()}>
                        <div style={{display:'flex',gap:4}}>
                          <button className={s.btnGhost} onClick={() => { setSelected(ten); openEdit(ten); }} title="Editar"><Edit2 size={12}/></button>
                          <button className={ten.ativo ? s.btnDanger : s.btnSuccess} onClick={() => toggleSuspend(ten)}>
                            {ten.ativo ? <><Pause size={11}/> Suspender</> : <><Play size={11}/> Reativar</>}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {/* Pagination */}
          {paginas > 1 && (
            <div style={{display:'flex',alignItems:'center',justifyContent:'flex-end',gap:8,padding:'12px 16px',borderTop:'1px solid #edf0f7'}}>
              <button className={s.btnGhost} disabled={pagina<=1} onClick={() => setPagina(p=>p-1)}>Anterior</button>
              <span style={{fontSize:13,color:'#6b7280'}}>{pagina}/{paginas}</span>
              <button className={s.btnGhost} disabled={pagina>=paginas} onClick={() => setPagina(p=>p+1)}>Próxima</button>
            </div>
          )}
        </div>
      </div>

      {/* Detail pane */}
      {t && (
        <div className={s.card} style={{position:'sticky',top:20}}>
          <div className={s.cardHeader}>
            <div className={s.cardTitle}>{t.nomeEmpresa || t.nome}</div>
            <button className={s.modalClose} onClick={() => setSelected(null)}><X size={14}/></button>
          </div>
          <div style={{padding:'16px 20px'}}>
            {editMode ? (
              <>
                <div className={s.formGroup} style={{marginBottom:10}}>
                  <label className={s.label}>Nome da empresa</label>
                  <input className={s.inputBase} value={editForm.nomeEmpresa} onChange={e => setEditForm(f=>({...f,nomeEmpresa:e.target.value}))}/>
                </div>
                <div className={s.formGroup} style={{marginBottom:10}}>
                  <label className={s.label}>Telefone</label>
                  <input className={s.inputBase} value={editForm.telefone} onChange={e => setEditForm(f=>({...f,telefone:e.target.value}))}/>
                </div>
                <div className={s.formGroup} style={{marginBottom:10}}>
                  <label className={s.label}>Plano</label>
                  <select className={s.selectBase} value={editForm.plano} onChange={e => setEditForm(f=>({...f,plano:e.target.value}))} style={{width:'100%'}}>
                    <option value="starter">Starter</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div className={s.formGroup} style={{marginBottom:16}}>
                  <label className={s.label}>Status</label>
                  <select className={s.selectBase} value={editForm.planoStatus} onChange={e => setEditForm(f=>({...f,planoStatus:e.target.value}))} style={{width:'100%'}}>
                    <option value="trial">Trial</option>
                    <option value="ativo">Ativo</option>
                    <option value="suspenso">Suspenso</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button className={s.btnSecondary} onClick={() => setEditMode(false)} style={{flex:1}}>Cancelar</button>
                  <button className={s.btnPrimary} onClick={saveEdit} disabled={saving} style={{flex:1}}>{saving?'Salvando...':'Salvar'}</button>
                </div>
              </>
            ) : (
              <>
                {/* Info rows */}
                {[
                  ['Email',    t.email],
                  ['Telefone', t.telefone || '—'],
                  ['Cadastro', t.createdAt ? new Date(t.createdAt).toLocaleDateString('pt-BR') : '—'],
                  ['Último acesso', t.ultimoAcesso ? new Date(t.ultimoAcesso).toLocaleDateString('pt-BR') : '—'],
                  ['Tipo',     TIPO_LABEL[t.metadados?.tipoNegocio] || 'Salão'],
                ].map(([k,v]) => (
                  <div className={s.metricRow} key={k}>
                    <span className={s.metricKey}>{k}</span>
                    <span className={s.metricVal} style={{fontSize:13}}>{v}</span>
                  </div>
                ))}

                {/* Usage */}
                {t.uso && (
                  <div style={{marginTop:16}}>
                    <div style={{fontSize:12,fontWeight:700,color:'#8892a4',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:10}}>Uso atual</div>
                    {[
                      ['Clientes',      t.uso.clientes,     200],
                      ['Profissionais', t.uso.funcionarios, 10],
                      ['Agendamentos',  t.uso.agendamentos, 999],
                    ].map(([label, val, max]) => (
                      <div className={s.usageRow} key={label} style={{marginBottom:8}}>
                        <span className={s.usageLabel}>{label}</span>
                        <div className={s.usageBar}><div className={s.usageFill} style={{width:`${Math.min(100,(val/max)*100)}%`}}/></div>
                        <span className={s.usageCount}>{val}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button className={s.btnGhost} onClick={() => openEdit(t)} style={{width:'100%',marginTop:16,justifyContent:'center'}}>
                  <Edit2 size={12}/> Editar tenant
                </button>
                <button
                  className={t.ativo ? s.btnDanger : s.btnSuccess}
                  onClick={() => toggleSuspend(t)}
                  style={{width:'100%',marginTop:8,justifyContent:'center'}}
                >
                  {t.ativo ? <><Pause size={12}/> Suspender acesso</> : <><Play size={12}/> Reativar acesso</>}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
