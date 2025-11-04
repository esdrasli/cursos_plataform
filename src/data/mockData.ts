import { Course, User, Sale, CreatorStudent } from '../types';

export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'React do Zero ao Avançado',
    description: 'Aprenda React.js do básico ao avançado, construindo projetos reais e dominando hooks, context API, e muito mais.',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop',
    price: 297.00,
    originalPrice: 597.00,
    instructor: 'Lucas Silva',
    instructorAvatar: 'https://i.pravatar.cc/150?img=12',
    rating: 4.9,
    totalStudents: 8547,
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
    ]
  },
  {
    id: '2',
    title: 'Node.js e APIs RESTful',
    description: 'Construa APIs profissionais com Node.js, Express, MongoDB e aprenda boas práticas de desenvolvimento backend.',
    thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=450&fit=crop',
    price: 347.00,
    originalPrice: 697.00,
    instructor: 'Marina Costa',
    instructorAvatar: 'https://i.pravatar.cc/150?img=5',
    rating: 4.8,
    totalStudents: 6234,
    duration: '38h',
    level: 'Intermediário',
    category: 'Backend',
    features: [
      'Acesso vitalício',
      'Certificado de conclusão',
      'Projetos completos',
      'Deploy em produção'
    ],
    modules: []
  },
  {
    id: '3',
    title: 'TypeScript na Prática',
    description: 'Domine TypeScript e leve suas habilidades em JavaScript para o próximo nível com tipagem estática.',
    thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=450&fit=crop',
    price: 197.00,
    originalPrice: 397.00,
    instructor: 'Pedro Santos',
    instructorAvatar: 'https://i.pravatar.cc/150?img=8',
    rating: 4.7,
    totalStudents: 4521,
    duration: '28h',
    level: 'Intermediário',
    category: 'Programação',
    features: [
      'Acesso vitalício',
      'Certificado de conclusão',
      'Exercícios práticos'
    ],
    modules: []
  },
  {
    id: '4',
    title: 'UI/UX Design Completo',
    description: 'Aprenda design de interfaces do zero, dominando Figma, princípios de UX e criando projetos incríveis.',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop',
    price: 397.00,
    originalPrice: 797.00,
    instructor: 'Ana Paula',
    instructorAvatar: 'https://i.pravatar.cc/150?img=1',
    rating: 5.0,
    totalStudents: 3847,
    duration: '45h',
    level: 'Iniciante',
    category: 'Design',
    features: [
      'Acesso vitalício',
      'Certificado de conclusão',
      'Portfolio completo',
      'Mentoria exclusiva'
    ],
    modules: []
  }
];

export const mockSales: Sale[] = [
  { id: 's1', courseTitle: 'React do Zero ao Avançado', studentName: 'Carlos Pereira', date: '2025-07-20', amount: 297.00 },
  { id: 's2', courseTitle: 'Node.js e APIs RESTful', studentName: 'Juliana Martins', date: '2025-07-20', amount: 347.00 },
  { id: 's3', courseTitle: 'React do Zero ao Avançado', studentName: 'Fernanda Lima', date: '2025-07-19', amount: 297.00 },
  { id: 's4', courseTitle: 'UI/UX Design Completo', studentName: 'Ricardo Alves', date: '2025-07-19', amount: 397.00 },
  { id: 's5', courseTitle: 'TypeScript na Prática', studentName: 'Beatriz Souza', date: '2025-07-18', amount: 197.00 },
];

export const mockCreatorStudents: CreatorStudent[] = [
  { id: 'cs1', name: 'Carlos Pereira', email: 'carlos.p@example.com', avatar: 'https://i.pravatar.cc/150?img=3', enrolledDate: '2025-07-20', totalSpent: 297.00 },
  { id: 'cs2', name: 'Juliana Martins', email: 'juliana.m@example.com', avatar: 'https://i.pravatar.cc/150?img=4', enrolledDate: '2025-07-20', totalSpent: 347.00 },
  { id: 'cs3', name: 'Fernanda Lima', email: 'fernanda.l@example.com', avatar: 'https://i.pravatar.cc/150?img=6', enrolledDate: '2025-07-19', totalSpent: 297.00 },
  { id: 'cs4', name: 'Ricardo Alves', email: 'ricardo.a@example.com', avatar: 'https://i.pravatar.cc/150?img=7', enrolledDate: '2025-07-19', totalSpent: 397.00 },
  { id: 'cs5', name: 'Beatriz Souza', email: 'beatriz.s@example.com', avatar: 'https://i.pravatar.cc/150?img=9', enrolledDate: '2025-07-18', totalSpent: 197.00 },
  { id: 'cs6', name: 'Marcos Andrade', email: 'marcos.a@example.com', avatar: 'https://i.pravatar.cc/150?img=10', enrolledDate: '2025-07-17', totalSpent: 644.00 },
];
