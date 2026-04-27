import React, { useState, useEffect, useCallback } from 'react';
import BasePage from './BasePage';
import s  from './shared.module.css';
import ps from './ProductsPage.module.css';
import {
  Package, Search, Plus, X, Edit2, Trash2,
  AlertTriangle, DollarSign, Boxes, CheckCircle,
  ChevronRight, TrendingUp, Tag, Truck,
  ToggleLeft, ToggleRight,
} from 'lucide-react';
import produtoService, { CATEGORY_CFG, UNIT_LABEL } from '../../services/produtoService';

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmtBRL = (v) =>
  Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const CATS = Object.entries(CATEGORY_CFG).map(([v, c]) => ({ value: v, ...c }));

const EMPTY_FORM = {
  sku: '', nome: '', descricao: '', categoria: 'cosmetico',
  precoUnitario: '', precoCusto: '', unidade: 'un',
  fornecedor: '', estoqueMinimoAlerta: 5, ativo: true,
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const [products,    setProducts]    = useState([]);
  const [stats,       setStats]       = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [catFilter,   setCatFilter]   = useState('all');
  const [statusFilter,setStatusFilter]= useState('all');
  const [selected,    setSelected]    = useState(null);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [saving,      setSaving]      = useState(false);
  const [saveError,   setSaveError]   = useState(null);
  const [deleteId,    setDeleteId]    = useState(null);

  // ── Load data ──
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [prods, st] = await Promise.allSettled([
        produtoService.listar({ limite: 100 }),
        produtoService.estatisticas(),
      ]);
      if (prods.status === 'fulfilled') setProducts(prods.value);
      if (st.status   === 'fulfilled') setStats(st.value);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Derived stats ──
  const total    = products.length;
  const ativos   = products.filter(p => p.ativo).length;
  const criticos = stats?.estoquesBaixos?.length ?? 0;
  const valor    = stats?.valorTotalEstoque ?? 0;

  // ── Filtered list ──
  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = p.nome.toLowerCase().includes(q) ||
                        p.sku.toLowerCase().includes(q)  ||
                        (p.fornecedor || '').toLowerCase().includes(q);
    const matchCat    = catFilter    === 'all' || p.categoria === catFilter;
    const matchStatus = statusFilter === 'all' ||
                       (statusFilter === 'ativo'   && p.ativo) ||
                       (statusFilter === 'inativo' && !p.ativo);
    return matchSearch && matchCat && matchStatus;
  });

  // ── Modal helpers ──
  const openNew = () => {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setSaveError(null);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setForm({
      sku:                 p.sku,
      nome:                p.nome,
      descricao:           p.descricao,
      categoria:           p.categoria,
      precoUnitario:       p.precoUnitario,
      precoCusto:          p.precoCusto,
      unidade:             p.unidade,
      fornecedor:          p.fornecedor,
      estoqueMinimoAlerta: p.estoqueMinimoAlerta,
      ativo:               p.ativo,
    });
    setSaveError(null);
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setSaveError(null); };

  const setF = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  // ── Save ──
  const save = async () => {
    if (!form.nome.trim()) { setSaveError('Nome é obrigatório'); return; }
    if (!form.sku.trim())  { setSaveError('SKU é obrigatório');  return; }
    if (!form.precoUnitario || Number(form.precoUnitario) <= 0) {
      setSaveError('Preço unitário deve ser maior que zero'); return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        ...form,
        precoUnitario:       Number(form.precoUnitario),
        precoCusto:          Number(form.precoCusto) || 0,
        estoqueMinimoAlerta: Number(form.estoqueMinimoAlerta) || 0,
      };
      if (editProduct) {
        const updated = await produtoService.atualizar(editProduct.id, payload);
        setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
        if (selected?.id === editProduct.id) setSelected(updated);
      } else {
        const created = await produtoService.criar(payload);
        setProducts(prev => [created, ...prev]);
      }
      closeModal();
    } catch (err) {
      setSaveError(err.response?.data?.error || err.message || 'Erro ao salvar produto');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──
  const confirmDelete = async (id) => {
    try {
      await produtoService.deletar(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (err) {
      console.error(err);
    }
    setDeleteId(null);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <BasePage title="Produtos" description="Cadastro e gestão do catálogo de produtos" icon={Package}>
      <div className={s.page}>

        {/* ── Stats ── */}
        <div className={s.statsStrip}>
          <div className={s.statBox}>
            <span className={s.statLabel}>Total de produtos</span>
            <span className={s.statValue}>{total}</span>
          </div>
          <div className={s.statBox}>
            <span className={s.statLabel}>Produtos ativos</span>
            <span className={s.statValue} style={{ color: '#22c55e' }}>{ativos}</span>
          </div>
          <div className={s.statBox}>
            <span className={s.statLabel}>Estoque crítico</span>
            <span className={s.statValue} style={{ color: criticos > 0 ? '#ef4444' : 'inherit' }}>
              {criticos}
            </span>
          </div>
          <div className={s.statBox}>
            <span className={s.statLabel}>Valor em estoque</span>
            <span className={s.statValue} style={{ fontSize: 18 }}>{fmtBRL(valor)}</span>
          </div>
        </div>

        {/* ── Main layout ── */}
        <div className={ps.layout}>

          {/* ── Left: list ── */}
          <div className={ps.listPane}>

            {/* Toolbar */}
            <div className={ps.listToolbar}>
              <div className={s.searchWrap} style={{ flex: 1 }}>
                <Search size={14} />
                <input
                  className={`${s.inputBase} ${s.searchInput}`}
                  style={{ width: '100%' }}
                  placeholder="Buscar por nome, SKU ou fornecedor..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <div className={ps.filterRow}>
                {/* Category filter */}
                <select
                  className={s.select}
                  value={catFilter}
                  onChange={e => setCatFilter(e.target.value)}
                >
                  <option value="all">Todas categorias</option>
                  {CATS.map(c => (
                    <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                  ))}
                </select>

                {/* Status filter */}
                <select
                  className={s.select}
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <option value="all">Todos</option>
                  <option value="ativo">Ativos</option>
                  <option value="inativo">Inativos</option>
                </select>

                <button className={s.btnPrimary} onClick={openNew}>
                  <Plus size={15} /> Novo produto
                </button>
              </div>
            </div>

            {/* Product table */}
            <div className={`${s.card} ${ps.tableCard}`}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Categoria</th>
                    <th>Preço</th>
                    <th>Margem</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr className={s.emptyRow}>
                      <td colSpan={6}>Carregando produtos...</td>
                    </tr>
                  )}
                  {!loading && filtered.length === 0 && (
                    <tr className={s.emptyRow}>
                      <td colSpan={6}>Nenhum produto encontrado</td>
                    </tr>
                  )}
                  {filtered.map(p => {
                    const cat = CATEGORY_CFG[p.categoria] || CATEGORY_CFG.outro;
                    const isSelected = selected?.id === p.id;
                    return (
                      <tr
                        key={p.id}
                        className={`${ps.tableRow} ${isSelected ? ps.tableRowActive : ''}`}
                        onClick={() => setSelected(p)}
                      >
                        <td>
                          <div className={ps.productCell}>
                            <div className={ps.productIcon} style={{ background: cat.color + '18', color: cat.color }}>
                              {cat.emoji}
                            </div>
                            <div className={ps.productInfo}>
                              <span className={ps.productName}>{p.nome}</span>
                              <span className={ps.productSku}>{p.sku}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            className={ps.catBadge}
                            style={{ background: cat.color + '18', color: cat.color }}
                          >
                            {cat.emoji} {cat.label}
                          </span>
                        </td>
                        <td>
                          <span className={ps.priceCell}>{fmtBRL(p.precoUnitario)}</span>
                        </td>
                        <td>
                          <span className={ps.marginCell} style={{ color: p.margem > 30 ? '#22c55e' : p.margem > 10 ? '#f59e0b' : '#ef4444' }}>
                            {p.margem > 0 ? `${p.margem.toFixed(0)}%` : '—'}
                          </span>
                        </td>
                        <td>
                          {p.ativo
                            ? <span className={`${s.badge} ${s.badgeGreen}`}><CheckCircle size={10}/> Ativo</span>
                            : <span className={`${s.badge} ${s.badgeGray}`}>Inativo</span>
                          }
                        </td>
                        <td>
                          <div className={ps.rowActions}>
                            <button
                              className={ps.rowBtn}
                              title="Editar"
                              onClick={e => { e.stopPropagation(); openEdit(p); }}
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              className={`${ps.rowBtn} ${ps.rowBtnDanger}`}
                              title="Excluir"
                              onClick={e => { e.stopPropagation(); setDeleteId(p.id); }}
                            >
                              <Trash2 size={13} />
                            </button>
                            <ChevronRight size={13} className={ps.chevron} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Right: detail pane ── */}
          {selected ? (
            <ProductDetail
              product={selected}
              onEdit={() => openEdit(selected)}
              onDelete={() => setDeleteId(selected.id)}
            />
          ) : (
            <div className={ps.detailEmpty}>
              <Package size={40} strokeWidth={1.2} />
              <p>Selecione um produto<br />para ver os detalhes</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal: novo / editar ── */}
      {modalOpen && (
        <div className={ps.overlay} onClick={closeModal}>
          <div className={ps.modal} onClick={e => e.stopPropagation()}>
            <div className={ps.modalHeader}>
              <h3>{editProduct ? 'Editar produto' : 'Novo produto'}</h3>
              <button className={ps.modalClose} onClick={closeModal}><X size={18} /></button>
            </div>

            <div className={ps.modalBody}>
              {saveError && (
                <div className={ps.formError}>
                  <AlertTriangle size={14} /> {saveError}
                </div>
              )}

              <div className={ps.formGrid}>

                {/* SKU */}
                <div className={ps.formGroup}>
                  <label>SKU *</label>
                  <input
                    className={ps.formInput}
                    placeholder="Ex: PROD-001"
                    value={form.sku}
                    disabled={!!editProduct}
                    style={editProduct ? { background: 'rgba(0,0,0,0.04)', cursor: 'not-allowed' } : {}}
                    onChange={e => setF('sku', e.target.value.toUpperCase())}
                  />
                </div>

                {/* Categoria */}
                <div className={ps.formGroup}>
                  <label>Categoria</label>
                  <select className={ps.formInput} value={form.categoria} onChange={e => setF('categoria', e.target.value)}>
                    {CATS.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
                  </select>
                </div>

                {/* Nome */}
                <div className={`${ps.formGroup} ${ps.formGroupFull}`}>
                  <label>Nome do produto *</label>
                  <input
                    className={ps.formInput}
                    placeholder="Ex: Creme Hidratante Facial 250ml"
                    value={form.nome}
                    onChange={e => setF('nome', e.target.value)}
                  />
                </div>

                {/* Preço unitário */}
                <div className={ps.formGroup}>
                  <label>Preço de venda (R$) *</label>
                  <input
                    className={ps.formInput}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={form.precoUnitario}
                    onChange={e => setF('precoUnitario', e.target.value)}
                  />
                </div>

                {/* Preço custo */}
                <div className={ps.formGroup}>
                  <label>Preço de custo (R$)</label>
                  <input
                    className={ps.formInput}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={form.precoCusto}
                    onChange={e => setF('precoCusto', e.target.value)}
                  />
                </div>

                {/* Unidade */}
                <div className={ps.formGroup}>
                  <label>Unidade</label>
                  <select className={ps.formInput} value={form.unidade} onChange={e => setF('unidade', e.target.value)}>
                    {Object.entries(UNIT_LABEL).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>

                {/* Estoque mínimo */}
                <div className={ps.formGroup}>
                  <label>Estoque mínimo (alerta)</label>
                  <input
                    className={ps.formInput}
                    type="number"
                    min="0"
                    value={form.estoqueMinimoAlerta}
                    onChange={e => setF('estoqueMinimoAlerta', e.target.value)}
                  />
                </div>

                {/* Fornecedor */}
                <div className={`${ps.formGroup} ${ps.formGroupFull}`}>
                  <label>Fornecedor</label>
                  <input
                    className={ps.formInput}
                    placeholder="Nome do fornecedor"
                    value={form.fornecedor}
                    onChange={e => setF('fornecedor', e.target.value)}
                  />
                </div>

                {/* Descrição */}
                <div className={`${ps.formGroup} ${ps.formGroupFull}`}>
                  <label>Descrição</label>
                  <textarea
                    className={ps.formTextarea}
                    rows={3}
                    placeholder="Descrição do produto, composição, indicações..."
                    value={form.descricao}
                    onChange={e => setF('descricao', e.target.value)}
                  />
                </div>

                {/* Ativo toggle */}
                <div className={`${ps.formGroup} ${ps.formGroupFull}`}>
                  <button
                    type="button"
                    className={`${ps.toggleBtn} ${form.ativo ? ps.toggleBtnOn : ''}`}
                    onClick={() => setF('ativo', !form.ativo)}
                  >
                    {form.ativo
                      ? <><ToggleRight size={20} /> Produto ativo</>
                      : <><ToggleLeft  size={20} /> Produto inativo</>
                    }
                  </button>
                </div>

              </div>
            </div>

            <div className={ps.modalFooter}>
              <button className={s.btnGhost} onClick={closeModal} disabled={saving}>
                Cancelar
              </button>
              <button className={s.btnPrimary} onClick={save} disabled={saving}>
                {saving ? 'Salvando...' : editProduct ? 'Salvar alterações' : 'Cadastrar produto'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm delete ── */}
      {deleteId && (
        <div className={ps.overlay} onClick={() => setDeleteId(null)}>
          <div className={ps.confirmBox} onClick={e => e.stopPropagation()}>
            <Trash2 size={28} style={{ color: '#dc2626', marginBottom: 12 }} />
            <h3>Excluir produto?</h3>
            <p>Esta ação não pode ser desfeita.<br/>O histórico de movimentações será mantido.</p>
            <div className={ps.confirmActions}>
              <button className={s.btnGhost} onClick={() => setDeleteId(null)}>Cancelar</button>
              <button className={ps.btnDanger} onClick={() => confirmDelete(deleteId)}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </BasePage>
  );
}

// ── ProductDetail sub-component ───────────────────────────────────────────────

function ProductDetail({ product: p, onEdit, onDelete }) {
  const cat = CATEGORY_CFG[p.categoria] || CATEGORY_CFG.outro;

  return (
    <div className={ps.detailPane}>

      {/* Header */}
      <div className={ps.detailHeader}>
        <div className={ps.detailIcon} style={{ background: cat.color + '20', color: cat.color }}>
          {cat.emoji}
        </div>
        <div className={ps.detailMeta}>
          <h2 className={ps.detailName}>{p.nome}</h2>
          <span className={ps.detailSku}>{p.sku}</span>
        </div>
        <div className={ps.detailActions}>
          <button className={ps.iconBtn} onClick={onEdit} title="Editar"><Edit2 size={15}/></button>
          <button className={`${ps.iconBtn} ${ps.iconBtnDanger}`} onClick={onDelete} title="Excluir">
            <Trash2 size={15}/>
          </button>
        </div>
      </div>

      {/* Status badge */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {p.ativo
          ? <span className={`${s.badge} ${s.badgeGreen}`}><CheckCircle size={10}/> Ativo</span>
          : <span className={`${s.badge} ${s.badgeGray}`}>Inativo</span>
        }
        <span
          className={ps.catBadge}
          style={{ background: cat.color + '18', color: cat.color }}
        >
          {cat.emoji} {cat.label}
        </span>
      </div>

      {/* Pricing */}
      <div className={ps.detailSection}>
        <div className={ps.detailSectionTitle}><DollarSign size={12}/> Precificação</div>
        <div className={ps.priceGrid}>
          <div className={ps.priceBox}>
            <span className={ps.priceLabel}>Venda</span>
            <span className={ps.priceValue}>{fmtBRL(p.precoUnitario)}</span>
          </div>
          <div className={ps.priceBox}>
            <span className={ps.priceLabel}>Custo</span>
            <span className={ps.priceValue} style={{ color: 'var(--text-secondary)' }}>
              {p.precoCusto > 0 ? fmtBRL(p.precoCusto) : '—'}
            </span>
          </div>
          <div className={ps.priceBox}>
            <span className={ps.priceLabel}>Margem</span>
            <span className={ps.priceValue} style={{
              color: p.margem > 30 ? '#22c55e' : p.margem > 10 ? '#f59e0b' : '#ef4444'
            }}>
              {p.margem > 0 ? `${p.margem.toFixed(1)}%` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Stock */}
      <div className={ps.detailSection}>
        <div className={ps.detailSectionTitle}><Boxes size={12}/> Estoque</div>
        <div className={ps.detailRow}>
          <AlertTriangle size={14} style={{ color: '#f59e0b' }}/>
          <span>Alerta a partir de <strong>{p.estoqueMinimoAlerta} {UNIT_LABEL[p.unidade] || p.unidade}</strong></span>
        </div>
        <div className={ps.detailRow}>
          <TrendingUp size={14} style={{ color: 'var(--purple)' }}/>
          <span>Unidade: <strong>{UNIT_LABEL[p.unidade] || p.unidade}</strong></span>
        </div>
      </div>

      {/* Supplier & extra info */}
      <div className={ps.detailSection}>
        <div className={ps.detailSectionTitle}><Truck size={12}/> Informações</div>
        {p.fornecedor && (
          <div className={ps.detailRow}>
            <Truck size={14} style={{ color: 'var(--purple)' }}/>
            <span>{p.fornecedor}</span>
          </div>
        )}
        {p.criadoEm && (
          <div className={ps.detailRow}>
            <Tag size={14} style={{ color: 'var(--purple)' }}/>
            <span>Cadastrado em: {p.criadoEm}</span>
          </div>
        )}
        {!p.fornecedor && !p.criadoEm && (
          <div className={ps.detailRow} style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
            Sem informações adicionais
          </div>
        )}
      </div>

      {/* Description */}
      {p.descricao && (
        <div className={ps.detailSection}>
          <div className={ps.detailSectionTitle}>Descrição</div>
          <p className={ps.detailNote}>{p.descricao}</p>
        </div>
      )}

      {/* Quick actions */}
      <div className={ps.quickActions}>
        <button className={ps.quickBtn} onClick={onEdit}>
          <Edit2 size={16}/> Editar
        </button>
        <button className={`${ps.quickBtn} ${ps.quickBtnDanger}`} onClick={onDelete}>
          <Trash2 size={16}/> Excluir
        </button>
      </div>
    </div>
  );
}
