#!/bin/bash
set -e

echo "🔨 Iniciando build..."

# Frontend
echo "📦 Instalando dependências do frontend..."
cd frontend
npm install --legacy-peer-deps
echo "⚙️  Compilando frontend..."
CI=false npm run build
cd ..

# Backend
echo "📦 Instalando dependências do backend..."
cd backend
npm install
cd ..

echo "✅ Build completo!"
