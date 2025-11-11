import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Code, 
  Palette, 
  TrendingUp, 
  Briefcase, 
  Camera, 
  Music, 
  BookOpen, 
  Languages,
  Database,
  Smartphone,
  Globe,
  BarChart3
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { coursesAPI } from '../services/api';

interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  color: string;
  courseCount: number;
}

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await coursesAPI.getAll({ limit: 1000 });
        const courses = response.courses || response || [];

        // Extrair categorias únicas dos cursos
        const categoryMap = new Map<string, { count: number; courses: any[] }>();
        
        courses.forEach((course: any) => {
          const categoryName = course.category || 'Outros';
          if (!categoryMap.has(categoryName)) {
            categoryMap.set(categoryName, { count: 0, courses: [] });
          }
          const categoryData = categoryMap.get(categoryName)!;
          categoryData.count++;
          categoryData.courses.push(course);
        });

        // Mapear categorias conhecidas para ícones e cores
        const categoryIcons: Record<string, { icon: React.ElementType; color: string; description: string }> = {
          'Desenvolvimento Web': { 
            icon: Code, 
            color: 'from-blue-500 to-blue-600',
            description: 'Aprenda a criar sites e aplicações web modernas'
          },
          'Programação': { 
            icon: Code, 
            color: 'from-purple-500 to-purple-600',
            description: 'Domine linguagens de programação e algoritmos'
          },
          'Design': { 
            icon: Palette, 
            color: 'from-pink-500 to-pink-600',
            description: 'Crie designs incríveis e interfaces atraentes'
          },
          'Marketing': { 
            icon: TrendingUp, 
            color: 'from-green-500 to-green-600',
            description: 'Estratégias de marketing digital e vendas'
          },
          'Negócios': { 
            icon: Briefcase, 
            color: 'from-indigo-500 to-indigo-600',
            description: 'Empreendedorismo e gestão de negócios'
          },
          'Fotografia': { 
            icon: Camera, 
            color: 'from-red-500 to-red-600',
            description: 'Técnicas de fotografia e edição de imagens'
          },
          'Música': { 
            icon: Music, 
            color: 'from-yellow-500 to-yellow-600',
            description: 'Produção musical e teoria'
          },
          'Idiomas': { 
            icon: Languages, 
            color: 'from-teal-500 to-teal-600',
            description: 'Aprenda novos idiomas e culturas'
          },
          'Backend': { 
            icon: Database, 
            color: 'from-orange-500 to-orange-600',
            description: 'Desenvolvimento de servidores e APIs'
          },
          'Mobile': { 
            icon: Smartphone, 
            color: 'from-cyan-500 to-cyan-600',
            description: 'Desenvolvimento de aplicativos móveis'
          },
          'Data Science': { 
            icon: BarChart3, 
            color: 'from-violet-500 to-violet-600',
            description: 'Análise de dados e machine learning'
          },
        };

        // Converter para array de categorias
        const categoriesList: Category[] = Array.from(categoryMap.entries()).map(([name, data]) => {
          const categoryInfo = categoryIcons[name] || {
            icon: BookOpen,
            color: 'from-gray-500 to-gray-600',
            description: 'Cursos diversos nesta categoria'
          };

          return {
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name,
            icon: categoryInfo.icon,
            description: categoryInfo.description,
            color: categoryInfo.color,
            courseCount: data.count
          };
        });

        // Ordenar por quantidade de cursos
        categoriesList.sort((a, b) => b.courseCount - a.courseCount);
        setCategories(categoriesList);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        // Categorias padrão caso não consiga buscar
        setCategories([
          {
            id: 'desenvolvimento-web',
            name: 'Desenvolvimento Web',
            icon: Code,
            description: 'Aprenda a criar sites e aplicações web modernas',
            color: 'from-blue-500 to-blue-600',
            courseCount: 0
          },
          {
            id: 'design',
            name: 'Design',
            icon: Palette,
            description: 'Crie designs incríveis e interfaces atraentes',
            color: 'from-pink-500 to-pink-600',
            courseCount: 0
          },
          {
            id: 'marketing',
            name: 'Marketing',
            icon: TrendingUp,
            description: 'Estratégias de marketing digital e vendas',
            color: 'from-green-500 to-green-600',
            courseCount: 0
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Explore Nossas Categorias
              </h1>
              <p className="text-xl text-primary-100 max-w-2xl mx-auto">
                Descubra cursos organizados por área de conhecimento e encontre o que você precisa para alcançar seus objetivos
              </p>
            </div>
          </div>
        </section>

        {/* Categorias Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg">Nenhuma categoria encontrada.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={`/cursos?category=${encodeURIComponent(category.name)}`}
                    className="block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
                  >
                    <div className={`bg-gradient-to-r ${category.color} p-6 text-white`}>
                      <category.icon className="w-12 h-12 mb-4" />
                      <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                      <p className="text-white/90 text-sm">{category.description}</p>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm">
                          {category.courseCount} {category.courseCount === 1 ? 'curso' : 'cursos'} disponíveis
                        </span>
                        <span className="text-primary-600 font-semibold group-hover:translate-x-1 transition-transform">
                          Explorar →
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Não encontrou o que procura?
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Explore todos os nossos cursos ou entre em contato para solicitar uma categoria específica
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/cursos"
                className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Ver Todos os Cursos
              </Link>
              <Link
                to="/login"
                className="px-8 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Criar Conta Grátis
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CategoriesPage;

