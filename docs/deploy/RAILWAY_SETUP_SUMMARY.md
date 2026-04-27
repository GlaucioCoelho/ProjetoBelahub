# 🎯 Resumo da Configuração Railway - BelaHub

## O que foi feito ✅

### 1. **Arquivo `railway.json` Criado**
   - Configuração mínima para Railway detectar o projeto
   - Builder: `nixpacks` (automático, sem Dockerfile necessário)
   - Start Command: `node backend/server.js`
   - Location: Raiz do projeto (`/ProjetoBelahub/railway.json`)

### 2. **`package.json` Atualizado**
   - Adicionado script `postinstall`: Instala dependências de ambos frontend e backend automaticamente
   - Adicionado script `build:all-railway`: Específico para Railway (build frontend + instala backend)
   - Mantém todos os scripts anteriores para desenvolvimento local

### 3. **`backend/server.js` Modificado para Servir Frontend**
   - **Importações adicionadas**: `path` e `fileURLToPath` (para ES modules)
   - **Configuração de diretórios**: Define caminho para `frontend/build`
   - **Static file serving**: `app.use(express.static(frontendBuildPath))` serve arquivos estáticos
   - **SPA Fallback Route**: Rota `app.get('*')` que serve `index.html` para rotas não-API
     - Requisições em `/api/*` recebem erro 404 JSON apropriado
     - Requisições em qualquer outra rota recebem `index.html` (necessário para React Router)

### 4. **Documentação Criada**
   - **`RAILWAY_DEPLOYMENT.md`**: Guia completo e detalhado (6 páginas)
     - Configuração MongoDB Atlas passo a passo
     - Setup Railway com GitHub integration
     - Variáveis de ambiente e build settings
     - Troubleshooting e recursos

   - **`RAILWAY_CHECKLIST.md`**: Checklist prático para execução
     - Dividido em 5 fases (MongoDB, Railway, Deploy, Validação, Manutenção)
     - Cada fase com sub-tarefas checkbox
     - Exemplos de comandos prontos para copiar e colar
     - Troubleshooting rápido

---

## Próximos Passos (O que você precisa fazer)

### FASE 1️⃣: MongoDB Atlas (30 minutos)

```bash
1. Acesse https://www.mongodb.com/cloud/atlas
2. Crie uma conta
3. Crie um projeto "BelaHub"
4. Crie um cluster M0 (gratuito)
5. Configure Database User (username: belahub_user)
6. Configure Network Access (Allow from anywhere: 0.0.0.0/0)
7. Obtenha a connection string mongodb+srv://...
```

**Você precisará salvar:**
- `MONGODB_URI`: A connection string completa com senha

---

### FASE 2️⃣: Railway Setup (20 minutos)

```bash
1. Acesse https://railway.app/dashboard
2. Clique "New Project" → "Deploy from GitHub"
3. Autorize Railway com sua conta GitHub
4. Selecione repositório "ProjetoBelahub"
5. Selecione a branch (main/master)
6. Clique "Deploy"
```

---

### FASE 3️⃣: Configurar Variáveis de Ambiente

No painel do Railway, adicione estas variáveis:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://belahub_user:SENHA@cluster0.xxxxx.mongodb.net/belahub?retryWrites=true&w=majority
JWT_SECRET=[execute comando abaixo para gerar]
PORT=3000
```

**Para gerar JWT_SECRET**, execute no terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copie o resultado e cole em `JWT_SECRET` no Railway.

---

### FASE 4️⃣: Push do Código

```bash
cd /caminho/para/ProjetoBelahub

# Verifique o que será enviado
git status

# Adicione todos os arquivos
git add .

# Faça commit
git commit -m "Configure Railway deployment"

# Faça push
git push origin main
```

**O que foi adicionado:**
- `railway.json` - Configuração do Railway
- `RAILWAY_DEPLOYMENT.md` - Guia detalhado
- `RAILWAY_CHECKLIST.md` - Checklist prático
- `backend/server.js` - Modificado para servir frontend
- `package.json` - Adicionado postinstall script

---

### FASE 5️⃣: Monitorar Build no Railway

1. Acesse seu projeto no Railway (https://railway.app/dashboard)
2. Vá para "Deployments"
3. Acompanhe o progresso em tempo real
4. Aguarde até ver ✅ "Build Successful"

**Se der erro:**
- Verifique os logs completos
- Procure pela seção de erro específica
- Consulte a seção "Troubleshooting" do guia

---

### FASE 6️⃣: Obter URL e Testar

Após deploy bem-sucedido:

```bash
# 1. Obtenha a URL do Railway (algo como: https://belahub-production-xxxx.railway.app)

# 2. Teste o health check
curl https://belahub-production-xxxx.railway.app/api/health

# 3. Abra no navegador
https://belahub-production-xxxx.railway.app
```

**Esperado:**
- Rota de health retorna JSON com `"status": "OK"` e `"database": "Conectado"`
- Frontend carrega sem erros
- Você consegue registrar e fazer login

---

## Arquitetura Implementada

```
BelaHub (Monorepo)
│
├── backend/ (Express.js)
│   ├── server.js (MODIFICADO - serve frontend + API)
│   ├── src/
│   │   ├── routes/ (API routes)
│   │   ├── models/ (Mongoose schemas)
│   │   └── controllers/
│   └── package.json
│
├── frontend/ (React)
│   ├── build/ (gerado no deploy)
│   ├── src/
│   ├── public/
│   └── package.json
│
├── package.json (ROOT - orquestra builds)
├── railway.json (NOVO - config Railway)
├── vercel.json (não mais usado)
│
└── Documentação/
    ├── RAILWAY_DEPLOYMENT.md (novo)
    └── RAILWAY_CHECKLIST.md (novo)

FLUXO DE DEPLOY:
1. Git push para GitHub
2. Webhook dispara Railway
3. Railway instala dependências (postinstall: frontend + backend)
4. Railway executa build:all (compila frontend React)
5. Railway inicia: node backend/server.js
6. Backend serve:
   - /api/* → rotas Express
   - /static/* → arquivos do frontend
   - /* → index.html (SPA routing)
```

---

## Configuração de Ambiente

### Local (desenvolvimento)
```
MONGODB_URI=mongodb://localhost:27017/belahub
JWT_SECRET=qualquer-valor-para-testes
NODE_ENV=development
```

### Production (Railway)
```
MONGODB_URI=mongodb+srv://belahub_user:SENHA@cluster0.xxxxx.mongodb.net/belahub?retryWrites=true&w=majority
JWT_SECRET=string-aleatória-longa-segura
NODE_ENV=production
PORT=3000 (Railway define automaticamente)
```

---

## Tempo Estimado

| Fase | Tempo | Descrição |
|------|-------|-----------|
| MongoDB Atlas | 30 min | Criar cluster + configurar acesso |
| Railway Setup | 20 min | Conectar GitHub + variáveis |
| Deploy | 10 min | Git push + monitorar build |
| Validação | 10 min | Testar aplicação |
| **TOTAL** | **70 min** | Primeira vez (próximas atualizações: 5 min) |

---

## Diferenças vs Vercel

| Aspecto | Vercel | Railway |
|--------|--------|---------|
| Monorepo Support | Limitado | Excelente |
| Configuração | Complexa (vercel.json) | Simples (railway.json) |
| Backend + Frontend | Separados | Integrados naturalmente |
| Build Time | Rápido | Normal |
| Preço | Grátis com limites | Mais créditos grátis |
| Documentação | Genérica | Específica |

---

## Recursos Úteis

- 📚 **Railway Docs:** https://docs.railway.app
- 📚 **MongoDB Docs:** https://docs.atlas.mongodb.com
- 📚 **Express Docs:** https://expressjs.com
- 💬 **Railway Community:** https://discord.gg/railway

---

## Próximas Atualizações

Quando você quiser fazer mudanças no código:

```bash
# 1. Faça suas mudanças localmente
# 2. Teste em http://localhost:3000

# 3. Commit e push
git add .
git commit -m "Descrição da mudança"
git push origin main

# 4. Railway fará deploy automático (nenhuma ação manual!)
# 5. Veja em https://belahub-xxx.railway.app
```

---

## Segurança

⚠️ **Importantes:**
- Nunca compartilhe `JWT_SECRET`
- Nunca compartilhe `MONGODB_URI` com senha
- Use Railway "Secrets" para variáveis sensíveis
- Mantenha whitelist do MongoDB restritivo se possível

---

## Troubleshooting Rápido

**Build falha?** → Veja logs do Railway, procure por "error"
**404 no frontend?** → Verifique se `frontend/build/index.html` existe
**MongoDB desconecta?** → Verifique MONGODB_URI e whitelist do MongoDB Atlas
**Erro "Cannot find module"?** → Confirme que postinstall rodou para ambos diretórios

---

**Status:** ✅ Pronto para Deploy
**Configuração Completa em:** 2026-04-04
**Próximo Passo:** Siga o `RAILWAY_CHECKLIST.md`
