# 🚀 Configuração do Repositório GitHub - BelaHub

Este guia explica como criar um repositório privado no GitHub para o projeto BelaHub.

## 1️⃣ Criar o Repositório no GitHub

### Passo 1: Acessar GitHub
1. Vá para [github.com](https://github.com) e faça login na sua conta
2. Clique no ícone **+** no canto superior direito
3. Selecione **"New repository"**

### Passo 2: Configurar o Repositório
Preencha os seguintes campos:

- **Repository name**: `BelaHub`
- **Description**: `SaaS para gestão de salões de beleza`
- **Visibility**: 🔒 **Private** (repositório privado)
- **.gitignore**: Selecione **Node** (já temos um customizado)
- **License**: Deixe em branco (privado)

### Passo 3: Criar Repositório
Clique em **"Create repository"**

## 2️⃣ Inicializar Git Localmente

### Passo 1: Abra o Terminal
Navegue até a pasta do projeto:
```bash
cd ~/caminho/para/ProjetoBelahub
```

### Passo 2: Inicializar Git
```bash
git init
```

### Passo 3: Adicionar Remoto
Copie o URL HTTPS do seu repositório GitHub e execute:
```bash
git remote add origin https://github.com/seu-usuario/BelaHub.git
```

Ou use SSH (se configurado):
```bash
git remote add origin git@github.com:seu-usuario/BelaHub.git
```

### Passo 4: Configurar Git (primeira vez)
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

## 3️⃣ Fazer o Primeiro Push

### Passo 1: Adicionar Todos os Arquivos
```bash
git add .
```

### Passo 2: Criar Primeiro Commit
```bash
git commit -m "feat: Initial project structure with backend and frontend setup"
```

### Passo 3: Enviar para GitHub
```bash
git branch -M main
git push -u origin main
```

## 4️⃣ Configurações Recomendadas no GitHub

### Adicionar Colaboradores
1. Vá para **Settings** → **Collaborators** → **Add people**
2. Adicione membros do time (necessário convite)

### Proteger Branch Main
1. Vá para **Settings** → **Branches**
2. Clique em **Add rule**
3. Aplique regras de proteção:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Include administrators

### Configurar Deploy (opcional)
1. Vá para **Settings** → **Environments**
2. Configure ambientes (desenvolvimento, staging, produção)

## 5️⃣ Fluxo de Desenvolvimento

### Para cada nova feature:

```bash
# 1. Criar branch
git checkout -b feature/nome-da-feature

# 2. Fazer commits
git add .
git commit -m "feat: descrição da alteração"

# 3. Push da branch
git push origin feature/nome-da-feature

# 4. Abrir Pull Request no GitHub
# 5. Depois de aprovado, mergear em main
```

## 6️⃣ Estrutura de Commits

Use o padrão Conventional Commits:

```
feat: nova funcionalidade
fix: correção de bug
docs: mudanças em documentação
style: formatação de código
refactor: refatoração sem mudança funcional
test: adição de testes
chore: tarefas de manutenção
```

Exemplo:
```bash
git commit -m "feat: adicionar sistema de agendamentos"
git commit -m "fix: corrigir validação de email"
git commit -m "docs: atualizar README com instruções"
```

## 7️⃣ Ignorar Arquivos Sensíveis

Verificar que `.gitignore` contém:
- ✅ `.env` (variáveis de ambiente)
- ✅ `node_modules/`
- ✅ `build/`, `dist/`
- ✅ Arquivos de log

**NUNCA faça push de:**
- Chaves privadas
- Senhas
- Tokens de API
- Arquivos de configuração sensíveis

## 8️⃣ Comandos Úteis

```bash
# Ver status
git status

# Ver histórico
git log --oneline

# Ver branches
git branch -a

# Deletar branch local
git branch -d nome-branch

# Deletar branch remoto
git push origin --delete nome-branch

# Atualizar local com remoto
git pull origin main

# Ver diferenças
git diff
```

## 9️⃣ Autenticação GitHub

### Via Token (Recomendado)
1. GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Selecione escopos: `repo`, `gist`
4. Use o token como senha quando solicitar

### Via SSH (Mais seguro)
1. Gere chave SSH: `ssh-keygen -t ed25519 -C "seu@email.com"`
2. Adicione em GitHub Settings → SSH and GPG keys
3. Use URLs `git@github.com:...` nos remotes

## 🔟 Próximos Passos

1. ✅ Criar repositório privado no GitHub
2. ✅ Fazer push inicial do código
3. ⬜ Configurar CI/CD (GitHub Actions)
4. ⬜ Adicionar membros do time
5. ⬜ Proteger branch main
6. ⬜ Configurar variáveis de ambiente

---

**Dúvidas?** Consulte a [documentação oficial do GitHub](https://docs.github.com/pt)
