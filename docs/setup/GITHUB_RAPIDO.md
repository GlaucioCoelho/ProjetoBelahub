# ⚡ GitHub Rápido - 3 Minutos

Se você quer fazer isso **AGORA**, siga este guia super rápido!

---

## 🎯 Opção 1: Script Automático (MAIS FÁCIL) ⭐

```bash
# 1. Primeiro, crie o repositório em: https://github.com/new
#    Nome: BelaHub
#    Privacy: Private (🔒)
#    Clique "Create repository"

# 2. Execute o script automático:
cd caminho/para/ProjetoBelahub
bash setup-github.sh

# 3. Responda as perguntas
```

**Pronto! Seu repositório foi criado! ✅**

---

## 🎯 Opção 2: Comandos Manuais (RÁPIDO)

```bash
# 1. Configure seu GitHub (primeira vez apenas)
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"

# 2. Inicialize o repositório
cd caminho/para/ProjetoBelahub
git init

# 3. Adicione o remoto (substitua SEU_USUARIO)
git remote add origin https://github.com/SEU_USUARIO/BelaHub.git

# 4. Faça o primeiro push
git add .
git commit -m "feat: Initial BelaHub project with Sprint 1 authentication"
git branch -M main
git push -u origin main
```

**Pronto! ✅**

---

## ✅ Verificar se Funcionou

Acesse: **https://github.com/SEU_USUARIO/BelaHub**

Você deve ver todos os seus arquivos lá!

---

## 📝 Futuros Commits

```bash
# Fazer mudanças...

# Depois:
git add .
git commit -m "feat: sua descrição aqui"
git push origin main
```

---

## 🆘 Se der erro "Authentication failed"

1. Gere token em: https://github.com/settings/tokens
2. Copie o token
3. Quando Git pedir "password", cole o token

---

## 🎉 Sucesso!

Agora seu código está seguro no GitHub! 🔒

Próximo passo: Sprint 2 (Agendamentos)
