# 🏆 Sprint 6 - Gestão de Estoque | Status & Documentação Completa

## 📋 Visão Geral do Sprint

**Sprint 6** implementa o **Sistema Completo de Gestão de Estoque** do BelaHub, permitindo:
- Gerenciamento centralizado de produtos com múltiplas localizações
- Rastreamento de movimentações de estoque (entrada, saída, ajuste, devolução, perda)
- Sistema de alertas automático para estoque baixo e crítico
- Relatórios e estatísticas de estoque e movimentações
- Integração com agendamentos e vendas

**Status:** ✅ **BACKEND COMPLETO** (100%)
- 4 Models implementados e testados
- 4 Controllers com 35+ endpoints
- 4 Route files com proteção de autenticação
- Integração com server.js concluída

---

## 🏗️ Arquitetura do Sistema

### Stack Técnico
- **Backend:** Node.js/Express 4.18.2
- **Database:** MongoDB com Mongoose 7.0.0
- **Autenticação:** JWT com middleware proteger
- **Padrão:** MVC (Models, Controllers, Routes)
- **Multitenancy:** Isolamento por empresa

### Fluxo de Dados

```
Produto (SKU, preço, categoria)
    ↓
Estoque (quantidade por localização)
    ↓
Movimentação (entrada, saída, ajuste)
    ↓
AlertaEstoque (monitoramento automático)
```

### Relações entre Models

```
Empresa (Usuario)
    ├─ Produto (1:N) - SKU único por empresa
    ├─ Estoque (1:N) - quantidade por localização
    │   └─ Movimentacao (1:N) - histórico de movimentações
    │   └─ AlertaEstoque (1:N) - alertas por estoque
    └─ Movimentacao (1:N) - log centralizado
```

---

## 📦 Models

### 1. **Produto** (`src/models/Produto.js`)

Representa um produto no catálogo com informações comerciais.

**Campos Principais:**
```javascript
{
  empresa: ObjectId (ref: Usuario, required),
  sku: String (unique, uppercase, required),
  nome: String (required),
  descricao: String,
  categoria: String (enum: higiene|cosmetico|ferramenta|uniforme|acessorio|outro),
  precoUnitario: Number (required, >= 0),
  precoCusto: Number,
  unidade: String (enum: un|ml|g|l|kg, default: un),
  ativo: Boolean (default: true),
  fornecedor: String,
  codigoFornecedor: String,
  estoqueMinimoAlerta: Number (default: 5),
  localizacao: String,
  dataUltimaMovimentacao: Date
}
```

**Índices:**
- `{ empresa: 1, sku: 1 }`
- `{ empresa: 1, categoria: 1 }`
- `{ empresa: 1, ativo: 1 }`
- `{ sku: 1 }` (único)

**Métodos:**
- `verificarSkuUnico(sku, excludeId)` - Valida SKU único por empresa
- `calcularMargem()` - Calcula margem de lucro (preco - custo) / preco
- `toJSON()` - Formata resposta com margem calculada

---

### 2. **Estoque** (`src/models/Estoque.js`)

Rastreia quantidade de produtos em diferentes localizações.

**Campos Principais:**
```javascript
{
  empresa: ObjectId (ref: Usuario, required),
  produto: ObjectId (ref: Produto, required),
  localizacao: String (required),
  quantidadeAtual: Number (>= 0),
  quantidadeReservada: Number (>= 0),
  quantidadeDisponivel: Number (auto calculado),
  estoqueMinimoLocal: Number (default: 5),
  estoqueMaximoLocal: Number,
  dataUltimaContagem: Date,
  observacoes: String
}
```

**Índices:**
- `{ empresa: 1, produto: 1, localizacao: 1 }` (unique)
- `{ empresa: 1, localizacao: 1 }`
- `{ empresa: 1, quantidadeAtual: 1 }`

**Métodos:**
- `adicionarQuantidade(quantidade)` - Incrementa quantidade
- `removerQuantidade(quantidade)` - Decrementa quantidade
- `reservarQuantidade(quantidade)` - Reserva itens para venda
- `liberarReserva(quantidade)` - Libera reserva após cancelamento
- `estaComEstoqueBaixo()` - Verifica se quantidade <= mínimo
- `estaAcimaDoMaximo()` - Verifica se excede máximo
- `verificarDisponibilidade(produtoId, quantidade)` - Valida disponibilidade global

---

### 3. **Movimentacao** (`src/models/Movimentacao.js`)

Registra todas as movimentações de estoque para auditoria e análise.

**Campos Principais:**
```javascript
{
  empresa: ObjectId (ref: Usuario, required),
  produto: ObjectId (ref: Produto, required),
  estoque: ObjectId (ref: Estoque, required),
  tipo: String (enum: entrada|saida|ajuste|devolucao|perda, required),
  quantidade: Number (required, >= 0),
  motivo: String (específico por tipo, required),
  referencia: {
    agendamento: ObjectId,
    notaFiscal: String,
    documentoInterno: String
  },
  usuarioResponsavel: String (required),
  observacoes: String,
  dataPlanejada: Date,
  status: String (enum: planejada|realizada|cancelada, default: realizada)
}
```

**Motivos por Tipo:**
- **entrada:** compra, devolucao_fornecedor, transferencia_interna, contagem
- **saida:** venda, uso_interno, transferencia_interna, devolucao_cliente
- **ajuste:** correcao_estoque, ajuste_fisico, reconciliacao
- **devolucao:** defeituoso, vencido, cliente_insatisfeito
- **perda:** roubo, dano, obsoleto, outro

**Índices:**
- `{ empresa: 1, produto: 1, createdAt: -1 }`
- `{ empresa: 1, estoque: 1, createdAt: -1 }`
- `{ empresa: 1, tipo: 1, createdAt: -1 }`
- `{ empresa: 1, status: 1 }`
- `{ referencia.agendamento: 1 }`

**Métodos:**
- `listarComFiltros(empresa, filtros)` - Listagem com paginação
- `obterResumo(empresa, dataInicio, dataFim)` - Resumo por tipo
- `toJSON()` - Formata com data/hora legível

---

### 4. **AlertaEstoque** (`src/models/AlertaEstoque.js`)

Sistema de alertas para monitorar condições críticas de estoque.

**Campos Principais:**
```javascript
{
  empresa: ObjectId (ref: Usuario, required),
  produto: ObjectId (ref: Produto, required),
  estoque: ObjectId (ref: Estoque, required),
  tipo: String (enum: estoque_baixo|estoque_critico|estoque_maximo_excedido|produto_vencido),
  severidade: String (enum: baixa|media|alta|critica),
  quantidadeAtual: Number,
  quantidadeLimite: Number,
  descricao: String,
  ativo: Boolean (default: true),
  lido: Boolean (default: false),
  dataLeitura: Date,
  acaoTomada: {
    tipo: String (enum: pedido_compra|transferencia|pausa_venda|ignorado|nenhuma),
    descricao: String,
    data: Date,
    usuarioResponsavel: String
  }
}
```

**Índices:**
- `{ empresa: 1, ativo: 1, lido: 1 }`
- `{ empresa: 1, tipo: 1, severidade: 1 }`
- `{ empresa: 1, produto: 1, createdAt: -1 }`
- `{ ativo: 1, lido: 1, createdAt: -1 }`

**Métodos Estáticos:**
- `criarAlertaEstoque(empresa, produto, estoque, tipo, qtdAtual, qtdLimite)` - Cria/atualiza alerta
- `determinarSeveridade(tipo, quantidade, limite)` - Define nível de severidade
- `obterDescricaoAlerta(tipo, quantidade, limite)` - Gera descrição automática
- `obterNaoLidos(empresa)` - Lista alertas não lidos
- `obterResumo(empresa)` - Agregação por tipo/severidade

**Métodos de Instância:**
- `marcarComoLido()` - Marca como lido
- `registrarAcao(tipo, descricao, usuarioResponsavel)` - Registra ação e desativa alerta

---

## 🎮 Controllers

### 1. **produtoController.js** (8 funções)

Gerencia CRUD de produtos e estatísticas.

**Funções:**
1. `criar(req, res)` - Cria novo produto com validação de SKU
2. `listar(req, res)` - Lista com filtro por categoria, ativo, busca e paginação
3. `obter(req, res)` - Obtém detalhes com estoques associados
4. `atualizar(req, res)` - Atualiza com validação de SKU
5. `deletar(req, res)` - Deleta se sem estoque
6. `obterStatisticas(req, res)` - Dashboard: total produtos, valor em estoque, produtos baixos
7. `obterPorCategoria(req, res)` - Lista por categoria
8. `listarComEstoque(req, res)` - Lista com totais de estoque

---

### 2. **estoqueController.js** (11 funções)

Gerencia operações de estoque e quantidades.

**Funções:**
1. `criar(req, res)` - Cria novo registro de estoque
2. `listar(req, res)` - Lista com filtro por localização
3. `obter(req, res)` - Obtém com movimentações recentes
4. `atualizar(req, res)` - Atualiza configurações
5. `deletar(req, res)` - Deleta e limpa alertas associados
6. `adicionarQuantidade(req, res)` - Entrada com registro de movimentação
7. `removerQuantidade(req, res)` - Saída com validação e alerta
8. `reservarQuantidade(req, res)` - Reserva itens
9. `liberarReserva(req, res)` - Libera reserva
10. `obterPorProduto(req, res)` - Todas as localizações de um produto
11. `obterResumoEstoque(req, res)` - Estatísticas gerais

---

### 3. **movimentacaoController.js** (8 funções)

Registra e analisa movimentações de estoque.

**Funções:**
1. `criar(req, res)` - Cria movimentação e atualiza estoque
2. `listar(req, res)` - Lista com múltiplos filtros e paginação
3. `obter(req, res)` - Obtém movimentação com detalhes
4. `atualizar(req, res)` - Atualiza movimentação
5. `deletar(req, res)` - Deleta movimentação
6. `obterResumo(req, res)` - Resumo por tipo em período
7. `obterPorEstoque(req, res)` - Histórico de estoque específico
8. `obterRelatorioMensalPorTipo(req, res)` - Análise por tipo/motivo
9. `gerarMovimentacaoEmLote(req, res)` - Processa múltiplas movimentações

---

### 4. **alertasController.js** (12 funções)

Gerencia sistema de alertas de estoque.

**Funções:**
1. `listarAlertas(req, res)` - Lista com filtros e paginação
2. `obterAlerta(req, res)` - Obtém detalhes de um alerta
3. `marcarComoLido(req, res)` - Marca alerta como lido
4. `marcarVariosComoLidos(req, res)` - Operação em lote
5. `registrarAcao(req, res)` - Registra ação tomada e desativa
6. `obterNaoLidos(req, res)` - Lista apenas não lidos
7. `obterResumo(req, res)` - Contagem por tipo e severidade
8. `criarAlertaManual(req, res)` - Cria alerta manualmente
9. `desativarAlerta(req, res)` - Desativa alerta
10. `desativarVariosAlertas(req, res)` - Operação em lote
11. `obterAlertsporProduto(req, res)` - Alertas de um produto
12. `obterHistoricoAlertas(req, res)` - Histórico com paginação
13. `obterEstatisticas(req, res)` - Analytics: tipos, severidade, taxa resolução

---

## 🌐 API Endpoints

### Produtos (`/api/produtos`)

```
POST   /api/produtos
       Criar novo produto
       Body: { sku, nome, descricao, categoria, precoUnitario, precoCusto, unidade, ... }

GET    /api/produtos
       Listar produtos com filtros
       Query: ?categoria=cosmetico&ativo=true&busca=creme&pagina=1&limite=20

GET    /api/produtos/:id
       Obter produto com estoques

PUT    /api/produtos/:id
       Atualizar produto

DELETE /api/produtos/:id
       Deletar produto (sem estoque)

GET    /api/produtos/com-estoque/listar
       Listar com totais de estoque

GET    /api/produtos/estatisticas/geral
       Dashboard: totais, valor, produtos baixos

GET    /api/produtos/categoria/:categoria
       Listar por categoria
```

### Estoque (`/api/estoque`)

```
POST   /api/estoque
       Criar registro de estoque
       Body: { produto, localizacao, quantidadeAtual, estoqueMinimoLocal, ... }

GET    /api/estoque
       Listar com filtro por localização
       Query: ?localizacao=prateleira%201&pagina=1&limite=20

GET    /api/estoque/:id
       Obter estoque com movimentações recentes

PUT    /api/estoque/:id
       Atualizar configurações

DELETE /api/estoque/:id
       Deletar estoque

GET    /api/estoque/resumo/geral
       Resumo: total quantidade, disponível, reservado, localizações

GET    /api/estoque/produto/:produtoId
       Todas as localizações de um produto

POST   /api/estoque/:id/adicionar
       Entrada de estoque
       Body: { quantidade, motivo, usuarioResponsavel, referencia: {...} }

POST   /api/estoque/:id/remover
       Saída de estoque
       Body: { quantidade, motivo, usuarioResponsavel, referencia: {...} }

POST   /api/estoque/:id/reservar
       Reservar itens
       Body: { quantidade, usuarioResponsavel }

POST   /api/estoque/:id/liberar-reserva
       Liberar reserva
       Body: { quantidade }
```

### Movimentações (`/api/movimentacoes`)

```
POST   /api/movimentacoes
       Registrar movimentação
       Body: { estoque, quantidade, tipo, motivo, usuarioResponsavel, referencia: {...} }

GET    /api/movimentacoes
       Listar com múltiplos filtros
       Query: ?tipo=entrada&motivo=compra&status=realizada&dataInicio=2024-01-01&dataFim=2024-01-31&pagina=1

GET    /api/movimentacoes/:id
       Obter movimentação

PUT    /api/movimentacoes/:id
       Atualizar movimentação

DELETE /api/movimentacoes/:id
       Deletar movimentação

GET    /api/movimentacoes/resumo/geral
       Resumo por tipo em período
       Query: ?dataInicio=2024-01-01&dataFim=2024-01-31

GET    /api/movimentacoes/relatorio/mensal
       Análise por tipo/motivo
       Query: ?dataInicio=2024-01-01&dataFim=2024-01-31

GET    /api/movimentacoes/estoque/:estoqueId
       Histórico de movimentações de estoque
       Query: ?pagina=1&limite=10

POST   /api/movimentacoes/lote/processar
       Processar múltiplas movimentações
       Body: { movimentacoes: [{ estoque, quantidade, tipo, ... }, ...] }
```

### Alertas (`/api/alertas`)

```
GET    /api/alertas
       Listar alertas com filtros
       Query: ?ativo=true&lido=false&tipo=estoque_baixo&severidade=alta&pagina=1

GET    /api/alertas/:id
       Obter alerta

POST   /api/alertas
       Criar alerta manual
       Body: { produto, estoque, tipo, severidade, descricao }

GET    /api/alertas/nao-lidos/listar
       Listar não lidos

GET    /api/alertas/resumo/geral
       Contagem por severidade

GET    /api/alertas/estatisticas/geral
       Analytics: por tipo, severidade, taxa resolução
       Query: ?dataInicio=2024-01-01&dataFim=2024-01-31

GET    /api/alertas/historico/listagem
       Histórico com paginação
       Query: ?produtoId=xxx&dataInicio=2024-01-01&pagina=1&limite=10

GET    /api/alertas/produto/:produtoId
       Alertas ativos de um produto

POST   /api/alertas/:id/lido
       Marcar como lido

POST   /api/alertas/:id/desativar
       Desativar alerta

POST   /api/alertas/acao/registrar/:id
       Registrar ação tomada
       Body: { tipo, descricao, usuarioResponsavel }

POST   /api/alertas/lote/marcar-como-lidos
       Marcar vários como lidos
       Body: { alertaIds: [...] }

POST   /api/alertas/lote/desativar
       Desativar vários
       Body: { alertaIds: [...] }
```

---

## 🧪 Exemplos cURL

### Criar Produto
```bash
curl -X POST http://localhost:5000/api/produtos \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "CREME-FACIAL-001",
    "nome": "Creme Facial Hidratante",
    "descricao": "Creme facial com vitamina E e aloe vera",
    "categoria": "cosmetico",
    "precoUnitario": 45.90,
    "precoCusto": 20.00,
    "unidade": "ml",
    "fornecedor": "Fornecedor X",
    "estoqueMinimoAlerta": 10
  }'
```

### Criar Estoque
```bash
curl -X POST http://localhost:5000/api/estoque \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "produto": "PRODUCT_ID",
    "localizacao": "Prateleira 1 - Área Cosméticos",
    "quantidadeAtual": 50,
    "estoqueMinimoLocal": 10,
    "estoqueMaximoLocal": 200
  }'
```

### Entrada de Estoque (Compra)
```bash
curl -X POST http://localhost:5000/api/estoque/ESTOQUE_ID/adicionar \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantidade": 100,
    "motivo": "compra",
    "usuarioResponsavel": "gerente@belahub.com",
    "referencia": {
      "notaFiscal": "NF-001234",
      "documentoInterno": "PEDIDO-5678"
    }
  }'
```

### Saída de Estoque (Uso em Serviço)
```bash
curl -X POST http://localhost:5000/api/estoque/ESTOQUE_ID/remover \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantidade": 2,
    "motivo": "uso_interno",
    "usuarioResponsavel": "manicure@belahub.com",
    "referencia": {
      "agendamento": "AGENDAMENTO_ID"
    }
  }'
```

### Listar Alertas Não Lidos
```bash
curl -X GET http://localhost:5000/api/alertas/nao-lidos/listar \
  -H "Authorization: Bearer JWT_TOKEN"
```

### Marcar Alerta como Lido
```bash
curl -X POST http://localhost:5000/api/alertas/ALERTA_ID/lido \
  -H "Authorization: Bearer JWT_TOKEN"
```

### Registrar Ação em Alerta
```bash
curl -X POST http://localhost:5000/api/alertas/acao/registrar/ALERTA_ID \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "pedido_compra",
    "descricao": "Pedido enviado para fornecedor - Esperado em 5 dias úteis",
    "usuarioResponsavel": "gerente@belahub.com"
  }'
```

### Movimentação em Lote
```bash
curl -X POST http://localhost:5000/api/movimentacoes/lote/processar \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "movimentacoes": [
      {
        "estoque": "ESTOQUE_ID_1",
        "quantidade": 10,
        "tipo": "entrada",
        "motivo": "compra",
        "usuarioResponsavel": "admin"
      },
      {
        "estoque": "ESTOQUE_ID_2",
        "quantidade": 5,
        "tipo": "saida",
        "motivo": "uso_interno",
        "usuarioResponsavel": "admin"
      }
    ]
  }'
```

### Obter Estatísticas de Produtos
```bash
curl -X GET http://localhost:5000/api/produtos/estatisticas/geral \
  -H "Authorization: Bearer JWT_TOKEN"
```

**Response:**
```json
{
  "resumo": {
    "totalProdutos": 45,
    "produtosAtivos": 42,
    "produtosInativos": 3,
    "valorTotalEstoque": 15420.50,
    "produtosComEstoqueBaixo": 7
  },
  "estoquesBaixos": [...],
  "produtosMaisMovimentados": [...],
  "distribuicaoPorCategoria": [...]
}
```

---

## 🔗 Pontos de Integração

### Com Sprint 4 (Funcionários)
- Movimentações podem referenciar agendamentos de funcionários
- Rastreamento de uso de produtos em serviços

### Com Sprint 5 (Financeiro)
- Produtos têm preço para cálculo de receitas
- Movimentações podem ser vinculadas a transações
- Valor total de estoque para fluxo de caixa

### Com Sprint 3 (Agendamentos)
- Produtos usados em serviços são registrados como saída
- Comissões de produtos vendidos

### Com Sprint 2 (Clientes)
- Histórico de produtos comprados
- Preferências de produtos por cliente

---

## ✅ Checklist de Implementação

### Models ✅
- [x] Produto.js com validação SKU, cálculo de margem
- [x] Estoque.js com operações de quantidade e reserva
- [x] Movimentacao.js com agregações e histórico
- [x] AlertaEstoque.js com criação automática e resolução

### Controllers ✅
- [x] produtoController.js (8 funções)
- [x] estoqueController.js (11 funções)
- [x] movimentacaoController.js (9 funções)
- [x] alertasController.js (13 funções)

### Routes ✅
- [x] produtoRoutes.js com 8 endpoints
- [x] estoqueRoutes.js com 11 endpoints
- [x] movimentacaoRoutes.js com 8 endpoints
- [x] alertasRoutes.js com 13 endpoints

### Integration ✅
- [x] Imports adicionados em server.js
- [x] Routes registradas com /api/produtos, /api/estoque, /api/movimentacoes, /api/alertas
- [x] Middleware de autenticação em todas as rotas

### Documentation ✅
- [x] SPRINT6_STATUS.md (este arquivo) completo

---

## 📊 Estatísticas da Implementação

- **Models:** 4 arquivos, ~500 linhas
- **Controllers:** 4 arquivos, ~900 linhas
- **Routes:** 4 arquivos, ~100 linhas
- **Total Backend:** ~1.500 linhas de código
- **Endpoints:** 40+ rotas HTTP
- **Métodos:** 50+ funções de negócio

---

## 🚀 Próximas Etapas (Sprint 6 Frontend)

1. **Pages:**
   - [x] Estoque.js - Visualização centralizada com gráficos
   - [x] Produtos.js - CRUD de produtos

2. **Components:**
   - [x] FormularioProduto.js - Criação/edição de produtos
   - [x] CartaoEstoque.js - Card para exibição de estoque
   - [x] ModalMovimentacao.js - Modal para registrar movimentações
   - [x] PainelAlertas.js - Dashboard de alertas

3. **Integration:**
   - Conectar com Sprint 5 (Financeiro)
   - Conectar com Sprint 4 (Funcionários)

---

## 📝 Notas Importantes

- ✅ Todas as rotas protegidas com autenticação JWT
- ✅ Multitenancy garantida com isolamento por empresa
- ✅ Índices otimizados para performance
- ✅ Validação de dados em Models e Controllers
- ✅ Alertas criados automaticamente para condições críticas
- ✅ Histórico completo de movimentações para auditoria

---

**Status Final:** 🎉 Sprint 6 Backend 100% Completo
**Data:** 2026-04-03
**Próximo:** Sprint 6 Frontend + Integração com Sprints anteriores
