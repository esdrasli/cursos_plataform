import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Navigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { checkoutAPI } from '../services/api';

const CheckoutReturnPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }

    const verifyPayment = async () => {
      try {
        const sessionData = await checkoutAPI.getSessionStatus(sessionId);
        setStatus(sessionData.status);
        setCustomerEmail(sessionData.customer_email || '');
      } catch (error: any) {
        console.error('Erro ao verificar pagamento:', error);
        setStatus('error');
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (status === 'open') {
    return <Navigate to={`/checkout/${sessionId}`} replace />;
  }

  if (status === 'complete') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center py-12">
          <div className="max-w-md mx-auto px-4">
            <section id="success" className="bg-white rounded-xl shadow-sm p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Pagamento Confirmado!</h2>
              <p className="text-gray-600 mb-6">
                Agradecemos sua compra! Um email de confirmação será enviado para {customerEmail || 'seu email'}.
                Você já tem acesso ao curso.
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Ir para Dashboard
              </button>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center py-12">
          <div className="max-w-md mx-auto px-4">
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro no Pagamento</h2>
              <p className="text-gray-600 mb-6">Ocorreu um erro ao processar seu pagamento. Tente novamente.</p>
              <button
                onClick={() => navigate('/cursos')}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Voltar para Cursos
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Loading state
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <Loader className="w-16 h-16 text-primary-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verificando pagamento...</h2>
            <p className="text-gray-600">Aguarde enquanto verificamos seu pagamento.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutReturnPage;

