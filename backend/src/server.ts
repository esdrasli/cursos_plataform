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
import brandingRoutes from './routes/branding.routes.js';
import uploadRoutes from './routes/upload.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature']
}));

// Webhook do Stripe precisa de raw body (antes do express.json())
app.use('/api/checkout/webhook', express.raw({ type: 'application/json' }));

// IMPORTANTE: express.json() e express.urlencoded() devem vir ANTES das rotas de upload
// mas o multer processa multipart/form-data automaticamente, então não há conflito
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static('uploads'));

// Servir vídeos do storage de cursos
// Estrutura: /storage/cursos/{userId}/{courseId}/aulas/aula_{lessonNumber}.mp4
const videoStoragePath = process.env.VIDEO_STORAGE_PATH || '/home/ndx.sisaatech.com/storage/cursos';
app.use('/storage/cursos', express.static(videoStoragePath, {
  // Configurações para streaming de vídeo
  setHeaders: (res, filePath) => {
    // Permitir range requests para streaming
    res.setHeader('Accept-Ranges', 'bytes');
    // Cache control para vídeos
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
}));

// Conectar ao PostgreSQL
let retryCount = 0;
const maxRetries = 5;
const retryDelay = 5000;

async function connectDatabase() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Conectado ao PostgreSQL');
    console.log(`📊 Banco de dados: ${AppDataSource.options.database}`);
    
    // Configurar search_path após conexão (importante para produção com schema 'cursos')
    if (process.env.DB_SCHEMA || (process.env.NODE_ENV === 'production' && process.env.DB_SCHEMA_PROD)) {
      const schema = process.env.DB_SCHEMA || process.env.DB_SCHEMA_PROD || 'cursos';
      try {
        await AppDataSource.query(`SET search_path TO ${schema}, public;`);
        console.log(`📂 Schema configurado: ${schema}`);
      } catch (schemaError: any) {
        console.error(`⚠️  Erro ao configurar schema: ${schemaError.message}`);
      }
    }
    
    // Verificar se a tabela users existe, se não, tentar criar
    try {
      const schema = process.env.DB_SCHEMA || (process.env.NODE_ENV === 'production' && process.env.DB_SCHEMA_PROD) || 'public';
      
      // Usar query direta com schema explícito para evitar problemas de permissão
      const result = await AppDataSource.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = $1
          AND table_name = 'users'
        ) as exists;
      `, [schema]);
      
      if (!result[0]?.exists) {
        console.log(`⚠️  Tabela users não encontrada no schema '${schema}'. Execute: npm run init-db`);
        console.log('   Ou execute o script create_tables.sql no DBeaver');
      } else {
        console.log(`✅ Tabela users encontrada no schema '${schema}'`);
      }
    } catch (checkError: any) {
      // Ignorar erros de verificação (pode ser problema de permissão)
      console.log(`⚠️  Não foi possível verificar tabelas: ${checkError.message}`);
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
app.use('/api/branding', brandingRoutes);
app.use('/api/upload', uploadRoutes);

// Log para debug - verificar se rotas estão registradas
console.log('✅ Rotas registradas:');
console.log('   - /api/upload/video (POST)');

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
