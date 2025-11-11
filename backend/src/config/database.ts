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

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'cursos_plataform',
  synchronize: false, // Desabilitado - tabelas criadas manualmente via SQL
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Course, Enrollment, Sale, LandingPage, Affiliate, AffiliateSale, AppConfig],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
  extra: {
    // Configurações para Docker
    connectTimeoutMS: 10000,
    max: 10,
  },
});

