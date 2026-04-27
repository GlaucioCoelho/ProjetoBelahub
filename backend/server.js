import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './src/routes/authRoutes.js';
import agendamentoRoutes from './src/routes/agendamentoRoutes.js';
import clienteRoutes from './src/routes/clienteRoutes.js';
import funcionarioRoutes from './src/routes/funcionarioRoutes.js';
import transacaoRoutes from './src/routes/transacaoRoutes.js';
import faturamentoRoutes from './src/routes/faturamentoRoutes.js';
import produtoRoutes from './src/routes/produtoRoutes.js';
import estoqueRoutes from './src/routes/estoqueRoutes.js';
import movimentacaoRoutes from './src/routes/movimentacaoRoutes.js';
import alertasRoutes from './src/routes/alertasRoutes.js';
import servicoRoutes from './src/routes/servicoRoutes.js';
import pacoteRoutes  from './src/routes/pacoteRoutes.js';
import comandaRoutes from './src/routes/comandaRoutes.js';
import adminRoutes   from './src/routes/adminRoutes.js';

// Carrega variáveis de ambiente
dotenv.config();

// Configuração de diretórios para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'build');

const app = express();
const PORT = process.env.PORT || 5000;

// Detectar CORS origin com fallback seguro para produção
const frontendUrl = process.env.FRONTEND_URL ||
  (process.env.NODE_ENV === 'production' ? 'https://belahub-production.up.railway.app' : 'http://localhost:3000');

// Middlewares
app.use(cors({
  origin: frontendUrl,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Servir arquivos estáticos do frontend
app.use(express.static(frontendBuildPath));

// Conectar ao MongoDB
const conectarMongoDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/belahub',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Erro ao conectar MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Rotas de Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date(),
    database: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado'
  });
});

// Rotas de Autenticação
app.use('/api/auth', authRoutes);

// Rotas de Agendamentos (Sprint 2)
app.use('/api/agendamentos', agendamentoRoutes);

// Rotas de Clientes (Sprint 3)
app.use('/api/clientes', clienteRoutes);

// Rotas de Funcionários (Sprint 4)
app.use('/api/funcionarios', funcionarioRoutes);

// Rotas de Financeiro (Sprint 5)
app.use('/api/transacoes', transacaoRoutes);
app.use('/api/faturamento', faturamentoRoutes);

// Rotas de Estoque (Sprint 6)
app.use('/api/produtos', produtoRoutes);
app.use('/api/estoque', estoqueRoutes);
app.use('/api/movimentacoes', movimentacaoRoutes);
app.use('/api/alertas', alertasRoutes);
app.use('/api/servicos', servicoRoutes);
app.use('/api/pacotes',  pacoteRoutes);
app.use('/api/comandas', comandaRoutes);
app.use('/api/admin',   adminRoutes);

// Debug - verificar se frontend build existe
app.get('/api/debug/status', (req, res) => {
  const fs = require('fs');
  const indexPath = path.join(frontendBuildPath, 'index.html');
  const exists = fs.existsSync(indexPath);
  res.json({
    status: 'ok',
    frontendBuildPath,
    indexHtmlExists: exists,
    buildPath: frontendBuildPath,
    cwd: process.cwd()
  });
});

// Fallback para SPA (Single Page Application) - servir index.html para rotas não-API
app.get('*', (req, res) => {
  // Se a rota não começa com /api, servir o index.html do React
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendBuildPath, 'index.html'), (err) => {
      if (err) {
        res.status(404).json({ error: 'Arquivo não encontrado' });
      }
    });
  } else {
    res.status(404).json({ error: 'Rota não encontrada' });
  }
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Inicializar servidor
const iniciarServidor = async () => {
  await conectarMongoDB();

  app.listen(PORT, () => {
    console.log(`🚀 BelaHub Backend rodando em http://localhost:${PORT}`);
    console.log(`📝 API Health: http://localhost:${PORT}/api/health`);
    console.log(`🌍 CORS habilitado para: ${process.env.FRONTEND_URL}`);
    console.log(`📚 Endpoints disponíveis:`);
    console.log(`   POST   /api/auth/registro`);
    console.log(`   POST   /api/auth/login`);
    console.log(`   POST   /api/auth/logout`);
    console.log(`   GET    /api/auth/me (protegido)`);
  });
};

iniciarServidor();
