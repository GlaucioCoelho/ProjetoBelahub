import React, { useState, useEffect, useCallback } from 'react';
import BasePage from './BasePage';
import s from './shared.module.css';
import { FileText, Search, CheckCircle, Send, X } from 'lucide-react';
import faturamentoService from '../../services/faturamentoService';

const STATUS_BADGE = {
  rascunho:  s.badgeGray,
  emitida:   s.badgeBlue,
  paga:      s.badgeGreen,
  cancelada: s.badgeRed,
};

const METODOS = ['cartao', 'dinheiro', 'transferencia', 'pix'];
const METODO_LABEL = { cartao: 'Cartão', dinheiro: 'Dinheiro', transferencia: 'Transferência', pix: 'PIX' };

const f = (v) => `R$ ${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

export default function InvoicesPage() {
  const [notas, setNotas]             = useState([]);
  const [total, setTotal]             = useState(0);
  const [loading, setLoading]         = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch]           = useState('');
  const [error, setError]             = useState('');
  const [actionModal, setActionModal] = useState(null); // { nota, mode: 'emitir'|'pagar' }
  const [metodo, setMetodo]           = useState('pix');
  const [saving, setSaving]           = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    faturamentoService.listar({ status: statusFilter || undefined })
      .then(({ notas, total }) => { setNotas(notas); setTotal(total); })
      .catch(() => setNotas([]))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const rows = notas.filter(n => {
    if (!search) return true;
    const q = search.toLowerCase();
    return n.numero.toLowerCase().includes(q) || n.cliente.toLowerCase().includes(q);
  });

  const totalEmitidas = notas.filter(n => n.status === 'emitida').reduce((a, n) => a + n.valorTotal, 0);
  const totalPagas    = notas.filter(n => n.status === 'paga').reduce((a, n) => a + n.valorTotal, 0);
  const totalDraft    = notas.filter(n => n.status === 'rascunho').length;

  async function handleEmitir(nota) {
    setSaving(true);
    try {
      await faturamentoService.emitir(nota.id);
      setActionModal(null);
      load();
    } catch (e) {
      setError(e?.response?.data?.error || 'Erro ao emitir nota.');
    } finally { setSaving(false); }
  }

  async function handlePagar(nota) {
    setSaving(true);
    try {
      await faturamentoService.marcarComoPaga(nota.id, metodo);
      setActionModal(null);
      load();
    } catch (e) {
      setError(e?.response?.data?.error || 'Erro ao marcar como paga.');
    } finally { setSaving(false); }
  }

  return (
    <BasePage title="Notas Fiscais" description="Gerencie notas fiscais do seu salão" icon={FileText}>
      <div className={s.page}>
        {/* Stats */}
        <div className={s.statsStrip}>
          <div className={s.statBox}>
            <span className={s.statLabel}>Total de notas</span>
            <span className={s.statValue}>{total}</span>
          </div>
          <div className={s.statBox}>
            <span className={s.statLabel}>Rascunhos</span>
            <span className={s.statValue}>{totalDraft}</span>
          </div>
          <div className={s.statBox}>
            <span className={s.statLabel}>A receber (emitidas)</span>
            <span className={s.statValue} style={{ fontSize: 18 }}>{f(totalEmitidas)}</span>
          </div>
          <div className={s.statBox}>
            <span className={s.statLabel}>Recebido (pagas)</span>
            <span className={s.statValue} style={{ fontSize: 18, color: '#22c55e' }}>{f(totalPagas)}</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className={s.toolbar}>
          <div className={s.toolbarLeft}>
            <div className={s.searchWrap}>
              <Search size={15} />
              <input
                className={`${s.inputBase} ${s.searchInput}`}
                placeholder="Buscar nota ou cliente…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className={s.select}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">Todos os status</option>
              <option value="rascunho">Rascunho</option>
              <option value="emitida">Emitida</option>
              <option value="paga">Paga</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 16px', color: '#dc2626', fontSize: 14 }}>
            {error}
          </div>
        )}

        {/* Table */}
        <div className={s.card}>
          <div className={s.cardHeader}>
            <span className={s.cardTitle}>Notas Fiscais</span>
            <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{rows.length} resultado{rows.length !== 1 ? 's' : ''}</span>
          </div>
          {loading ? (
            <div className={s.emptyState}>Carregando…</div>
          ) : (
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Cliente</th>
                  <th>Emissão</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Pagamento</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr className={s.emptyRow}>
                    <td colSpan={7}>Nenhuma nota encontrada.</td>
                  </tr>
                ) : rows.map(n => (
                  <tr key={n.id}>
                    <td style={{ fontWeight: 600 }}>{n.numero}</td>
                    <td>{n.cliente}</td>
                    <td>{n.dataEmissao}</td>
                    <td className={s.amountNeutral}>{f(n.valorTotal)}</td>
                    <td>
                      <span className={`${s.badge} ${STATUS_BADGE[n.status] || s.badgeGray}`}>
                        {n.statusLabel}
                      </span>
                    </td>
                    <td>{n.metodoLabel !== '--' ? n.metodoLabel : <span style={{ color: 'var(--text-tertiary)' }}>—</span>}</td>
                    <td>
                      <div className={s.actionBtns}>
                        {n.status === 'rascunho' && (
                          <button
                            className={s.btnIconSm}
                            title="Emitir nota"
                            onClick={() => { setActionModal({ nota: n, mode: 'emitir' }); setError(''); }}
                          >
                            <Send size={13} />
                          </button>
                        )}
                        {n.status === 'emitida' && (
                          <button
                            className={s.btnIconSm}
                            title="Marcar como paga"
                            onClick={() => { setActionModal({ nota: n, mode: 'pagar' }); setMetodo('pix'); setError(''); }}
                          >
                            <CheckCircle size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Action modal */}
      {actionModal && (
        <div className={s.modalOverlay} onClick={() => setActionModal(null)}>
          <div className={s.modal} onClick={e => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h3 className={s.modalTitle}>
                {actionModal.mode === 'emitir' ? 'Emitir Nota Fiscal' : 'Registrar Pagamento'}
              </h3>
              <button className={s.modalClose} onClick={() => setActionModal(null)}><X size={16} /></button>
            </div>
            <div style={{ padding: '16px 24px' }}>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>
                Nota: <strong>{actionModal.nota.numero}</strong> — Cliente: <strong>{actionModal.nota.cliente}</strong>
              </p>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
                Valor: <strong>{f(actionModal.nota.valorTotal)}</strong>
              </p>
              {actionModal.mode === 'emitir' && (
                <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
                  Confirmar emissão desta nota fiscal?
                </p>
              )}
              {actionModal.mode === 'pagar' && (
                <div className={s.formGroup}>
                  <label className={s.label}>Forma de Pagamento</label>
                  <select className={s.select} value={metodo} onChange={e => setMetodo(e.target.value)}>
                    {METODOS.map(m => <option key={m} value={m}>{METODO_LABEL[m]}</option>)}
                  </select>
                </div>
              )}
              {error && <p style={{ color: '#dc2626', fontSize: 13, marginTop: 10 }}>{error}</p>}
            </div>
            <div className={s.modalFooter}>
              <button className={s.btnGhost} onClick={() => setActionModal(null)}>Cancelar</button>
              <button
                className={s.btnPrimary}
                disabled={saving}
                onClick={() => actionModal.mode === 'emitir' ? handleEmitir(actionModal.nota) : handlePagar(actionModal.nota)}
              >
                {saving ? 'Salvando…' : actionModal.mode === 'emitir' ? 'Emitir' : 'Confirmar Pagamento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </BasePage>
  );
}
