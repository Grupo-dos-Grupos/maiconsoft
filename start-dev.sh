#!/bin/bash

echo "🚀 Iniciando ambiente de desenvolvimento..."
echo ""

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado. Instale em: https://nodejs.org/"
    exit 1
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não está instalado."
    exit 1
fi

echo "✅ Node.js $(node --version) e npm $(npm --version) detectados"
echo ""

# Instalar dependências do backend se necessário
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Instalando dependências do backend..."
    cd backend && npm install && cd ..
    echo ""
fi

# Instalar dependências do frontend se necessário
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Instalando dependências do frontend..."
    cd frontend && npm install && cd ..
    echo ""
fi

echo "🎯 Iniciando servidores..."
echo ""

# Função para limpar processos ao sair
cleanup() {
    echo ""
    echo "🛑 Parando servidores..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT

# Iniciar backend em background
echo "🔧 Iniciando API Node.js (porta 3001)..."
cd backend && npm run dev &
BACKEND_PID=$!
cd ..

# Aguardar backend inicializar
sleep 3

# Iniciar frontend em background
echo "🎨 Iniciando React (porta 3000)..."
cd frontend && npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Servidores iniciados!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:3001"
echo "📊 Dashboard: http://localhost:3001/api/dashboard"
echo ""
echo "Pressione Ctrl+C para parar os servidores"
echo ""

# Aguardar processos
wait
