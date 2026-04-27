import React, { useState, useEffect, useCallback } from 'react';
import s from './admin.module.css';
import { Plus, X, Check, Edit2, Trash2 } from 'lucide-react';
import adminService from '../../services/adminService';

const EMPTY = {
  nome: '', slug: '', preco: 0, precoAnual: 0, cor: '#7c3aed',
  descricao: '', destaque: false, ativo: true,
  limites: { funcionarios: 5, clientes: 200, agendamentosMes: 500 },
  recursos: [],
};

export default function AdminPlans() {
  const [planos,    setPlanos]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget,setEditTarget]= useState(null);
  const [form,      setForm]      = useState(EMPTY);
  const [recurso,   setRecurso]   = useState('');
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  const load = useCallback(() => {
    setLoading(true);
    adminService.listarPlanos()
      .then(setPlanos)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  function openNew() {
    setEditTarget(null);
    setForm({ ...EMPTY, limites: { ...EMPTY.limites }, recursos: [] });
    setRecurso(''); setError(''); setShowModal(true);
  }

  function openEdit(p) {
    setEditTarget(p._id);
    setForm({
      nome: p.nome, slug: p.slug, preco: p.preco, precoAnual: p.precoAnual || 0,
      cor: p.cor, descricao: p.descricao || '', destaque: p.destaque, ativo: p.ativo,
      limites: { ...p.limites },
      recursos: [...(p.recursos || [])],
    });
    setRecurso(''); setError(''); setShowModal(true);
  }

  function addRecurso() {
    if (!recurso.trim()) return;
    setForm(f => ({ ...f, recursos: [...f.recursos, recurso.trim()] }));
    setRecurso('');
  }

  async function save() {
    if (!form.nome.trim()) return setError('Nome é obrigatório.');
    if (!form.slug.trim()) return setError('Slug é obrigatório.');
    setSaving(true); setError('');
    try {
      if (editTarget) await adminService.atualizarPlano(editTarget, form);
      else             await adminService.criarPlano(form);
      setShowModal(false); load();
    } catch (e) {
      setError(e?.response?.data?.mensagem || 'Erro ao salvar.');
    } finally { setSaving(false); }
  }

  async function deletar(id) {
    if (!window.confirm('Excluir este plano?')) return;
    await adminService.deletarPlano(id).catch(() => {});
    load();
  }

  const PLAN_COLOR = { starter: '#6b7280', pro: '#7c3aed', enterprise: '#e8185a' };

  return (
    <div>
      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:16}}>
        <button className={s.btnPrimary} onClick={openNew}><Plus size={14}/> Novo plano</button>
      </div>

      {loading ? (
        <div className={s.emptyState}><p>Carregando...</p></div>
      ) : (
        <div className={s.threeCol}>
          {planos.map(p => (
            <div key={p._id} className={`${s.planCard} ${p.destaque ? s.planCardFeatured : ''}`}>
              {p.destaque && <div className={s.planCardFeaturedBadge}>⭐ Mais popular</div>}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                <div>
                  <div style={{width:10,height:10,borderRadius:'50%',background:p.cor,display:'inline-block',marginRight:6}}/>
                  <span className={s.planName}>{p.nome}</span>
                </div>
                <div style={{display:'flex',gap:4}}>
                  <button className={s.btnGhost} onClick={() => openEdit(p)}><Edit2 size={11}/></button>
                  <button className={s.btnGhost} onClick={() => deletar(p._id)} style={{color:'#e8185a'}}><Trash2 size={11}/></button>
                </div>
              </div>

              <div style={{marginBottom:16}}>
                <span className={s.planPrice}>
                  {p.preco === 0 ? 'Grátis' : `R$ ${p.preco.toLocaleString('pt-BR')}`}
                  {p.preco > 0 && <span>/mês</span>}
                </span>
                {p.descricao && <div style={{fontSize:12,color:'#8892a4',marginTop:4}}>{p.descricao}</div>}
              </div>

              <div style={{marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:700,color:'#8892a4',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8}}>Limites</div>
                {[
                  [`${p.limites?.funcionarios || 0} profissionais`],
                  [`${p.limites?.clientes || 0} clientes`],
                  [`${p.limites?.agendamentosMes || 0} agend./mês`],
                ].map(([txt]) => (
                  <div className={s.planFeature} key={txt}>
                    <Check size={13} className={s.planFeatureCheck}/>
                    {txt}
                  </div>
                ))}
                {(p.recursos || []).map((r, i) => (
                  <div className={s.planFeature} key={i}>
                    <Check size={13} className={s.planFeatureCheck}/>
                    {r}
                  </div>
                ))}
              </div>

              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:12,color:'#8892a4',borderTop:'1px solid #edf0f7',paddingTop:10}}>
                <span>{p.tenants || 0} empresa{p.tenants !== 1 ? 's' : ''}</span>
                <span className={`${s.badge} ${p.ativo ? s.badgeGreen : s.badgeGray}`}>{p.ativo ? 'Ativo' : 'Inativo'}</span>
              </div>
            </div>
          ))}

          {planos.length === 0 && (
            <div className={s.emptyState} style={{gridColumn:'1/-1'}}>
              <p>Nenhum plano cadastrado. Crie o primeiro!</p>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className={s.overlay} onClick={() => setShowModal(false)}>
          <div className={s.modal} onClick={e => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h3 className={s.modalTitle}>{editTarget ? 'Editar plano' : 'Novo plano'}</h3>
              <button className={s.modalClose} onClick={() => setShowModal(false)}><X size={14}/></button>
            </div>
            <div className={s.modalBody}>
              <div className={s.formGrid}>
                <div className={s.formGroup}>
                  <label className={s.label}>Nome *</label>
                  <input className={s.inputBase} value={form.nome} onChange={e => setForm(f=>({...f,nome:e.target.value,slug:e.target.value.toLowerCase().replace(/\s+/g,'-')}))} placeholder="Ex: Pro"/>
                </div>
                <div className={s.formGroup}>
                  <label className={s.label}>Slug *</label>
                  <input className={s.inputBase} value={form.slug} onChange={e => setForm(f=>({...f,slug:e.target.value}))} placeholder="pro"/>
                </div>
                <div className={s.formGroup}>
                  <label className={s.label}>Preço/mês (R$)</label>
                  <input className={s.inputBase} type="number" min={0} value={form.preco} onChange={e => setForm(f=>({...f,preco:Number(e.target.value)}))}/>
                </div>
                <div className={s.formGroup}>
                  <label className={s.label}>Preço anual (R$)</label>
                  <input className={s.inputBase} type="number" min={0} value={form.precoAnual} onChange={e => setForm(f=>({...f,precoAnual:Number(e.target.value)}))}/>
                </div>
                <div className={s.formGroup} style={{gridColumn:'1/-1'}}>
                  <label className={s.label}>Descrição</label>
                  <input className={s.inputBase} value={form.descricao} onChange={e => setForm(f=>({...f,descricao:e.target.value}))} placeholder="Ex: Ideal para salões em crescimento"/>
                </div>

                <div style={{gridColumn:'1/-1'}}>
                  <div style={{fontSize:12,fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:10}}>Limites</div>
                  <div className={s.formGrid}>
                    {[['funcionarios','Profissionais'],['clientes','Clientes'],['agendamentosMes','Agendamentos/mês']].map(([k,lbl]) => (
                      <div className={s.formGroup} key={k}>
                        <label className={s.label}>{lbl}</label>
                        <input className={s.inputBase} type="number" min={0} value={form.limites[k]} onChange={e => setForm(f=>({...f,limites:{...f.limites,[k]:Number(e.target.value)}}))}/>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{gridColumn:'1/-1'}}>
                  <label className={s.label}>Recursos inclusos</label>
                  <div style={{display:'flex',gap:8,marginBottom:8}}>
                    <input className={s.inputBase} value={recurso} onChange={e => setRecurso(e.target.value)} onKeyDown={e => e.key==='Enter' && addRecurso()} placeholder="Ex: Relatórios avançados"/>
                    <button className={s.btnGhost} onClick={addRecurso} type="button">+ Add</button>
                  </div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                    {form.recursos.map((r,i) => (
                      <span key={i} style={{background:'rgba(124,58,237,0.08)',color:'#7c3aed',fontSize:12,fontWeight:600,padding:'3px 10px',borderRadius:20,display:'flex',alignItems:'center',gap:6}}>
                        {r}
                        <button style={{background:'none',border:'none',cursor:'pointer',color:'#7c3aed',padding:0,lineHeight:1}} onClick={() => setForm(f=>({...f,recursos:f.recursos.filter((_,j)=>j!==i)}))}>×</button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className={s.formGroup} style={{flexDirection:'row',alignItems:'center',gap:12}}>
                  <label className={s.label} style={{marginBottom:0}}>Destaque</label>
                  <input type="checkbox" checked={form.destaque} onChange={e => setForm(f=>({...f,destaque:e.target.checked}))} style={{width:16,height:16,cursor:'pointer'}}/>
                </div>
                <div className={s.formGroup} style={{flexDirection:'row',alignItems:'center',gap:12}}>
                  <label className={s.label} style={{marginBottom:0}}>Ativo</label>
                  <input type="checkbox" checked={form.ativo} onChange={e => setForm(f=>({...f,ativo:e.target.checked}))} style={{width:16,height:16,cursor:'pointer'}}/>
                </div>
              </div>

              {error && <p style={{color:'#e8185a',fontSize:13,marginTop:12}}>{error}</p>}
            </div>
            <div className={s.modalFooter}>
              <button className={s.btnSecondary} onClick={() => setShowModal(false)}>Cancelar</button>
              <button className={s.btnPrimary} onClick={save} disabled={saving}>{saving?'Salvando...':editTarget?'Salvar':'Criar plano'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
