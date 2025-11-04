import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Bell, User, BookOpen } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { mockCourses } from '../data/mockData';

const DashboardPage: React.FC = () => {
  const user = {
    name: 'Ana Paula',
    avatar: 'https://i.pravatar.cc/150?img=1'
  };
  const enrolledCourses = mockCourses.slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Bem-vinda, {user.name}!</h1>
          <p className="text-gray-600 mt-1">Vamos começar a aprender algo novo hoje?</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Meus Cursos</h2>
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
                          <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">45% completo</p>
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
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Recomendado para você</h3>
              <div className="space-y-4">
                {mockCourses.slice(2, 4).map(course => (
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
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardPage;
