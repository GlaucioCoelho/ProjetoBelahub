# 🚀 BelaHub - Instruções de Setup Completo

Bem-vindo ao **BelaHub**! Este documento guia você pelos passos necessários para iniciar o desenvolvimento do SaaS para salões de beleza.

## 📋 Checklist de Setup

- [ ] Criar repositório no GitHub
- [ ] Clonar repositório localmente
- [ ] Instalar dependências (Backend)
- [ ] Instalar dependências (Frontend)
- [ ] Configurar variáveis de ambiente
- [ ] Testar servidores locais

---

## 1️⃣ Criar Repositório no GitHub

### Via GitHub Web (Recomendado)
1. Acesse [github.com/new](https://github.com/new)
2. Preencha os campos:
   - **Repository name**: `BelaHub`
   - **Description**: `SaaS para gestão de salões de beleza`
   - **Privacy**: 🔒 **Private** (privado)
3. Clique em **"Create repository"**

Veja o guia completo em `GITHUB_SETUP.md`

---

## 2️⃣ Clonar o Repositório

```bash
# Via HTTPS
git clone https://github.com/seu-usuario/BelaHub.git
cd BelaHub

# Ou via SSH
git clone git@github.com:seu-usuario/BelaHub.git
cd BelaHub
```

---

## 3️⃣ Setup Backend (Node.js + Express + MongoDB)

### Pré-requisitos
- Node.js 16+ instalado ([baixar aqui](https://nodejs.org))
- MongoDB local ou MongoDB Atlas ([criar conta](https://www.mongodb.com/cloud/atlas))

### Passos

```bash
# 1. Entrar na pasta backend
cd backend

# 2. Instalar dependências
npm install

# 3. Criar arquivo .env
cp .env.example .env

# 4. Editar .env com suas configurações
# Abra .env e configure:
# - MONGODB_URI: conexão com banco
# - JWT_SECRET: chave aleatória segura
# - STRIPE_KEYS: (deixe vazio por enquanto)

# 5. Iniciar servidor em desenvolvimento
npm run dev

# ✅ Você verá: 🚀 BelaHub Backend rodando em http://localhost:5000
```

### Teste o Backend
```bash
# Abra outra aba do terminal/cmd e teste:
curl http://localhost:5000/api/health

# Resultado esperado:
# {"status":"OK","timestamp":"2026-04-03T..."}
```

---

## 4️⃣ Setup Frontend (React)

### Pré-requisitos
- Node.js 16+ (já instalado no passo anterior)

### Passos

```bash
# 1. Abra nova aba do terminal
# 2. Entre na pasta frontend
cd frontend

# 3. Instalar dependências
npm install

# 4. Iniciar servidor de desenvolvimento
npm start

# ✅ O navegador abrirá automaticamente em http://localhost:3000
# Veja a página de login do BelaHub!
```

---

## 5️⃣ Configurar Banco de Dados (MongoDB)

### Opção A: MongoDB Local

```bash
# Se tiver MongoDB instalado localmente
mongod

# Será acessível em: mongodb://localhost:27017/belahub
```

### Opção B: MongoDB Atlas (Cloud) - Recomendado

1. Acesse [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Crie uma conta free
3. Crie um cluster
4. Na seção "Connect", copie a connection string
5. Cole em `.env` como `MONGODB_URI`

Exemplo:
```env
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/belahub?retryWrites=true&w=majority
```

---

## 6️⃣ Estrutura de Pastas Explicada

```
BelaHub/
├── backend/                    # API Node.js
│   ├── src/
│   │   ├── models/            # Schemas MongoDB
│   │   ├── controllers/       # Lógica de negócio
│   │   ├── routes/            # Endpoints API
│   │   ├── middlewares/       # Autenticação, validação
│   │   └── config/            # Configurações
│   ├── package.json
│   ├── server.js              # Arquivo principal
│   └── .env.example
│
├── frontend/                   # App React
│   ├── public/
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── pages/             # Páginas (Login, Dashboard...)
│   │   ├── services/          # Chamadas à API
│   │   ├── styles/            # CSS
│   │   └── App.js
│   └── package.json
│
├── docs/                       # Documentação
├── design/                     # Logo e mockups
├── README.md                   # Documentação principal
├── GITHUB_SETUP.md            # Como criar repo GitHub
└── Planejamento_BelaHub.xlsx  # Backlog e roadmap
```

---

## 7️⃣ Variáveis de Ambiente Importantes

Crie `.env` na pasta `backend/`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/belahub

# JWT (gere uma chave aleatória segura)
JWT_SECRET=sua_chave_secreta_super_segura_aqui_12345
JWT_EXPIRE=7d

# Servidor
PORT=5000
NODE_ENV=development
API_URL=http://localhost:5000

# Frontend
FRONTEND_URL=http://localhost:3000

# Stripe (deixe vazio por enquanto)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...

# Email (configurar depois)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha
```

---

## 8️⃣ Comandos Úteis

### Backend
```bash
cd backend

npm run dev           # Inicia em desenvolvimento com nodemon
npm start            # Inicia em produção
npm test             # Roda testes
```

### Frontend
```bash
cd frontend

npm start            # Inicia servidor de dev
npm run build        # Cria build para produção
npm test             # Roda testes
```

### Git
```bash
git status           # Ver status
git add .            # Adicionar arquivos
git commit -m "..."  # Criar commit
git push             # Enviar para GitHub
git pull             # Baixar atualizações
```

---

## 9️⃣ Troubleshooting

### Problema: "Cannot find module"
```bash
# Solução: Reinstalar node_modules
rm -rf node_modules
npm install
```

### Problema: "Port 5000 already in use"
```bash
# Solução: Mudar porta em .env
PORT=5001

# Ou matar processo na porta
lsof -i :5000          # Mac/Linux
netstat -ano | grep 5000  # Windows
```

### Problema: "MongoDB connection refused"
```bash
# Verificar se MongoDB está rodando
# Ou usar MongoDB Atlas (cloud)
```

### Problema: "CORS error"
```bash
# Certifique-se que FRONTEND_URL está correto em .env
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

---

## 🔟 Próximas Etapas

1. ✅ Setup local completo
2. ⬜ Fazer primeiro commit no GitHub
3. ⬜ Começar Sprint 1 (Autenticação)
4. ⬜ Configurar CI/CD (GitHub Actions)
5. ⬜ Deploy (Heroku, Railway, Vercel)

---

## 📚 Recursos Úteis

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev)
- [MongoDB University](https://university.mongodb.com/)
- [Postman (para testar API)](https://www.postman.com/)

---

## ❓ Dúvidas?

1. Leia o arquivo `README.md` para mais contexto
2. Verifique `GITHUB_SETUP.md` para questões de repositório
3. Consulte `Planejamento_BelaHub.xlsx` para o roadmap completo

---

**Bom desenvolvimento! 🎉**

*Última atualização: 2026-04-03*
