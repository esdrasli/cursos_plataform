import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, MoreVertical, Edit, Copy, Trash2 } from 'lucide-react';
import { mockLandingPages } from '../../data/mockData';

const CreatorPagesListPage: React.FC = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Minhas Páginas</h1>
        <Link
          to="/creator/pages/new"
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Criar Nova Página</span>
        </Link>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-50 text-sm font-semibold text-gray-600">
                <th className="p-4">Título da Página</th>
                <th className="p-4">Curso Associado</th>
                <th className="p-4">Status</th>
                <th className="p-4">Última Atualização</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {mockLandingPages.map(page => (
                <tr key={page.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-bold text-gray-900">{page.title}</td>
                  <td className="p-4 text-gray-700">{page.courseTitle}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      page.status === 'Publicada' 
                      ? 'text-green-800 bg-green-100' 
                      : 'text-yellow-800 bg-yellow-100'
                    }`}>
                      {page.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">{new Date(page.lastUpdated).toLocaleDateString('pt-BR')}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                       <Link to={`/creator/pages/edit/${page.id}`} className="p-2 rounded-full hover:bg-gray-200">
                         <Edit className="w-5 h-5 text-gray-500" />
                       </Link>
                       <button className="p-2 rounded-full hover:bg-gray-200">
                         <Trash2 className="w-5 h-5 text-red-500" />
                       </button>
                    </div>
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

export default CreatorPagesListPage;
