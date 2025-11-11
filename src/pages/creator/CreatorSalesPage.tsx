import React, { useState, useEffect } from 'react';
import { Search, Download, Eye, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import Loading from '../../components/Loading';
import Error from '../../components/Error';
import Pagination from '../../components/Pagination';
import { creatorAPI } from '../../services/api';

const CreatorSalesPage: React.FC = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  const fetchSales = async (page: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await creatorAPI.getSales({ 
        search: searchTerm || undefined,
        page,
        limit: 20
      });
      setSales(response.sales || []);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar vendas');
      console.error('Erro ao carregar vendas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSales(currentPage);
  }, [searchTerm, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Vendas</h1>
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
              placeholder="Buscar por aluno ou curso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {isLoading ? (
          <Loading message="Carregando vendas..." />
        ) : error ? (
          <Error message={error} onRetry={() => fetchSales(currentPage)} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b bg-gray-50 text-sm font-semibold text-gray-600">
                    <th className="p-4">Curso</th>
                    <th className="p-4">Aluno</th>
                    <th className="p-4">Data</th>
                    <th className="p-4 text-right">Valor</th>
                    <th className="p-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-600">
                        Nenhuma venda encontrada
                      </td>
                    </tr>
                  ) : (
                    sales.map((sale: any) => {
                      const saleAmount = typeof sale.amount === 'number' 
                        ? sale.amount 
                        : parseFloat(sale.amount) || 0;
                      const landingPage = sale.landingPage;
                      const hasLandingPage = landingPage && (landingPage.id || landingPage._id);
                      
                      return (
                        <tr key={sale._id || sale.id} className="border-b hover:bg-gray-50">
                          <td className="p-4 font-medium text-gray-800">{sale.courseTitle}</td>
                          <td className="p-4 text-gray-700">{sale.studentName}</td>
                          <td className="p-4 text-gray-500">
                            {new Date(sale.createdAt || sale.date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="p-4 text-right font-semibold text-green-600">
                            R$ {saleAmount.toFixed(2)}
                          </td>
                          <td className="p-4 text-center">
                            {hasLandingPage ? (
                              <Link
                                to={`/creator/pages/edit/${landingPage.id || landingPage._id}`}
                                className="inline-flex items-center space-x-2 px-3 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors text-sm font-medium"
                                title="Visualizar Landing Page"
                              >
                                <Eye className="w-4 h-4" />
                                <span>Ver Página</span>
                              </Link>
                            ) : (
                              <span className="text-xs text-gray-400 italic">Sem página</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
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

export default CreatorSalesPage;
