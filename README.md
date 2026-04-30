# BelaHub 💅

**BelaHub** é um SaaS completo para gestão de salões de beleza, oferecendo controle total de agendamentos, clientes, funcionários, finanças e estoque. Funciona como **Progressive Web App (PWA)**, permitindo instalação como aplicativo nativo em celulares e desktops.

## 🎯 Objetivo

Simplificar a operação de salões de beleza com uma plataforma integrada que centraliza todos os processos administrativos e operacionais, com suporte offline e acesso multiplataforma.

## ✨ Funcionalidades Principais

- 📅 **Agendamentos**: Sistema inteligente de marcação de compromissos
- 👥 **Gestão de Clientes**: Base de dados com histórico de atendimentos
- 💼 **Gestão de Funcionários**: Controle de profissionais e suas agendas
- 💰 **Gestão Financeira**: Controle de pagamentos, faturamento e comissões
- 📦 **Gestão de Estoque**: Controle de produtos e consumiveis
- 📱 **PWA (Progressive Web App)**: Instale como app no celular ou desktop
- ⚡ **Ações Rápidas**: Navegação instantânea para funções principais
- 🔐 **Autenticação Segura**: Login com JWT e proteção de rotas
- 💳 **Integração Stripe**: Pagamentos online integrados
- 📧 **Notificações por Email**: Lembretes e confirmações automáticas

## 🏗️ Arquitetura

```
BelaHub/
├── frontend/          # Aplicação React (PWA)
├── backend/           # API Node.js Express
├── docs/              # Documentação (incluindo PWA_INSTALL.md)
├── design/            # Identidade visual e mockups
├── scripts/           # Scripts de utilitários e seed
└── assets/            # Recursos estáticos
```

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** com Express.js
- **MongoDB** para banco de dados (suporte local e Atlas)
- **JWT** para autenticação segura
- **Stripe** para pagamentos online
- **Multer** para upload de arquivos
- **Nodemailer & Resend** para envio de emails
- **node-cron** para jobs agendados

### Frontend
- **React** 18+
- **React Router** para navegação SPA
- **Axios** para requisições HTTP
- **CSS Modules** para estilização modular
- **Zustand** para gerenciamento de estado
- **Lucide React** para ícones
- **Service Worker** para suporte PWA e offline

## 🚀 Como Começar

### Pré-requisitos
- **Node.js** 18+
- **Docker** (opcional, para MongoDB)
- **npm** ou **yarn**

### Opção 1: Setup Rápido com Docker (Recomendado)

```bash
# 1. Clone o repositório
git clone https://github.com/GlaucioCoelho/ProjetoBelahub.git
cd ProjetoBelahub

# 2. Inicie o MongoDB com Docker
docker run -d --name belahub-mongo -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=belahub_user \
  -e MONGO_INITDB_ROOT_PASSWORD=HsmrcQSCscXYjVci \
  -e MONGO_INITDB_DATABASE=belahub \
  mongo:latest

# 3. Configure o backend
cd backend
npm install
npm run dev   # Node rodando em http://localhost:5000

# 4. Em outro terminal, configure o frontend
cd frontend
npm install
npm start     # React rodando em http://localhost:3000

# 5. Seed com dados de teste (em outro terminal)
cd backend
node scripts/seed.js
```

**Credenciais de Teste:**
- Email: `admin@belahub.com`
- Senha: `123456`

### Opção 2: MongoDB Local

Se preferir usar MongoDB instalado localmente, atualize o `.env` do backend:

```env
MONGODB_URI=mongodb://localhost:27017/belahub
```

### Instalação Manual

**Backend:**
```bash
cd backend
npm install
cp .env.example .env  # Configure as variáveis
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

## 📁 Estrutura de Pastas

### Backend
```
backend/
├── src/
│   ├── models/        # Schemas Mongoose (Usuario, Agendamento, etc)
│   ├── routes/        # Rotas da API
│   ├── controllers/   # Lógica de negócio
│   ├── middlewares/   # Autenticação, validação
│   ├── jobs/          # Jobs agendados (lembretes, etc)
│   ├── utils/         # Funções auxiliares (email, validação)
│   └── config/        # Configurações
├── scripts/
│   ├── seed.js        # Popula banco com dados de teste
│   └── *.js           # Outros scripts úteis
├── tests/             # Testes unitários e integração
└── server.js          # Arquivo principal
```

### Frontend
```
frontend/
├── public/
│   ├── manifest.json       # Configuração PWA
│   ├── service-worker.js   # Service Worker para offline
│   └── index.html          # HTML raiz com meta tags PWA
├── src/
│   ├── components/         # Componentes reutilizáveis
│   ├── pages/              # Páginas da aplicação
│   ├── services/           # Chamadas à API e serviços
│   ├── hooks/              # Custom hooks (usePWAInstall)
│   ├── store/              # Estado global (authStore, navigationContext)
│   ├── styles/             # Estilos globais
│   └── App.jsx             # Componente raiz
└── package.json
```

## 📱 PWA - Instale como App

BelaHub é um **Progressive Web App**, permitindo instalação em qualquer dispositivo!

### 📲 Instruções de Instalação

**Android (Chrome/Edge):**
1. Abra http://localhost:3000
2. Toque em ⋮ (menu) → "Instalar app"
3. Confirme

**iPhone (Safari):**
1. Abra http://localhost:3000
2. Toque em ↗️ (compartilhar)
3. "Adicionar à Tela Inicial"
4. Confirme

**Desktop (Windows/Mac):**
1. Abra http://localhost:3000
2. Clique em ⋮ (menu) → "Instalar BelaHub"
3. Confirme

📖 **Documentação completa:** Veja [`docs/PWA_INSTALL.md`](./docs/PWA_INSTALL.md)

## 🔐 Variáveis de Ambiente

### Backend `.env`
```env
# Database
MONGODB_URI=mongodb://belahub_user:HsmrcQSCscXYjVci@localhost:27017/belahub?authSource=admin

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT
JWT_SECRET=BelaHub_JWT_Secret_2026_ProducaoSegura

# Stripe (Obtém em https://dashboard.stripe.com/test/apikeys)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Resend - https://resend.com)
RESEND_API_KEY=re_...
EMAIL_FROM=BelaHub <onboarding@resend.dev>
```

## 🚀 Endpoints Principais

### Autenticação
- `POST /api/auth/registro` - Criar nova conta
- `POST /api/auth/login` - Fazer login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Dados do usuário logado (protegido)

### Agendamentos
- `GET /api/agendamentos` - Listar agendamentos
- `POST /api/agendamentos` - Criar agendamento
- `PUT /api/agendamentos/:id` - Atualizar agendamento
- `DELETE /api/agendamentos/:id` - Cancelar agendamento

### Clientes
- `GET /api/clientes` - Listar clientes
- `POST /api/clientes` - Criar cliente
- `PUT /api/clientes/:id` - Atualizar cliente

### Estoque
- `GET /api/produtos` - Listar produtos
- `GET /api/estoque` - Status do estoque
- `GET /api/alertas/nao-lidos/listar` - Alertas de estoque baixo

📚 **API completa:** Veja [`docs/api-inventory.md`](./docs/api-inventory.md)

## 🔄 Ações Rápidas do Dashboard

O dashboard inclui ações rápidas para acesso instantâneo:
- 📅 **Novo agendamento** → Ir para Agenda
- 👤 **Novo cliente** → Ir para Clientes
- 💸 **Lançar venda** → Ir para Vendas
- 📦 **Ver estoque** → Ir para Produtos

## ✅ Features Recentes

### ✨ Atualização v1.1.0 (Abril 2026)
- ✅ PWA completo com Service Worker
- ✅ Componente de instalação de app
- ✅ Contexto de navegação para ações rápidas
- ✅ Support para MongoDB local com Docker
- ✅ Melhor responsividade para celulares
- ✅ Integração Stripe (em desenvolvimento)
- ✅ Documentação PWA

## 📋 Roadmap

- [x] MVP com funcionalidades básicas
- [x] PWA (Progressive Web App)
- [x] Docker setup para desenvolvimento
- [ ] Integração completa com Stripe
- [ ] Sistema de notificações push
- [ ] App mobile (React Native)
- [ ] Dashboard com analytics avançado
- [ ] Integração WhatsApp
- [ ] Backup automático

## 🧪 Testes

```bash
# Backend
cd backend
npm run test

# Frontend
cd frontend
npm run test
```

## 🐳 Gerenciamento do Docker

```bash
# Ver status do MongoDB
docker ps | grep belahub-mongo

# Parar MongoDB
docker stop belahub-mongo

# Reiniciar MongoDB
docker start belahub-mongo

# Ver logs
docker logs belahub-mongo

# Remover container
docker rm belahub-mongo
```

## 🤝 Contribuindo

Este é um projeto em desenvolvimento. As contribuições seguem o fluxo Git padrão:

1. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
2. Commit suas mudanças: `git commit -m 'feat: Adicionar nova funcionalidade'`
3. Push para a branch: `git push origin feature/nova-funcionalidade`
4. Abra um Pull Request

## 📄 Licença

Privado - Todos os direitos reservados © 2026 BelaHub

## 📞 Suporte

Para dúvidas ou sugestões, entre em contato com a equipe de desenvolvimento.

---

**Versão**: 1.1.0 | **Data**: 2026-04-30 | **Status**: ✅ Em Desenvolvimento
