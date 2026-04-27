#!/bin/bash

# Script para fazer push do código para GitHub
# Este script está pronto para fazer o push após obter credenciais

echo "🚀 BelaHub - GitHub Push Script"
echo "================================"
echo ""

# Verificar se estamos em um git repository
if [ ! -d ".git" ]; then
    echo "❌ Erro: Não estou em um repositório Git"
    exit 1
fi

# Mostrar informações do repositório
echo "📊 Informações do Repositório:"
echo "   Remote: $(git config --get remote.origin.url)"
echo "   Branch: $(git rev-parse --abbrev-ref HEAD)"
echo "   Commits: $(git rev-list --all --count)"
echo ""

# Tentar fazer push
echo "📤 Fazendo push para GitHub..."
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCESSO! Código enviado para GitHub"
    echo ""
    echo "Acesse seu repositório em:"
    echo "👉 https://github.com/GlaucioCoelho/BelaHub"
    echo ""
else
    echo ""
    echo "❌ Falha ao fazer push"
    echo ""
    echo "Se for erro de autenticação, você pode:"
    echo "1. Usar um Personal Access Token (PAT):"
    echo "   - Vá em https://github.com/settings/tokens"
    echo "   - Crie um novo token com escopo 'repo'"
    echo "   - Execute: git push -u origin main"
    echo "   - Use o token como senha quando pedir"
    echo ""
    echo "2. Ou configure SSH:"
    echo "   - ssh-keygen -t ed25519 -C 'glauciovenancio17@gmail.com'"
    echo "   - Copie a chave pública para https://github.com/settings/ssh"
    echo "   - Execute: git remote set-url origin git@github.com:GlaucioCoelho/BelaHub.git"
    echo "   - Execute: git push -u origin main"
    exit 1
fi
