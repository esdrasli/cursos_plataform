import 'reflect-metadata';
import { AppDataSource } from '../config/database.js';

async function createTables() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await AppDataSource.initialize();
    console.log('✅ Conectado ao banco de dados');

    const queryRunner = AppDataSource.createQueryRunner();
    
    // SQL inline para criar todas as tabelas
    const sql = getSQL();
    
    // Processar SQL - dividir por comandos
    const lines = sql.split('\n');
    let currentCommand = '';
    let inDoBlock = false;
    const commands: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Ignorar linhas vazias e comentários
      if (!trimmed || trimmed.startsWith('--')) {
        continue;
      }
      
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
    
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        try {
          await queryRunner.query(command);
          successCount++;
          if ((i + 1) % 10 === 0) {
            console.log(`✅ ${i + 1}/${commands.length} comandos executados...`);
          }
        } catch (error: any) {
          // Ignorar erros de "já existe" ou "permissão negada" (são avisos normais)
          if (error.message.includes('already exists') || 
              error.message.includes('permission denied') ||
              error.message.includes('duplicate') ||
              error.message.includes('duplicate_object') ||
              error.message.includes('no privileges were granted')) {
            skippedCount++;
          } else {
            errorCount++;
            console.error(`❌ Erro no comando ${i + 1}:`, error.message.split('\n')[0]);
            // Continuar mesmo com erro
          }
        }
      }
    }
    
    console.log('\n📊 Resumo:');
    console.log(`   ✅ Sucesso: ${successCount}`);
    console.log(`   ⚠️  Ignorados (já existem): ${skippedCount}`);
    console.log(`   ❌ Erros: ${errorCount}`);
    
    // Verificar tabelas criadas
    try {
      const tables = await queryRunner.query(`
        SELECT table_name
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('users', 'courses', 'enrollments', 'sales', 'landing_pages', 'affiliates', 'affiliate_sales', 'app_configs', 'user_enrolled_courses')
        ORDER BY table_name
      `);
      
      console.log('\n📋 Tabelas encontradas no banco:');
      if (tables.length > 0) {
        tables.forEach((table: any) => {
          console.log(`   ✅ ${table.table_name}`);
        });
      } else {
        console.log('   ⚠️  Nenhuma tabela encontrada');
      }
    } catch (error) {
      console.log('   ⚠️  Não foi possível verificar tabelas');
    }
    
    console.log('\n✅ Processo concluído!');
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Erro ao criar tabelas:', error.message);
    process.exit(1);
  }
}

function getSQL(): string {
  return `
SET search_path TO public;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'users_role_enum') THEN
        CREATE TYPE users_role_enum AS ENUM('student', 'creator', 'admin');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'courses_level_enum') THEN
        CREATE TYPE courses_level_enum AS ENUM('Iniciante', 'Intermediário', 'Avançado');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'courses_status_enum') THEN
        CREATE TYPE courses_status_enum AS ENUM('draft', 'published');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sales_paymentmethod_enum') THEN
        CREATE TYPE sales_paymentmethod_enum AS ENUM('credit', 'pix', 'boleto');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sales_status_enum') THEN
        CREATE TYPE sales_status_enum AS ENUM('pending', 'completed', 'failed', 'refunded');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'landing_pages_status_enum') THEN
        CREATE TYPE landing_pages_status_enum AS ENUM('Publicada', 'Rascunho');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'affiliates_status_enum') THEN
        CREATE TYPE affiliates_status_enum AS ENUM('active', 'inactive', 'suspended');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'affiliate_sales_status_enum') THEN
        CREATE TYPE affiliate_sales_status_enum AS ENUM('pending', 'approved', 'paid', 'cancelled');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(500) DEFAULT 'https://i.pravatar.cc/150?img=1',
    role users_role_enum DEFAULT 'student',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

CREATE TABLE IF NOT EXISTS public.courses (
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

CREATE INDEX IF NOT EXISTS idx_courses_instructorId ON public.courses("instructorId");
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category);

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_courses_instructor'
    ) THEN
        ALTER TABLE public.courses ADD CONSTRAINT fk_courses_instructor 
        FOREIGN KEY ("instructorId") REFERENCES public.users(id);
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_enrolled_courses (
    "userId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    PRIMARY KEY ("userId", "courseId")
);

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_user_enrolled_courses_user'
    ) THEN
        ALTER TABLE public.user_enrolled_courses 
        ADD CONSTRAINT fk_user_enrolled_courses_user 
        FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_user_enrolled_courses_course'
    ) THEN
        ALTER TABLE public.user_enrolled_courses 
        ADD CONSTRAINT fk_user_enrolled_courses_course 
        FOREIGN KEY ("courseId") REFERENCES public.courses(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    progress INTEGER DEFAULT 0,
    "completedLessons" JSONB DEFAULT '[]',
    "enrolledAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "lastAccessedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_course UNIQUE ("userId", "courseId")
);

CREATE INDEX IF NOT EXISTS idx_enrollments_userId ON public.enrollments("userId");
CREATE INDEX IF NOT EXISTS idx_enrollments_courseId ON public.enrollments("courseId");

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_enrollments_user'
    ) THEN
        ALTER TABLE public.enrollments 
        ADD CONSTRAINT fk_enrollments_user 
        FOREIGN KEY ("userId") REFERENCES public.users(id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_enrollments_course'
    ) THEN
        ALTER TABLE public.enrollments 
        ADD CONSTRAINT fk_enrollments_course 
        FOREIGN KEY ("courseId") REFERENCES public.courses(id);
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.sales (
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

CREATE INDEX IF NOT EXISTS idx_sales_studentId ON public.sales("studentId");
CREATE INDEX IF NOT EXISTS idx_sales_instructorId ON public.sales("instructorId");
CREATE INDEX IF NOT EXISTS idx_sales_courseId ON public.sales("courseId");

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_sales_course'
    ) THEN
        ALTER TABLE public.sales 
        ADD CONSTRAINT fk_sales_course 
        FOREIGN KEY ("courseId") REFERENCES public.courses(id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_sales_student'
    ) THEN
        ALTER TABLE public.sales 
        ADD CONSTRAINT fk_sales_student 
        FOREIGN KEY ("studentId") REFERENCES public.users(id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_sales_instructor'
    ) THEN
        ALTER TABLE public.sales 
        ADD CONSTRAINT fk_sales_instructor 
        FOREIGN KEY ("instructorId") REFERENCES public.users(id);
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.landing_pages (
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

CREATE INDEX IF NOT EXISTS idx_landing_pages_courseId ON public.landing_pages("courseId");
CREATE INDEX IF NOT EXISTS idx_landing_pages_creatorId ON public.landing_pages("creatorId");

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_landing_pages_course'
    ) THEN
        ALTER TABLE public.landing_pages 
        ADD CONSTRAINT fk_landing_pages_course 
        FOREIGN KEY ("courseId") REFERENCES public.courses(id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_landing_pages_creator'
    ) THEN
        ALTER TABLE public.landing_pages 
        ADD CONSTRAINT fk_landing_pages_creator 
        FOREIGN KEY ("creatorId") REFERENCES public.users(id);
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.affiliates (
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

CREATE INDEX IF NOT EXISTS idx_affiliates_userId ON public.affiliates("userId");
CREATE INDEX IF NOT EXISTS idx_affiliates_affiliateCode ON public.affiliates("affiliateCode");

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_affiliates_user'
    ) THEN
        ALTER TABLE public.affiliates 
        ADD CONSTRAINT fk_affiliates_user 
        FOREIGN KEY ("userId") REFERENCES public.users(id);
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.affiliate_sales (
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

CREATE INDEX IF NOT EXISTS idx_affiliate_sales_affiliateId ON public.affiliate_sales("affiliateId");
CREATE INDEX IF NOT EXISTS idx_affiliate_sales_saleId ON public.affiliate_sales("saleId");
CREATE INDEX IF NOT EXISTS idx_affiliate_sales_courseId ON public.affiliate_sales("courseId");

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_affiliate_sales_affiliate'
    ) THEN
        ALTER TABLE public.affiliate_sales 
        ADD CONSTRAINT fk_affiliate_sales_affiliate 
        FOREIGN KEY ("affiliateId") REFERENCES public.affiliates(id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_affiliate_sales_sale'
    ) THEN
        ALTER TABLE public.affiliate_sales 
        ADD CONSTRAINT fk_affiliate_sales_sale 
        FOREIGN KEY ("saleId") REFERENCES public.sales(id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_affiliate_sales_course'
    ) THEN
        ALTER TABLE public.affiliate_sales 
        ADD CONSTRAINT fk_affiliate_sales_course 
        FOREIGN KEY ("courseId") REFERENCES public.courses(id);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_affiliate_sales_student'
    ) THEN
        ALTER TABLE public.affiliate_sales 
        ADD CONSTRAINT fk_affiliate_sales_student 
        FOREIGN KEY ("studentId") REFERENCES public.users(id);
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.app_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'string',
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_app_configs_key ON public.app_configs(key);
`;
}

createTables();

