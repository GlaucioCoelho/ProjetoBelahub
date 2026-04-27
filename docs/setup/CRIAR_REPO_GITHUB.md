# 🚀 Como Criar o Repositório BelaHub no GitHub

Este guia passo-a-passo vai te ajudar a criar o repositório privado no GitHub e fazer o primeiro push.

---

## 📋 PASSO-A-PASSO

### **Passo 1: Criar Repositório no GitHub** (5 minutos)

1. Acesse: **https://github.com/new**

2. Preencha os campos:
   - **Repository name**: `BelaHub`
   - **Description**: `SaaS para gestão de salões de beleza`
   - **Privacy**: 🔒 **Private** (privado - importante!)
   - **Add a README file**: NÃO marque (vamos fazer via Git)
   - **Add .gitignore**: NÃO marque (já temos)
   - **Choose a license**: Deixe em branco

3. Clique em **"Create repository"**

4. Você verá uma página com as instruções. Copie a **URL HTTPS** do seu repositório:
   ```
   https://github.com/SEU_USUARIO/BelaHub.git
   ```

---

### **Passo 2: Preparar o Repositório Local**

Abra o terminal na pasta `ProjetoBelahub` e execute esses comandos:

```bash
# 1. Entrar na pasta do projeto
cd ~/caminho/para/ProjetoBelahub

# 2. Configurar Git (primeira vez)
git config --global user.name "Seu Nome Aqui"
git config --global user.email "seu@email.com"

# 3. Inicializar repositório Git
git init

# 4. Adicionar remoto (substitua pela sua URL)
git remote add origin https://github.com/SEU_USUARIO/BelaHub.git

# 5. Verificar se configurou corretamente
git remote -v
```

Você deve ver:
```
origin  https://github.com/SEU_USUARIO/BelaHub.git (fetch)
origin  https://github.com/SEU_USUARIO/BelaHub.git (push)
```

---

### **Passo 3: Fazer o Primeiro Commit**

```bash
# 1. Adicionar todos os arquivos
git add .

# 2. Criar primeiro commit
git commit -m "feat: Initial BelaHub project setup with Node.js/React stack and Sprint 1 authentication system"

# 3. Renomear branch para main (padrão)
git branch -M main

# 4. Fazer push para GitHub (será pedido autenticação)
git push -u origin main
```

**Na primeira vez:**
- Se pedir por autenticação via HTTPS, siga as opções:
  - **Opção 1 (Recomendado)**: GitHub Codespaces (clicar no link)
  - **Opção 2**: Usar GitHub token pessoal como senha

---

### **Passo 4: Autenticação GitHub (Se Necessário)**

Se o Git pedir por autenticação:

**Via Token (Recomendado):**
1. Acesse: https://github.com/settings/tokens
2. Clique em "Generate new token"
3. Selecione escopo: `repo` e `gist`
4. Copie o token
5. Quando Git pedir "password", cole o token

**Via SSH (Mais seguro):**
1. Gere chave SSH:
   ```bash
   ssh-keygen -t ed25519 -C "seu@email.com"
   ```
2. Adicione em GitHub Settings → SSH keys
3. Use URL SSH em vez de HTTPS:
   ```bash
   git remote set-url origin git@github.com:SEU_USUARIO/BelaHub.git
   ```

---

### **Passo 5: Verificar no GitHub**

1. Acesse: `https://github.com/SEU_USUARIO/BelaHub`
2. Você deve ver:
   - ✅ Todos os arquivos do projeto
   - ✅ Branch `main` como padrão
   - ✅ Um commit inicial

---

## 🎯 COMANDOS RÁPIDOS

```bash
# Ver status
git status

# Ver histórico
git log --oneline

# Ver branches
git branch -a

# Ver remotes
git remote -v

# Adicionar novos arquivos
git add .

# Commit
git commit -m "feat: sua mensagem aqui"

# Push (após configurar remoto)
git push origin main
```

---

## ✅ CHECKLIST

- [ ] Criei repositório no GitHub
- [ ] Copiei a URL HTTPS
- [ ] Executei `git init`
- [ ] Executei `git remote add origin URL`
- [ ] Executei `git add .`
- [ ] Executei `git commit`
- [ ] Executei `git branch -M main`
- [ ] Executei `git push -u origin main`
- [ ] Verifiquei no GitHub
- [ ] Repositório está privado

---

## ⚠️ DICAS IMPORTANTES

✅ **O que fazer:**
- Use mensagens de commit descritivas
- Commit frequentemente com mudanças pequenas
- Mantenha o repositório privado
- Sincronize regularmente

❌ **O que NÃO fazer:**
- Não faça commit de `.env` (já está em .gitignore)
- Não commitize `node_modules/` (já está em .gitignore)
- Não compartilhe o repositório publicamente (é privado)
- Não use `git push --force` (perigoso)

---

## 🆘 PROBLEMAS COMUNS

### "Permission denied (publickey)"
```bash
# Você está usando SSH sem chave configurada
# Solução: Use HTTPS em vez de SSH
git remote set-url origin https://github.com/SEU_USUARIO/BelaHub.git
```

### "fatal: 'origin' does not appear to be a 'git' repository"
```bash
# Solução: Adicione o remoto
git remote add origin https://github.com/SEU_USUARIO/BelaHub.git
```

### "Updates were rejected because the remote contains work that you do not have locally"
```bash
# Solução: Puxe as mudanças primeiro
git pull origin main
git push origin main
```

### "fatal: not a git repository"
```bash
# Solução: Inicialize o repositório
git init
git remote add origin https://github.com/SEU_USUARIO/BelaHub.git
```

---

## 📚 PRÓXIMAS ETAPAS

1. ✅ Criar repositório no GitHub
2. ✅ Fazer primeiro push
3. ⬜ Proteger branch main (Settings → Branches)
4. ⬜ Configurar CI/CD (GitHub Actions)
5. ⬜ Adicionar colaboradores

---

## 🎉 PRONTO!

Depois de fazer o push, seu repositório estará no GitHub e você poderá:
- ✅ Trabalhar em branches diferentes
- ✅ Fazer Pull Requests
- ✅ Colaborar com outras pessoas
- ✅ Manter histórico de todas as mudanças
- ✅ Deploy automático

**Sucesso!** 🚀

---

*Última atualização: 2026-04-03*
