# ✅ Checklist Railway Deployment - BelaHub

## ANTES DE COMEÇAR
- [ ] Repositório está no GitHub (público ou privado)
- [ ] Todos os arquivos estão commitados e pushados
- [ ] Você tem uma conta GitHub
- [ ] Você tem acesso à internet para criar contas online

---

## FASE 1: MONGODB ATLAS (30 minutos)

### Criar e Configurar
- [ ] Acesse https://www.mongodb.com/cloud/atlas
- [ ] Crie uma conta ou faça login
- [ ] Crie um novo projeto: "BelaHub"
- [ ] Crie um cluster M0 (gratuito)
- [ ] Aguarde a criação do cluster (5-10 minutos)

### Segurança e Acesso
- [ ] Security → Database Access → Crie usuário "belahub_user"
- [ ] Copie a senha gerada em local seguro
- [ ] Security → Network Access → "Allow from anywhere" (0.0.0.0/0)
- [ ] Clique "Confirm"

### Obter Connection String
- [ ] Clique em "Connect" no cluster
- [ ] Escolha "Connect your application"
- [ ] Copie a connection string (com senha substituída)
- [ ] Salve em local seguro: `MONGODB_URI`

**Exemplo guardado:**
```
mongodb+srv://belahub_user:SENHA_AQUI@cluster0.xxxxx.mongodb.net/belahub?retryWrites=true&w=majority
```

---

## FASE 2: RAILWAY SETUP (20 minutos)

### Criar Projeto
- [ ] Acesse https://railway.app/dashboard
- [ ] Clique "New Project"
- [ ] Selecione "Deploy from GitHub"
- [ ] Autorize o Railway com sua conta GitHub
- [ ] Selecione o repositório "ProjetoBelahub"
- [ ] Selecione a branch (main ou master)
- [ ] Clique "Deploy"

### Configurar Variáveis de Ambiente
No painel do Railway, acesse "Variables" e adicione:

- [ ] `NODE_ENV` = `production`
- [ ] `MONGODB_URI` = `mongodb+srv://belahub_user:SENHA@cluster0.xxxxx...`
- [ ] `JWT_SECRET` = (gere uma string aleatória longa - veja comando abaixo)
- [ ] `PORT` = `3000`

**Para gerar JWT_SECRET, rode localmente:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Verificar Build Settings
- [ ] Build Command: `npm run build:all`
- [ ] Start Command: `node backend/server.js`
- [ ] Root Directory: `.`
- [ ] Railway detectou `railway.json` ✓

---

## FASE 3: DEPLOY AUTOMÁTICO (10 minutos)

### Preparar Código
- [ ] Todos os arquivos estão salvos localmente
- [ ] `railway.json` existe na raiz
- [ ] `package.json` da raiz tem scripts corretos
- [ ] `backend/server.js` foi modificado para servir frontend

### Push para GitHub
```bash
git status                    # Verifique o que será commitado
git add .                     # Adicione todos os arquivos
git commit -m "Configure Railway deployment"
git push origin main          # Faça push
```

- [ ] Código enviado para GitHub
- [ ] Sem erros no git push

### Monitorar Build
- [ ] No Railway, acesse "Deployments"
- [ ] Veja a build em progresso
- [ ] Aguarde até ver "✅ Build Successful"
- [ ] Acompanhe os logs se houver erros

---

## FASE 4: VALIDAÇÃO (10 minutos)

### Obter URL da Aplicação
- [ ] Railway mostra uma URL como `https://belahub-xxx.railway.app`
- [ ] Copie essa URL (você vai precisar)

### Testar Health Check
```bash
curl https://belahub-xxx.railway.app/api/health
```

- [ ] Retorna JSON com `"status": "OK"`
- [ ] Retorna `"database": "Conectado"`

### Acessar Frontend
- [ ] Abra a URL no navegador: `https://belahub-xxx.railway.app`
- [ ] Frontend carrega sem erros brancos
- [ ] Você vê a tela de login/registro

### Testar Funcionalidade
- [ ] Registre um usuário de teste
- [ ] Faça login com essa conta
- [ ] Verifique se você consegue acessar o dashboard
- [ ] Nenhum erro no console do navegador (F12)

---

## FASE 5: Ptomorrow (Manutenção Contínua)

### Monitoramento
- [ ] Verifique logs do Railway regularmente
- [ ] Configure alertas para erros críticos
- [ ] Monitore uso de banco de dados MongoDB

### Próximas Atualizações
Quando você quiser atualizar a aplicação:

```bash
git add .
git commit -m "Nova feature: X"
git push origin main
# Railway fará deploy automaticamente
```

- [ ] Nenhuma ação manual necessária após push
- [ ] Deploy acontece automaticamente

### Backup MongoDB
- [ ] Configure backup automático no MongoDB Atlas
- [ ] Opção: MongoDB Atlas Backup (pago) ou manual

---

## TROUBLESHOOTING RÁPIDO

| Problema | Solução |
|----------|---------|
| Build falha | Verifique logs do Railway, veja erro específico |
| "Cannot find module" | Confirme que npm install rodou para ambos diretórios |
| Frontend não carrega | Verifique se frontend/build existe nos logs |
| MongoDB desconecta | Verifique MONGODB_URI e IP whitelist |
| 404 em rotas | Verifique se backend está servindo index.html |

---

## LINKS IMPORTANTES

- Railway Dashboard: https://railway.app/dashboard
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Logs de Deploy: [Vá ao seu projeto no Railway]
- Health Check: https://belahub-xxx.railway.app/api/health

---

## NOTAS IMPORTANTES

⚠️ **JWT_SECRET**: Guarde em local seguro, não compartilhe
⚠️ **MONGODB_URI**: Contém senha, não compartilhe
⚠️ **Whitelist MongoDB**: Deixe como 0.0.0.0/0 ou restrinja ao IP do Railway

---

**Status Geral:** Pronto para deploy
**Tempo Total Estimado:** 70-90 minutos (primeira vez)
**Tempo Estimado Próximas Atualizações:** 5 minutos (só fazer git push)

✅ Após completar esta checklist, sua aplicação estará em produção!
