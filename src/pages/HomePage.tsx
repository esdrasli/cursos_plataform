import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Users, Award, Zap, TrendingUp, Shield } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CourseCard from '../components/CourseCard';
import { coursesAPI } from '../services/api';
import { Course } from '../types';

const HomePage: React.FC = () => {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await coursesAPI.getAll({ limit: 4 });
        // TypeORM retorna 'id', não '_id'
        const mappedCourses = response.courses.map((course: any) => ({
          id: course.id || course._id, // Suporta ambos os formatos
          title: course.title,
          description: course.description,
          thumbnail: course.thumbnail,
          price: course.price,
          originalPrice: course.originalPrice,
          instructor: course.instructor,
          instructorAvatar: course.instructorAvatar,
          rating: course.rating,
          totalStudents: course.totalStudents,
          duration: course.duration,
          level: course.level,
          category: course.category,
          modules: course.modules || [],
          features: course.features || []
        }));
        setFeaturedCourses(mappedCourses);
      } catch (error) {
        console.error('Erro ao carregar cursos:', error);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=1080&fit=crop')] opacity-10 bg-cover bg-center"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Transforme Sua Carreira com os Melhores Cursos
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-primary-100">
                Aprenda no seu ritmo com especialistas do mercado e alcance seus objetivos profissionais
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/cursos"
                  className="px-8 py-4 bg-white text-primary-700 rounded-lg font-bold text-lg hover:bg-primary-50 transition-all inline-flex items-center justify-center group"
                >
                  Explorar Cursos
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/10 transition-all inline-flex items-center justify-center"
                >
                  Começar Grátis
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden md:block"
            >
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=600&fit=crop"
                  alt="Estudantes"
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-3 rounded-full">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">50k+</p>
                      <p className="text-gray-600">Alunos Ativos</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Star, value: '4.8', label: 'Avaliação Média', color: 'yellow' },
              { icon: Users, value: '50k+', label: 'Alunos', color: 'blue' },
              { icon: Award, value: '200+', label: 'Cursos', color: 'purple' },
              { icon: TrendingUp, value: '95%', label: 'Taxa de Sucesso', color: 'green' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-${stat.color}-100 rounded-full mb-4`}>
                  <stat.icon className={`w-8 h-8 text-${stat.color}-600`} />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Cursos em Destaque
            </motion.h2>
            <p className="text-xl text-gray-600">
              Escolha entre os cursos mais procurados e transforme sua carreira
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {featuredCourses.map((course, index) => (
              <motion.div
                key={course.id || course._id || `course-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <CourseCard course={course} />
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/cursos"
              className="inline-flex items-center px-8 py-4 bg-primary-600 text-white rounded-lg font-bold text-lg hover:bg-primary-700 transition-all group"
            >
              Ver Todos os Cursos
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Por que Escolher a MindX?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Aprendizado Acelerado',
                description: 'Metodologia comprovada para você aprender mais rápido e com maior retenção'
              },
              {
                icon: Shield,
                title: 'Certificado Reconhecido',
                description: 'Certificados válidos e reconhecidos pelo mercado ao concluir seus cursos'
              },
              {
                icon: Users,
                title: 'Suporte Especializado',
                description: 'Tire suas dúvidas direto com instrutores e nossa comunidade ativa'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-8 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-6">
                  <feature.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para Começar sua Jornada?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Junte-se a milhares de alunos que já transformaram suas carreiras
          </p>
          <Link
            to="/cursos"
            className="inline-flex items-center px-8 py-4 bg-white text-primary-700 rounded-lg font-bold text-lg hover:bg-primary-50 transition-all group"
          >
            Começar Agora
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
