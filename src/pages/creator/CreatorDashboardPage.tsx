import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingCart, Users, TrendingUp, MoreVertical } from 'lucide-react';
import { mockCourses, mockSales } from '../../data/mockData';

const StatCard: React.FC<{ icon: React.ElementType; title: string; value: string; change: string; color: string }> = ({ icon: Icon, title, value, change, color }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className={`bg-white p-6 rounded-xl shadow-sm border-l-4 border-${color}-500`}
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`p-3 bg-${color}-100 rounded-full`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
    </div>
    <div className="flex items-center text-sm text-gray-500 mt-4">
      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
      <span className="text-green-600 font-semibold mr-1">{change}</span>
      <span>vs. último mês</span>
    </div>
  </motion.div>
);

const CreatorDashboardPage: React.FC = () => {
  const creatorCourses = mockCourses.filter(c => c.instructor === 'Lucas Silva');

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard do Criador</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard icon={DollarSign} title="Receita Total" value="R$ 12.450" change="+12.5%" color="green" />
        <StatCard icon={ShoppingCart} title="Vendas" value="42" change="+8.2%" color="blue" />
        <StatCard icon={Users} title="Novos Alunos" value="128" change="+20%" color="purple" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Meus Cursos</h2>
          <div className="space-y-4">
            {creatorCourses.map(course => (
              <div key={course.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img src={course.thumbnail} alt={course.title} className="w-24 h-16 object-cover rounded-lg" />
                  <div>
                    <h3 className="font-bold text-gray-900">{course.title}</h3>
                    <p className="text-sm text-gray-500">{course.totalStudents} alunos · R$ {course.price.toFixed(2)}</p>
                  </div>
                </div>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <MoreVertical className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Vendas Recentes</h2>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <ul className="space-y-4">
              {mockSales.slice(0, 5).map(sale => (
                <li key={sale.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{sale.studentName}</p>
                      <p className="text-xs text-gray-500">{sale.courseTitle}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-green-600 text-sm">+R${sale.amount.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboardPage;
