import React, { useState, useEffect, useCallback } from 'react';
import BasePage from './BasePage';
import s from './shared.module.css';
import pk from './PackagesPage.module.css';
import {
  BookOpen, Plus, Search, X, Edit2, Trash2,
  Tag, Clock, CheckCircle, AlertCircle, ChevronRight,
  DollarSign, Layers,
} from 'lucide-react';
import pacoteService from '../../services/pacoteService';
import servicoService from '../../services/servicoService';

const EMPTY_FORM = {
  nome: '', descricao: '', preco: '', precoOriginal: '',
  validadeDias: 90, sessoes: 1, ativo: true, servicos: [],
};

function formatBRL(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/* ── Detail pane ─────────────────────────────────────── */
function PackageDetail({ pkg, onEdit, onDelete }) {
  const discount = pkg.precoOriginal > 0
    ? Math.round((1 - pkg.preco / pkg.precoOriginal) * 100)
    : 0;

  return (
    <div className={pk.detailPane}>
      {/* Header */}
      <div className={pk.detailHeader}>
        <div className={pk.detailIcon}>🎁</div>
        <div className={pk.detailMeta}>
          <h2 className={pk.detailName}>{pkg.nome}</h2>
          <span className={`${s.badge} ${pkg.ativo ? s.badgeGreen : s.badgeGray}`}>
            {pkg.ativo ? 'Ativo' : 'Inativo'}
          </span>
        </div>
        <div className={pk.detailActions}>
          <button className={pk.iconBtn} onClick={() => onEdit(pkg)}><Edit2 size={15}/></button>
          <button className={`${pk.iconBtn} ${pk.iconBtnDanger}`} onClick={() => onDelete(pkg.id)}><Trash2 size={15}/></button>
        </div>
      </div>

      {/* Pricing */}
      <div className={pk.priceGrid}>
        <div className={pk.priceBox}>
          <span className={pk.priceLabel}>Preço</span>
          <span className={pk.priceValue} style={{ color: 'var(--purple)' }}>{formatBRL(pkg.preco)}</span>
        </div>
        {pkg.precoOriginal > 0 && (
          <div className={pk.priceBox}>
            <span className={pk.priceLabel}>Original</span>
            <span className={pk.priceValue} style={{ textDecoration: 'line-through', color: 'var(--text-tertiary)' }}>
              {formatBRL(pkg.precoOriginal)}
            </span>
          </div>
        )}
        {discount > 0 && (
          <div className={pk.priceBox} style={{ background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.15)' }}>
            <span className={pk.priceLabel}>Desconto</span>
            <span className={pk.priceValue} style={{ color: '#16a34a' }}>{discount}%</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className={pk.section}>
        <div className={pk.sectionTitle}>Detalhes</div>
        <div className={pk.infoRow}><Clock size={13}/> Validade: <strong>{pkg.validadeDias} dias</strong></div>
        <div className={pk.infoRow}><CheckCircle size={13}/> Sessões: <strong>{pkg.sessoes}</strong></div>
      </div>

      {/* Services */}
      {pkg.servicos.length > 0 && (
        <div className={pk.section}>
          <div className={pk.sectionTitle}>Serviços incluídos</div>
          <div className={pk.serviceList}>
            {pkg.servicos.map((sv, i) => (
              <div key={i} className={pk.serviceItem}>
                <Layers size={12}/>
                <span>{sv.nome}</span>
                {sv.quantidade > 1 && <span className={pk.qty}>×{sv.quantidade}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {pkg.descricao && (
        <div className={pk.section}>
          <div className={pk.sectionTitle}>Descrição</div>
          <p className={pk.descText}>{pkg.descricao}</p>
        </div>
      )}
    </div>
  );
}

/* ── Main page ───────────────────────────────────────── */
export default function PackagesPage() {
  const [packages,     setPackages]     = useState([]);
  const [stats,        setStats]        = useState({ total: 0, ativos: 0, precoMedio: 0, sessoesMedia: 0 });
  const [servicesData, setServicesData] = useState([]);
  const [search,       setSearch]       = useState('');
  const [filterSt,     setFilterSt]     = useState('all');
  const [selected,     setSelected]     = useState(null);
  const [modal,        setModal]        = useState(false);
  const [editId,       setEditId]       = useState(null);
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [deleteId,     setDeleteId]     = useState(null);
  const [formError,    setFormError]    = useState('');
  const [saving,       setSaving]       = useState(false);
  const [svcSearch,    setSvcSearch]    = useState('');

  const loadAll = useCallback(async () => {
    const [pkRes, stRes] = await Promise.allSettled([
      pacoteService.listar({ limite: 200 }),
      pacoteService.estatisticas(),
    ]);
    if (pkRes.status  === 'fulfilled') setPackages(pkRes.value);
    if (stRes.status  === 'fulfilled') setStats(stRes.value);
  }, []);

  useEffect(() => {
    loadAll();
    servicoService.listar({ ativo: true, limite: 200 }).then(setServicesData).catch(() => {});
  }, [loadAll]);

  const filtered = packages
    .filter(p => filterSt === 'all' || (filterSt === 'ativo' ? p.ativo : !p.ativo))
    .filter(p => p.nome.toLowerCase().includes(search.toLowerCase()));

  /* ── Modal helpers ── */
  const openNew = () => {
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setFormError('');
    setSvcSearch('');
    setModal(true);
  };

  const openEdit = (pkg) => {
    setEditId(pkg.id);
    setForm({
      nome: pkg.nome, descricao: pkg.descricao,
      preco: pkg.preco, precoOriginal: pkg.precoOriginal || '',
      validadeDias: pkg.validadeDias, sessoes: pkg.sessoes,
      ativo: pkg.ativo, servicos: [...pkg.servicos],
    });
    setFormError('');
    setSvcSearch('');
    setModal(true);
  };

  const toggleService = (svc) => {
    setForm(prev => {
      const exists = prev.servicos.find(s => s.nome === svc.nome);
      if (exists) return { ...prev, servicos: prev.servicos.filter(s => s.nome !== svc.nome) };
      return { ...prev, servicos: [...prev.servicos, { nome: svc.nome, quantidade: 1 }] };
    });
  };

  const setQty = (nome, qty) => {
    setForm(prev => ({
      ...prev,
      servicos: prev.servicos.map(s => s.nome === nome ? { ...s, quantidade: Math.max(1, qty) } : s),
    }));
  };

  const save = async () => {
    if (!form.nome.trim())          { setFormError('Informe o nome do pacote.'); return; }
    if (!form.preco || Number(form.preco) <= 0) { setFormError('Informe um preço válido.'); return; }
    if (form.servicos.length === 0) { setFormError('Adicione ao menos um serviço.'); return; }
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        ...form,
        preco:         Number(form.preco),
        precoOriginal: form.precoOriginal ? Number(form.precoOriginal) : 0,
        validadeDias:  Number(form.validadeDias),
        sessoes:       Number(form.sessoes),
      };
      if (editId) {
        const updated = await pacoteService.atualizar(editId, payload);
        setPackages(prev => prev.map(p => p.id === updated.id ? updated : p));
        if (selected?.id === editId) setSelected(updated);
      } else {
        const created = await pacoteService.criar(payload);
        setPackages(prev => [created, ...prev]);
      }
      await pacoteService.estatisticas().then(setStats).catch(() => {});
      setModal(false);
    } catch (err) {
      setFormError(err?.response?.data?.error || 'Erro ao salvar pacote.');
    } finally {
      setSaving(false);
    }
  };

  const del = async (id) => {
    try {
      await pacoteService.deletar(id);
      setPackages(prev => prev.filter(p => p.id !== id));
      if (selected?.id === id) setSelected(null);
      await pacoteService.estatisticas().then(setStats).catch(() => {});
    } catch (err) { console.error(err); }
    setDeleteId(null);
  };

  const f = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  const svcFiltered = servicesData.filter(sv =>
    sv.nome.toLowerCase().includes(svcSearch.toLowerCase())
  );

  return (
    <BasePage title="Pacotes" description="Pacotes e combos de serviços" icon={BookOpen}>
      <div className={s.page}>

        {/* Stats */}
        <div className={s.statsStrip}>
          <div className={s.statBox}>
            <span className={s.statLabel}>Total de pacotes</span>
            <span className={s.statValue}>{stats.total}</span>
          </div>
          <div className={s.statBox}>
            <span className={s.statLabel}>Pacotes ativos</span>
            <span className={s.statValue}>{stats.ativos}</span>
          </div>
          <div className={s.statBox}>
            <span className={s.statLabel}>Preço médio</span>
            <span className={s.statValue}>{formatBRL(stats.precoMedio || 0)}</span>
          </div>
          <div className={s.statBox}>
            <span className={s.statLabel}>Sessões médias</span>
            <span className={s.statValue}>{stats.sessoesMedia || 0}</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className={pk.toolbar}>
          <div className={s.searchWrap} style={{ flex: 1, maxWidth: 300 }}>
            <Search size={14}/>
            <input className={`${s.inputBase} ${s.searchInput}`} style={{ width: '100%' }}
              placeholder="Buscar pacote..."
              value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
          <div className={pk.filterBtns}>
            {[['all','Todos'],['ativo','Ativos'],['inativo','Inativos']].map(([v,l]) => (
              <button key={v}
                className={`${pk.filterBtn} ${filterSt === v ? pk.filterBtnActive : ''}`}
                onClick={() => setFilterSt(v)}>{l}
              </button>
            ))}
          </div>
          <button className={s.btnPrimary} onClick={openNew}><Plus size={15}/> Novo pacote</button>
        </div>

        {/* Layout */}
        <div className={pk.layout}>

          {/* Cards grid */}
          <div className={pk.cardsPane}>
            {filtered.length === 0 && (
              <div className={pk.empty}>Nenhum pacote encontrado</div>
            )}
            {filtered.map(pkg => {
              const discount = pkg.precoOriginal > 0
                ? Math.round((1 - pkg.preco / pkg.precoOriginal) * 100)
                : 0;
              return (
                <div key={pkg.id}
                  className={`${pk.card} ${selected?.id === pkg.id ? pk.cardActive : ''} ${!pkg.ativo ? pk.cardInactive : ''}`}
                  onClick={() => setSelected(pkg)}>

                  {/* Card top */}
                  <div className={pk.cardTop}>
                    <div className={pk.cardEmoji}>🎁</div>
                    <div className={pk.cardInfo}>
                      <div className={pk.cardName}>{pkg.nome}</div>
                      <div className={pk.cardMeta}>
                        <span><Layers size={10}/> {pkg.servicos.length} serviço{pkg.servicos.length !== 1 ? 's' : ''}</span>
                        <span><Clock size={10}/> {pkg.validadeDias}d</span>
                        <span><CheckCircle size={10}/> {pkg.sessoes} sessão{pkg.sessoes !== 1 ? 'ões' : ''}</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className={pk.cardChevron}/>
                  </div>

                  {/* Pricing */}
                  <div className={pk.cardPrice}>
                    <div>
                      <span className={pk.cardPriceVal}>{formatBRL(pkg.preco)}</span>
                      {pkg.precoOriginal > 0 && (
                        <span className={pk.cardPriceOrig}>{formatBRL(pkg.precoOriginal)}</span>
                      )}
                    </div>
                    <div className={pk.cardBadges}>
                      {discount > 0 && (
                        <span className={pk.discountBadge}>-{discount}%</span>
                      )}
                      <span className={`${s.badge} ${pkg.ativo ? s.badgeGreen : s.badgeGray}`}>
                        {pkg.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>

                  {/* Services tags */}
                  {pkg.servicos.length > 0 && (
                    <div className={pk.cardServiceTags}>
                      {pkg.servicos.slice(0, 3).map((sv, i) => (
                        <span key={i} className={pk.serviceTag}>{sv.nome}</span>
                      ))}
                      {pkg.servicos.length > 3 && (
                        <span className={pk.serviceTagMore}>+{pkg.servicos.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* Row actions */}
                  <div className={pk.cardActions}>
                    <button className={pk.actionBtn} onClick={e => { e.stopPropagation(); openEdit(pkg); }}>
                      <Edit2 size={13}/> Editar
                    </button>
                    <button className={`${pk.actionBtn} ${pk.actionBtnDanger}`}
                      onClick={e => { e.stopPropagation(); setDeleteId(pkg.id); }}>
                      <Trash2 size={13}/> Excluir
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail pane */}
          {selected ? (
            <PackageDetail svc={selected} pkg={selected} onEdit={openEdit} onDelete={id => setDeleteId(id)}/>
          ) : (
            <div className={pk.detailEmpty}>
              <BookOpen size={38} strokeWidth={1.2}/>
              <p>Selecione um pacote<br/>para ver os detalhes</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      {modal && (
        <div className={pk.overlay} onClick={() => setModal(false)}>
          <div className={pk.modal} onClick={e => e.stopPropagation()}>
            <div className={pk.modalHeader}>
              <h3>{editId ? 'Editar pacote' : 'Novo pacote'}</h3>
              <button className={pk.modalClose} onClick={() => setModal(false)}><X size={18}/></button>
            </div>
            <div className={pk.modalBody}>
              {formError && (
                <div className={pk.formError}><AlertCircle size={15}/>{formError}</div>
              )}

              <div className={pk.formGrid}>
                {/* Nome */}
                <div className={`${pk.formGroup} ${pk.formGroupFull}`}>
                  <label>Nome do pacote *</label>
                  <input className={pk.formInput} placeholder="Ex: Pacote Noiva Completo"
                    value={form.nome} onChange={f('nome')}/>
                </div>

                {/* Preço + Preço Original */}
                <div className={pk.formGroup}>
                  <label>Preço do pacote (R$) *</label>
                  <input className={pk.formInput} type="number" min="0" step="0.01"
                    placeholder="0,00" value={form.preco} onChange={f('preco')}/>
                </div>
                <div className={pk.formGroup}>
                  <label>Preço original (R$)</label>
                  <input className={pk.formInput} type="number" min="0" step="0.01"
                    placeholder="Antes do desconto" value={form.precoOriginal} onChange={f('precoOriginal')}/>
                </div>

                {/* Validade + Sessões */}
                <div className={pk.formGroup}>
                  <label>Validade (dias)</label>
                  <input className={pk.formInput} type="number" min="1"
                    value={form.validadeDias} onChange={f('validadeDias')}/>
                </div>
                <div className={pk.formGroup}>
                  <label>Nº de sessões</label>
                  <input className={pk.formInput} type="number" min="1"
                    value={form.sessoes} onChange={f('sessoes')}/>
                </div>

                {/* Serviços */}
                <div className={`${pk.formGroup} ${pk.formGroupFull}`}>
                  <label>Serviços incluídos * ({form.servicos.length} selecionado{form.servicos.length !== 1 ? 's' : ''})</label>
                  <input className={pk.formInput} placeholder="Filtrar serviços..."
                    value={svcSearch} onChange={e => setSvcSearch(e.target.value)}
                    style={{ marginBottom: 8 }}/>
                  <div className={pk.svcPickerList}>
                    {svcFiltered.length === 0 && (
                      <div className={pk.svcEmpty}>Nenhum serviço cadastrado</div>
                    )}
                    {svcFiltered.map(sv => {
                      const selected = form.servicos.find(s => s.nome === sv.nome);
                      return (
                        <div key={sv.id} className={`${pk.svcRow} ${selected ? pk.svcRowSelected : ''}`}>
                          <button type="button" className={pk.svcCheck}
                            onClick={() => toggleService(sv)}>
                            {selected ? <CheckCircle size={16} style={{ color: 'var(--purple)' }}/> : <div className={pk.svcCheckEmpty}/>}
                          </button>
                          <span className={pk.svcName}>{sv.nome}</span>
                          <span className={pk.svcPrice}>{formatBRL(sv.preco)}</span>
                          {selected && (
                            <div className={pk.svcQtyWrap}>
                              <button type="button" className={pk.qtyBtn}
                                onClick={() => setQty(sv.nome, selected.quantidade - 1)}>−</button>
                              <span className={pk.qtyVal}>{selected.quantidade}</span>
                              <button type="button" className={pk.qtyBtn}
                                onClick={() => setQty(sv.nome, selected.quantidade + 1)}>+</button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Descrição */}
                <div className={`${pk.formGroup} ${pk.formGroupFull}`}>
                  <label>Descrição</label>
                  <textarea className={pk.formTextarea} rows={3}
                    placeholder="Descreva o pacote..."
                    value={form.descricao} onChange={f('descricao')}/>
                </div>

                {/* Status */}
                <div className={pk.formGroup}>
                  <label>Status</label>
                  <button type="button"
                    className={`${pk.toggleBtn} ${form.ativo ? pk.toggleBtnOn : ''}`}
                    onClick={() => setForm(p => ({ ...p, ativo: !p.ativo }))}>
                    {form.ativo ? '✅ Ativo' : '⛔ Inativo'}
                  </button>
                </div>
              </div>
            </div>
            <div className={pk.modalFooter}>
              <button className={s.btnGhost} onClick={() => setModal(false)}>Cancelar</button>
              <button className={s.btnPrimary} onClick={save} disabled={saving}>
                {saving ? 'Salvando...' : editId ? 'Salvar alterações' : 'Criar pacote'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm delete ── */}
      {deleteId && (
        <div className={pk.overlay} onClick={() => setDeleteId(null)}>
          <div className={pk.confirmBox} onClick={e => e.stopPropagation()}>
            <Trash2 size={28} style={{ color: '#dc2626', marginBottom: 12 }}/>
            <h3>Excluir pacote?</h3>
            <p>Esta ação não pode ser desfeita.</p>
            <div className={pk.confirmActions}>
              <button className={s.btnGhost} onClick={() => setDeleteId(null)}>Cancelar</button>
              <button className={pk.btnDanger} onClick={() => del(deleteId)}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </BasePage>
  );
}
