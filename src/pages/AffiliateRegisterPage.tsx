import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Mail, CreditCard } from 'lucide-react';
import { affiliateAPI } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AffiliateRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    paymentInfo: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email) {
      setError('Nome e email são obrigatórios');
      return;
    }

    try {
      setIsLoading(true);
      await affiliateAPI.register(formData);
      navigate('/affiliate');
    } catch (error: any) {
      console.error('Erro ao registrar:', error);
      setError(error.response?.data?.message || 'Erro ao se cadastrar como afiliado');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <UserPlus className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Torne-se um Afiliado</h1>
            <p className="text-gray-600">
              Ganhe comissões indicando nossos cursos. Cadastre-se e comece a ganhar hoje mesmo!
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <UserPlus className="w-4 h-4 inline mr-2" />
                Nome Completo
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CreditCard className="w-4 h-4 inline mr-2" />
                Informações de Pagamento (Opcional)
              </label>
              <textarea
                value={formData.paymentInfo}
                onChange={(e) => setFormData({ ...formData, paymentInfo: e.target.value })}
                placeholder="Ex: Chave PIX, conta bancária, etc."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Você pode adicionar essas informações depois no seu dashboard
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Como funciona?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Você recebe um código único de afiliado</li>
                <li>• Compartilhe links com seu código</li>
                <li>• Ganhe comissão quando alguém comprar através do seu link</li>
                <li>• Taxa padrão: 10% sobre cada venda</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Cadastrando...' : 'Cadastrar como Afiliado'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AffiliateRegisterPage;

