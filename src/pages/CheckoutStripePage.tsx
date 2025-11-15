import React, { useCallback, useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Loading from '../components/Loading';
import Error from '../components/Error';
import { checkoutAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
// IMPORTANTE: Configure VITE_STRIPE_PUBLIC_KEY no arquivo .env
// Chave de produção deve começar com pk_live_
// Chave de teste deve começar com pk_test_
// NUNCA commite chaves secretas no código!
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

if (!stripePublicKey) {
  console.error('⚠️ VITE_STRIPE_PUBLIC_KEY não configurada! Configure no arquivo .env');
}

const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

const CheckoutStripePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const affiliateCode = searchParams.get('ref') || undefined;
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const courseData = await checkoutAPI.getCourseInfo(id);
        setCourse(courseData.course);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar informações do curso');
        console.error('Erro ao buscar curso:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [id]);

  const fetchClientSecret = useCallback(async () => {
    if (!id) {
      throw new Error('ID do curso não fornecido');
    }
    
    try {
      const sessionData = await checkoutAPI.createCheckoutSession({
        courseId: id,
        affiliateCode,
      });
      
      if (!sessionData.clientSecret) {
        throw new Error('Client secret não foi retornado pelo servidor');
      }
      
      return sessionData.clientSecret;
    } catch (err: any) {
      console.error('Erro ao criar sessão de checkout:', err);
      console.error('Detalhes do erro:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      // Mostrar erro mais amigável
      setError(err.response?.data?.message || err.message || 'Erro ao criar sessão de checkout');
      throw err;
    }
  }, [id, affiliateCode]);

  const options = { fetchClientSecret };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <Loading message="Carregando checkout..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <Error message={error} onRetry={() => window.location.reload()} />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow py-8">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>

          {course && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Finalizar Compra</h1>
              <p className="text-gray-600">{course.title}</p>
              <p className="text-xl font-bold text-primary-600 mt-2">
                R$ {course.price?.toFixed(2)}
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {!stripePublicKey && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800">
                ⚠️ Chave pública do Stripe não configurada. Configure <code>VITE_STRIPE_PUBLIC_KEY</code> no arquivo <code>.env</code>
              </p>
            </div>
          )}

          {stripePromise && (
            <div id="checkout" className="bg-white rounded-xl shadow-sm p-6">
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={options}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutStripePage;

