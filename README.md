# BelaHub 💅

**BelaHub** é um SaaS completo para gestão de salões de beleza, oferecendo controle total de agendamentos, clientes, funcionários, finanças e estoque.

## 🎯 Objetivo

Simplificar a operação de salões de beleza com uma plataforma integrada que centraliza todos os processos administrativos e operacionais.

## ✨ Funcionalidades Principais

- 📅 **Agendamentos**: Sistema inteligente de marcação de compromissos
- 👥 **Gestão de Clientes**: Base de dados com histórico de atendimentos
- 💼 **Gestão de Funcionários**: Controle de profissionais e suas agendas
- 💰 **Gestão Financeira**: Controle de pagamentos, faturamento e comissões
- 📦 **Gestão de Estoque**: Controle de produtos e consumiveis

## 🏗️ Arquitetura

```
BelaHub/
├── frontend/          # Aplicação React
├── backend/           # API Node.js Express
├── docs/              # Documentação
├── design/            # Identidade visual e mockups
└── assets/            # Recursos estáticos
```

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** com Express.js
- **MongoDB** para banco de dados
- **JWT** para autenticação
- **Stripe** para pagamentos
- **Multer** para upload de arquivos

### Frontend
- **React** 18+
- **React Router** para navegação
- **Axios** para requisições HTTP
- **Styled Components** para estilização
- **Zustand** para gerenciamento de estado

## 🚀 Como Começar

### Pré-requisitos
- Node.js 16+
- MongoDB (local ou cloud)
- npm ou yarn

### Instalação Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Instalação Frontend
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
│   ├── models/        # Schemas Mongoose
│   ├── routes/        # Rotas da API
│   ├── controllers/   # Lógica de negócio
│   ├── middlewares/   # Autenticação, validação
│   ├── utils/         # Funções auxiliares
│   └── config/        # Configurações
├── tests/             # Testes unitários
└── server.js          # Arquivo principal
```

### Frontend
```
frontend/
├── public/
├── src/
│   ├── components/    # Componentes React
│   ├── pages/         # Páginas da aplicação
│   ├── services/      # Chamadas à API
│   ├── hooks/         # Custom hooks
│   ├── store/         # Estado global (Zustand)
│   ├── styles/        # Estilos globais
│   └── App.js         # Componente raiz
└── package.json
```

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na pasta backend com:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/belahub

# JWT
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRE=7d

# API
PORT=5000
NODE_ENV=development

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha
```

## 📋 Roadmap

- [ ] MVP com funcionalidades básicas
- [ ] Integração com pagamento (Stripe)
- [ ] Sistema de notificações
- [ ] App mobile (React Native)
- [ ] Dashboard com analytics
- [ ] Integrações com redes sociais

## 🤝 Contribuindo

Este é um projeto privado. As contribuições seguem o fluxo Git padrão:

1. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
2. Commit suas mudanças: `git commit -m 'Add nova funcionalidade'`
3. Push para a branch: `git push origin feature/nova-funcionalidade`
4. Abra um Pull Request

## 📄 Licença

Privado - Todos os direitos reservados

## 📞 Suporte

Para dúvidas ou sugestões, entre em contato com a equipe de desenvolvimento.

---

**Versão**: 1.0.0 | **Data**: 2026-04-03
