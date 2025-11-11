import 'reflect-metadata';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database.js';
import { User } from './entities/User.js';
import { Course } from './entities/Course.js';
import { Sale } from './entities/Sale.js';
import { Enrollment } from './entities/Enrollment.js';
import { LandingPage } from './entities/LandingPage.js';
import { AppConfig } from './entities/AppConfig.js';

dotenv.config();

async function seed(): Promise<void> {
  try {
    console.log('🌱 Conectando ao PostgreSQL...');
    
    // Aguardar conexão com retry
    let retries = 0;
    const maxRetries = 10;
    while (retries < maxRetries) {
      try {
        if (!AppDataSource.isInitialized) {
          await AppDataSource.initialize();
        }
        console.log('✅ Conectado ao PostgreSQL');
        break;
      } catch (error: any) {
        retries++;
        if (retries >= maxRetries) {
          throw error;
        }
        console.log(`⏳ Tentativa ${retries}/${maxRetries}... Aguardando PostgreSQL...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Limpar dados existentes
    console.log('🧹 Limpando dados existentes...');
    const userRepository = AppDataSource.getRepository(User);
    const courseRepository = AppDataSource.getRepository(Course);
    const saleRepository = AppDataSource.getRepository(Sale);
    const enrollmentRepository = AppDataSource.getRepository(Enrollment);
    const landingPageRepository = AppDataSource.getRepository(LandingPage);

    await landingPageRepository.delete({});
    await enrollmentRepository.delete({});
    await saleRepository.delete({});
    await courseRepository.delete({});
    await userRepository.delete({});

    // Criar usuários
    console.log('👤 Criando usuários...');
    const creator1 = userRepository.create({
      name: 'Lucas Silva',
      email: 'lucas@creator.com',
      password: '123456',
      role: 'creator',
      avatar: 'https://i.pravatar.cc/150?img=12'
    });
    await userRepository.save(creator1);

    const creator2 = userRepository.create({
      name: 'Marina Costa',
      email: 'marina@creator.com',
      password: '123456',
      role: 'creator',
      avatar: 'https://i.pravatar.cc/150?img=5'
    });
    await userRepository.save(creator2);

    const student1 = userRepository.create({
      name: 'Carlos Pereira',
      email: 'carlos@student.com',
      password: '123456',
      role: 'student',
      avatar: 'https://i.pravatar.cc/150?img=3'
    });
    await userRepository.save(student1);

    const student2 = userRepository.create({
      name: 'Juliana Martins',
      email: 'juliana@student.com',
      password: '123456',
      role: 'student',
      avatar: 'https://i.pravatar.cc/150?img=4'
    });
    await userRepository.save(student2);

    // Criar cursos
    console.log('📚 Criando cursos...');
    const course1 = courseRepository.create({
      title: 'React do Zero ao Avançado',
      description: 'Aprenda React.js do básico ao avançado, construindo projetos reais e dominando hooks, context API, e muito mais.',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop',
      price: 297.00,
      originalPrice: 597.00,
      instructor: 'Lucas Silva',
      instructorId: creator1.id,
      instructorAvatar: creator1.avatar,
      rating: 4.9,
      totalStudents: 2,
      duration: '42h',
      level: 'Intermediário',
      category: 'Desenvolvimento Web',
      features: [
        'Acesso vitalício',
        'Certificado de conclusão',
        'Suporte direto com instrutor',
        'Projetos práticos',
        'Atualizações gratuitas'
      ],
      modules: [
        {
          id: 'm1',
          title: 'Introdução ao React',
          duration: '3h 20min',
          lessons: [
            {
              id: 'l1',
              title: 'O que é React e por que usar?',
              duration: '15:30',
              videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              completed: false,
              locked: false
            },
            {
              id: 'l2',
              title: 'Configurando o ambiente',
              duration: '22:15',
              videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              completed: false,
              locked: false
            }
          ]
        },
        {
          id: 'm2',
          title: 'Componentes e Props',
          duration: '5h 15min',
          lessons: [
            {
              id: 'l3',
              title: 'Criando seu primeiro componente',
              duration: '18:45',
              videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              completed: false,
              locked: true
            }
          ]
        }
      ],
      status: 'published'
    });
    await courseRepository.save(course1);

    const course2 = courseRepository.create({
      title: 'Node.js e APIs RESTful',
      description: 'Construa APIs profissionais com Node.js, Express, MongoDB e aprenda boas práticas de desenvolvimento backend.',
      thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=450&fit=crop',
      price: 347.00,
      originalPrice: 697.00,
      instructor: 'Marina Costa',
      instructorId: creator2.id,
      instructorAvatar: creator2.avatar,
      rating: 4.8,
      totalStudents: 1,
      duration: '38h',
      level: 'Intermediário',
      category: 'Backend',
      features: [
        'Acesso vitalício',
        'Certificado de conclusão',
        'Projetos completos',
        'Deploy em produção'
      ],
      modules: [],
      status: 'published'
    });
    await courseRepository.save(course2);

    // Criar matrículas
    console.log('📝 Criando matrículas...');
    const enrollment1 = enrollmentRepository.create({
      userId: student1.id,
      courseId: course1.id,
      progress: 45,
      completedLessons: [
        { moduleId: 'm1', lessonId: 'l1', completedAt: new Date() }
      ]
    });
    await enrollmentRepository.save(enrollment1);

    const enrollment2 = enrollmentRepository.create({
      userId: student2.id,
      courseId: course2.id,
      progress: 20,
      completedLessons: []
    });
    await enrollmentRepository.save(enrollment2);

    // Criar vendas
    console.log('💰 Criando vendas...');
    const sale1 = saleRepository.create({
      courseId: course1.id,
      courseTitle: course1.title,
      studentId: student1.id,
      studentName: student1.name,
      instructorId: creator1.id,
      amount: course1.price,
      paymentMethod: 'credit',
      status: 'completed',
      transactionId: `TXN-${Date.now()}-1`
    });
    await saleRepository.save(sale1);

    const sale2 = saleRepository.create({
      courseId: course2.id,
      courseTitle: course2.title,
      studentId: student2.id,
      studentName: student2.name,
      instructorId: creator2.id,
      amount: course2.price,
      paymentMethod: 'pix',
      status: 'completed',
      transactionId: `TXN-${Date.now()}-2`
    });
    await saleRepository.save(sale2);

    // Criar landing pages
    console.log('📄 Criando landing pages...');
    const landingPage1 = landingPageRepository.create({
      title: 'Página de Vendas - React Avançado',
      courseId: course1.id,
      courseTitle: course1.title,
      creatorId: creator1.id,
      hero: {
        title: 'Torne-se um Mestre em React.js',
        subtitle: 'Do zero ao deploy, o curso mais completo do mercado para você dominar a biblioteca mais popular do mundo.',
        cta: 'Garantir minha vaga agora',
        image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop'
      },
      status: 'Publicada'
    });
    await landingPageRepository.save(landingPage1);

    const landingPage2 = landingPageRepository.create({
      title: 'Página de Vendas - Node.js',
      courseId: course2.id,
      courseTitle: course2.title,
      creatorId: creator2.id,
      hero: {
        title: 'Construa APIs Poderosas com Node.js',
        subtitle: 'Aprenda a criar, testar e publicar APIs RESTful profissionais com as melhores práticas do mercado.',
        cta: 'Quero me inscrever',
        image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=450&fit=crop'
      },
      status: 'Rascunho'
    });
    await landingPageRepository.save(landingPage2);

    // Criar configurações padrão
    console.log('⚙️ Criando configurações padrão...');
    const configRepository = AppDataSource.getRepository(AppConfig);
    
    // Limpar configurações existentes
    await configRepository.clear();

    // Configurações de IA
    const aiConfigs = [
      {
        key: 'colorPalettes',
        value: JSON.stringify({
          primary: {
            primary: '#4F46E5',
            secondary: '#7C3AED',
            accent: '#EC4899',
            background: '#FFFFFF',
            text: '#1F2937',
          },
          bold: {
            primary: '#DC2626',
            secondary: '#EA580C',
            accent: '#F59E0B',
            background: '#FFFFFF',
            text: '#111827',
          },
          elegant: {
            primary: '#1F2937',
            secondary: '#4B5563',
            accent: '#6B7280',
            background: '#F9FAFB',
            text: '#111827',
          },
          vibrant: {
            primary: '#10B981',
            secondary: '#3B82F6',
            accent: '#8B5CF6',
            background: '#FFFFFF',
            text: '#1F2937',
          },
        }),
        type: 'json' as const,
        description: 'Paletas de cores para layouts de landing pages',
        category: 'ai'
      },
      {
        key: 'defaultHeroImage',
        value: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=450&fit=crop',
        type: 'string' as const,
        description: 'Imagem padrão para hero sections',
        category: 'ai'
      },
      {
        key: 'defaultBenefits',
        value: 'Acesso vitalício • Certificado reconhecido • Suporte exclusivo • Atualizações gratuitas • Projetos práticos',
        type: 'string' as const,
        description: 'Benefícios padrão para cursos',
        category: 'ai'
      }
    ];

    for (const configData of aiConfigs) {
      const config = configRepository.create(configData);
      await configRepository.save(config);
    }

    console.log('✅ Seed concluído com sucesso!');
    console.log('\n📋 Credenciais de acesso:');
    console.log('Criador 1:');
    console.log('  Email: lucas@creator.com');
    console.log('  Senha: 123456');
    console.log('\nCriador 2:');
    console.log('  Email: marina@creator.com');
    console.log('  Senha: 123456');
    console.log('\nAluno 1:');
    console.log('  Email: carlos@student.com');
    console.log('  Senha: 123456');
    console.log('\nAluno 2:');
    console.log('  Email: juliana@student.com');
    console.log('  Senha: 123456');

    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Erro ao fazer seed:', error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    // Não fazer exit em caso de erro (para não quebrar o container)
    throw error;
  }
}

seed();
