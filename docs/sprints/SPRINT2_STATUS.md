# 📅 SPRINT 2 - STATUS E GUIA DE TESTES

## 🎯 Objetivo da Sprint
Implementar o **Sistema Completo de Agendamentos** com:
- Backend: APIs CRUD com validação de conflito de horário
- Frontend: Interface intuitiva com filtros avançados
- Validação: Evitar agendamentos duplicados automaticamente

---

## ✅ O Que Foi Entregue

### Backend (REST API)

```
POST   /api/agendamentos
       ├─ Criar novo agendamento
       ├─ Valida conflito de horário automaticamente
       └─ Retorna: { sucesso, mensagem, dados }

GET    /api/agendamentos
       ├─ Lista agendamentos com filtros
       ├─ Filtros: dataInicio, dataFim, profissional, cliente, status
       └─ Retorna array de agendamentos com cliente populado

GET    /api/agendamentos/disponibilidade
       ├─ Retorna slots livres para um profissional em uma data
       ├─ Query: ?profissional=João&data=2026-04-03
       └─ Retorna: ['08:00', '08:30', '09:00', ...]

GET    /api/agendamentos/:id
       ├─ Obtém agendamento específico
       └─ Popula dados do cliente

PUT    /api/agendamentos/:id
       ├─ Atualiza agendamento (data, hora, status, preço, notas)
       ├─ Re-valida conflito se alterar horário
       └─ Retorna agendamento atualizado

DELETE /api/agendamentos/:id
       ├─ Cancela agendamento (marca como 'cancelado')
       └─ Não deleta, preserva histórico
```

### Model (MongoDB)

```javascript
Agendamento {
  _id: ObjectId,
  cliente: ObjectId (ref Usuario),
  profissional: String,          // Nome do profissional
  servico: String,                // Ex: "Corte de cabelo"
  dataAgendamento: Date,          // 2026-04-05
  horarioInicio: String,          // "14:30" (HH:MM)
  duracao: Number,                // 60 minutos
  status: String,                 // 'agendado' | 'concluido' | 'cancelado'
  preco: Number,                  // R$ 150.00
  notas: String,                  // Observações
  telefoneProfissional: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Frontend (React Components)

```
/agendamentos (Página Principal)
├─ Header com botão "+ Novo Agendamento"
├─ Filtros avançados
│  ├─ Data Início (input date)
│  ├─ Data Fim (input date)
│  ├─ Nome Profissional (input text)
│  └─ Status (select dropdown)
├─ Lista de Agendamentos em Grid (3 colunas)
│  └─ CartaoAgendamento (para cada agendamento)
│     ├─ Badge de status (azul/verde/vermelho)
│     ├─ Informações formatadas
│     └─ Botões: Concluir / Cancelar
└─ FormularioAgendamento (modal)
   ├─ Carrega horários disponíveis automaticamente
   ├─ Campos: cliente, profissional, serviço, data, hora, duração, preço, notas
   └─ Submit com validação
```

---

## 🚀 Como Testar Localmente

### 1️⃣ Preparar o Ambiente

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2️⃣ Iniciar Servers

**Terminal 1 - Backend (porta 5000)**
```bash
cd backend
npm start
```
Esperado:
```
✅ MongoDB conectado: localhost
🚀 BelaHub Backend rodando em http://localhost:5000
📝 API Health: http://localhost:5000/api/health
```

**Terminal 2 - Frontend (porta 3000)**
```bash
cd frontend
npm start
```

### 3️⃣ Testar no Navegador

**Passo 1: Registrar/Login**
- Abra: http://localhost:3000
- Registro: nome, email, empresa (opcional), telefone (opcional), senha
- Senha mínimo 6 caracteres

**Passo 2: Dashboard**
- Após login, veja o dashboard com métricas
- Clique em "📅 Agendamentos" na sidebar

**Passo 3: Criar Agendamento**
- Clique em "+ Novo Agendamento"
- Preencha os campos:
  - Cliente: "João Silva"
  - Profissional: "Maria"
  - Serviço: "Corte de cabelo"
  - Data: Selecione uma data futura
  - Horário: Sistema carrega horários disponíveis automaticamente
  - Duração: 60 minutos
  - Preço: 150.00
- Clique "Criar Agendamento"

**Passo 4: Testar Validação de Conflito**
- Tente agendar outro agendamento com MESMA profissional, DATA e HORÁRIO
- Sistema deve retornar: "Horário não disponível para este profissional nesta data"

**Passo 5: Filtrar Agendamentos**
- Use os filtros: data, profissional, status
- Sistema filtra em tempo real

**Passo 6: Ações**
- Clique "Concluir" para marcar como concluído
- Clique "Cancelar" para cancelar agendamento
- Status muda visualmente (cores)

---

## 🔧 Testes com cURL

### Criar Agendamento
```bash
TOKEN="seu_jwt_token_aqui"

curl -X POST http://localhost:5000/api/agendamentos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "cliente": "507f1f77bcf86cd799439011",
    "profissional": "Maria Santos",
    "servico": "Coloração",
    "dataAgendamento": "2026-04-10",
    "horarioInicio": "14:00",
    "duracao": 120,
    "preco": 250
  }'
```

### Listar Agendamentos
```bash
curl -X GET "http://localhost:5000/api/agendamentos?profissional=Maria&status=agendado" \
  -H "Authorization: Bearer $TOKEN"
```

### Horários Disponíveis
```bash
curl -X GET "http://localhost:5000/api/agendamentos/disponibilidade?profissional=Maria&data=2026-04-10" \
  -H "Authorization: Bearer $TOKEN"
```

### Atualizar Status
```bash
AGENDAMENTO_ID="507f1f77bcf86cd799439012"

curl -X PUT http://localhost:5000/api/agendamentos/$AGENDAMENTO_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status": "concluido"}'
```

### Cancelar Agendamento
```bash
curl -X DELETE http://localhost:5000/api/agendamentos/$AGENDAMENTO_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Estrutura de Arquivos Criados

```
backend/
├── src/
│   ├── models/
│   │   └── Agendamento.js          ✨ NOVO - Schema MongoDB
│   ├── controllers/
│   │   └── agendamentoController.js ✨ NOVO - Lógica de negócios
│   └── routes/
│       └── agendamentoRoutes.js     ✨ NOVO - Endpoints
└── server.js                        ✏️ MODIFICADO - Importa rotas

frontend/
├── src/
│   ├── pages/
│   │   └── Agendamentos.js          ✨ NOVO - Página principal
│   └── components/
│       ├── FormularioAgendamento.js ✨ NOVO - Form
│       └── CartaoAgendamento.js     ✨ NOVO - Card visual
└── App.js                           ✏️ JÁ ESTAVA PRONTO
```

---

## 🎨 Design & UX

### Cores (Identidade Visual)
- Primary: `#FF6B9D` (Rosa)
- Secondary: `#C44569` (Roxo)
- Success: `#4CAF50` (Verde)
- Error: `#f44336` (Vermelho)
- Info: `#2196F3` (Azul)

### Status Visual
```
🔵 Agendado   → Azul (#2196F3)
✅ Concluído  → Verde (#4CAF50)
❌ Cancelado  → Vermelho (#f44336)
⚠️  Não Comp. → Laranja (#FF9800)
```

### Responsividade
- Grid automático: `repeat(auto-fill, minmax(350px, 1fr))`
- Mobile: 1 coluna
- Tablet: 2 colunas
- Desktop: 3+ colunas

---

## 📈 Métricas da Sprint 2

| Métrica | Valor |
|---------|-------|
| Story Points | 34 SP |
| User Stories | 8 histórias |
| Arquivos Criados | 6 arquivos |
| Linhas de Código | ~1.100 LOC |
| Endpoints API | 6 endpoints |
| Commits | 2 (1 com código, 1 com docs) |
| Status | ✅ 100% CONCLUÍDA |

---

## 🐛 Bugs Conhecidos / Melhorias Futuras

### Sprint 3+
- [ ] Integrar Notifications (email/SMS)
- [ ] Adicionar Calendário Visual (react-big-calendar)
- [ ] Relatório de Agendamentos por período
- [ ] Cancelamento automático após 48h sem confirmação
- [ ] Sincronização com Google Calendar
- [ ] Lembretes por email/SMS

---

## 🔗 Links Úteis

- **Repositório**: https://github.com/GlaucioCoelho/BelaHub
- **Documentação API**: ./API_ENDPOINTS.md
- **Setup Local**: ./SETUP_INSTRUCOES.md
- **Sprint Planning**: ./Sprint2_Planejamento.xlsx

---

✨ **Sprint 2 Concluída com Sucesso!** ✨

Próximo: Sprint 3 - Gestão de Clientes
