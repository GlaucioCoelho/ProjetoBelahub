# 🚀 Guia de Deployment - BelaHub no Vercel

**Objetivo**: Deployar a aplicação completa (backend + frontend) no Vercel com MongoDB Atlas em produção.

**Tempo estimado**: 45-60 minutos (primeira vez)

**Pré-requisitos**:
- ✅ Conta GitHub com repositório BelaHub
- ✅ Conta Vercel (conectada ao GitHub)
- ✅ Conta MongoDB Atlas
- ✅ Domínio (opcional, pode usar *.vercel.app)
- ✅ Node.js 18+ instalado localmente

---

## 📋 Fase 1: Preparação (10 min)

### 1.1 Clonar/Preparar Repositório

```bash
# Se ainda não clonado:
git clone https://github.com/seu-usuario/belahub.git
cd belahub

# Criar branch de deployment
git checkout -b deployment/vercel
```

### 1.2 Verificar Estrutura de Pastas

```
belahub/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── src/
│   │   ├── models/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── middlewares/
│   └── .env.example
├── frontend/
│   ├── package.json
│   ├── public/
│   └── src/
├── vercel.json ← Criar este arquivo
├── .env.production.example ← Criar este arquivo
└── README.md
```

### 1.3 Limpar Arquivos Temporários

```bash
# Remover node_modules e .env local
rm -rf backend/node_modules frontend/node_modules
rm -f backend/.env frontend/.env

# Certificar que .gitignore está atualizado
echo ".env" >> .gitignore
echo "node_modules/" >> .gitignore
echo ".DS_Store" >> .gitignore
git add .gitignore && git commit -m "chore: update .gitignore for deployment"
```

---

## 🗄️ Fase 2: Database Setup (15 min)

### 2.1 Criar Cluster MongoDB Atlas

1. **Acessar MongoDB Atlas**: https://account.mongodb.com/account/login
2. **Criar novo Cluster** (free tier é OK para começar)
   - Cloud Provider: AWS
   - Region: São Paulo (sa-east-1) recomendado para Brasil
   - Cluster Tier: M0 (free, 512MB)
   - Click "Create Cluster" e aguarde ~5min

### 2.2 Configurar Acesso

1. **Database Access**:
   - Click "Add Database User"
   - Username: `belahub_admin`
   - Password: Gerar senha forte (copiar!)
   - Built-in Role: `Atlas Admin`

2. **Network Access**:
   - Click "Add IP Address"
   - Selecionar "Allow Access from Anywhere" (0.0.0.0/0) - Vercel IPs são dinâmicos
   - Click "Confirm"

### 2.3 Obter Connection String

1. **Cluster > Connect**
2. **Choose a connection method**: "Drivers"
3. **Select your driver**: Node.js 4.0 or later
4. **Copiar a string de conexão**:
   ```
   mongodb+srv://belahub_admin:<password>@cluster.mongodb.net/belahub?retryWrites=true&w=majority
   ```
   - Substituir `<password>` pela senha criada
   - Substituir `/belahub` se usar outro nome de database
   - **Guardar esta string** - será necessária no Vercel

### 2.4 Testar Conexão Localmente

```bash
# No backend, criar teste de conexão
cd backend

# Instalar mongoose localmente
npm install mongoose

# Criar arquivo test-db.js
cat > test-db.js << 'EOF'
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://belahub_admin:SEU_PASSWORD@cluster.mongodb.net/belahub?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Conexão MongoDB Atlas bem-sucedida!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Erro de conexão:', err.message);
    process.exit(1);
  });
EOF

# Testar (substituir password)
node test-db.js

# Se sucesso, remover arquivo de teste
rm test-db.js
```

---

## 🛠️ Fase 3: Backend Setup (10 min)

### 3.1 Otimizar server.js para Serverless

O arquivo `backend/server.js` já deve estar otimizado, mas verificar:

```javascript
// ✅ CORRETO - Export para Vercel Functions
app.listen(PORT, () => console.log(`Server rodando na porta ${PORT}`));
module.exports = app; // Exportar para Vercel

// ❌ INCORRETO - Não fazer require() dinâmico
// const routes = require(`./routes/${routeName}`); // Não fazer!

// ✅ CORRETO - Imports estáticos no topo
import funcionarioRoutes from './src/routes/funcionarioRoutes.js';
import produtoRoutes from './src/routes/produtoRoutes.js';
// etc...
```

### 3.2 Atualizar package.json Backend

```json
{
  "name": "belahub-backend",
  "version": "1.0.0",
  "type": "module",
  "engines": {
    "node": "18.x"
  },
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "echo 'No build needed for Node.js'"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "dotenv": "^16.0.3",
    "cors": "^2.8.5"
  }
}
```

### 3.3 Commit Mudanças

```bash
git add backend/ vercel.json .env.production.example
git commit -m "feat: backend optimization for Vercel deployment"
```

---

## 🎨 Fase 4: Frontend Build (10 min)

### 4.1 Otimizar React Build

```bash
cd frontend

# Gerar build de produção localmente
npm run build

# Verificar tamanho do bundle
du -sh build/

# Ideal: < 500KB (gzipped)
```

### 4.2 Criar .env.production

```bash
# frontend/.env.production
cat > .env.production << 'EOF'
REACT_APP_API_URL=https://belahub.com.br/api
REACT_APP_JWT_STORAGE_KEY=belahub_jwt_token
REACT_APP_USUARIO_STORAGE_KEY=belahub_usuario
EOF
```

### 4.3 Atualizar package.json Frontend

```json
{
  "name": "belahub-frontend",
  "version": "1.0.0",
  "private": true,
  "engines": {
    "node": "18.x"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.11.0",
    "axios": "^1.4.0",
    "zustand": "^4.3.7",
    "styled-components": "^5.3.10"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

### 4.4 Commit

```bash
cd ../
git add frontend/.env.production
git commit -m "feat: frontend production environment configuration"
```

---

## 🚀 Fase 5: Deploy no Vercel (15 min)

### 5.1 Conectar Repositório ao Vercel

1. **Acessar Vercel**: https://vercel.com/login
2. **New Project** > **Import Git Repository**
3. **Selecionar** repositório `belahub` do GitHub
4. **Configurações do Projeto**:
   - Framework Preset: "Other" (não é Next.js)
   - Root Directory: `.` (raiz do projeto)
   - Build Command:
     ```
     cd backend && npm install && cd ../frontend && npm install && npm run build
     ```
   - Output Directory: `frontend/build`
   - Install Command:
     ```
     npm install --prefix backend && npm install --prefix frontend
     ```

### 5.2 Configurar Variáveis de Ambiente

1. **Settings** > **Environment Variables**
2. **Adicionar cada variável**:
   ```
   MONGODB_URI = mongodb+srv://belahub_admin:PASSWORD@cluster.mongodb.net/belahub?...
   JWT_SECRET = (gerar string aleatória de 64+ caracteres)
   JWT_EXPIRY = 7d
   NODE_ENV = production
   ALLOWED_ORIGINS = https://belahub.com.br,https://www.belahub.com.br
   ```

3. **Selecionar ambientes**:
   - ✅ Production
   - ✅ Preview
   - ✅ Development (opcional, usar .env.local)

### 5.3 Fazer Deploy

1. **Click "Deploy"**
2. **Aguardar** build terminar (2-3 min)
3. **Verificar logs** para erros

```bash
# Testar endpoint após deploy
curl -X GET https://seu-vercel-project.vercel.app/api/health

# Esperado: 200 OK ou resposta da API
```

---

## 🌐 Fase 6: Configurar Domínio (10 min)

### 6.1 Opção A: Transferir Domínio Existente

1. **Registrador de Domínio** (GoDaddy, NameCheap, etc):
   - Acessar DNS settings
   - Apontar nameservers para Vercel:
     ```
     ns1.vercel.com
     ns2.vercel.com
     ```

2. **Vercel Console**:
   - Settings > Domains
   - Click "Add Domain"
   - Digitar: `belahub.com.br`
   - Aceitar as configurações de DNS

3. **Aguardar propagação** (até 48h, geralmente 10min-2h)

### 6.2 Opção B: Comprar Domínio no Vercel

1. **Settings > Domains** > **Purchase Domain**
2. **Pesquisar**: `belahub.com.br`
3. **Comprar** (preço varia, ~R$40/ano)
4. **DNS automático** - Vercel cuida de tudo!

### 6.3 Configurar SSL/HTTPS

- ✅ **Automático**: Vercel provisiona certificado Let's Encrypt
- Verificar em **Settings > Domains** - deve aparecer ✅ Valid SSL
- Testar: `https://belahub.com.br` - deve funcionar

---

## ✅ Fase 7: Testes e Validação (10 min)

### 7.1 Smoke Tests

```bash
# 1. Verificar aplicação carrega
curl -I https://belahub.com.br
# Esperado: 200 OK

# 2. Verificar API está respondendo
curl -X GET https://belahub.com.br/api/funcionarios \
  -H "Authorization: Bearer VALID_JWT_TOKEN"
# Esperado: 200 com array de funcionários

# 3. Testar login
curl -X POST https://belahub.com.br/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","senha":"password"}'
# Esperado: 200 com token JWT

# 4. Verificar headers de segurança
curl -I https://belahub.com.br
# Verificar:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
```

### 7.2 Performance Check

1. **Vercel Analytics**:
   - Settings > Analytics
   - Ativar "Vercel Web Analytics"
   - Monitora LCP, FID, CLS

2. **Lighthouse**:
   ```bash
   # Rodar localmente
   npm install -g lighthouse
   lighthouse https://belahub.com.br --view
   ```

3. **Métricas esperadas**:
   - Largest Contentful Paint (LCP): < 2.5s
   - First Input Delay (FID): < 100ms
   - Cumulative Layout Shift (CLS): < 0.1

### 7.3 Checklist de Validação

- [ ] Frontend carrega sem erros no console
- [ ] Login funciona (recebe JWT)
- [ ] CRUD básico funciona (GET, POST, PUT, DELETE)
- [ ] Banco de dados está sendo atualizado
- [ ] SSL/HTTPS ativo (ícone cadeado)
- [ ] Headers de segurança presentes
- [ ] Performance acceptable (LCP < 2.5s)
- [ ] Logs aparecem em Vercel > Deployments > Logs

---

## 🔧 Troubleshooting

### Erro: "Cannot find module"
```
❌ Error: Cannot find module './src/routes/agendamentoRoutes.js'

Solução:
1. Verificar nome exato do arquivo (case-sensitive!)
2. Fazer: git status
3. git add . && git commit -m "fix: add missing routes"
4. Redeployar
```

### Erro: "ECONNREFUSED - MongoDB"
```
❌ Error: ECONNREFUSED - connect ECONNREFUSED 127.0.0.1:27017

Solução:
1. Verificar MONGODB_URI está correto no Vercel console
2. Verificar IP whitelist no MongoDB Atlas (0.0.0.0/0)
3. Testar conexão: node backend/test-db.js
4. Redeployar após fixes
```

### Erro: "JWT_SECRET is not defined"
```
❌ Error: JWT_SECRET is not defined

Solução:
1. Settings > Environment Variables
2. Adicionar JWT_SECRET
3. Redeployar (click "Redeploy")
4. Verificar em Deployments > Last Deploy > Logs
```

### Aplicação lenta/timeout
```
❌ Error: 504 Gateway Timeout

Solução:
1. Aumentar maxDuration em vercel.json (até 60s)
2. Otimizar queries MongoDB (criar índices)
3. Implementar caching
4. Upgrade plano Vercel se necessário
```

### CORS errors
```
❌ Error: CORS policy: blocked by browser

Solução:
1. Verificar ALLOWED_ORIGINS em .env
2. Adicionar frontend URL: https://belahub.com.br
3. Verificar headers CORS em backend/server.js
4. Redeployar
```

---

## 📊 Monitoramento Pós-Deploy

### 7.1 Configurar Alertas

1. **Vercel Monitoring**:
   - Settings > Monitoring
   - Ativar "Error Rate", "CPU", "Memory" alerts

2. **Email Notifications**:
   - Settings > Notifications
   - Ativar "Failed Deployment" notificações

### 7.2 Acompanhar Logs

```bash
# Ver logs em tempo real (Vercel CLI)
vercel logs

# Ou via Dashboard:
# Deployments > [Latest] > Logs
```

### 7.3 Métricas Importantes

| Métrica | Alvo | Frequência |
|---------|------|-----------|
| Uptime | > 99.9% | Diário |
| Response Time | < 200ms | Real-time |
| Error Rate | < 0.1% | Real-time |
| Database Connections | < 100 | Real-time |

---

## 🔙 Rollback (se necessário)

```bash
# Se versão atual tem bug:

1. **Vercel Console**:
   - Deployments > (selecionar versão anterior ok)
   - Click "Redeploy"

2. **Via CLI**:
   vercel rollback

3. **Via Git**:
   git revert HEAD
   git push origin main
   # Vercel redeploys automaticamente
```

---

## 📚 Recursos Adicionais

- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **Express.js Best Practices**: https://expressjs.com/en/advanced/best-practice-performance.html
- **Security Headers**: https://securityheaders.com/

---

## ✨ Próximas Etapas (Pós-Deploy)

1. **Backup automático** (MongoDB Atlas > Cloud Backups)
2. **Monitoramento** (Datadog, New Relic, ou Vercel Analytics)
3. **CI/CD** (GitHub Actions para testes automáticos)
4. **Email transacional** (SendGrid, Mailgun)
5. **Observabilidade** (Sentry para error tracking)

---

**Status**: Ready to Deploy 🚀
**Última atualização**: 2026-04-04
**Versão do Guia**: 1.0
