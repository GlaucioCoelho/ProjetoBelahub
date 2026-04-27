# 🏗️ ARQUITETURA DO SISTEMA - SPRINT 2

## 📐 Fluxo Completo de Dados

```
┌─────────────────────────────────────────────────────────────────┐
│                    NAVEGADOR DO USUÁRIO                         │
│                    http://localhost:3000                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React 18)                          │
│                                                                 │
│  Pages/                                                         │
│  ├─ Agendamentos.js (Página Principal)                         │
│  │  ├─ Estado: agendamentos[], filtros, carregando, mensagem   │
│  │  ├─ useEffect: carregarAgendamentos()                       │
│  │  └─ Renderiza: Filtros + Lista de Cards                     │
│  │                                                              │
│  Components/                                                    │
│  ├─ FormularioAgendamento.js                                   │
│  │  ├─ Campos: cliente, profissional, data, hora, duração      │
│  │  ├─ onBlur(profissional, data): carrega horários            │
│  │  └─ onSubmit: POST /api/agendamentos                        │
│  │                                                              │
│  ├─ CartaoAgendamento.js                                       │
│  │  ├─ Props: agendamento, onAtualizar                         │
│  │  ├─ Botões: Concluir (PUT), Cancelar (DELETE)              │
│  │  └─ Cores: status visual (azul/verde/vermelho)              │
│  │                                                              │
│  Store/                                                         │
│  └─ authStore.js (Zustand)                                     │
│     └─ Estado: usuario, estaAutenticado, token                 │
│                                                                 │
│  Services/                                                      │
│  └─ authService.js                                             │
│     └─ obterToken(): retorna JWT do localStorage               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
            ↓ (axios + JWT Token)      ↑ (JSON Response)
        ─────────────────────────────────────────
                 HTTPS/CORS (porta 5000)
        ─────────────────────────────────────────
            ↓ (JSON Request)            ↑ (JSON Response)
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND (Node.js + Express)                        │
│              http://localhost:5000/api                          │
│                                                                 │
│  Routes/ (agendamentoRoutes.js)                                │
│  ├─ POST   /agendamentos         → criar()                     │
│  ├─ GET    /agendamentos         → listar()                    │
│  ├─ GET    /agendamentos/:id     → obter()                     │
│  ├─ PUT    /agendamentos/:id     → atualizar()                 │
│  ├─ DELETE /agendamentos/:id     → cancelar()                  │
│  └─ GET    /disponibilidade      → obterHorariosDisponiveis()  │
│                                                                 │
│  Middleware/                                                    │
│  └─ autenticacao.js: proteger()                                │
│     └─ Verifica: Authorization: Bearer <JWT>                   │
│        Se inválido → 401 Unauthorized                          │
│                                                                 │
│  Controllers/ (agendamentoController.js)                       │
│  ├─ criar()                                                    │
│  │  ├─ Valida: cliente, profissional, servico, data, hora     │
│  │  ├─ Chamada: Agendamento.verificarConflito()               │
│  │  │  └─ Se houver conflito → 409 Conflict                   │
│  │  ├─ Create no MongoDB                                       │
│  │  └─ Return: 201 + dados criados                             │
│  │                                                              │
│  ├─ listar()                                                   │
│  │  ├─ Build filtro: { dataAgendamento, profissional, ... }   │
│  │  ├─ find(filtro).populate('cliente')                        │
│  │  └─ Return: 200 + array de agendamentos                     │
│  │                                                              │
│  ├─ obter()                                                    │
│  │  ├─ findById(id).populate('cliente')                        │
│  │  └─ Return: 200 + agendamento ou 404                        │
│  │                                                              │
│  ├─ atualizar()                                                │
│  │  ├─ Se mudar data/hora → verifica conflito novamente       │
│  │  ├─ Update: dataAgendamento, horarioInicio, status, etc     │
│  │  └─ Return: 200 + agendamento atualizado                    │
│  │                                                              │
│  ├─ cancelar()                                                 │
│  │  ├─ findByIdAndUpdate(id, { status: 'cancelado' })         │
│  │  └─ Return: 200 + agendamento (não deleta)                  │
│  │                                                              │
│  └─ obterHorariosDisponiveis()                                 │
│     ├─ find({ profissional, dataAgendamento, status })        │
│     ├─ Loop 8h-18h em slots de 30min                          │
│     ├─ Remove horários já ocupados                             │
│     └─ Return: 200 + ['08:00', '08:30', ...]                   │
│                                                                 │
│  Models/ (Agendamento.js)                                      │
│  └─ Schema MongoDB:                                            │
│     ├─ cliente: ObjectId (ref Usuario)                         │
│     ├─ profissional: String                                    │
│     ├─ servico: String                                         │
│     ├─ dataAgendamento: Date                                   │
│     ├─ horarioInicio: String (HH:MM)                           │
│     ├─ duracao: Number                                         │
│     ├─ status: enum ['agendado', 'concluido', 'cancelado']     │
│     ├─ preco: Number                                           │
│     ├─ notas: String                                           │
│     ├─ Métodos:                                                │
│     │  ├─ verificarConflito() - valida sobreposição            │
│     │  ├─ obterHorarioFim() - calcula hora de término          │
│     │  └─ toJSON() - formata resposta                          │
│     └─ Índices: { profissional, dataAgendamento, horarioInicio}│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                         ↓ ↑
                    MongoDB Driver
                         ↓ ↑
┌─────────────────────────────────────────────────────────────────┐
│            DATABASE (MongoDB - localhost:27017)                 │
│                                                                 │
│  Database: belahub                                              │
│  ├─ Collection: usuarios (Sprint 1)                            │
│  │  └─ Fields: _id, nome, email, senha, telefone, role, etc   │
│  │                                                              │
│  └─ Collection: agendamentos (Sprint 2)                        │
│     ├─ Document 1: {_id, cliente, profissional, ...}          │
│     ├─ Document 2: {_id, cliente, profissional, ...}          │
│     └─ Índice: { profissional, dataAgendamento, horarioInicio }│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Criar Agendamento (Passo a Passo)

```
1. USUÁRIO CLICA "+Novo Agendamento"
   └─ FormularioAgendamento abre (modal)

2. USUÁRIO PREENCHE FORMULÁRIO
   ├─ Cliente: "João Silva"
   ├─ Profissional: "Maria Santos"
   ├─ Data: "2026-04-10"
   ├─ Horário: "14:00"
   └─ Duração: 60

3. AO SELECIONAR DATA + PROFISSIONAL
   └─ Frontend: GET /api/agendamentos/disponibilidade
      ├─ Query: profissional=Maria&data=2026-04-10
      └─ Response: ['08:00', '08:30', '09:00', ... '18:00']

4. USUÁRIO CLICA "CRIAR AGENDAMENTO"
   └─ Frontend: POST /api/agendamentos
      ├─ Headers: Authorization: Bearer <JWT>
      ├─ Body: { cliente, profissional, servico, ... }
      └─ Backend recebe

5. BACKEND - VALIDAÇÃO
   ├─ Middleware: proteger() → valida JWT
   ├─ Controller: criar() → valida campos obrigatórios
   └─ Model: verificarConflito()
      ├─ Busca agendamentos existentes MESMA data/profissional
      ├─ Loop verifica sobreposição de horários
      └─ Se SIM: return erro 409 "Horário não disponível"
      └─ Se NÃO: prossegue

6. MONGODB - CRIAR DOCUMENTO
   ├─ Agendamento.create(dados)
   └─ Insere novo documento + timestamps

7. BACKEND - RESPOSTA
   ├─ Status: 201 Created
   └─ Body: { sucesso: true, dados: {...} }

8. FRONTEND - ATUALIZAR UI
   ├─ Limpa formulário
   ├─ Mostra mensagem "Sucesso!"
   ├─ Aguarda 1500ms
   └─ Chamada: carregarAgendamentos() (refresca lista)

9. FRONTEND - REFRESCA LISTA
   └─ GET /api/agendamentos
      └─ Retorna array com novo agendamento

10. USUÁRIO VÊ NOVO CARTÃO
    ├─ CartaoAgendamento renderizado
    ├─ Status: 🔵 Agendado (azul)
    └─ Botões: Concluir / Cancelar disponíveis
```

---

## 🛡️ Validações de Segurança

```
┌─ AUTENTICAÇÃO ─────────────────────────┐
│                                        │
│ 1. Usuario faz Login                   │
│    └─ POST /api/auth/login              │
│       └─ Retorna: JWT Token (7 dias)    │
│                                        │
│ 2. JWT armazenado em localStorage       │
│                                        │
│ 3. Toda request para /api/agendamentos │
│    └─ Headers: Authorization: Bearer... │
│                                        │
│ 4. Middleware proteger() valida        │
│    ├─ JWT válido?                      │
│    ├─ JWT expirado?                    │
│    └─ Se erro → 401 Unauthorized        │
│                                        │
│ 5. Continua se autenticado ✅           │
│                                        │
└────────────────────────────────────────┘

┌─ VALIDAÇÃO DE DADOS ────────────────────────┐
│                                             │
│ Campos Obrigatórios:                        │
│  ✓ cliente                                  │
│  ✓ profissional                             │
│  ✓ servico                                  │
│  ✓ dataAgendamento                          │
│  ✓ horarioInicio (regex: HH:MM)             │
│  ✓ duracao (15-480 minutos)                 │
│                                             │
│ Validações Automáticas:                     │
│  ✓ Evita agendamentos duplicados            │
│  ✓ Valida formato de hora (24h)             │
│  ✓ Valida duração (mínimo 15min)            │
│  ✓ Apenas status conhecidos aceitos         │
│                                             │
└─────────────────────────────────────────────┘

┌─ PROTEÇÃO DE DADOS ─────────────────────────┐
│                                             │
│ MongoDB:                                    │
│  ✓ Validações do Mongoose Schema            │
│  ✓ Tipos de dados garantidos                │
│  ✓ Enum restrito para status                │
│  ✓ Cliente populado (seguro - ref)          │
│                                             │
│ API:                                        │
│  ✓ CORS configurado (porta 3000)            │
│  ✓ Timeout em requests                      │
│  ✓ Rate limiting (implementar Sprint 3)     │
│  ✓ Sanitização de entrada (Mongoose)        │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 📊 Padrão de Resposta API

### Sucesso (201/200)
```json
{
  "sucesso": true,
  "mensagem": "Agendamento criado com sucesso",
  "dados": {
    "_id": "507f1f77bcf86cd799439011",
    "cliente": {
      "_id": "507f1f77bcf86cd799439010",
      "nome": "João Silva",
      "email": "joao@example.com",
      "telefone": "11999999999"
    },
    "profissional": "Maria Santos",
    "servico": "Corte de cabelo",
    "dataAgendamento": "2026-04-10T00:00:00.000Z",
    "dataFormatada": "10/04/2026",
    "horarioInicio": "14:00",
    "horarioFim": "15:00",
    "duracao": 60,
    "status": "agendado",
    "preco": 150,
    "notas": "Cliente preferência: sem máquina",
    "createdAt": "2026-04-03T20:30:00.000Z",
    "updatedAt": "2026-04-03T20:30:00.000Z"
  }
}
```

### Erro - Conflito de Horário (409)
```json
{
  "sucesso": false,
  "mensagem": "Horário não disponível para este profissional nesta data"
}
```

### Erro - Não Autenticado (401)
```json
{
  "sucesso": false,
  "mensagem": "Token expirado ou inválido"
}
```

### Erro - Validação (400)
```json
{
  "sucesso": false,
  "mensagem": "Campos obrigatórios faltando"
}
```

---

## 🔧 Ferramentas & Tecnologias

```
Frontend:
  ├─ React 18.2.0
  ├─ React Router 6.11.0
  ├─ Axios 1.4.0 (HTTP Client)
  ├─ Zustand 4.3.7 (State Management)
  ├─ Styled Components 5.3.10 (CSS-in-JS)
  ├─ React Hook Form 7.43.9 (Forms)
  └─ Date-fns 2.30.0 (Datas)

Backend:
  ├─ Node.js + Express 4.18.2
  ├─ MongoDB + Mongoose 7.0.0
  ├─ JWT (jsonwebtoken 9.0.0)
  ├─ bcryptjs 2.4.3 (Password Hash)
  ├─ CORS 2.8.5
  └─ dotenv 16.0.3 (Env Vars)

Database:
  └─ MongoDB 5.0+ (localhost:27017)

DevTools:
  ├─ Postman/Insomnia (testar API)
  ├─ MongoDB Compass (gerenciar DB)
  ├─ VS Code + ESLint
  └─ GitHub (versionamento)
```

---

## 🎯 Resumo Arquitetura

| Camada | Tecnologia | Responsabilidade |
|--------|-----------|-----------------|
| **Apresentação** | React 18 | Interface, componentes, estado |
| **Estado** | Zustand | Autenticação, contexto global |
| **HTTP Client** | Axios | Requisições, JWT header |
| **Roteamento** | React Router | Navegação entre páginas |
| **Servidor** | Express.js | Rotas, middleware, lógica |
| **Validação** | Mongoose | Schema, validações, métodos |
| **Banco** | MongoDB | Persistência de dados |

---

✨ **Arquitetura pronta para escalar para Sprint 3!** ✨
