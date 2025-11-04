import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, MoreVertical } from 'lucide-react';
import { mockCourses } from '../../data/mockData';

const CreatorCoursesPage: React.FC = () => {
  const creatorCourses = mockCourses.filter(c => c.instructor === 'Lucas Silva' || c.instructor === 'Marina Costa');

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Meus Cursos</h1>
        <Link
          to="#"
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Curso</span>
        </Link>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar curso..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

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
              {creatorCourses.map(course => (
                <tr key={course.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center space-x-4">
                      <img src={course.thumbnail} alt={course.title} className="w-20 h-12 object-cover rounded-md" />
                      <div>
                        <p className="font-bold text-gray-900">{course.title}</p>
                        <p className="text-xs text-gray-500">{course.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-medium text-gray-700">{course.totalStudents.toLocaleString('pt-BR')}</td>
                  <td className="p-4 font-medium text-gray-700">R$ {course.price.toFixed(2)}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                      Publicado
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-2 rounded-full hover:bg-gray-200">
                      <MoreVertical className="w-5 h-5 text-gray-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CreatorCoursesPage;
