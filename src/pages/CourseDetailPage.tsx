import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Users, Clock, Award, CheckCircle, Play, ShoppingCart, Check } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Loading from '../components/Loading';
import Error from '../components/Error';
import { coursesAPI } from '../services/api';
import { Course } from '../types';
import { useCart } from '../contexts/CartContext';
import { useCourseCustomization } from '../hooks/useCourseCustomization';

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const affiliateCode = searchParams.get('ref'); // Capturar código de afiliado da URL
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart, isInCart } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);

  // Converter preços para números quando o curso for carregado
  const coursePrice = course ? (typeof course.price === 'number' ? course.price : parseFloat(course.price) || 0) : 0;
  const originalPrice = course?.originalPrice 
    ? (typeof course.originalPrice === 'number' ? course.originalPrice : parseFloat(course.originalPrice) || 0)
    : null;

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id || id === 'undefined') {
        console.error('CourseDetailPage: ID inválido', id);
        setError('ID do curso inválido');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        console.log('Buscando curso com ID:', id); // Debug
        const data = await coursesAPI.getById(id);
        
        // Mapear os dados do backend para o formato do frontend
        // TypeORM retorna 'id', não '_id'
        const mappedCourse: Course = {
          id: data.id || data._id, // Suporta ambos os formatos
          title: data.title,
          description: data.description,
          thumbnail: data.thumbnail,
          price: data.price,
          originalPrice: data.originalPrice,
          instructor: data.instructor,
          instructorAvatar: data.instructorAvatar,
          rating: data.rating,
          totalStudents: data.totalStudents,
          duration: data.duration,
          level: data.level,
          category: data.category,
          modules: data.modules || [],
          features: data.features || [],
          customization: data.customization,
          sections: data.sections
        };
        
        console.log('Curso mapeado:', { id: mappedCourse.id, title: mappedCourse.title }); // Debug
        
        setCourse(mappedCourse);
        setError('');
      } catch (err: any) {
        setError('Erro ao carregar curso');
        console.error('Erro ao buscar curso:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  // Sempre chamar o hook ANTES de qualquer return condicional
  // Usar undefined se course não existir ainda
  const customization = useCourseCustomization(course?.customization || undefined);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20">
          <Loading message="Carregando curso..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20">
          <Error 
            message={error || 'Curso não encontrado'} 
            onRetry={() => window.location.reload()}
          />
          <div className="text-center mt-4">
            <Link to="/cursos" className="text-primary-600 hover:underline">
              Voltar para cursos
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }


  // Layout padrão (fallback) ou seções personalizadas
  return (
    <div 
      className="min-h-screen"
      style={{
        ...customization.getBackgroundStyle(),
        backgroundColor: course?.customization?.background?.type !== 'image' && course?.customization?.background?.type !== 'gradient'
          ? (course?.customization?.colors?.background || '#F9FAFB')
          : undefined,
      }}
    >
      <Header />

      <section 
            className="text-white py-12"
            style={{
              backgroundColor: course?.customization?.colors?.header || '#111827',
              color: course?.customization?.colors?.headerText || '#FFFFFF',
            }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="mb-4">
                      <span className="px-3 py-1 bg-primary-600 rounded-full text-sm font-medium">
                        {course.category}
                      </span>
                    </div>
                    <h1 
                      className="text-3xl md:text-5xl font-bold mb-4"
                      style={customization.getHeadingStyle()}
                    >
                      {course.title}
                    </h1>
                    <p 
                      className="text-xl mb-6"
                      style={{ 
                        color: course?.customization?.colors?.textSecondary || '#D1D5DB',
                        ...customization.getTextStyle()
                      }}
                    >
                      {course.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-6 mb-6">
                      <div className="flex items-center space-x-2">
                        <img
                          src={course.instructorAvatar}
                          alt={course.instructor}
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <p className="text-sm text-gray-400">Instrutor</p>
                          <p className="font-semibold">{course.instructor}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold">{course.rating}</span>
                        <span className="text-gray-400">({course.totalStudents.toLocaleString('pt-BR')} alunos)</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <span>{course.duration} de conteúdo</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Award className="w-5 h-5 text-gray-400" />
                        <span>{course.level}</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="lg:col-span-1">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-xl overflow-hidden shadow-xl sticky top-20"
                  >
                    <div className="relative">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-48 object-cover"
                      />
                      <button className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors group">
                        <div className="bg-white rounded-full p-4 group-hover:scale-110 transition-transform">
                          <Play className="w-8 h-8 text-primary-600 fill-primary-600" />
                        </div>
                      </button>
                    </div>

                    <div className="p-6">
                      <div className="mb-6">
                        {originalPrice && originalPrice > coursePrice && (
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-gray-400 line-through text-lg">
                              R$ {originalPrice.toFixed(2)}
                            </span>
                            <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-bold">
                              {Math.round(((originalPrice - coursePrice) / originalPrice) * 100)}% OFF
                            </span>
                          </div>
                        )}
                        <p className="text-4xl font-bold text-gray-900">
                          R$ {coursePrice.toFixed(2)}
                        </p>
                        <p className="text-gray-600 text-sm mt-1">ou 12x de R$ {(coursePrice / 12).toFixed(2)}</p>
                      </div>

                      <Link
                        to={`/checkout/${course.id}${affiliateCode ? `?ref=${affiliateCode}` : ''}`}
                        className={`block w-full px-6 py-4 text-white text-center font-bold text-lg hover:shadow-lg transition-all mb-3 ${customization.getButtonClassName()}`}
                        style={customization.getButtonStyle()}
                      >
                        Comprar Agora
                      </Link>

                      <button
                        onClick={() => {
                          if (course) {
                            addToCart(course);
                            setAddedToCart(true);
                            setTimeout(() => setAddedToCart(false), 2000);
                          }
                        }}
                        disabled={isInCart(course.id) || addedToCart}
                        className={`block w-full px-6 py-3 text-center font-medium transition-colors flex items-center justify-center space-x-2 ${customization.getButtonClassName()} ${
                          isInCart(course.id) || addedToCart
                            ? 'bg-green-100 text-green-700 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        {addedToCart ? (
                          <>
                            <Check className="w-5 h-5" />
                            <span>Adicionado ao Carrinho!</span>
                          </>
                        ) : isInCart(course.id) ? (
                          <>
                            <Check className="w-5 h-5" />
                            <span>Já está no Carrinho</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-5 h-5" />
                            <span>Adicionar ao Carrinho</span>
                          </>
                        )}
                      </button>

                      <div className="mt-6 pt-6 border-t space-y-3">
                        <p className="font-semibold text-gray-900 mb-3">Este curso inclui:</p>
                        {course.features.map((feature, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </section>

          <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">O que você vai aprender</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    'Fundamentos sólidos e boas práticas',
                    'Projetos práticos do mundo real',
                    'Técnicas avançadas de desenvolvimento',
                    'Deploy e publicação de projetos',
                    'Otimização e performance',
                    'Testes e qualidade de código'
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Conteúdo do Curso</h2>
                <div className="space-y-4">
                  {course.modules.map((module, index) => (
                    <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="bg-primary-100 text-primary-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </span>
                          <div>
                            <h3 className="font-semibold text-gray-900">{module.title}</h3>
                            <p className="text-sm text-gray-600">
                              {module.lessons.length} aulas · {module.duration}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="divide-y">
                        {module.lessons.map((lesson) => (
                          <div key={lesson.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                            <div className="flex items-center space-x-3">
                              <Play className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">{lesson.title}</span>
                            </div>
                            <span className="text-sm text-gray-500">{lesson.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {course.modules.length === 0 && (
                    <p className="text-gray-600">Conteúdo será adicionado em breve.</p>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Sobre o Instrutor</h2>
                <div className="flex items-start space-x-4 bg-gray-50 p-6 rounded-lg">
                  <img
                    src={course.instructorAvatar}
                    alt={course.instructor}
                    className="w-20 h-20 rounded-full"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{course.instructor}</h3>
                    <p className="text-gray-600 mb-4">
                      Desenvolvedor Full Stack com mais de 10 anos de experiência em projetos para empresas de tecnologia.
                      Apaixonado por ensinar e ajudar pessoas a alcançarem seus objetivos profissionais.
                    </p>
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4" />
                        <span>4.9 Avaliação</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>15.234 Alunos</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Play className="w-4 h-4" />
                        <span>12 Cursos</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CourseDetailPage;
