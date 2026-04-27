import React, { useState, useEffect, useCallback } from 'react';
import BasePage from './BasePage';
import s from './shared.module.css';
import cs from './ServicesPage.module.css';
import {
  Layers, Plus, Search, X, Edit2, Trash2,
  Clock, DollarSign, ChevronRight, AlertCircle,
} from 'lucide-react';
import servicoService, { CATEGORY_CFG } from '../../services/servicoService';

const CATEGORIES = Object.entries(CATEGORY_CFG).map(([k, v]) => ({ value: k, ...v }));

const EMPTY_FORM = {
  nome: '', categoria: 'corte', duracao: 60,
  preco: '', comissao: 40, descricao: '', ativo: true,
};

function formatDuracao(min) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function formatBRL(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function ServiceDetail({ svc, onEdit, onDelete }) {
  const cfg = CATEGORY_CFG[svc.categoria] || CATEGORY_CFG.outro;
  return (
    <div className={cs.detailPane}>
      <div className={cs.detailHeader}>
        <div className={cs.detailIcon} style={{ background: cfg.color + '1a', color: cfg.color }}>
          <span>{cfg.emoji}</span>
        </div>
        <div className={cs.detailMeta}>
          <h2 className={cs.detailName}>{svc.nome}</h2>
          <span className={cs.catBadge} style={{ background: cfg.color + '18', color: cfg.color }}>
            {cfg.label}
          </span>
        </div>
        <div className={cs.detailActions}>
          <button className={cs.iconBtn} title="Editar" onClick={() => onEdit(svc)}><Edit2 size={15} /></button>
          <button className={`${cs.iconBtn} ${cs.iconBtnDanger}`} title="Excluir" onClick={() => onDelete(svc.id)}><Trash2 size={15} /></button>
        </div>
      </div>

      <div className={cs.kpiGrid}>
        <div className={cs.kpi}>
          <DollarSign size={16} style={{ color: '#22c55e' }} />
          <span className={cs.kpiVal}>{formatBRL(svc.preco)}</span>
          <span className={cs.kpiLbl}>Preço</span>
        </div>
        <div className={cs.kpi}>
          <Clock size={16} style={{ color: 'var(--purple)' }} />
          <span className={cs.kpiVal}>{formatDuracao(svc.duracao)}</span>
          <span className={cs.kpiLbl}>Duração</span>
        </div>
        <div className={cs.kpi}>
          <span style={{ fontSize: 16, color: '#f59e0b' }}>%</span>
          <span className={cs.kpiVal}>{svc.comissao}%</span>
          <span className={cs.kpiLbl}>Comissão</span>
        </div>
      </div>

      {svc.descricao && (
        <div className={cs.section}>
          <div className={cs.sectionTitle}>Descrição</div>
          <p className={cs.descText}>{svc.descricao}</p>
        </div>
      )}

      <div className={cs.section}>
        <div className={cs.sectionTitle}>Status</div>
        <span className={`${s.badge} ${svc.ativo ? s.badgeGreen : s.badgeGray}`}>
          {svc.ativo ? '✅ Ativo' : '⛔ Inativo'}
        </span>
      </div>
    </div>
  );
}

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState({ total: 0, ativos: 0, precoMedio: 0, duracaoMedia: 0 });
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [filterSt, setFilterSt] = useState('all');
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadAll = useCallback(async () => {
    const [svcsRes, statsRes] = await Promise.allSettled([
      servicoService.listar({ limite: 200 }),
      servicoService.estatisticas(),
    ]);
    if (svcsRes.status === 'fulfilled') setServices(svcsRes.value);
    if (statsRes.status === 'fulfilled') setStats(statsRes.value);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const filtered = services
    .filter(s => filterSt === 'all' || (filterSt === 'ativo' ? s.ativo : !s.ativo))
    .filter(s => filterCat === 'all' || s.categoria === filterCat)
    .filter(s => s.nome.toLowerCase().includes(search.toLowerCase()));

  const openNew = () => {
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setFormError('');
    setModal(true);
  };

  const openEdit = (svc) => {
    setEditId(svc.id);
    setForm({
      nome: svc.nome, categoria: svc.categoria,
      duracao: svc.duracao, preco: svc.preco,
      comissao: svc.comissao, descricao: svc.descricao, ativo: svc.ativo,
    });
    setFormError('');
    setModal(true);
  };

  const save = async () => {
    if (!form.nome.trim()) { setFormError('Informe o nome do serviço.'); return; }
    if (!form.preco || isNaN(form.preco) || Number(form.preco) < 0) { setFormError('Informe um preço válido.'); return; }
    setSaving(true);
    setFormError('');
    try {
      const payload = { ...form, preco: Number(form.preco), duracao: Number(form.duracao), comissao: Number(form.comissao) };
      if (editId) {
        const updated = await servicoService.atualizar(editId, payload);
        setServices(prev => prev.map(s => s.id === updated.id ? updated : s));
        if (selected?.id === editId) setSelected(updated);
      } else {
        const created = await servicoService.criar(payload);
        setServices(prev => [created, ...prev]);
      }
      await servicoService.estatisticas().then(setStats).catch(() => {});
      setModal(false);
    } catch (err) {
      setFormError(err?.response?.data?.error || 'Erro ao salvar serviço.');
    } finally {
      setSaving(false);
    }
  };

  const del = async (id) => {
    try {
      await servicoService.deletar(id);
      setServices(prev => prev.filter(s => s.id !== id));
      if (selected?.id === id) setSelected(null);
      await servicoService.estatisticas().then(setStats).catch(() => {});
    } catch (err) {
      console.error(err);
    }
    setDeleteId(null);
  };

  const f = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  return (
    <BasePage title="Serviços" description="Catálogo de serviços do salão" icon={Layers}>
      <div className={s.page}>

        {/* Stats */}
        <div className={s.statsStrip}>
          <div className={s.statBox}>
            <span className={s.statLabel}>Total de serviços</span>
            <span className={s.statValue}>{stats.total}</span>
          </div>
          <div className={s.statBox}>
            <span className={s.statLabel}>Serviços ativos</span>
            <span className={s.statValue}>{stats.ativos}</span>
          </div>
          <div className={s.statBox}>
            <span className={s.statLabel}>Preço médio</span>
            <span className={s.statValue}>{formatBRL(stats.precoMedio || 0)}</span>
          </div>
          <div className={s.statBox}>
            <span className={s.statLabel}>Duração média</span>
            <span className={s.statValue}>{formatDuracao(stats.duracaoMedia || 0)}</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className={cs.toolbar}>
          <div className={s.searchWrap} style={{ flex: 1, maxWidth: 280 }}>
            <Search size={14} />
            <input className={`${s.inputBase} ${s.searchInput}`} style={{ width: '100%' }}
              placeholder="Buscar serviço..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className={s.select} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="all">Todas categorias</option>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <div className={cs.filterBtns}>
            {[['all', 'Todos'], ['ativo', 'Ativos'], ['inativo', 'Inativos']].map(([v, l]) => (
              <button key={v}
                className={`${cs.filterBtn} ${filterSt === v ? cs.filterBtnActive : ''}`}
                onClick={() => setFilterSt(v)}>{l}</button>
            ))}
          </div>
          <button className={s.btnPrimary} onClick={openNew}><Plus size={15} /> Novo serviço</button>
        </div>

        {/* Main layout */}
        <div className={cs.layout}>

          {/* Table */}
          <div className={cs.listPane}>
            <div className={s.card} style={{ overflow: 'visible' }}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>SERVIÇO</th>
                    <th>DURAÇÃO</th>
                    <th>PREÇO</th>
                    <th>COMISSÃO</th>
                    <th>STATUS</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr className={s.emptyRow}>
                      <td colSpan={6}>Nenhum serviço encontrado</td>
                    </tr>
                  )}
                  {filtered.map(svc => {
                    const cfg = CATEGORY_CFG[svc.categoria] || CATEGORY_CFG.outro;
                    return (
                      <tr key={svc.id}
                        className={`${cs.tableRow} ${selected?.id === svc.id ? cs.tableRowActive : ''}`}
                        onClick={() => setSelected(svc)}>
                        <td>
                          <div className={cs.serviceCell}>
                            <div className={cs.serviceIcon} style={{ background: cfg.color + '1a', color: cfg.color }}>
                              {cfg.emoji}
                            </div>
                            <div className={cs.serviceInfo}>
                              <span className={cs.serviceName}>{svc.nome}</span>
                              <span className={cs.catBadgeSmall} style={{ background: cfg.color + '18', color: cfg.color }}>{cfg.label}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={cs.durationCell}><Clock size={12} />{formatDuracao(svc.duracao)}</span>
                        </td>
                        <td className={cs.priceCell}>{formatBRL(svc.preco)}</td>
                        <td className={cs.commCell}>{svc.comissao}%</td>
                        <td>
                          <span className={`${s.badge} ${svc.ativo ? s.badgeGreen : s.badgeGray}`}>
                            {svc.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td>
                          <div className={cs.rowActions}>
                            <button className={cs.rowBtn} onClick={e => { e.stopPropagation(); openEdit(svc); }}><Edit2 size={13} /></button>
                            <button className={`${cs.rowBtn} ${cs.rowBtnDanger}`} onClick={e => { e.stopPropagation(); setDeleteId(svc.id); }}><Trash2 size={13} /></button>
                            <ChevronRight size={14} className={cs.chevron} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detail pane */}
          {selected ? (
            <ServiceDetail
              svc={selected}
              onEdit={openEdit}
              onDelete={id => setDeleteId(id)}
            />
          ) : (
            <div className={cs.detailEmpty}>
              <Layers size={40} strokeWidth={1.2} />
              <p>Selecione um serviço<br />para ver os detalhes</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      {modal && (
        <div className={cs.overlay} onClick={() => setModal(false)}>
          <div className={cs.modal} onClick={e => e.stopPropagation()}>
            <div className={cs.modalHeader}>
              <h3>{editId ? 'Editar serviço' : 'Novo serviço'}</h3>
              <button className={cs.modalClose} onClick={() => setModal(false)}><X size={18} /></button>
            </div>
            <div className={cs.modalBody}>
              {formError && (
                <div className={cs.formError}><AlertCircle size={15} />{formError}</div>
              )}
              <div className={cs.formGrid}>
                <div className={`${cs.formGroup} ${cs.formGroupFull}`}>
                  <label>Nome do serviço *</label>
                  <input className={cs.formInput} placeholder="Ex: Corte feminino"
                    value={form.nome} onChange={f('nome')} />
                </div>
                <div className={cs.formGroup}>
                  <label>Categoria</label>
                  <select className={cs.formInput} value={form.categoria} onChange={f('categoria')}>
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                    ))}
                  </select>
                </div>
                <div className={cs.formGroup}>
                  <label>Duração (min) *</label>
                  <input className={cs.formInput} type="number" min="5" step="5"
                    value={form.duracao} onChange={f('duracao')} />
                </div>
                <div className={cs.formGroup}>
                  <label>Preço (R$) *</label>
                  <input className={cs.formInput} type="number" min="0" step="0.01"
                    placeholder="0,00" value={form.preco} onChange={f('preco')} />
                </div>
                <div className={cs.formGroup}>
                  <label>Comissão (%)</label>
                  <input className={cs.formInput} type="number" min="0" max="100"
                    value={form.comissao} onChange={f('comissao')} />
                </div>
                <div className={`${cs.formGroup} ${cs.formGroupFull}`}>
                  <label>Descrição</label>
                  <textarea className={cs.formTextarea} rows={3}
                    placeholder="Descreva o serviço..."
                    value={form.descricao} onChange={f('descricao')} />
                </div>
                <div className={cs.formGroup}>
                  <label>Status</label>
                  <button type="button"
                    className={`${cs.toggleBtn} ${form.ativo ? cs.toggleBtnOn : ''}`}
                    onClick={() => setForm(p => ({ ...p, ativo: !p.ativo }))}>
                    {form.ativo ? '✅ Ativo' : '⛔ Inativo'}
                  </button>
                </div>
              </div>
            </div>
            <div className={cs.modalFooter}>
              <button className={s.btnGhost} onClick={() => setModal(false)}>Cancelar</button>
              <button className={s.btnPrimary} onClick={save} disabled={saving}>
                {saving ? 'Salvando...' : editId ? 'Salvar alterações' : 'Cadastrar serviço'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm delete ── */}
      {deleteId && (
        <div className={cs.overlay} onClick={() => setDeleteId(null)}>
          <div className={cs.confirmBox} onClick={e => e.stopPropagation()}>
            <Trash2 size={28} style={{ color: '#dc2626', marginBottom: 12 }} />
            <h3>Excluir serviço?</h3>
            <p>Esta ação não pode ser desfeita.</p>
            <div className={cs.confirmActions}>
              <button className={s.btnGhost} onClick={() => setDeleteId(null)}>Cancelar</button>
              <button className={cs.btnDanger} onClick={() => del(deleteId)}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </BasePage>
  );
}
