# 🎯 BelaHub - Comece Aqui!

Bem-vindo ao projeto **BelaHub**! Este arquivo é seu ponto de partida para entender e começar o desenvolvimento.

---

## 📚 Documentos Importantes (Leia na Ordem)

### 1️⃣ **COMECE_AQUI.md** ← VOCÊ ESTÁ AQUI
Visão geral do projeto (este arquivo)

### 2️⃣ **README.md**
- Descrição completa do projeto
- Arquitetura técnica
- Stack tecnológico
- Como estrutura está organizada

### 3️⃣ **SETUP_INSTRUCOES.md** ⭐ LEIA PRIMEIRO
Guia passo-a-passo para:
- Instalar Node.js e dependências
- Configurar MongoDB
- Rodar backend e frontend localmente
- Teste o ambiente

### 4️⃣ **GITHUB_SETUP.md**
Como criar o repositório privado no GitHub

### 5️⃣ **PRIMEIRO_PUSH_GITHUB.md**
Como fazer o primeiro push para o GitHub

### 6️⃣ **Planejamento_BelaHub.xlsx** 📊
Planilha com:
- **Backlog**: Todas as histórias priorizadas (MoSCoW)
- **Sprint 1**: Primeira sprint detalhada
- **Roadmap**: Cronograma completo (6 sprints)
- **Riscos**: Análise de riscos do projeto

---

## 🚀 Quickstart (5 minutos)

```bash
# 1. Setup Backend
cd backend
cp .env.example .env
npm install
npm run dev

# 2. Em outro terminal: Setup Frontend
cd frontend
npm install
npm start

# 3. Abra navegador em http://localhost:3000
```

---

## 📁 Estrutura do Projeto

```
BelaHub/
├── 📄 README.md                        # Documentação principal
├── 📄 SETUP_INSTRUCOES.md             # Como configurar tudo
├── 📄 GITHUB_SETUP.md                 # GitHub
├── 📄 PRIMEIRO_PUSH_GITHUB.md         # Primeiro push
├── 📊 Planejamento_BelaHub.xlsx       # Backlog e roadmap
├── 🔑 .gitignore                      # Arquivos ignorados
│
├── 📁 backend/                        # API Node.js + Express
│   ├── src/
│   │   ├── models/                   # Schemas MongoDB
│   │   │   ├── Cliente.js            # Modelo de cliente
│   │   │   └── Agendamento.js        # Modelo de agendamento
│   │   ├── controllers/              # Lógica de negócio (a implementar)
│   │   ├── routes/                   # Endpoints API (a implementar)
│   │   ├── middlewares/              # Auth, validação (a implementar)
│   │   └── config/
│   │       └── database.js           # Conexão MongoDB
│   ├── server.js                     # Arquivo principal
│   ├── package.json                  # Dependências
│   └── .env.example                  # Variáveis de ambiente
│
├── 📁 frontend/                       # App React
│   ├── public/
│   │   └── index.html                # HTML principal
│   ├── src/
│   │   ├── pages/                    # Páginas da app
│   │   │   ├── Login.js              # Tela de login
│   │   │   ├── Dashboard.js          # Dashboard principal
│   │   │   ├── Agendamentos.js       # Gerenciar agendamentos
│   │   │   ├── Clientes.js           # Gerenciar clientes
│   │   │   ├── Funcionarios.js       # Gerenciar profissionais
│   │   │   ├── Financeiro.js         # Relatório financeiro
│   │   │   └── Estoque.js            # Gerenciar estoque
│   │   ├── components/               # Componentes reutilizáveis (a criar)
│   │   ├── services/                 # Chamadas à API (a criar)
│   │   ├── styles/
│   │   │   ├── GlobalStyles.css      # Estilos globais
│   │   │   └── App.css               # Estilos do app
│   │   ├── App.js                    # Componente raiz
│   │   └── index.js                  # Inicializador
│   ├── package.json                  # Dependências
│   └── .gitignore                    # Arquivos ignorados
│
└── 📁 docs/                           # Documentação adicional (a criar)
```

---

## 🎨 Identidade Visual

Na pasta há dois arquivos:
- **Logo BelaHub.png** - Logo oficial
- **Mockups do app BelaHub para salão.png** - Prototipo visual

Use esses como referência visual durante o desenvolvimento.

---

## 💻 Stack Tecnológico

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| **Frontend** | React | 18.2+ |
| **Frontend Routing** | React Router | 6.11+ |
| **Frontend State** | Zustand | 4.3+ |
| **Frontend HTTP** | Axios | 1.4+ |
| **Frontend Styling** | Styled Components | 5.3+ |
| **Backend** | Node.js | 16+ |
| **Backend Framework** | Express.js | 4.18+ |
| **Database** | MongoDB | 5.0+ |
| **Authentication** | JWT | - |
| **Password Hashing** | bcryptjs | 2.4+ |
| **File Upload** | Multer | 1.4+ |
| **Payments** | Stripe | 12.0+ |
| **Email** | Nodemailer | 6.9+ |

---

## 📊 Planejamento (6 Sprints)

**Sprint 1** (06/04 - 19/04): Autenticação + Setup
- Servidor Express
- Modelo de Usuário
- Login/Registro
- JWT middleware

**Sprint 2** (20/04 - 03/05): Agendamentos
- CRUD de agendamentos
- Validação de conflitos
- UI calendário

**Sprint 3** (04/05 - 17/05): Clientes
- Gestão de clientes
- Histórico de atendimentos
- Interface web

**Sprint 4** (18/05 - 31/05): Funcionários
- Gestão de profissionais
- Agendas individuais

**Sprint 5** (01/06 - 14/06): Financeiro
- Integração Stripe
- Relatórios de receita
- Comissões

**Sprint 6** (15/06 - 28/06): Estoque + Deploy
- Gestão de produtos
- Deploy em produção

---

## ✅ Checklist de Setup

- [ ] Ler `SETUP_INSTRUCOES.md`
- [ ] Instalar Node.js
- [ ] Clonar repositório GitHub (ou criar novo)
- [ ] Instalar dependências backend (`npm install`)
- [ ] Instalar dependências frontend (`npm install`)
- [ ] Configurar `.env` no backend
- [ ] Testar servidor backend (`npm run dev`)
- [ ] Testar servidor frontend (`npm start`)
- [ ] Acessar http://localhost:3000 e ver login

---

## 🎯 Primeira Tarefa

1. **Ler**: `SETUP_INSTRUCOES.md` (5 min)
2. **Instalar**: Node.js + MongoDB (10 min)
3. **Clonar/Criar**: Repositório GitHub (5 min)
4. **Rodar**: Backend + Frontend localmente (5 min)
5. **Testar**: Abra http://localhost:3000

**Tempo total**: ~30 minutos

---

## 💡 Dicas Importantes

### 🔐 Variáveis de Ambiente
- **NUNCA** faça commit de `.env` (já está em `.gitignore`)
- Use `.env.example` como template
- Regenere `JWT_SECRET` com algo seguro:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

### 🌐 CORS e Conectividade
- Backend roda em: `http://localhost:5000`
- Frontend roda em: `http://localhost:3000`
- Já está configurado para se comunicarem

### 📚 Padrões de Código
- Use **ES6 modules** (import/export)
- Siga **Conventional Commits** para mensagens
- Nomeie branches: `feature/xyz`, `fix/xyz`, `docs/xyz`

### 🧪 Testes
- Backend: `npm test` (quando criarem testes)
- Frontend: `npm test` (quando criarem testes)

---

## 🆘 Problemas Comuns

**Q: "Port 5000 already in use"**
A: Mude `PORT` em `.env` para outro valor (ex: 5001)

**Q: "Cannot connect to MongoDB"**
A: Certifique que `MONGODB_URI` em `.env` está correto

**Q: "CORS error"**
A: Certifique que `FRONTEND_URL` em `.env` aponta para `http://localhost:3000`

**Q: "npm install não funciona"**
A: Delete `node_modules` e `.lock`, tente novamente:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📞 Recursos Úteis

- [Node.js Official](https://nodejs.org)
- [Express Documentation](https://expressjs.com)
- [React Official](https://react.dev)
- [MongoDB University](https://university.mongodb.com)
- [Git Cheatsheet](https://github.github.com/training-kit/downloads/github-git-cheat-sheet.pdf)
- [Postman (API Testing)](https://www.postman.com)

---

## 🚀 Próximas Etapas Após Setup

1. Criar repositório GitHub (ver `GITHUB_SETUP.md`)
2. Fazer primeiro push (ver `PRIMEIRO_PUSH_GITHUB.md`)
3. Começar Sprint 1 com o backlog do `Planejamento_BelaHub.xlsx`
4. Implementar autenticação
5. Criar CRUD de Agendamentos

---

## 📝 Contribuindo

Leia `GITHUB_SETUP.md` para padrões de:
- Branches
- Commits
- Pull Requests
- Code Review

---

## 📄 Licença

Privado - Todos os direitos reservados

---

## 👥 Time

- **Líder de Desenvolvimento**: Dev Lead
- **Backend Developer 1**: Dev 1
- **Backend Developer 2**: Dev 2
- **Frontend Developer**: Dev 3

---

## ⭐ Bora Começar!

1. Abra `SETUP_INSTRUCOES.md`
2. Siga os passos
3. Você em 30 minutos terá backend + frontend rodando
4. Comemore! 🎉

---

**Versão**: 1.0.0
**Data**: 2026-04-03
**Stack**: Node.js + React + MongoDB
**Status**: 🟢 Pronto para desenvolvimento

---

💪 Boa sorte com o BelaHub! Se tiver dúvidas, consulte a documentação fornecida.
