import React, { useState, useEffect } from 'react';
import { Search, Download } from 'lucide-react';
import Loading from '../../components/Loading';
import Error from '../../components/Error';
import Pagination from '../../components/Pagination';
import { creatorAPI } from '../../services/api';

const CreatorStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  const fetchStudents = async (page: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await creatorAPI.getStudents({ 
        search: searchTerm || undefined,
        page,
        limit: 20
      });
      setStudents(response.students || []);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar alunos');
      console.error('Erro ao carregar alunos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(currentPage);
  }, [searchTerm, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Alunos</h1>
        <button
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          <Download className="w-5 h-5" />
          <span>Exportar</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {isLoading ? (
          <Loading message="Carregando alunos..." />
        ) : error ? (
          <Error message={error} onRetry={() => fetchStudents(currentPage)} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b bg-gray-50 text-sm font-semibold text-gray-600">
                    <th className="p-4">Nome</th>
                    <th className="p-4">E-mail</th>
                    <th className="p-4">Data de Inscrição</th>
                    <th className="p-4 text-right">Valor Gasto</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-600">
                        Nenhum aluno encontrado
                      </td>
                    </tr>
                  ) : (
                    students.map((student: any) => (
                      <tr key={student.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full" />
                            <span className="font-medium text-gray-900">{student.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-700">{student.email}</td>
                        <td className="p-4 text-gray-500">
                          {new Date(student.enrolledDate).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-4 text-right font-semibold text-gray-800">R$ {student.totalSpent.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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
      </div>
    </div>
  );
};

export default CreatorStudentsPage;
