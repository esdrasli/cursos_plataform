import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CourseCard from '../components/CourseCard';
import Loading from '../components/Loading';
import Error from '../components/Error';
import Pagination from '../components/Pagination';
import { coursesAPI } from '../services/api';
import { Course } from '../types';

const CoursesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  const categories = ['Todos', 'Desenvolvimento Web', 'Backend', 'Programação', 'Design'];

  const fetchCourses = async (page: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      const params: any = {
        page,
        limit: 12
      };
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory !== 'Todos') params.category = selectedCategory;
      
      const response = await coursesAPI.getAll(params);
      
      // Mapear os dados do backend para o formato do frontend
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
      
      console.log('Cursos mapeados:', mappedCourses.map(c => ({ id: c.id, title: c.title }))); // Debug
      
      setCourses(mappedCourses);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar cursos. Tente novamente.');
      console.error('Erro ao buscar cursos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(currentPage);
  }, [searchTerm, selectedCategory, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Explore Nossos Cursos
            </h1>
            <p className="text-xl text-primary-100">
              Encontre o curso perfeito para impulsionar sua carreira
            </p>
          </motion.div>

          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 mb-8">
            <div className="flex items-center space-x-2 text-gray-600">
              <Filter className="w-5 h-5" />
              <span className="font-medium">Filtrar por:</span>
            </div>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {error && (
            <Error message={error} onRetry={() => fetchCourses(currentPage)} />
          )}

          {isLoading ? (
            <Loading message="Carregando cursos..." />
          ) : error ? null : (
            <>
              <div className="mb-6">
                <p className="text-gray-600">
                  {pagination?.total || courses.length} {pagination?.total === 1 ? 'curso encontrado' : 'cursos encontrados'}
                </p>
              </div>

              {courses.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-600">Nenhum curso encontrado com os filtros selecionados.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                    {courses.map((course, index) => (
                      <motion.div
                        key={course.id || `course-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <CourseCard course={course} />
                      </motion.div>
                    ))}
                  </div>

                  {pagination && pagination.pages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={pagination.pages}
                      onPageChange={handlePageChange}
                      totalItems={pagination.total}
                      itemsPerPage={pagination.limit}
                    />
                  )}
                </>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CoursesPage;
