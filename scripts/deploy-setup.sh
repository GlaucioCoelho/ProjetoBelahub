#!/bin/bash

# ========================================
# BelaHub - Vercel Deployment Setup Script
# Automatiza tarefas de preparação para deploy
# ========================================

set -e  # Exit on error

echo "🚀 BelaHub - Vercel Deployment Setup"
echo "======================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ========== FUNÇÕES ==========

check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 não está instalado${NC}"
        return 1
    fi
    return 0
}

# ========== VERIFICAÇÕES PRÉ-REQUISITOS ==========

echo -e "\n${YELLOW}Verificando pré-requisitos...${NC}"

required_commands=("git" "node" "npm")
missing=0

for cmd in "${required_commands[@]}"; do
    if check_command $cmd; then
        version=$($cmd --version 2>/dev/null || $cmd -v)
        echo -e "${GREEN}✅ $cmd${NC} ($version)"
    else
        missing=1
    fi
done

if [ $missing -eq 1 ]; then
    echo -e "${RED}❌ Por favor instale os pré-requisitos antes de continuar${NC}"
    exit 1
fi

# ========== CLEANUP ==========

echo -e "\n${YELLOW}Limpando arquivos temporários...${NC}"

rm -rf backend/node_modules 2>/dev/null && echo -e "${GREEN}✅ Removido backend/node_modules${NC}" || true
rm -rf frontend/node_modules 2>/dev/null && echo -e "${GREEN}✅ Removido frontend/node_modules${NC}" || true
rm -f backend/.env 2>/dev/null && echo -e "${GREEN}✅ Removido backend/.env${NC}" || true
rm -f frontend/.env 2>/dev/null && echo -e "${GREEN}✅ Removido frontend/.env${NC}" || true

# ========== VALIDAR ESTRUTURA ==========

echo -e "\n${YELLOW}Validando estrutura do projeto...${NC}"

required_files=(
    "backend/server.js"
    "backend/package.json"
    "frontend/package.json"
    "frontend/src/App.js"
    "vercel.json"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file não encontrado${NC}"
        exit 1
    fi
done

# ========== CRIAR BRANCH DEPLOYMENT ==========

echo -e "\n${YELLOW}Preparando branch de deployment...${NC}"

if git rev-parse --verify deployment/vercel > /dev/null 2>&1; then
    echo -e "${YELLOW}ℹ️  Branch deployment/vercel já existe${NC}"
    git checkout deployment/vercel
else
    echo -e "Criando branch deployment/vercel..."
    git checkout -b deployment/vercel
    echo -e "${GREEN}✅ Branch deployment/vercel criado${NC}"
fi

# ========== VERIFICAR .gitignore ==========

echo -e "\n${YELLOW}Atualizando .gitignore...${NC}"

if ! grep -q "^.env$" .gitignore; then
    echo ".env" >> .gitignore
    echo -e "${GREEN}✅ Adicionado .env ao .gitignore${NC}"
else
    echo -e "${GREEN}✅ .env já está em .gitignore${NC}"
fi

if ! grep -q "^node_modules/" .gitignore; then
    echo "node_modules/" >> .gitignore
    echo -e "${GREEN}✅ Adicionado node_modules/ ao .gitignore${NC}"
else
    echo -e "${GREEN}✅ node_modules/ já está em .gitignore${NC}"
fi

# ========== INSTALAR DEPENDÊNCIAS ==========

echo -e "\n${YELLOW}Instalando dependências...${NC}"

echo "Instalando dependências do backend..."
cd backend
npm install --production
cd ..
echo -e "${GREEN}✅ Backend instalado${NC}"

echo "Instalando dependências do frontend..."
cd frontend
npm install --production
cd ..
echo -e "${GREEN}✅ Frontend instalado${NC}"

# ========== VALIDAR BUILD FRONTEND ==========

echo -e "\n${YELLOW}Validando build do frontend...${NC}"

cd frontend
npm run build
build_size=$(du -sh build/ | cut -f1)
echo -e "${GREEN}✅ Frontend build gerado (tamanho: $build_size)${NC}"
cd ..

# ========== CRIAR ARQUIVOS ENV ==========

echo -e "\n${YELLOW}Criando arquivos de environment...${NC}"

if [ ! -f "frontend/.env.production" ]; then
    cat > frontend/.env.production << 'EOF'
REACT_APP_API_URL=https://belahub.com.br/api
REACT_APP_JWT_STORAGE_KEY=belahub_jwt_token
REACT_APP_USUARIO_STORAGE_KEY=belahub_usuario
EOF
    echo -e "${GREEN}✅ Criado frontend/.env.production${NC}"
else
    echo -e "${GREEN}✅ frontend/.env.production já existe${NC}"
fi

# ========== COMMIT MUDANÇAS ==========

echo -e "\n${YELLOW}Commitando mudanças...${NC}"

git add .gitignore vercel.json .env.production.example frontend/.env.production 2>/dev/null || true

if [ -n "$(git status --porcelain)" ]; then
    git commit -m "chore: prepare for Vercel deployment

- Clean up node_modules and .env files
- Add .gitignore rules for production
- Create environment configuration files
- Validate build artifacts
- Ready for Vercel deployment

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
    echo -e "${GREEN}✅ Mudanças commitadas${NC}"
else
    echo -e "${YELLOW}ℹ️  Nenhuma mudança para commitar${NC}"
fi

# ========== RESUMO FINAL ==========

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Preparação para Deploy Concluída!${NC}"
echo -e "${GREEN}========================================${NC}"

echo -e "\n${YELLOW}Próximas etapas:${NC}"
echo "1. Criar cluster MongoDB Atlas (https://www.mongodb.com/cloud/atlas)"
echo "2. Copiar connection string do MongoDB"
echo "3. Acessar Vercel (https://vercel.com)"
echo "4. Importar repositório GitHub"
echo "5. Adicionar environment variables no Vercel console"
echo "6. Clicar 'Deploy'"
echo ""
echo -e "${YELLOW}Documentação:${NC}"
echo "→ Abrir: DEPLOYMENT_VERCEL_GUIA.md"
echo ""
echo -e "${YELLOW}Branch atual:${NC}"
git branch --show-current

echo -e "\n${GREEN}Boa sorte! 🚀${NC}"
