import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import { creatorAPI } from '../../services/api';
import { LandingPage, Course } from '../../types';
import Loading from '../../components/Loading';
import Error from '../../components/Error';
import { getHeroClasses, getCTAClasses } from '../../utils/layoutUtils';

// Componente Hero com layout aplicado
const HeroSection: React.FC<{ 
  hero: any; 
  layout?: any; 
  course?: Course | null;
  coursePrice: number | null;
}> = ({ hero, layout, course, coursePrice }) => {
  const classes = getHeroClasses(layout);
  const ctaClasses = getCTAClasses(layout);
  
  const backgroundStyle: React.CSSProperties = {};
  if (layout?.heroBackground === 'image' && hero?.image) {
    backgroundStyle.backgroundImage = `url(${hero.image})`;
    backgroundStyle.backgroundSize = 'cover';
    backgroundStyle.backgroundPosition = 'center';
    backgroundStyle.backgroundBlendMode = 'overlay';
  } else if (layout?.colors) {
    if (layout.heroBackground === 'solid') {
      backgroundStyle.backgroundColor = layout.colors.primary;
    } else {
      backgroundStyle.background = `linear-gradient(to right, ${layout.colors.primary}, ${layout.colors.secondary})`;
    }
  } else if (hero?.image) {
    backgroundStyle.backgroundImage = `url(${hero.image})`;
    backgroundStyle.backgroundSize = 'cover';
    backgroundStyle.backgroundPosition = 'center';
    backgroundStyle.backgroundBlendMode = 'overlay';
  }

  const originalPrice = course?.originalPrice 
    ? (typeof course.originalPrice === 'number' ? course.originalPrice : parseFloat(course.originalPrice) || 0)
    : null;

  return (
    <section 
      className={classes.container}
      style={backgroundStyle}
    >
      <div className={classes.content}>
        <h1 className={classes.title}>
          {hero.title || 'Título da Landing Page'}
        </h1>
        <p className={classes.subtitle}>
          {hero.subtitle || 'Subtítulo da landing page'}
        </p>
        {course && coursePrice !== null && (
          <div className="mb-8">
            <p className="text-3xl font-bold text-primary-400 mb-2">
              {coursePrice ? `R$ ${coursePrice.toFixed(2)}` : 'Consulte o preço'}
            </p>
            {originalPrice && originalPrice > coursePrice && (
              <p className="text-lg text-gray-400 line-through">
                R$ {originalPrice.toFixed(2)}
              </p>
            )}
          </div>
        )}
        <Link
          to={course ? `/checkout/${course.id}` : '#'}
          className={ctaClasses}
        >
          {hero.cta || 'Comprar Agora'}
        </Link>
      </div>
    </section>
  );
};

const LandingPageViewPage: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const [landingPage, setLandingPage] = useState<LandingPage | null>(null);
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLandingPage = async () => {
      if (!pageId) {
        setError('ID da página não fornecido');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Buscar landing page
        const pageData = await creatorAPI.getLandingPage(pageId);
        console.log('Landing page carregada:', pageData); // Debug
        
        // Mapear dados do backend para o formato esperado
        const mappedPage: LandingPage = {
          id: pageData.id || pageData._id,
          title: pageData.title,
          courseId: pageData.courseId,
          courseTitle: pageData.courseTitle,
          hero: pageData.hero,
          status: pageData.status,
          sections: pageData.sections || [],
          layout: pageData.layout || undefined,
          createdAt: pageData.createdAt,
          lastUpdated: pageData.lastUpdated || pageData.updatedAt
        };
        
        setLandingPage(mappedPage);

        // Buscar informações do curso associado
        // O backend pode retornar o curso na relação, então verificar primeiro
        if (pageData.course) {
          // Se o curso já vem na resposta, usar ele
          const courseData = pageData.course;
          setCourse({
            id: courseData.id || courseData._id,
            title: courseData.title,
            description: courseData.description || '',
            thumbnail: courseData.thumbnail || '',
            price: courseData.price,
            originalPrice: courseData.originalPrice,
            instructor: courseData.instructor || '',
            instructorAvatar: courseData.instructorAvatar || '',
            rating: courseData.rating || 0,
            totalStudents: courseData.totalStudents || 0,
            duration: courseData.duration || '',
            level: courseData.level || 'Iniciante',
            category: courseData.category || '',
            modules: courseData.modules || [],
            features: courseData.features || []
          });
        } else if (mappedPage.courseId) {
          // Se não veio na relação, buscar separadamente
          try {
            const { coursesAPI } = await import('../../services/api');
            const courseData = await coursesAPI.getById(mappedPage.courseId);
            console.log('Curso carregado:', courseData); // Debug
            setCourse(courseData);
          } catch (courseError) {
            console.warn('Erro ao buscar curso:', courseError);
            // Não é crítico, continuar sem informações do curso
          }
        }
      } catch (err: any) {
        console.error('Erro ao carregar landing page:', err);
        setError(err.message || 'Erro ao carregar landing page');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLandingPage();
  }, [pageId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Loading message="Carregando página..." />
      </div>
    );
  }

  if (error || !landingPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Error message={error || 'Landing page não encontrada'} />
          <Link
            to="/creator/pages"
            className="inline-flex items-center space-x-2 mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar para Páginas</span>
          </Link>
        </div>
      </div>
    );
  }

  const hero = landingPage.hero || { title: '', subtitle: '', cta: '', image: '' };
  const coursePrice = course ? (typeof course.price === 'number' ? course.price : parseFloat(course.price) || 0) : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Barra de Controle (apenas para visualização) */}
      <div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <Link
            to="/creator/pages"
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </Link>
          <span className="text-gray-400">|</span>
          <span className="text-sm text-gray-300">
            Visualização: {landingPage.title}
          </span>
          <span className={`px-2 py-1 text-xs rounded ${
            landingPage.status === 'Publicada' 
              ? 'bg-green-600' 
              : 'bg-yellow-600'
          }`}>
            {landingPage.status}
          </span>
        </div>
        <Link
          to={`/creator/pages/edit/${pageId}`}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
        >
          <Edit className="w-4 h-4" />
          <span>Editar</span>
        </Link>
      </div>

      {/* Hero Section */}
      <HeroSection 
        hero={hero}
        layout={landingPage.layout}
        course={course}
        coursePrice={coursePrice}
      />

      {/* Seções de Conteúdo */}
      {landingPage.sections && landingPage.sections.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 py-16">
          {landingPage.sections.map((section: any, index: number) => (
            <div key={index} className="mb-16">
              {section.type === 'benefits' && (
                <section className="bg-gray-50 rounded-xl p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                    Benefícios do Curso
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {section.content?.split('•').filter((item: string) => item.trim()).map((benefit: string, idx: number) => (
                      <div key={idx} className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                          <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-gray-700 font-medium">{benefit.trim()}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              
              {section.type === 'features' && (
                <section className="py-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                    O que você vai aprender
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {section.content && typeof section.content === 'object' && section.content.map((feature: any, idx: number) => (
                      <div key={idx} className="flex items-start space-x-4 p-6 bg-white rounded-lg shadow-sm">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 mb-2">{feature.title || feature}</h3>
                          {feature.description && (
                            <p className="text-gray-600 text-sm">{feature.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {section.type === 'testimonials' && (
                <section className="bg-gray-50 rounded-xl p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                    O que nossos alunos dizem
                  </h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    {section.content && typeof section.content === 'object' && section.content.map((testimonial: any, idx: number) => (
                      <div key={idx} className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                            <span className="text-primary-600 font-bold">
                              {testimonial.name?.[0] || 'A'}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{testimonial.name || 'Aluno'}</p>
                            <p className="text-sm text-gray-500">{testimonial.rating || '5'} ⭐</p>
                          </div>
                        </div>
                        <p className="text-gray-700 italic">"{testimonial.text || testimonial}"</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {section.type === 'text' && (
                <section className="py-12">
                  <div className="prose max-w-none">
                    <p className="text-lg text-gray-700 leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </section>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Seção de CTA Final */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Pronto para começar?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Não perca esta oportunidade de transformar sua carreira
          </p>
          <Link
            to={course ? `/checkout/${course.id}` : '#'}
            className="inline-block px-8 py-4 bg-white text-primary-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105"
          >
            {hero.cta || 'Garantir Minha Vaga Agora'}
          </Link>
        </div>
      </section>

      {/* Informações do Curso (se disponível) */}
      {course && (
        <section className="bg-gray-50 py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <img
                  src={course.thumbnail || 'https://via.placeholder.com/600x400'}
                  alt={course.title}
                  className="w-full rounded-xl shadow-lg"
                />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h2>
                <p className="text-gray-700 mb-6">{course.description}</p>
                <div className="space-y-3 mb-6">
                  {course.duration && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{course.duration}</span>
                    </div>
                  )}
                  {course.level && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      <span>Nível: {course.level}</span>
                    </div>
                  )}
                  {course.totalStudents && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span>{course.totalStudents} alunos matriculados</span>
                    </div>
                  )}
                </div>
                <Link
                  to={`/checkout/${course.id}`}
                  className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  Comprar Curso
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default LandingPageViewPage;

