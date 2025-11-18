/* eslint-env node */
/* global process, console */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Importar rotas
import authRoutes from './routes/auth.routes.js';
import coursesRoutes from './routes/courses.routes.js';
import checkoutRoutes from './routes/checkout.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import creatorRoutes from './routes/creator.routes.js';
import learningRoutes from './routes/learning.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// Configuração de CORS mais permissiva para aceitar requisições do frontend
app.use(cors({
  origin: function (origin, callback) {
    // Permitir requisições sem origin (ex: Postman, mobile apps)
    if (!origin) return callback(null, true);
    
    // Lista de origens permitidas
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5174',
      'https://ndx.sisaatech.com',
      'http://ndx.sisaatech.com',
      'https://api.ndx.sisaatech.com',
      'http://api.ndx.sisaatech.com'
    ];
    
    // Verificar se a origem está na lista ou se é do mesmo domínio
    if (allowedOrigins.includes(origin) || origin.includes('ndx.sisaatech.com')) {
      callback(null, true);
    } else if (process.env.NODE_ENV === 'development') {
      // Em desenvolvimento, permitir todas as origens
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar ao MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cursos_plataform';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Conectado ao MongoDB'))
  .catch((err) => {
    console.error('❌ Erro ao conectar ao MongoDB:', err.message);
    console.log('⚠️  Continuando sem MongoDB (usando dados em memória)');
  });

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/creator', creatorRoutes);
app.use('/api/learning', learningRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API está funcionando',
    timestamp: new Date().toISOString()
  });
});

// Middleware de erro
app.use((err, req, res) => {
  // Tratar erros de CORS especificamente
  if (err.message && err.message.includes('CORS')) {
    console.error('❌ Erro de CORS:', {
      origin: req.headers.origin,
      method: req.method,
      url: req.url
    });
    return res.status(403).json({
      message: 'Acesso negado por CORS',
      origin: req.headers.origin
    });
  }
  
  console.error('Erro:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Rota 404
app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
});

