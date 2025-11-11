import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Loading from '../components/Loading';
import Error from '../components/Error';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Course } from '../types';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [myCourses, recs] = await Promise.all([
        dashboardAPI.getMyCourses(),
        dashboardAPI.getRecommendations()
      ]);

      // Mapear cursos matriculados
      const mappedCourses = myCourses.map((course: any) => ({
        id: course._id || course.id,
        title: course.title,
        thumbnail: course.thumbnail,
        instructor: course.instructor,
        progress: course.progress || 0,
        lastAccessedAt: course.lastAccessedAt,
        enrolledAt: course.enrolledAt
      }));

      // Mapear recomendações
      const mappedRecommendations = recs.map((course: any) => ({
        id: course._id,
        title: course.title,
        thumbnail: course.thumbnail,
        instructor: course.instructor,
        price: course.price,
        originalPrice: course.originalPrice,
        rating: course.rating,
        totalStudents: course.totalStudents,
        duration: course.duration,
        level: course.level,
        category: course.category,
        modules: course.modules || [],
        features: course.features || []
      }));

      setEnrolledCourses(mappedCourses);
      setRecommendations(mappedRecommendations);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dashboard');
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Loading message="Carregando dashboard..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Error message={error} onRetry={fetchData} />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Bem-vindo, {user?.name}!</h1>
          <p className="text-gray-600 mt-1">Vamos começar a aprender algo novo hoje?</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Meus Cursos</h2>
            {enrolledCourses.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <p className="text-gray-600 mb-4">Você ainda não está matriculado em nenhum curso.</p>
                <Link
                  to="/cursos"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  Explorar Cursos
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {enrolledCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow">
                      <img src={course.thumbnail} alt={course.title} className="w-full md:w-48 h-40 md:h-auto object-cover" />
                      <div className="p-5 flex flex-col justify-between flex-1">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                          <p className="text-sm text-gray-600 mb-3">Por {course.instructor}</p>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                            <div 
                              className="bg-primary-600 h-2.5 rounded-full transition-all" 
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-500 mb-4">{course.progress}% completo</p>
                        </div>
                        <Link
                          to={`/aprender/${course.id}`}
                          className="self-start px-6 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                        >
                          Continuar Aprendendo
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Recomendado para você</h3>
              {recommendations.length === 0 ? (
                <p className="text-gray-600 text-sm">Nenhuma recomendação no momento.</p>
              ) : (
                <>
                  <div className="space-y-4">
                    {recommendations.map(course => (
                      <Link to={`/curso/${course.id}`} key={course.id} className="flex items-start space-x-4 p-2 -m-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <img src={course.thumbnail} alt={course.title} className="w-20 h-14 object-cover rounded-md flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-800 text-sm line-clamp-2">{course.title}</p>
                          <p className="text-xs text-gray-500">{course.instructor}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link to="/cursos" className="mt-4 text-sm font-medium text-primary-600 hover:underline block text-center">
                    Ver mais recomendações
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardPage;
