#!/bin/bash

# Script para criar repositório no GitHub e fazer push
# Uso: ./criar-e-pushear.sh seu_token_aqui

TOKEN=$1
USERNAME="GlaucioCoelho"
REPO_NAME="BelaHub"

if [ -z "$TOKEN" ]; then
    echo "❌ Erro: Token não fornecido!"
    echo "Uso: ./criar-e-pushear.sh SEU_TOKEN_AQUI"
    exit 1
fi

echo "🚀 Criando repositório no GitHub..."

# Criar repositório via API do GitHub
curl -X POST \
  -H "Authorization: token $TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d "{
    \"name\": \"$REPO_NAME\",
    \"description\": \"SaaS para Gestão de Salões de Beleza\",
    \"private\": true,
    \"auto_init\": false
  }" \
  -s -o /dev/null

echo "✅ Repositório criado!"

echo "📤 Configurando Git..."
git remote set-url origin https://$USERNAME:$TOKEN@github.com/$USERNAME/$REPO_NAME.git

echo "🔄 Fazendo push para GitHub..."
git push -u origin main --force

if [ $? -eq 0 ]; then
    echo "✅ Push realizado com sucesso!"
    echo "📍 Repositório: https://github.com/$USERNAME/$REPO_NAME"
else
    echo "❌ Erro ao fazer push"
    exit 1
fi

echo ""
echo "⚠️  IMPORTANTE: Revogue o token em https://github.com/settings/tokens"
