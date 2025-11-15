import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '../entities/User.js';
import { Course } from '../entities/Course.js';
import { Enrollment } from '../entities/Enrollment.js';
import { Sale } from '../entities/Sale.js';
import { LandingPage } from '../entities/LandingPage.js';
import { Affiliate } from '../entities/Affiliate.js';
import { AffiliateSale } from '../entities/AffiliateSale.js';
import { AppConfig } from '../entities/AppConfig.js';
import { Branding } from '../entities/Branding.js';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'cursos_plataform',
  synchronize: process.env.NODE_ENV !== 'production', // Criar tabelas automaticamente em desenvolvimento
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Course, Enrollment, Sale, LandingPage, Affiliate, AffiliateSale, AppConfig, Branding],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
  extra: {
    // Configurações para Docker
    connectTimeoutMS: 10000,
    max: 10,
  },
  // Configurar schema padrão (para produção, usar 'cursos' se necessário)
  schema: process.env.DB_SCHEMA || (process.env.NODE_ENV === 'production' && process.env.DB_SCHEMA_PROD) || undefined,
});

// Se DB_SCHEMA estiver configurado, definir search_path após conexão
if (process.env.DB_SCHEMA || (process.env.NODE_ENV === 'production' && process.env.DB_SCHEMA_PROD)) {
  const schema = process.env.DB_SCHEMA || process.env.DB_SCHEMA_PROD || 'cursos';
  
  // Configurar search_path após conexão (para cada conexão no pool)
  AppDataSource.afterConnect = async (connection) => {
    try {
      await connection.query(`SET search_path TO ${schema}, public;`);
    } catch (error: any) {
      console.error(`⚠️  Erro ao configurar search_path: ${error.message}`);
    }
  };
}

