# 📝 Alterações Realizadas para Railway Deployment

## Resumo
Foram feitas 3 modificações principais para preparar a aplicação BelaHub para deployment no Railway:

1. **Criação de `railway.json`** - Novo arquivo de configuração
2. **Atualização de `package.json`** - Adicionado script postinstall
3. **Modificação de `backend/server.js`** - Serve arquivos estáticos do frontend

---

## 1️⃣ Novo Arquivo: `railway.json`

**Localização:** `/ProjetoBelahub/railway.json`

**Conteúdo completo:**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "startCommand": "node backend/server.js"
  }
}
```

**O que faz:**
- Define o builder como `nixpacks` (Railway detecta dependências automaticamente)
- Define o comando de inicialização como `node backend/server.js`
- Railroad usa este arquivo para saber como fazer build e deploy da aplicação

**Por que foi adicionado:**
- Vercel usava `vercel.json` (muito específico do Vercel)
- Railway detecta automaticamente com `railway.json`
- Configuração simples e clara

---

## 2️⃣ Modificação: `package.json` (Raiz)

**Localização:** `/ProjetoBelahub/package.json`

### Antes:
```json
{
  "scripts": {
    "start": "node backend/server.js",
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "cd frontend && npm start",
    "build": "npm run build:all",
    "build:all": "npm run install:frontend && npm run build:frontend && npm run install:backend",
    "install:frontend": "cd frontend && npm install --legacy-peer-deps",
    "install:backend": "cd backend && npm install",
    "build:frontend": "cd frontend && npm run build",
    "build:backend": "cd backend && npm install",
    "install-all": "npm install && npm run install:backend && npm run install:frontend",
    "test": "npm run test:backend && npm run test:frontend",
    "test:backend": "cd backend && npm test",
    "test:frontend": "cd frontend && npm test",
    "vercel-build": "npm run build:all"
  }
}
```

### Depois:
```json
{
  "scripts": {
    "start": "node backend/server.js",
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "cd frontend && npm start",
    "build": "npm run build:all",
    "build:all": "npm run install:frontend && npm run build:frontend && npm run install:backend",
    "build:all-railway": "npm run install:frontend && npm run build:frontend && npm run install:backend",
    "install:frontend": "cd frontend && npm install --legacy-peer-deps",
    "install:backend": "cd backend && npm install",
    "build:frontend": "cd frontend && npm run build",
    "build:backend": "cd backend && npm install",
    "install-all": "npm install && npm run install:backend && npm run install:frontend",
    "test": "npm run test:backend && npm run test:frontend",
    "test:backend": "cd backend && npm test",
    "test:frontend": "cd frontend && npm test",
    "vercel-build": "npm run build:all",
    "postinstall": "npm run install:frontend && npm run install:backend"
  }
}
```

### Mudanças:
- ✅ **Adicionado:** `"build:all-railway"` (alias específico para Railway)
- ✅ **Adicionado:** `"postinstall": "npm run install:frontend && npm run install:backend"`

**Por que o `postinstall`?**
- Executado automaticamente após `npm install`
- Garante que dependências de frontend e backend sejam instaladas
- No Railway, isso garante que tudo esteja pronto antes do build

---

## 3️⃣ Modificação: `backend/server.js`

**Localização:** `/ProjetoBelahub/backend/server.js`

### Mudança 1: Importações Adicionadas
**Antes:**
```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './src/routes/authRoutes.js';
// ... mais imports
```

**Depois:**
```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';                    // ← NOVO
import { fileURLToPath } from 'url';         // ← NOVO
import authRoutes from './src/routes/authRoutes.js';
// ... mais imports
```

**Por que:**
- `path` - Manipular caminhos de diretórios de forma segura
- `fileURLToPath` - Necessário em ES modules para obter `__dirname`

---

### Mudança 2: Configuração de Diretórios
**Antes:**
```javascript
// Carrega variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
```

**Depois:**
```javascript
// Carrega variáveis de ambiente
dotenv.config();

// Configuração de diretórios para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'build');

const app = express();
const PORT = process.env.PORT || 5000;
```

**Por que:**
- Define o caminho correto para os arquivos compilados do React
- `frontendBuildPath` aponta para `/frontend/build/` (onde o React compila)

**Resultado:**
- `__dirname` = `/ProjetoBelahub/backend`
- `frontendBuildPath` = `/ProjetoBelahub/frontend/build`

---

### Mudança 3: Servir Arquivos Estáticos
**Antes:**
```javascript
app.use(express.json());
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Conectar ao MongoDB
```

**Depois:**
```javascript
app.use(express.json());
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Servir arquivos estáticos do frontend
app.use(express.static(frontendBuildPath));

// Conectar ao MongoDB
```

**Por que:**
- Faz o Express servir todos os arquivos estáticos (CSS, JS, imagens) do React
- Permite que `/index.html`, `/static/js/main.xxxxx.js`, etc. sejam servidos
- Necessário para o frontend funcionar em produção

---

### Mudança 4: Fallback para SPA Routing
**Antes:**
```javascript
// Rotas de Estoque (Sprint 6)
app.use('/api/produtos', produtoRoutes);
app.use('/api/estoque', estoqueRoutes);
app.use('/api/movimentacoes', movimentacaoRoutes);
app.use('/api/alertas', alertasRoutes);

// Middleware para erro 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Middleware de tratamento de erros
```

**Depois:**
```javascript
// Rotas de Estoque (Sprint 6)
app.use('/api/produtos', produtoRoutes);
app.use('/api/estoque', estoqueRoutes);
app.use('/api/movimentacoes', movimentacaoRoutes);
app.use('/api/alertas', alertasRoutes);

// Fallback para SPA (Single Page Application) - servir index.html para rotas não-API
app.get('*', (req, res) => {
  // Se a rota não começa com /api, servir o index.html do React
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendBuildPath, 'index.html'), (err) => {
      if (err) {
        res.status(404).json({ error: 'Arquivo não encontrado' });
      }
    });
  } else {
    res.status(404).json({ error: 'Rota não encontrada' });
  }
});

// Middleware de tratamento de erros
```

**Por que:**
- React Router precisa que o servidor serve `index.html` para rotas não-API
- Sem isso, navegação no frontend resulta em 404
- Rota `*` captura tudo que não foi encontrado nas rotas anteriores

**Fluxo:**
1. Requisição em `/api/usuarios` → Express trata como API
2. Requisição em `/agendamentos` → React Router trata no frontend
3. Requisição em `/` → Serve `index.html` do React
4. Requisição em `/static/js/main.js` → Serve arquivo estático

---

## Arquivos NÃO Modificados (mas não mais necessários)

### `vercel.json`
- **Status:** Ainda existe, mas não é mais usado
- **Por quê:** Railway não usa esta configuração
- **Ação:** Pode deletar se quiser (opcional)

---

## Estrutura de Diretórios Resultante

```
BelaHub/
├── backend/
│   ├── server.js ✏️ MODIFICADO
│   ├── src/
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── agendamentoRoutes.js
│   │   │   ├── clienteRoutes.js
│   │   │   ├── funcionarioRoutes.js
│   │   │   ├── transacaoRoutes.js
│   │   │   ├── faturamentoRoutes.js
│   │   │   ├── produtoRoutes.js
│   │   │   ├── estoqueRoutes.js
│   │   │   ├── movimentacaoRoutes.js
│   │   │   └── alertasRoutes.js
│   │   └── ...
│   └── package.json
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── build/ ← Gerado por npm run build:frontend
│   │   ├── index.html ← Servido pelo backend
│   │   ├── static/
│   │   │   ├── css/
│   │   │   ├── js/
│   │   │   └── media/
│   │   └── ...
│   └── package.json
│
├── package.json ✏️ MODIFICADO
├── railway.json ✅ NOVO
├── vercel.json (não mais usado)
└── ...
```

---

## Processo de Deploy Resultante

### Local (desenvolvimento)
```
npm install          # postinstall instala tudo
npm run dev          # Roda frontend + backend
http://localhost:3000
```

### Production (Railway)
```
1. git push origin main
2. Railway detecta novo commit
3. npm install (postinstall instala frontend + backend)
4. npm run build:all (compila React)
5. node backend/server.js (inicia servidor)
6. Backend serve:
   - /api/* → Express routes
   - /static/* → Arquivos do React
   - /* → index.html (SPA routing)
7. https://belahub-xxx.railway.app ao vivo!
```

---

## Verificação das Mudanças

Para verificar que tudo foi feito corretamente:

```bash
# 1. Verifique se railway.json existe
cat railway.json

# 2. Verifique se postinstall está em package.json
grep "postinstall" package.json

# 3. Verifique se server.js tem imports corretos
grep "import path from" backend/server.js
grep "fileURLToPath" backend/server.js

# 4. Verifique se server.js serve estáticos
grep "express.static" backend/server.js

# 5. Verifique se há fallback route
grep "app.get('\*'" backend/server.js
```

Se todos retornarem resultados, as mudanças foram aplicadas com sucesso!

---

**Status:** ✅ Todas as mudanças foram aplicadas
**Data:** 2026-04-04
**Próximo Passo:** Siga o `RAILWAY_CHECKLIST.md`
