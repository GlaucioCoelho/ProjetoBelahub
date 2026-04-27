# 📤 Seu Primeiro Push para o GitHub

Este documento guia você nos passos para fazer o primeiro push do projeto BelaHub para o GitHub.

---

## 📝 Antes de Começar

✅ Certifique-se que você:
- Criou o repositório "BelaHub" no GitHub (vide `GITHUB_SETUP.md`)
- Tem Git instalado no seu computador
- Está na raiz da pasta `ProjetoBelahub`

---

## 🔧 Passo 1: Configurar Git (Se Primeira Vez)

```bash
git config --global user.name "Seu Nome Aqui"
git config --global user.email "seu@email.com"
```

Verifique a configuração:
```bash
git config --global user.name
git config --global user.email
```

---

## 🚀 Passo 2: Inicializar Git e Fazer Push

```bash
# 1. Abra o terminal/PowerShell na pasta ProjetoBelahub
cd /caminho/para/ProjetoBelahub

# 2. Inicialize o repositório Git
git init

# 3. Adicione o GitHub como remoto
git remote add origin https://github.com/SEU_USUARIO/BelaHub.git

# 4. Verifique se o remoto foi adicionado
git remote -v
# Você verá:
# origin  https://github.com/SEU_USUARIO/BelaHub.git (fetch)
# origin  https://github.com/SEU_USUARIO/BelaHub.git (push)

# 5. Adicione todos os arquivos
git add .

# 6. Crie o primeiro commit
git commit -m "feat: Initial BelaHub project setup with Node.js/React stack"

# 7. Renomeie a branch (se necessário)
git branch -M main

# 8. Faça o push para GitHub
git push -u origin main
```

Se pedir por **autenticação**:
- **HTTPS**: Use seu GitHub token como senha (Settings → Developer settings → Personal access tokens)
- **SSH**: Certifique-se que sua chave SSH está configurada

---

## ✅ Verificar se Funcionou

Acesse no navegador:
```
https://github.com/seu-usuario/BelaHub
```

Você deve ver:
- ✅ Todos os arquivos do projeto
- ✅ Branch `main` como padrão
- ✅ Um commit inicial

---

## 🔄 Próximas Commits (Workflow Normal)

Para futuros commits, use este fluxo:

```bash
# 1. Fazer alterações nos arquivos...

# 2. Ver o que mudou
git status

# 3. Adicionar mudanças
git add .
# Ou adicionar arquivo específico:
# git add backend/src/models/Servico.js

# 4. Criar commit com mensagem clara
git commit -m "feat: Add service model for appointments"

# 5. Enviar para GitHub
git push origin main
```

---

## 📋 Exemplos de Mensagens de Commit

Siga este padrão **Conventional Commits**:

```bash
# Nova funcionalidade
git commit -m "feat: Add JWT authentication middleware"

# Correção de bug
git commit -m "fix: Resolve MongoDB connection timeout"

# Documentação
git commit -m "docs: Update README with setup instructions"

# Refatoração
git commit -m "refactor: Extract database config to separate file"

# Testes
git commit -m "test: Add unit tests for auth controller"

# Manutenção
git commit -m "chore: Update npm dependencies"
```

---

## 🌳 Boas Práticas com Branches

Para desenvolvimento em equipe:

```bash
# Criar nova branch para feature
git checkout -b feature/agendamentos-api

# Fazer commits normalmente...
git add .
git commit -m "feat: Implement appointment CRUD endpoints"

# Quando terminar, fazer push da branch
git push origin feature/agendamentos-api

# No GitHub, abrir Pull Request (PR)
# Revisar código → Mergear em main

# Deletar branch após merger
git branch -d feature/agendamentos-api
git push origin --delete feature/agendamentos-api
```

---

## ⚠️ Erros Comuns e Soluções

### "fatal: not a git repository"
```bash
# Solução: Execute git init na pasta correta
pwd  # Verifique a pasta
git init
```

### "fatal: 'origin' does not appear to be a 'git' repository"
```bash
# Solução: Adicione o remoto
git remote add origin https://github.com/SEU_USUARIO/BelaHub.git
```

### "Permission denied (publickey)"
```bash
# Você está usando SSH sem chave configurada
# Solução 1: Use HTTPS em vez de SSH
git remote set-url origin https://github.com/SEU_USUARIO/BelaHub.git

# Solução 2: Configure chave SSH (mais seguro)
# Vide: https://docs.github.com/pt/authentication/connecting-to-github-with-ssh
```

### "Your branch is ahead of 'origin/main' by N commits"
```bash
# Você fez commits locais mas não fez push
git push origin main
```

### "Updates were rejected because the remote contains work that you do not have locally"
```bash
# Você tem mudanças no GitHub que não tem localmente
git pull origin main

# Depois:
git push origin main
```

---

## 🔐 Proteger Dados Sensíveis

**NUNCA faça commit de:**
- ❌ Arquivo `.env` (use `.env.example`)
- ❌ Senhas ou tokens
- ❌ Chaves API
- ❌ `node_modules/` (já está em `.gitignore`)

Verifique que `.gitignore` contém:
```
.env
.env.local
node_modules/
```

Se você acidentalmente fizer commit de `.env`:

```bash
# 1. Remova do Git (mas não delete localmente)
git rm --cached .env

# 2. Commit
git commit -m "chore: Remove .env from tracking"

# 3. Push
git push origin main

# 4. IMPORTANTE: Regenere todas as chaves/tokens em .env
```

---

## 📚 Referência Rápida

```bash
# Ver histórico
git log

# Ver diferenças
git diff

# Ver branch atual
git branch

# Ver remotes
git remote -v

# Fazer checkout de branch
git checkout -b novo-branch

# Mergear branch
git merge nome-branch

# Revert último commit (keep changes)
git reset --soft HEAD~1

# Revert último commit (discard changes)
git reset --hard HEAD~1
```

---

## 🎯 Próximas Etapas

1. ✅ Fazer primeiro push para GitHub
2. ⬜ Configurar Actions (CI/CD automático)
3. ⬜ Proteger branch main
4. ⬜ Começar desenvolvimento da Sprint 1

---

**Pronto para começar! 🚀**

*Para mais ajuda, consulte: https://docs.github.com/pt*
