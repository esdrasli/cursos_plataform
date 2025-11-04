import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Users, Clock, Award, CheckCircle, Play, Calendar } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { mockCourses } from '../data/mockData';

const CourseDetailPage: React.FC = () => {
  const { id } = useParams();
  const course = mockCourses.find(c => c.id === id);

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Curso não encontrado</h1>
          <Link to="/cursos" className="text-primary-600 hover:underline mt-4 inline-block">
            Voltar para cursos
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <section className="bg-gray-900 text-white py-12">
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
                <h1 className="text-3xl md:text-5xl font-bold mb-4">
                  {course.title}
                </h1>
                <p className="text-xl text-gray-300 mb-6">
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
                    {course.originalPrice && (
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-gray-400 line-through text-lg">
                          R$ {course.originalPrice.toFixed(2)}
                        </span>
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-bold">
                          {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}% OFF
                        </span>
                      </div>
                    )}
                    <p className="text-4xl font-bold text-gray-900">
                      R$ {course.price.toFixed(2)}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">ou 12x de R$ {(course.price / 12).toFixed(2)}</p>
                  </div>

                  <Link
                    to={`/checkout/${course.id}`}
                    className="block w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-center rounded-lg font-bold text-lg hover:shadow-lg transition-all mb-3"
                  >
                    Comprar Agora
                  </Link>

                  <button className="block w-full px-6 py-3 bg-gray-100 text-gray-900 text-center rounded-lg font-medium hover:bg-gray-200 transition-colors">
                    Adicionar ao Carrinho
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
