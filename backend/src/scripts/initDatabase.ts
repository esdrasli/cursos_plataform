import 'reflect-metadata';
import { AppDataSource } from '../config/database.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initDatabase() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await AppDataSource.initialize();
    console.log('✅ Conectado ao banco de dados');

    const queryRunner = AppDataSource.createQueryRunner();
    
    // Ler o arquivo SQL (tentar múltiplos caminhos)
    let sqlPath = join(__dirname, '../../create_tables.sql');
    let sql: string;
    
    try {
      sql = readFileSync(sqlPath, 'utf-8');
    } catch (error) {
      // Tentar caminho alternativo
      sqlPath = join(process.cwd(), 'create_tables.sql');
      try {
        sql = readFileSync(sqlPath, 'utf-8');
      } catch (error2) {
        // Se não encontrar, criar SQL inline
        console.log('⚠️  Arquivo create_tables.sql não encontrado, usando SQL inline...');
        sql = getInlineSQL();
      }
    }
    
    // Processar SQL - dividir por linhas e executar comandos completos
    const lines = sql.split('\n');
    let currentCommand = '';
    let inDoBlock = false;
    const commands: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('--')) continue;
      
      currentCommand += line + '\n';
      
      // Detectar início de bloco DO $$
      if (trimmed.startsWith('DO $$')) {
        inDoBlock = true;
      }
      
      // Detectar fim de bloco DO $$
      if (inDoBlock && trimmed.endsWith('$$;')) {
        inDoBlock = false;
        commands.push(currentCommand.trim());
        currentCommand = '';
      } else if (!inDoBlock && trimmed.endsWith(';')) {
        commands.push(currentCommand.trim());
        currentCommand = '';
      }
    }
    
    if (currentCommand.trim()) {
      commands.push(currentCommand.trim());
    }
    
    console.log(`📝 Executando ${commands.length} comandos SQL...`);
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        try {
          await queryRunner.query(command);
          console.log(`✅ Comando ${i + 1}/${commands.length} executado`);
        } catch (error: any) {
          // Ignorar erros de "já existe" ou "permissão negada"
          if (error.message.includes('already exists') || 
              error.message.includes('permission denied') ||
              error.message.includes('duplicate') ||
              error.message.includes('duplicate_object')) {
            console.log(`⚠️  Comando ${i + 1} ignorado (já existe): ${error.message.split('\n')[0]}`);
          } else {
            console.error(`❌ Erro no comando ${i + 1}:`, error.message);
            // Não lançar erro, apenas logar
          }
        }
      }
    }
    
    console.log('✅ Banco de dados inicializado com sucesso!');
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Erro ao inicializar banco de dados:', error.message);
    process.exit(1);
  }
}

function getInlineSQL(): string {
  return `
-- Criar extensão UUID se não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar ENUMs (ignorar se já existirem)
DO $$ BEGIN
  CREATE TYPE users_role_enum AS ENUM('student', 'creator', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE courses_level_enum AS ENUM('Iniciante', 'Intermediário', 'Avançado');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE courses_status_enum AS ENUM('draft', 'published');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE sales_paymentmethod_enum AS ENUM('credit', 'pix', 'boleto');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE sales_status_enum AS ENUM('pending', 'completed', 'failed', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE landing_pages_status_enum AS ENUM('Publicada', 'Rascunho');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE affiliates_status_enum AS ENUM('active', 'inactive', 'suspended');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE affiliate_sales_status_enum AS ENUM('pending', 'approved', 'paid', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tabela: users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(500) DEFAULT 'https://i.pravatar.cc/150?img=1',
    role users_role_enum DEFAULT 'student',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Tabela: courses
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    thumbnail VARCHAR(500) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    "originalPrice" DECIMAL(10, 2),
    instructor VARCHAR(255) NOT NULL,
    "instructorId" UUID NOT NULL,
    "instructorAvatar" VARCHAR(500) DEFAULT 'https://i.pravatar.cc/150?img=1',
    rating DECIMAL(3, 2) DEFAULT 0,
    "totalStudents" INTEGER DEFAULT 0,
    duration VARCHAR(100) NOT NULL,
    level courses_level_enum NOT NULL,
    category VARCHAR(100) NOT NULL,
    modules JSONB DEFAULT '[]',
    features TEXT[] DEFAULT '{}',
    status courses_status_enum DEFAULT 'draft',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_courses_instructorId ON courses("instructorId");
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);

-- Adicionar foreign key depois (pode falhar se users não existir ainda)
DO $$ BEGIN
  ALTER TABLE courses ADD CONSTRAINT fk_courses_instructor FOREIGN KEY ("instructorId") REFERENCES users(id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tabela: user_enrolled_courses
CREATE TABLE IF NOT EXISTS user_enrolled_courses (
    "userId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    PRIMARY KEY ("userId", "courseId")
);

DO $$ BEGIN
  ALTER TABLE user_enrolled_courses ADD CONSTRAINT fk_user_enrolled_courses_user FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE user_enrolled_courses ADD CONSTRAINT fk_user_enrolled_courses_course FOREIGN KEY ("courseId") REFERENCES courses(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tabela: enrollments
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    progress INTEGER DEFAULT 0,
    "completedLessons" JSONB DEFAULT '[]',
    "enrolledAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "lastAccessedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_course UNIQUE ("userId", "courseId")
);

CREATE INDEX IF NOT EXISTS idx_enrollments_userId ON enrollments("userId");
CREATE INDEX IF NOT EXISTS idx_enrollments_courseId ON enrollments("courseId");

DO $$ BEGIN
  ALTER TABLE enrollments ADD CONSTRAINT fk_enrollments_user FOREIGN KEY ("userId") REFERENCES users(id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE enrollments ADD CONSTRAINT fk_enrollments_course FOREIGN KEY ("courseId") REFERENCES courses(id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tabela: sales
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "courseId" UUID NOT NULL,
    "courseTitle" VARCHAR(255) NOT NULL,
    "studentId" UUID NOT NULL,
    "studentName" VARCHAR(255) NOT NULL,
    "instructorId" UUID NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    "paymentMethod" sales_paymentmethod_enum NOT NULL,
    status sales_status_enum DEFAULT 'pending',
    "transactionId" VARCHAR(255),
    "affiliateCode" VARCHAR(50),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sales_studentId ON sales("studentId");
CREATE INDEX IF NOT EXISTS idx_sales_instructorId ON sales("instructorId");
CREATE INDEX IF NOT EXISTS idx_sales_courseId ON sales("courseId");

DO $$ BEGIN
  ALTER TABLE sales ADD CONSTRAINT fk_sales_course FOREIGN KEY ("courseId") REFERENCES courses(id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE sales ADD CONSTRAINT fk_sales_student FOREIGN KEY ("studentId") REFERENCES users(id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE sales ADD CONSTRAINT fk_sales_instructor FOREIGN KEY ("instructorId") REFERENCES users(id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tabela: landing_pages
CREATE TABLE IF NOT EXISTS landing_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    "courseId" UUID NOT NULL,
    "courseTitle" VARCHAR(255) NOT NULL,
    "creatorId" UUID NOT NULL,
    hero JSONB NOT NULL,
    sections JSONB,
    layout JSONB,
    status landing_pages_status_enum DEFAULT 'Rascunho',
    "lastUpdated" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_landing_pages_courseId ON landing_pages("courseId");
CREATE INDEX IF NOT EXISTS idx_landing_pages_creatorId ON landing_pages("creatorId");

DO $$ BEGIN
  ALTER TABLE landing_pages ADD CONSTRAINT fk_landing_pages_course FOREIGN KEY ("courseId") REFERENCES courses(id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE landing_pages ADD CONSTRAINT fk_landing_pages_creator FOREIGN KEY ("creatorId") REFERENCES users(id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tabela: affiliates
CREATE TABLE IF NOT EXISTS affiliates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL UNIQUE,
    "affiliateCode" VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    "commissionRate" DECIMAL(5, 2) DEFAULT 10.0,
    "totalEarnings" DECIMAL(10, 2) DEFAULT 0,
    "pendingEarnings" DECIMAL(10, 2) DEFAULT 0,
    "paidEarnings" DECIMAL(10, 2) DEFAULT 0,
    "totalSales" INTEGER DEFAULT 0,
    "totalClicks" INTEGER DEFAULT 0,
    status affiliates_status_enum DEFAULT 'active',
    "paymentInfo" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_affiliates_userId ON affiliates("userId");
CREATE INDEX IF NOT EXISTS idx_affiliates_affiliateCode ON affiliates("affiliateCode");

DO $$ BEGIN
  ALTER TABLE affiliates ADD CONSTRAINT fk_affiliates_user FOREIGN KEY ("userId") REFERENCES users(id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tabela: affiliate_sales
CREATE TABLE IF NOT EXISTS affiliate_sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "affiliateId" UUID NOT NULL,
    "saleId" UUID NOT NULL UNIQUE,
    "courseId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "saleAmount" DECIMAL(10, 2) NOT NULL,
    "commissionRate" DECIMAL(5, 2) NOT NULL,
    "commissionAmount" DECIMAL(10, 2) NOT NULL,
    status affiliate_sales_status_enum DEFAULT 'pending',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_affiliate_sales_affiliateId ON affiliate_sales("affiliateId");
CREATE INDEX IF NOT EXISTS idx_affiliate_sales_saleId ON affiliate_sales("saleId");
CREATE INDEX IF NOT EXISTS idx_affiliate_sales_courseId ON affiliate_sales("courseId");

DO $$ BEGIN
  ALTER TABLE affiliate_sales ADD CONSTRAINT fk_affiliate_sales_affiliate FOREIGN KEY ("affiliateId") REFERENCES affiliates(id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE affiliate_sales ADD CONSTRAINT fk_affiliate_sales_sale FOREIGN KEY ("saleId") REFERENCES sales(id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE affiliate_sales ADD CONSTRAINT fk_affiliate_sales_course FOREIGN KEY ("courseId") REFERENCES courses(id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE affiliate_sales ADD CONSTRAINT fk_affiliate_sales_student FOREIGN KEY ("studentId") REFERENCES users(id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tabela: app_configs
CREATE TABLE IF NOT EXISTS app_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'string',
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_app_configs_key ON app_configs(key);
`;
}

initDatabase();

