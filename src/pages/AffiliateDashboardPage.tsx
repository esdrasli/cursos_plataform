import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, TrendingUp, Users, Copy, ExternalLink, CheckCircle, Clock, BookOpen, ShoppingCart } from 'lucide-react';
import { affiliateAPI, coursesAPI } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Loading from '../components/Loading';

const AffiliateDashboardPage: React.FC = () => {
  const [affiliate, setAffiliate] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [myAffiliateCourses, setMyAffiliateCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [affiliateLink, setAffiliateLink] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [affiliateData, statsData, salesData, myCoursesData] = await Promise.all([
        affiliateAPI.getMe(),
        affiliateAPI.getStats(),
        affiliateAPI.getSales(),
        affiliateAPI.getCourses().catch(() => []), // Se não houver cursos ainda, retorna array vazio
      ]);

      setAffiliate(affiliateData);
      setStats(statsData);
      setSales(salesData);
      console.log('Cursos do afiliado recebidos:', myCoursesData); // Debug
      setMyAffiliateCourses(myCoursesData || []);

      // Buscar cursos publicados para gerar links
      // Nota: Apenas cursos com status 'published' podem ter links de afiliação
      try {
        const coursesData = await coursesAPI.getAll({ limit: 100 });
        console.log('Cursos carregados para afiliação:', coursesData); // Debug
        const publishedCourses = (coursesData.courses || []).filter(
          (course: any) => course.status === 'published'
        );
        console.log('Cursos publicados:', publishedCourses.length); // Debug
        setCourses(publishedCourses);
      } catch (coursesError: any) {
        console.error('Erro ao carregar cursos:', coursesError);
        setCourses([]);
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      if (error.response?.status === 404) {
        // Não é afiliado ainda
        setAffiliate(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateLink = async () => {
    if (!selectedCourse) return;

    try {
      const linkData = await affiliateAPI.getLink(selectedCourse);
      setAffiliateLink(linkData.link);
    } catch (error: any) {
      console.error('Erro ao gerar link:', error);
      alert('Erro ao gerar link de afiliação');
    }
  };

  const handleCopyLink = () => {
    if (affiliateLink) {
      navigator.clipboard.writeText(affiliateLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!affiliate) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-grow flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Torne-se um Afiliado</h2>
            <p className="text-gray-600 mb-6">
              Ganhe comissões indicando nossos cursos! Cadastre-se como afiliado e comece a ganhar hoje mesmo.
            </p>
            <Link
              to="/affiliate/register"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Cadastrar como Afiliado
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard de Afiliado</h1>
          <p className="text-gray-600">Seu código: <span className="font-mono font-bold text-primary-600">{affiliate.affiliateCode}</span></p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Ganho</span>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              R$ {stats?.totalEarnings?.toFixed(2) || '0.00'}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Pendente</span>
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              R$ {stats?.pendingEarnings?.toFixed(2) || '0.00'}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total de Vendas</span>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats?.totalSales || 0}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Taxa de Comissão</span>
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats?.commissionRate || 0}%</p>
          </div>
        </div>

        {/* Cursos que o Afiliado está Promovendo */}
        {myAffiliateCourses.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-6 h-6 text-primary-600" />
                <h2 className="text-xl font-bold text-gray-900">Meus Cursos em Promoção</h2>
              </div>
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                {myAffiliateCourses.length} {myAffiliateCourses.length === 1 ? 'curso' : 'cursos'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myAffiliateCourses
                .filter((item: any) => {
                  // Filtrar apenas itens com curso válido e ID válido
                  const course = item.course;
                  if (!course) return false;
                  const courseId = course.id || course._id;
                  return courseId && courseId !== 'undefined' && courseId !== 'null';
                })
                .map((item: any, index: number) => {
                  const course = item.course || {};
                  const courseStats = item.stats || {};
                  const courseId = course.id || course._id;
                  
                  // Debug
                  if (index === 0) {
                    console.log('Primeiro item processado:', { item, course, courseId });
                  }
                  
                  // Validação adicional
                  if (!courseId || courseId === 'undefined' || courseId === 'null') {
                    console.error('Curso sem ID válido:', { item, course, courseId });
                    return null;
                  }
                
                return (
                  <div key={courseId} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    {course.thumbnail && (
                      <div className="h-40 bg-gray-200 overflow-hidden">
                        <img 
                          src={course.thumbnail} 
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                        {course.title || 'Curso sem título'}
                      </h3>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 flex items-center">
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            Vendas:
                          </span>
                          <span className="font-semibold text-gray-900">{courseStats.totalSales || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 flex items-center">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            Receita Total:
                          </span>
                          <span className="font-semibold text-gray-900">
                            R$ {parseFloat(courseStats.totalRevenue || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            Minhas Comissões:
                          </span>
                          <span className="font-semibold text-green-600">
                            R$ {parseFloat(courseStats.totalCommissions || 0).toFixed(2)}
                          </span>
                        </div>
                        {courseStats.lastSaleDate && (
                          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                            <span>Última venda:</span>
                            <span>{new Date(courseStats.lastSaleDate).toLocaleDateString('pt-BR')}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {courseId && courseId !== 'undefined' && courseId !== 'null' ? (
                          <Link
                            to={`/curso/${courseId}`}
                            className="flex-1 text-center px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
                          >
                            Ver Curso
                          </Link>
                        ) : (
                          <button
                            disabled
                            className="flex-1 text-center px-3 py-2 bg-gray-300 text-gray-500 rounded-lg text-sm font-semibold cursor-not-allowed"
                          >
                            Curso Inválido
                          </button>
                        )}
                        <button
                          onClick={async () => {
                            if (!courseId || courseId === 'undefined' || courseId === 'null') {
                              console.error('ID do curso inválido:', courseId);
                              alert('Erro: ID do curso inválido');
                              return;
                            }
                            try {
                              const linkData = await affiliateAPI.getLink(courseId);
                              if (linkData && linkData.link) {
                                setAffiliateLink(linkData.link);
                                setSelectedCourse(courseId);
                              } else {
                                console.error('Resposta inválida do servidor:', linkData);
                                alert('Erro ao gerar link de afiliação');
                              }
                            } catch (error: any) {
                              console.error('Erro ao gerar link:', error);
                              alert('Erro ao gerar link de afiliação: ' + (error.message || 'Erro desconhecido'));
                            }
                          }}
                          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                          title="Gerar link de afiliação"
                          disabled={!courseId || courseId === 'undefined' || courseId === 'null'}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
              .filter(Boolean)} {/* Remove nulls do array */}
            </div>
          </div>
        )}

        {/* Gerar Link de Afiliação */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Gerar Link de Afiliação</h2>
          {courses.length === 0 ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm font-medium mb-2">
                Nenhum curso publicado disponível no momento.
              </p>
              <p className="text-yellow-700 text-xs">
                Os cursos precisam estar com status <strong>"Publicado"</strong> para gerar links de afiliação. 
                Cursos em rascunho não aparecem nesta lista. Verifique se os cursos foram publicados corretamente.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row gap-4">
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Selecione um curso</option>
                  {courses.map((course) => (
                    <option key={course.id || course._id} value={course.id || course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleGenerateLink}
                  disabled={!selectedCourse}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  Gerar Link
                </button>
              </div>

              {affiliateLink && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-700">Seu link de afiliação:</span>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1 px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700 transition-colors"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar
                    </>
                  )}
                </button>
              </div>
                <p className="text-sm text-gray-600 break-all font-mono">{affiliateLink}</p>
              </div>
              )}
            </>
          )}
        </div>

        {/* Vendas Recentes */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Vendas Recentes</h2>
          {sales.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhuma venda ainda</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-3 text-sm font-semibold text-gray-600">Curso</th>
                    <th className="p-3 text-sm font-semibold text-gray-600">Valor</th>
                    <th className="p-3 text-sm font-semibold text-gray-600">Comissão</th>
                    <th className="p-3 text-sm font-semibold text-gray-600">Status</th>
                    <th className="p-3 text-sm font-semibold text-gray-600">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale: any) => (
                    <tr key={sale.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{sale.course?.title || sale.courseTitle}</td>
                      <td className="p-3">R$ {parseFloat(sale.saleAmount).toFixed(2)}</td>
                      <td className="p-3 font-semibold text-green-600">
                        R$ {parseFloat(sale.commissionAmount).toFixed(2)}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          sale.status === 'approved' ? 'bg-green-100 text-green-800' :
                          sale.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {sale.status === 'approved' ? 'Aprovado' :
                           sale.status === 'paid' ? 'Pago' : 'Pendente'}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {new Date(sale.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AffiliateDashboardPage;

