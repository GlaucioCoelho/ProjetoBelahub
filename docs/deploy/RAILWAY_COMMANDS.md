# 📋 Comandos Railway - BelaHub

## Preparar Local (para testar antes de subir)

```bash
# Instalar dependências de ambos os lados
npm install

# Compilar o frontend
npm run build:frontend

# Instalar dependências do backend
npm run install:backend

# Iniciar o servidor (serve frontend + backend)
npm start
```

Deve abrir em: `http://localhost:5000` (ou a porta que você definir)

---

## Git Commands (Push para Railway)

```bash
# Ver status dos arquivos
git status

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Configure Railway deployment"

# Fazer push (dispara deploy no Railway)
git push origin main
```

**Alternativa se a branch for diferente:**
```bash
git push origin master  # ou outro nome de branch
```

---

## Gerar JWT_SECRET (execute no terminal)

```bash
# Linux/Mac
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Salve o output em um local seguro
# Copie para Railway Dashboard → Variables → JWT_SECRET
```

---

## MongoDB Atlas Commands

Não há comandos para executar, mas aqui estão as URLs que você usará:

**Criar Conta:**
```
https://www.mongodb.com/cloud/atlas
```

**Acessar Dashboard:**
```
https://cloud.mongodb.com/v2/
```

**Obter Connection String:**
```
https://cloud.mongodb.com/ → Seu Projeto → Cluster → Connect → Connection String
```

**Formato esperado:**
```
mongodb+srv://belahub_user:SENHA@cluster0.xxxxx.mongodb.net/belahub?retryWrites=true&w=majority
```

---

## Railway Commands (Web Dashboard)

Não há comandos CLI obrigatórios, mas você usará:

**Criar Projeto:**
```
https://railway.app/dashboard → New Project → Deploy from GitHub
```

**Adicionar Variáveis:**
```
Railway Dashboard → Seu Projeto → Variables
Adicionar cada uma:
- NODE_ENV=production
- MONGODB_URI=...
- JWT_SECRET=...
- PORT=3000
```

**Ver Logs:**
```
Railway Dashboard → Seu Projeto → Logs
```

**Ver Deploy History:**
```
Railway Dashboard → Seu Projeto → Deployments
```

---

## Testar Aplicação (depois que deploy terminaa)

```bash
# Health Check da API
curl https://belahub-xxx.railway.app/api/health

# Resposta esperada:
# {
#   "status": "OK",
#   "timestamp": "2026-04-04T...",
#   "database": "Conectado"
# }
```

**No navegador:**
```
https://belahub-xxx.railway.app
```

Deve carregar o frontend do BelaHub normalmente.

---

## Troubleshooting Commands

**Limpar dependências localmente (se der problema):**
```bash
# Remover node_modules e package-lock
rm -rf node_modules package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json
rm -rf backend/node_modules backend/package-lock.json

# Reinstalar tudo
npm install
```

**Verificar versão do Node:**
```bash
node --version
# Deve ser v18.x ou similar
```

**Verificar variáveis de ambiente local:**
```bash
# Criar arquivo .env na raiz
echo "MONGODB_URI=mongodb://localhost:27017/belahub" > .env
echo "JWT_SECRET=test-secret" >> .env
echo "NODE_ENV=development" >> .env
```

---

## Environment Variables Reference

**Para adicionar no Railway Dashboard:**

```
NODE_ENV = production

MONGODB_URI = mongodb+srv://belahub_user:SENHA@cluster0.xxxxx.mongodb.net/belahub?retryWrites=true&w=majority

JWT_SECRET = [resultado do comando acima]

PORT = 3000

FRONTEND_URL = [Railway define automaticamente - pode deixar em branco]

ALLOWED_ORIGINS = [Railway define automaticamente - pode deixar em branco]
```

---

## GitHub Integration (já configurado)

Railway conecta automaticamente após você fazer push:

```bash
# Seu repositório GitHub será monitorado
# Qualquer push para a branch configurada dispara novo deploy

# Verificar remoto
git remote -v

# Deve mostrar:
# origin  https://github.com/seu-usuario/ProjetoBelahub.git (fetch)
# origin  https://github.com/seu-usuario/ProjetoBelahub.git (push)
```

---

## Scripts npm Disponíveis

```bash
# Desenvolvimento
npm run dev                 # Roda backend + frontend concorrentemente

# Build
npm run build              # Compila frontend (para produção)
npm run build:all          # Compila frontend + prepara backend
npm run build:all-railway  # Específico para Railway

# Instalação
npm install-all            # Instala dependências de tudo

# Teste
npm test                   # Roda testes (quando implementados)

# Servidor
npm start                  # Inicia servidor backend (sirve frontend também)
```

---

## URLs Importantes

**Sua Aplicação:**
```
https://belahub-production-xxxx.railway.app
```
(Você obtém essa URL após o first deploy bem-sucedido)

**Railway Dashboard:**
```
https://railway.app/dashboard
```

**MongoDB Atlas:**
```
https://www.mongodb.com/cloud/atlas
```

**Health Check:**
```
https://belahub-production-xxxx.railway.app/api/health
```

---

## Checklist de Antes do Deploy

```bash
# 1. Verifique se arquivo railway.json existe
[ -f railway.json ] && echo "✅ railway.json encontrado" || echo "❌ railway.json não encontrado"

# 2. Verifique se package.json da raiz existe
[ -f package.json ] && echo "✅ package.json (raiz) encontrado" || echo "❌ package.json (raiz) não encontrado"

# 3. Verifique se todos os diretórios existem
[ -d backend ] && echo "✅ backend/ existe" || echo "❌ backend/ não existe"
[ -d frontend ] && echo "✅ frontend/ existe" || echo "❌ frontend/ não existe"

# 4. Verifique status do Git
git status

# 5. Verifique variável de versão Node
node --version  # Deve ser v18.x
```

---

## Próximos Deploys (atualizar código)

```bash
# Faça suas mudanças em qualquer arquivo

# Commit e push
git add .
git commit -m "Nova feature: [descrição]"
git push origin main

# Railway fará deploy automaticamente!
# Vá em https://railway.app/dashboard e monitore
```

---

## Rollback (se algo der errado)

**Opção 1: Usar deploy anterior no Railway**
```
Railway Dashboard → Deployments → Selecione deploy anterior → Clique "Deploy"
```

**Opção 2: Reverter commit no Git**
```bash
git revert HEAD  # Cria um novo commit que desfaz o anterior
git push origin main  # Railway fará deploy da versão anterior
```

---

## Verificação Final

Após o deploy estar vivo, verifique:

```bash
# 1. Health check
curl -s https://belahub-xxx.railway.app/api/health | jq .

# 2. Testar rota de API
curl -s https://belahub-xxx.railway.app/api/auth -X GET

# 3. Abrir frontend
open https://belahub-xxx.railway.app
# ou
xdg-open https://belahub-xxx.railway.app  # Linux
start https://belahub-xxx.railway.app     # Windows
```

---

## Dúvidas Frequentes

**P: Como vejo os logs?**
```
A: Railway Dashboard → Seu Projeto → Logs (vê em tempo real)
```

**P: Como faço rollback?**
```
A: Railway Dashboard → Deployments → Selecione versão anterior → Deploy
```

**P: Preciso parar o servidor?**
```
A: Não manualmente. Railway administra automaticamente.
```

**P: Como edito variáveis?**
```
A: Railway Dashboard → Variables → Edite e salve
Não precisa fazer git push, Railway atualiza automaticamente
```

---

**Última atualização:** 2026-04-04
**Status:** ✅ Pronto para usar
