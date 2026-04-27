# 🚂 Guia de Deployment BelaHub no Railway

## Pré-requisitos

1. **Conta GitHub** - Seu repositório deve estar no GitHub
2. **Conta Railway** - Crie em https://railway.app
3. **MongoDB Atlas** - Crie um cluster gratuito em https://www.mongodb.com/cloud/atlas
4. **Variáveis de Ambiente** - Você precisará de algumas configurações

## Passo 1: Preparar o MongoDB Atlas

### 1.1 Criar Cluster Gratuito
1. Acesse https://www.mongodb.com/cloud/atlas
2. Crie uma conta (ou faça login)
3. Crie um novo projeto chamado "BelaHub"
4. Crie um cluster M0 (gratuito)
5. Aguarde a criação (leva alguns minutos)

### 1.2 Configurar Acesso
1. Na seção "Security" → "Database Access":
   - Clique em "Add New Database User"
   - Username: `belahub_user`
   - Password: Gere uma senha forte (salve em local seguro)
   - Built-in Role: `Atlas Admin`

2. Na seção "Security" → "Network Access":
   - Clique em "Add IP Address"
   - Selecione "Allow access from anywhere" (0.0.0.0/0)
   - Clique "Confirm"

### 1.3 Obter Connection String
1. Na página do cluster, clique em "Connect"
2. Escolha "Connect your application"
3. Selecione "Node.js" como driver
4. Copie a connection string

**Exemplo:**
```
mongodb+srv://belahub_user:<password>@cluster0.xxxxx.mongodb.net/belahub?retryWrites=true&w=majority
```

Substitua `<password>` pela senha que você criou.

## Passo 2: Configurar Railway

### 2.1 Criar Nova Aplicação
1. Acesse https://railway.app/dashboard
2. Clique em "New Project"
3. Selecione "Deploy from GitHub"
4. Conecte sua conta GitHub se necessário
5. Selecione o repositório `ProjetoBelahub`
6. Selecione a branch principal (main ou master)

### 2.2 Configurar Variáveis de Ambiente
Após criar o projeto no Railway:

1. Clique em "Variables" na seção do seu projeto
2. Adicione as seguintes variáveis:

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `NODE_ENV` | `production` | Ambiente de produção |
| `MONGODB_URI` | `mongodb+srv://belahub_user:<password>@cluster0.xxxxx.mongodb.net/belahub?retryWrites=true&w=majority` | Connection string do MongoDB |
| `JWT_SECRET` | (gere uma string aleatória longa) | Chave para JWT tokens |
| `FRONTEND_URL` | (será definida pelo Railway) | URL do frontend |
| `ALLOWED_ORIGINS` | (será definida pelo Railway) | Origens permitidas para CORS |
| `PORT` | `3000` | Porta do servidor |

### 2.3 Configurar Build Settings
No Railway, configure:

1. **Build Command:** `npm run build:all`
2. **Start Command:** `node backend/server.js`
3. **Root Directory:** `.` (raiz do projeto)

O Railway deve detectar o arquivo `railway.json` automaticamente.

## Passo 3: Deploy Automático via GitHub

### 3.1 Push para GitHub
```bash
git add .
git commit -m "Configure Railway deployment"
git push origin main
```

### 3.2 Monitorar o Deploy
1. No dashboard do Railway, vá para "Deployments"
2. Veja o progresso da build em tempo real
3. Verifique os logs se houver erros

### 3.3 Obter URL da Aplicação
Após o deploy bem-sucedido:
1. Na página do projeto, você verá uma URL como `https://belahub-production-xxxx.railway.app`
2. Esta é a URL da sua aplicação!

## Passo 4: Testar a Aplicação

### 4.1 Verificar Health Check
```bash
curl https://belahub-production-xxxx.railway.app/api/health
```

Resposta esperada:
```json
{
  "status": "OK",
  "timestamp": "2026-04-04T...",
  "database": "Conectado"
}
```

### 4.2 Acessar Frontend
Abra a URL no navegador. Você deve ver a interface do BelaHub carregando.

### 4.3 Testar Autenticação
1. Tente se registrar com uma conta de teste
2. Faça login
3. Verifique se os dados são salvos no MongoDB

## Passo 5: Configuração Avançada (Opcional)

### 5.1 Variáveis de Ambiente Seguras
Para variáveis sensíveis, use o Railway Secrets:
1. Clique em "Add Variable"
2. Marque como "Secret" (ícone de cadeado)
3. O valor não será exibido nos logs

### 5.2 Monitoramento e Logs
1. No dashboard, acesse "Logs"
2. Você pode filtrar por tipo de mensagem
3. Útil para debug de problemas

### 5.3 Redeploy Manual
Se precisar fazer redeploy:
1. Faça push de novo código para GitHub
2. Railway fará deploy automático
3. Ou clique em "Redeploy" no dashboard

## Passo 6: Troubleshooting

### Problema: "Build Command Failed"
**Solução:**
1. Verifique se o `package.json` na raiz existe
2. Confirme que `frontend/package.json` e `backend/package.json` existem
3. Veja os logs completos do Railway

### Problema: "Cannot find module"
**Solução:**
1. Certifique-se que `npm install` rodou para backend
2. Verifique se as dependências estão corretas no `package.json`

### Problema: "MongoDB Connection Failed"
**Solução:**
1. Verifique se a MONGODB_URI está correta
2. Confirme que o IP whitelist no MongoDB Atlas inclui o Railway
3. Teste a conexão localmente com a mesma string

### Problema: Frontend não carrega
**Solução:**
1. Verifique se `frontend/build/index.html` existe
2. Confirme que o build do frontend foi bem-sucedido nos logs
3. Verifique se o backend está servindo arquivos estáticos

## Variáveis de Ambiente Detalhadas

### NODE_ENV
Define o ambiente de execução. Em produção, algumas bibliotecas otimizam código.

### MONGODB_URI
Connection string do MongoDB. Formato:
```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

### JWT_SECRET
Chave privada para assinatura de JWT tokens. Gere com:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### FRONTEND_URL
URL pública da sua aplicação. Railway fornecerá automaticamente.

### ALLOWED_ORIGINS
Domínios que podem fazer requisições para a API. Exemplo:
```
https://belahub-production-xxxx.railway.app,http://localhost:3000
```

## Ciclo de Deploy

1. **Desenvolvimento Local** → Testa em `http://localhost:3000`
2. **Push para GitHub** → `git push origin main`
3. **GitHub Webhook** → Railway detecta novo commit
4. **Build** → Railway executa `npm run build:all`
5. **Deploy** → Railway inicia `node backend/server.js`
6. **Produção** → Aplicação ao vivo em `https://belahub-xxx.railway.app`

## Após o Deploy

### Checklist de Validação
- [ ] Health check retorna "Conectado"
- [ ] Frontend carrega corretamente
- [ ] Registro de usuário funciona
- [ ] Login funciona
- [ ] Dados persistem no MongoDB
- [ ] Nenhum erro no console do navegador

### Monitoramento Contínuo
- Monitore os logs do Railway regularmente
- Configure alertas para erros críticos
- Faça backup regular do MongoDB Atlas

## Suporte e Recursos

- **Railway Docs:** https://docs.railway.app
- **MongoDB Atlas Docs:** https://docs.atlas.mongodb.com
- **Express.js Docs:** https://expressjs.com

---

**Status:** ✅ Pronto para Deploy
**Data:** 2026-04-04
