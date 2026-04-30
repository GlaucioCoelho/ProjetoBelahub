# BelaHub Backend — API Inventory

Generated: 2026-04-28  
Base URL (local): `http://localhost:5000`  
Base URL (prod): `https://belahub-production.up.railway.app`

All protected routes require `Authorization: Bearer <jwt>` header.  
JWT is obtained from `POST /api/auth/login` or `POST /api/auth/registro`.

---

## Auth (`/api/auth`)

| Method | Path | Protected | Description |
|--------|------|-----------|-------------|
| POST | `/api/auth/registro` | No | Register a new tenant user |
| POST | `/api/auth/login` | No | Login, returns JWT |
| POST | `/api/auth/logout` | No | Stateless logout (client discards token) |
| GET  | `/api/auth/me` | Yes | Get current user profile |

**Response format:** `{ sucesso: true/false, mensagem?, token?, usuario? }`

---

## Admin (`/api/admin`) — super_admin only

| Method | Path | Protected | Description |
|--------|------|-----------|-------------|
| POST | `/api/admin/seed` | No (one-time bootstrap) | Create first super_admin |
| GET  | `/api/admin/dashboard` | super_admin | Platform MRR, totals, recent tenants |
| GET  | `/api/admin/tenants` | super_admin | List all tenants (paginated, filterable) |
| GET  | `/api/admin/tenants/:id` | super_admin | Get tenant with usage stats |
| PUT  | `/api/admin/tenants/:id` | super_admin | Update tenant (plano, status, etc.) |
| POST | `/api/admin/tenants/:id/suspender` | super_admin | Suspend tenant |
| POST | `/api/admin/tenants/:id/reativar` | super_admin | Reactivate tenant |
| GET  | `/api/admin/planos` | super_admin | List plans with tenant counts |
| POST | `/api/admin/planos` | super_admin | Create plan |
| PUT  | `/api/admin/planos/:id` | super_admin | Update plan |
| DELETE | `/api/admin/planos/:id` | super_admin | Delete plan |
| GET  | `/api/admin/audit` | super_admin | Audit log (paginated) |

> **Security note:** `/api/admin/seed` is unprotected by design for first-time setup. Disable or add a one-time token guard before going to production with real data.

---

## Agendamentos (`/api/agendamentos`) — protected

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/agendamentos` | Create appointment |
| GET  | `/api/agendamentos` | List appointments (filterable by date, profissional, cliente, status) |
| GET  | `/api/agendamentos/disponibilidade` | Available slots for a profissional on a given date |
| GET  | `/api/agendamentos/:id` | Get appointment by ID |
| PUT  | `/api/agendamentos/:id` | Update appointment (status change triggers revenue/commission side effects) |
| DELETE | `/api/agendamentos/:id` | Cancel/delete appointment (rolls back revenue if was concluido) |

**Side effects on status change:**
- `→ concluido`: Creates `Transacao` (receita) + increments `Funcionario` commission counters.
- `concluido →` other: Deletes transacao, decrements counters.

---

## Clientes (`/api/clientes`) — protected

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/clientes` | Create client |
| GET  | `/api/clientes` | List clients (filterable: busca, ativo) |
| GET  | `/api/clientes/:id` | Get client |
| GET  | `/api/clientes/:id/agendamentos` | Appointment history for client |
| GET  | `/api/clientes/:id/estatisticas` | Stats (total spent, counts) |
| PUT  | `/api/clientes/:id` | Update client |
| DELETE | `/api/clientes/:id` | Delete client |

---

## Funcionários (`/api/funcionarios`) — protected

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/funcionarios` | Create employee |
| GET  | `/api/funcionarios` | List employees (filterable: cargo, status, busca; paginated) |
| GET  | `/api/funcionarios/:id` | Get employee |
| PUT  | `/api/funcionarios/:id` | Update employee |
| DELETE | `/api/funcionarios/:id` | Delete employee (also deletes escalas) |
| POST | `/api/funcionarios/:funcionarioId/escalas` | Create work schedule entry |
| GET  | `/api/funcionarios/:funcionarioId/escalas` | List schedules (filterable by date range, tipo) |
| PUT  | `/api/funcionarios/:funcionarioId/escalas/:escalaId` | Update schedule |
| DELETE | `/api/funcionarios/:funcionarioId/escalas/:escalaId` | Delete schedule |
| GET  | `/api/funcionarios/:funcionarioId/comissoes` | Commission report |
| GET  | `/api/funcionarios/:funcionarioId/estatisticas` | Employee stats |

---

## Transações (`/api/transacoes`) — protected

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/transacoes` | Create transaction (tipos: receita, despesa, comissao, devolucao) |
| GET  | `/api/transacoes` | List transactions (filterable; paginated) |
| GET  | `/api/transacoes/resumo/financeiro` | Financial summary by type + net cash flow |
| GET  | `/api/transacoes/:id` | Get transaction |
| PUT  | `/api/transacoes/:id` | Update transaction |
| DELETE | `/api/transacoes/:id` | Delete transaction |

---

## Faturamento (`/api/faturamento`) — protected

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/faturamento` | Create invoice (status: rascunho) |
| GET  | `/api/faturamento` | List invoices (filterable; paginated) |
| GET  | `/api/faturamento/relatorio/vendas` | Sales report by status |
| GET  | `/api/faturamento/:id` | Get invoice |
| PUT  | `/api/faturamento/:id` | Update invoice |
| POST | `/api/faturamento/:id/emitir` | Emit invoice (rascunho → emitida) |
| POST | `/api/faturamento/:id/marcar-como-paga` | Mark invoice as paid |

---

## Produtos (`/api/produtos`) — protected

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/produtos` | Create product |
| GET  | `/api/produtos` | List products (filterable; paginated) |
| GET  | `/api/produtos/com-estoque/listar` | Products with stock levels |
| GET  | `/api/produtos/estatisticas/geral` | Product & stock statistics |
| GET  | `/api/produtos/categoria/:categoria` | Products by category |
| GET  | `/api/produtos/:id` | Get product with stock locations |
| PUT  | `/api/produtos/:id` | Update product |
| DELETE | `/api/produtos/:id` | Delete product (blocked if stock > 0) |

---

## Estoque (`/api/estoque`) — protected

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/estoque` | Create stock location for a product |
| GET  | `/api/estoque` | List stock records (paginated) |
| GET  | `/api/estoque/resumo/geral` | Stock summary (totals, low/high alerts) |
| GET  | `/api/estoque/produto/:produtoId` | Stock for a specific product across all locations |
| GET  | `/api/estoque/:id` | Get stock record with recent movements |
| PUT  | `/api/estoque/:id` | Update stock record |
| DELETE | `/api/estoque/:id` | Delete stock record (also deletes movimentacoes, deactivates alertas) |
| POST | `/api/estoque/:id/adicionar` | Add quantity (creates movimentacao, auto-resolves low-stock alertas) |
| POST | `/api/estoque/:id/remover` | Remove quantity (creates movimentacao, auto-creates low-stock alerta if needed) |
| POST | `/api/estoque/:id/reservar` | Reserve quantity |
| POST | `/api/estoque/:id/liberar-reserva` | Release reservation |

---

## Movimentações (`/api/movimentacoes`) — protected

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/movimentacoes` | Create movement (tipos: entrada, saida, devolucao, perda, ajuste) |
| GET  | `/api/movimentacoes` | List movements (filterable; paginated) |
| GET  | `/api/movimentacoes/resumo/geral` | Movement summary by type |
| GET  | `/api/movimentacoes/relatorio/mensal` | Monthly report by tipo+motivo |
| GET  | `/api/movimentacoes/estoque/:estoqueId` | Movements for a stock location |
| GET  | `/api/movimentacoes/:id` | Get movement |
| PUT  | `/api/movimentacoes/:id` | Update movement |
| DELETE | `/api/movimentacoes/:id` | Delete movement |
| POST | `/api/movimentacoes/lote/processar` | Bulk movement processing |

---

## Alertas de Estoque (`/api/alertas`) — protected

| Method | Path | Description |
|--------|------|-------------|
| GET  | `/api/alertas` | List alerts (filterable: ativo, lido, tipo, severidade; paginated) |
| GET  | `/api/alertas/nao-lidos/listar` | Unread active alerts |
| GET  | `/api/alertas/resumo/geral` | Alert counts by severity |
| GET  | `/api/alertas/estatisticas/geral` | Alert stats (by tipo, severidade, resolution rate) |
| GET  | `/api/alertas/historico/listagem` | Alert history (filterable by date) |
| GET  | `/api/alertas/produto/:produtoId` | Active alerts for a product |
| GET  | `/api/alertas/:id` | Get alert |
| POST | `/api/alertas` | Create manual alert |
| POST | `/api/alertas/:id/lido` | Mark alert as read |
| POST | `/api/alertas/acao/registrar/:id` | Register action taken on alert |
| POST | `/api/alertas/desativar/:id` | Deactivate alert |
| POST | `/api/alertas/lote/marcar-como-lidos` | Mark multiple alerts as read |
| POST | `/api/alertas/lote/desativar` | Deactivate multiple alerts |

---

## Serviços (`/api/servicos`) — protected

| Method | Path | Description |
|--------|------|-------------|
| GET  | `/api/servicos/estatisticas/geral` | Service stats (total, active, avg price/duration) |
| POST | `/api/servicos` | Create service |
| GET  | `/api/servicos` | List services (filterable: categoria, ativo, busca; paginated) |
| GET  | `/api/servicos/:id` | Get service |
| PUT  | `/api/servicos/:id` | Update service |
| DELETE | `/api/servicos/:id` | Delete service |

---

## Pacotes (`/api/pacotes`) — protected

| Method | Path | Description |
|--------|------|-------------|
| GET  | `/api/pacotes/estatisticas/geral` | Package stats (total, active, avg price/sessions) |
| POST | `/api/pacotes` | Create package |
| GET  | `/api/pacotes` | List packages (filterable: ativo, busca) |
| GET  | `/api/pacotes/:id` | Get package |
| PUT  | `/api/pacotes/:id` | Update package |
| DELETE | `/api/pacotes/:id` | Delete package |

---

## Comandas (`/api/comandas`) — protected

| Method | Path | Description |
|--------|------|-------------|
| GET  | `/api/comandas` | List comandas (filterable: status; includes fechadasHoje count) |
| POST | `/api/comandas` | Create comanda |
| GET  | `/api/comandas/:id` | Get comanda |
| PUT  | `/api/comandas/:id` | Update comanda (items, profissional, etc.) |
| PATCH | `/api/comandas/:id/fechar` | Close comanda |
| DELETE | `/api/comandas/:id` | Delete comanda |

---

## Utility Endpoints

| Method | Path | Protected | Description |
|--------|------|-----------|-------------|
| GET | `/api/health` | No | Server + DB connection status |
| GET | `/api/debug/status` | No | Frontend build path check |

---

## Known Issues & Technical Debt (resolved in this audit)

| # | File | Issue | Fix Applied |
|---|------|-------|-------------|
| 1 | `server.js:103` | `require('fs')` in ES module → runtime `ReferenceError` | Replaced with named `import { existsSync } from 'fs'` |
| 2 | `produtoController.js` | Missing `import mongoose` → `ReferenceError` in `obterStatisticas` and `obterPorCategoria` | Added import |
| 3 | `comandaController.js` | `obter`, `atualizar`, `fechar`, `deletar` lacked `empresa` filter → cross-tenant data access | All operations now filter by `empresa: req.usuario.id` |
| 4 | `comandaController.js:deletar` | No 404 when comanda not found | Returns 404 now |
| 5 | `authController.js:obterMeuPerfil` | No null check on user → crash if user deleted after token issued | Added 404 guard |
| 6 | `agendamentoController.js` | `catch (_) {}` silently swallowed conflict-check errors | Logs warning now |
| 7 | `adminController.js:deletarPlano` | Always returned 200 even when plan not found | Returns 404 if not found |

## Remaining Technical Debt

| Issue | Affected controllers | Recommendation |
|-------|---------------------|----------------|
| Inconsistent error response shape: half use `{ sucesso: false, mensagem }`, half use `{ error: message }` | estoque, movimentacao, produto, funcionario, faturamento, servico, pacote, alertas, transacao | Standardize to `{ sucesso: false, mensagem }` in a follow-up PR; coordinate with frontend team |
| JWT fallback secret is hardcoded | `autenticacao.js`, `authController.js`, `adminController.js` | Ensure `JWT_SECRET` env var is always set in production; remove fallback string |
| `/api/admin/seed` is permanently unprotected | `adminController.js` | Add a one-time-use guard or remove the route after initial setup |
| `obterMeuPerfil` does not handle deleted-user case with a clear tenant error | `authController.js` | Already fixed (404 guard added) |
