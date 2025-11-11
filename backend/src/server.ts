import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database.js';

// Importar rotas
import authRoutes from './routes/auth.routes.js';
import coursesRoutes from './routes/courses.routes.js';
import checkoutRoutes from './routes/checkout.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import creatorRoutes from './routes/creator.routes.js';
import learningRoutes from './routes/learning.routes.js';
import affiliateRoutes from './routes/affiliate.routes.js';
import configRoutes from './routes/config.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar ao PostgreSQL
let retryCount = 0;
const maxRetries = 5;
const retryDelay = 5000;

async function connectDatabase() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Conectado ao PostgreSQL');
    console.log(`📊 Banco de dados: ${AppDataSource.options.database}`);
    
    // Verificar se a tabela users existe, se não, tentar criar
    try {
      const queryRunner = AppDataSource.createQueryRunner();
      const result = await queryRunner.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        );
      `);
      
      if (!result[0].exists) {
        console.log('⚠️  Tabelas não encontradas. Execute: npm run init-db');
        console.log('   Ou execute o script create_tables.sql no DBeaver');
      }
    } catch (checkError) {
      // Ignorar erros de verificação
    }
  } catch (err: any) {
    retryCount++;
    console.error(`❌ Erro ao conectar ao PostgreSQL (tentativa ${retryCount}/${maxRetries}):`, err.message);
    
    if (retryCount < maxRetries) {
      console.log(`⏳ Tentando novamente em ${retryDelay / 1000} segundos...`);
      setTimeout(connectDatabase, retryDelay);
    } else {
      console.error('❌ Não foi possível conectar ao PostgreSQL após várias tentativas');
      process.exit(1);
    }
  }
}

connectDatabase();

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/creator', creatorRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/affiliate', affiliateRoutes);
app.use('/api/config', configRoutes);

// Rota de health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    message: 'API está funcionando',
    database: AppDataSource.isInitialized ? 'conectado' : 'desconectado',
    timestamp: new Date().toISOString()
  });
});

// Middleware de erro
app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Erro:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Rota 404
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
});
