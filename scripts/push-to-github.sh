#!/bin/bash

# Script para fazer push do BelaHub para GitHub
# Execute este script em sua máquina local

echo "🚀 Fazendo push do BelaHub para GitHub..."
echo ""

# Verificar se está no diretório correto
if [ ! -f "README.md" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Erro: Execute este script na pasta raiz do BelaHub"
    exit 1
fi

# Fazer push
echo "📤 Enviando arquivos para GitHub..."
git push -u origin main --force

if [ $? -eq 0 ]; then
    echo ""
    echo "╔════════════════════════════════════════════════════╗"
    echo "║                                                    ║"
    echo "║           ✅ SUCESSO! 🎉                          ║"
    echo "║                                                    ║"
    echo "║   Seu projeto foi enviado para o GitHub!          ║"
    echo "║                                                    ║"
    echo "╚════════════════════════════════════════════════════╝"
    echo ""
    echo "📍 Acesse seu repositório:"
    echo "   https://github.com/GlaucioCoelho/BelaHub"
    echo ""
else
    echo ""
    echo "❌ Erro ao fazer push!"
    echo ""
    echo "Se pedir autenticação:"
    echo "  - Username: GlaucioCoelho"
    echo "  - Password: Use um GitHub token"
    echo "    (Gere em: https://github.com/settings/tokens)"
    echo ""
fi
