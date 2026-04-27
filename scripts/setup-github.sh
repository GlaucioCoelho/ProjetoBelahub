#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                                ║${NC}"
echo -e "${BLUE}║              🚀 Setup GitHub BelaHub Repository 🚀             ║${NC}"
echo -e "${BLUE}║                                                                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"

echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE: Você deve ter criado o repositório no GitHub ANTES de executar este script!${NC}"
echo ""
echo -e "${BLUE}Passos necessários:${NC}"
echo "1. Acesse: https://github.com/new"
echo "2. Repository name: BelaHub"
echo "3. Privacy: Private (🔒)"
echo "4. NÃO adicione README, .gitignore ou license"
echo "5. Clique em 'Create repository'"
echo ""

read -p "Você já criou o repositório no GitHub? (s/n): " -r
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${RED}Por favor, crie o repositório primeiro em https://github.com/new${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Digite os dados do seu GitHub:${NC}"
read -p "Seu nome de usuário GitHub: " -r github_usuario
read -p "Seu nome completo: " -r nome_completo
read -p "Seu email: " -r email_user

if [ -z "$github_usuario" ] || [ -z "$nome_completo" ] || [ -z "$email_user" ]; then
    echo -e "${RED}Erro: Todos os campos são obrigatórios!${NC}"
    exit 1
fi

repo_url="https://github.com/${github_usuario}/BelaHub.git"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Iniciando setup com:${NC}"
echo "  👤 Usuário: $github_usuario"
echo "  📧 Email: $email_user"
echo "  📦 Repositório: $repo_url"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Passo 1: Configurar Git
echo -e "${YELLOW}[1/6]${NC} Configurando Git..."
git config --global user.name "$nome_completo"
git config --global user.email "$email_user"
echo -e "${GREEN}✅ Git configurado${NC}"

# Passo 2: Inicializar repositório
echo ""
echo -e "${YELLOW}[2/6]${NC} Inicializando repositório Git..."
if [ -d .git ]; then
    echo -e "${YELLOW}⚠️  Repositório Git já existe. Limpando...${NC}"
    rm -rf .git 2>/dev/null || true
fi
git init
echo -e "${GREEN}✅ Repositório inicializado${NC}"

# Passo 3: Adicionar remoto
echo ""
echo -e "${YELLOW}[3/6]${NC} Adicionando remoto GitHub..."
git remote add origin "$repo_url"
echo -e "${GREEN}✅ Remoto adicionado${NC}"
echo "   URL: $repo_url"

# Passo 4: Adicionar arquivos
echo ""
echo -e "${YELLOW}[4/6]${NC} Adicionando arquivos ao staging..."
git add .
echo -e "${GREEN}✅ Arquivos adicionados${NC}"

# Passo 5: Criar primeiro commit
echo ""
echo -e "${YELLOW}[5/6]${NC} Criando primeiro commit..."
git commit -m "feat: Initial BelaHub project setup with Node.js/React stack and Sprint 1 authentication system

- Backend: Express.js, MongoDB, JWT authentication
- Frontend: React, Zustand, React Router
- Authentication: Login/Register system with bcryptjs
- Dashboard: User interface with sidebar navigation
- Documentation: Complete setup and testing guides"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Commit criado${NC}"
else
    echo -e "${RED}❌ Erro ao criar commit${NC}"
    exit 1
fi

# Passo 6: Fazer push
echo ""
echo -e "${YELLOW}[6/6]${NC} Fazendo push para GitHub..."
echo -e "${BLUE}Dica: Se pedir autenticação, use GitHub token como senha${NC}"
echo "      Gere em: https://github.com/settings/tokens"
echo ""

git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                                ║${NC}"
    echo -e "${GREEN}║                 ✅ SUCESSO! 🎉                                ║${NC}"
    echo -e "${GREEN}║                                                                ║${NC}"
    echo -e "${GREEN}║         Seu repositório foi criado e sincronizado!             ║${NC}"
    echo -e "${GREEN}║                                                                ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}Próximas ações:${NC}"
    echo "1. Verifique seu repositório:"
    echo "   https://github.com/$github_usuario/BelaHub"
    echo ""
    echo "2. Clone o repositório para começar a trabalhar:"
    echo "   git clone $repo_url"
    echo ""
    echo "3. Para futuros commits:"
    echo "   git add ."
    echo "   git commit -m 'feat: descrição da mudança'"
    echo "   git push origin main"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Erro ao fazer push!${NC}"
    echo ""
    echo -e "${YELLOW}Possíveis soluções:${NC}"
    echo "1. Verifique se criou o repositório no GitHub"
    echo "2. Verifique se o username está correto"
    echo "3. Se pedir autenticação:"
    echo "   - GitHub Codespaces (link fornecido)"
    echo "   - GitHub token (https://github.com/settings/tokens)"
    echo ""
    exit 1
fi

echo -e "${GREEN}Tudo pronto! 🚀${NC}"
