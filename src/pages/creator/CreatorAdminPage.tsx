import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  BookOpen,
  Calendar,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Award
} from 'lucide-react';
import { creatorAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface CourseStats {
  course: {
    id: string;
    title: string;
    thumbnail: string;
    price: number;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  stats: {
    totalRevenue: number;
    totalSales: number;
    totalStudents: number;
    avgProgress: number;
    revenueThisMonth: number;
    salesThisMonth: number;
    lastSaleDate: string | null;
  };
}

interface DashboardStats {
  totalRevenue: number;
  totalSales: number;
  newStudents: number;
  totalCourses: number;
  totalRevenueAllTime: number;
  totalSalesAllTime: number;
  totalStudents: number;
  revenueLast7Days: number;
  salesLast7Days: number;
  revenueLast30Days: number;
  salesLast30Days: number;
  revenueByCourse: Array<{
    courseId: string;
    courseTitle: string;
    revenue: number;
    sales: number;
    students: number;
    price: number;
  }>;
}

const StatCard: React.FC<{
  icon: React.ElementType;
  title: string;
  value: string;
  subtitle?: string;
  change?: string;
  trend?: 'up' | 'down';
  color: string;
}> = ({ icon: Icon, title, value, subtitle, change, trend, color }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
      <div className={`p-3 bg-${color}-100 rounded-full`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
    </div>
    {change && (
      <div className="flex items-center text-sm mt-4">
        {trend === 'up' ? (
          <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
        ) : trend === 'down' ? (
          <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
        ) : null}
        <span className={trend === 'up' ? 'text-green-600 font-semibold' : trend === 'down' ? 'text-red-600 font-semibold' : 'text-gray-600'}>
          {change}
        </span>
      </div>
    )}
  </motion.div>
);

const CreatorAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [coursesStats, setCoursesStats] = useState<CourseStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'week' | 'all'>('month');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [statsData, coursesStatsData] = await Promise.all([
          creatorAPI.getDashboardStats().catch(err => {
            console.error('Erro ao buscar estatísticas:', err);
            return null;
          }),
          creatorAPI.getCoursesStats().catch(err => {
            console.error('Erro ao buscar estatísticas dos cursos:', err);
            return [];
          })
        ]);

        setStats(statsData);
        setCoursesStats(coursesStatsData);
      } catch (error: unknown) {
        console.error('Erro ao carregar dados:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar dados do dashboard';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800 font-medium mb-2">Erro ao carregar dados</p>
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Recarregar página
        </button>
      </div>
    );
  }

  const displayRevenue = selectedPeriod === 'month' 
    ? stats?.totalRevenue || 0
    : selectedPeriod === 'week'
    ? stats?.revenueLast7Days || 0
    : stats?.totalRevenueAllTime || 0;

  const displaySales = selectedPeriod === 'month'
    ? stats?.totalSales || 0
    : selectedPeriod === 'week'
    ? stats?.salesLast7Days || 0
    : stats?.totalSalesAllTime || 0;

  const revenueChange = stats && stats.revenueLast30Days > 0
    ? ((stats.revenueLast7Days - (stats.revenueLast30Days - stats.revenueLast7Days) / 3) / (stats.revenueLast30Days - stats.revenueLast7Days) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
          <p className="text-gray-600 mt-1">Visão geral dos seus cursos e performance</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedPeriod('week')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedPeriod === 'week'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            7 dias
          </button>
          <button
            onClick={() => setSelectedPeriod('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedPeriod === 'month'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Mês
          </button>
          <button
            onClick={() => setSelectedPeriod('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedPeriod === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Total
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">{error}</p>
        </div>
      )}

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={DollarSign}
          title="Receita"
          value={`R$ ${displayRevenue.toFixed(2).replace('.', ',')}`}
          subtitle={selectedPeriod === 'month' ? 'Este mês' : selectedPeriod === 'week' ? 'Últimos 7 dias' : 'Total'}
          change={selectedPeriod === 'month' && stats ? `vs. mês anterior: ${revenueChange}%` : undefined}
          trend={parseFloat(revenueChange) >= 0 ? 'up' : 'down'}
          color="green"
        />
        <StatCard
          icon={ShoppingCart}
          title="Vendas"
          value={displaySales.toString()}
          subtitle={selectedPeriod === 'month' ? 'Este mês' : selectedPeriod === 'week' ? 'Últimos 7 dias' : 'Total'}
          color="blue"
        />
        <StatCard
          icon={Users}
          title="Alunos"
          value={stats?.totalStudents?.toString() || '0'}
          subtitle="Total de alunos únicos"
          change={stats?.newStudents ? `+${stats.newStudents} este mês` : undefined}
          trend="up"
          color="purple"
        />
        <StatCard
          icon={BookOpen}
          title="Cursos"
          value={stats?.totalCourses?.toString() || '0'}
          subtitle="Total de cursos criados"
          color="orange"
        />
      </div>

      {/* Gráfico de Receita por Curso */}
      {stats?.revenueByCourse && stats.revenueByCourse.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Receita por Curso</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {stats.revenueByCourse
              .sort((a, b) => b.revenue - a.revenue)
              .slice(0, 5)
              .map((course) => {
                const percentage = stats.totalRevenueAllTime > 0
                  ? (course.revenue / stats.totalRevenueAllTime) * 100
                  : 0;
                return (
                  <div key={course.courseId} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{course.courseTitle}</span>
                      <span className="text-sm font-semibold text-gray-900">
                        R$ {course.revenue.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{course.sales} vendas</span>
                      <span>{course.students} alunos</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Tabela de Cursos com Estatísticas */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Cursos e Performance</h2>
          <p className="text-sm text-gray-600 mt-1">Estatísticas detalhadas de cada curso</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Curso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receita
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alunos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progresso Médio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {coursesStats.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Você ainda não criou nenhum curso.</p>
                    <button
                      onClick={() => navigate('/creator/courses/new')}
                      className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                    >
                      Criar Primeiro Curso
                    </button>
                  </td>
                </tr>
              ) : (
                coursesStats.map((item) => (
                  <tr key={item.course.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <img
                          src={item.course.thumbnail || 'https://via.placeholder.com/80x60'}
                          alt={item.course.title}
                          className="w-20 h-14 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x60';
                          }}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.course.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            R$ {item.course.price.toFixed(2).replace('.', ',')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        R$ {item.stats.totalRevenue.toFixed(2).replace('.', ',')}
                      </div>
                      {item.stats.revenueThisMonth > 0 && (
                        <div className="text-xs text-gray-500">
                          R$ {item.stats.revenueThisMonth.toFixed(2).replace('.', ',')} este mês
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.stats.totalSales}</div>
                      {item.stats.salesThisMonth > 0 && (
                        <div className="text-xs text-gray-500">
                          {item.stats.salesThisMonth} este mês
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.stats.totalStudents}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${item.stats.avgProgress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{item.stats.avgProgress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.course.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {item.course.status === 'published' ? 'Publicado' : 'Rascunho'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => navigate(`/creator/courses/edit/${item.course.id}`)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => navigate(`/curso/${item.course.id}`)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumo de Performance */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Receita Média</h3>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              R$ {stats.totalSalesAllTime > 0 
                ? (stats.totalRevenueAllTime / stats.totalSalesAllTime).toFixed(2).replace('.', ',')
                : '0,00'}
            </p>
            <p className="text-sm text-gray-500">Por venda</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Taxa de Conversão</h3>
              <Award className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {stats.totalStudents > 0 && stats.totalSalesAllTime > 0
                ? ((stats.totalSalesAllTime / stats.totalStudents) * 100).toFixed(1)
                : '0'}%
            </p>
            <p className="text-sm text-gray-500">Vendas por aluno</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Última Venda</h3>
              <Calendar className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900 mb-2">
              {coursesStats.length > 0
                ? (() => {
                    const lastSaleDates = coursesStats
                      .filter(cs => cs.stats.lastSaleDate)
                      .map(cs => new Date(cs.stats.lastSaleDate!));
                    if (lastSaleDates.length === 0) return 'N/A';
                    const latest = new Date(Math.max(...lastSaleDates.map(d => d.getTime())));
                    return latest.toLocaleDateString('pt-BR');
                  })()
                : 'N/A'}
            </p>
            <p className="text-sm text-gray-500">Data da última venda</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorAdminPage;

