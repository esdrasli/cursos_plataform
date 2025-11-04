import React from 'react';
import { Search, Download } from 'lucide-react';
import { mockSales } from '../../data/mockData';

const CreatorSalesPage: React.FC = () => {
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-50 text-sm font-semibold text-gray-600">
                <th className="p-4">Curso</th>
                <th className="p-4">Aluno</th>
                <th className="p-4">Data</th>
                <th className="p-4 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {mockSales.map(sale => (
                <tr key={sale.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-800">{sale.courseTitle}</td>
                  <td className="p-4 text-gray-700">{sale.studentName}</td>
                  <td className="p-4 text-gray-500">{new Date(sale.date).toLocaleDateString('pt-BR')}</td>
                  <td className="p-4 text-right font-semibold text-green-600">R$ {sale.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CreatorSalesPage;
