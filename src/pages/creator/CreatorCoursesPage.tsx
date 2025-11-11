import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { coursesAPI } from '../../services/api';

const CreatorCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  const fetchCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await coursesAPI.getMyCourses();
      console.log('Cursos carregados:', data); // Debug
      // Garantir que sempre seja um array
      const coursesArray = Array.isArray(data) ? data : [];
      console.log('Cursos processados:', coursesArray.length); // Debug
      setCourses(coursesArray);
    } catch (error: any) {
      console.error('Erro ao carregar cursos:', error);
      setError(error.message || 'Erro ao carregar cursos');
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses, location.pathname]); // Recarregar quando a rota mudar

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Meus Cursos</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchCourses}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
            title="Atualizar lista"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
          <Link
            to="/creator/courses/new"
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Novo Curso</span>
          </Link>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <p>{error}</p>
            <button
              onClick={fetchCourses}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Tentar novamente
            </button>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar curso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-gray-50 text-sm font-semibold text-gray-600">
                  <th className="p-4">Curso</th>
                  <th className="p-4">Alunos</th>
                  <th className="p-4">Preço</th>
                  <th className="p-4">Status</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-600">
                      {searchTerm ? 'Nenhum curso encontrado' : 'Você ainda não criou nenhum curso'}
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((course: any) => {
                    const courseId = course.id || course._id;
                    const coursePrice = typeof course.price === 'number' ? course.price : parseFloat(course.price) || 0;
                    
                    return (
                      <tr key={courseId} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center space-x-4">
                            <img 
                              src={course.thumbnail || 'https://via.placeholder.com/80x48'} 
                              alt={course.title || 'Curso'} 
                              className="w-20 h-12 object-cover rounded-md"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x48';
                              }}
                            />
                            <div>
                              <p className="font-bold text-gray-900">{course.title || 'Sem título'}</p>
                              <p className="text-xs text-gray-500">{course.category || 'Sem categoria'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-gray-700">
                          {course.totalStudents ? course.totalStudents.toLocaleString('pt-BR') : 0}
                        </td>
                        <td className="p-4 font-medium text-gray-700">
                          R$ {coursePrice.toFixed(2)}
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            course.status === 'published' 
                              ? 'text-green-800 bg-green-100' 
                              : 'text-yellow-800 bg-yellow-100'
                          }`}>
                            {course.status === 'published' ? 'Publicado' : 'Rascunho'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Link
                            to={`/creator/courses/edit/${courseId}`}
                            className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                          >
                            Editar
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorCoursesPage;
