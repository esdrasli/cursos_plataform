import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Course from './models/Course.js';
import Sale from './models/Sale.js';
import Enrollment from './models/Enrollment.js';
import LandingPage from './models/LandingPage.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cursos_plataform';

async function seed() {
  try {
    console.log('🌱 Conectando ao MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // Limpar dados existentes
    console.log('🧹 Limpando dados existentes...');
    await User.deleteMany({});
    await Course.deleteMany({});
    await Sale.deleteMany({});
    await Enrollment.deleteMany({});
    await LandingPage.deleteMany({});

    // Criar usuários
    console.log('👤 Criando usuários...');
    const creator1 = await User.create({
      name: 'Lucas Silva',
      email: 'lucas@creator.com',
      password: '123456',
      role: 'creator',
      avatar: 'https://i.pravatar.cc/150?img=12'
    });

    const creator2 = await User.create({
      name: 'Marina Costa',
      email: 'marina@creator.com',
      password: '123456',
      role: 'creator',
      avatar: 'https://i.pravatar.cc/150?img=5'
    });

    const student1 = await User.create({
      name: 'Carlos Pereira',
      email: 'carlos@student.com',
      password: '123456',
      role: 'student',
      avatar: 'https://i.pravatar.cc/150?img=3'
    });

    const student2 = await User.create({
      name: 'Juliana Martins',
      email: 'juliana@student.com',
      password: '123456',
      role: 'student',
      avatar: 'https://i.pravatar.cc/150?img=4'
    });

    // Criar cursos
    console.log('📚 Criando cursos...');
    const course1 = await Course.create({
      title: 'React do Zero ao Avançado',
      description: 'Aprenda React.js do básico ao avançado, construindo projetos reais e dominando hooks, context API, e muito mais.',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop',
      price: 297.00,
      originalPrice: 597.00,
      instructor: 'Lucas Silva',
      instructorId: creator1._id,
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

    const course2 = await Course.create({
      title: 'Node.js e APIs RESTful',
      description: 'Construa APIs profissionais com Node.js, Express, MongoDB e aprenda boas práticas de desenvolvimento backend.',
      thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=450&fit=crop',
      price: 347.00,
      originalPrice: 697.00,
      instructor: 'Marina Costa',
      instructorId: creator2._id,
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

    // Criar matrículas
    console.log('📝 Criando matrículas...');
    await Enrollment.create({
      userId: student1._id,
      courseId: course1._id,
      progress: 45,
      completedLessons: [
        { moduleId: 'm1', lessonId: 'l1', completedAt: new Date() }
      ]
    });

    await Enrollment.create({
      userId: student2._id,
      courseId: course2._id,
      progress: 20,
      completedLessons: []
    });

    // Criar vendas
    console.log('💰 Criando vendas...');
    await Sale.create({
      courseId: course1._id,
      courseTitle: course1.title,
      studentId: student1._id,
      studentName: student1.name,
      instructorId: creator1._id,
      amount: course1.price,
      paymentMethod: 'credit',
      status: 'completed',
      transactionId: `TXN-${Date.now()}-1`
    });

    await Sale.create({
      courseId: course2._id,
      courseTitle: course2.title,
      studentId: student2._id,
      studentName: student2.name,
      instructorId: creator2._id,
      amount: course2.price,
      paymentMethod: 'pix',
      status: 'completed',
      transactionId: `TXN-${Date.now()}-2`
    });

    // Criar landing pages
    console.log('📄 Criando landing pages...');
    await LandingPage.create({
      title: 'Página de Vendas - React Avançado',
      courseId: course1._id,
      courseTitle: course1.title,
      creatorId: creator1._id,
      hero: {
        title: 'Torne-se um Mestre em React.js',
        subtitle: 'Do zero ao deploy, o curso mais completo do mercado para você dominar a biblioteca mais popular do mundo.',
        cta: 'Garantir minha vaga agora',
        image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop'
      },
      status: 'Publicada'
    });

    await LandingPage.create({
      title: 'Página de Vendas - Node.js',
      courseId: course2._id,
      courseTitle: course2.title,
      creatorId: creator2._id,
      hero: {
        title: 'Construa APIs Poderosas com Node.js',
        subtitle: 'Aprenda a criar, testar e publicar APIs RESTful profissionais com as melhores práticas do mercado.',
        cta: 'Quero me inscrever',
        image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=450&fit=crop'
      },
      status: 'Rascunho'
    });

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

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao fazer seed:', error);
    process.exit(1);
  }
}

seed();

