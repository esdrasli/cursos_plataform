import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, CreditCard, QrCode, CheckCircle, ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Loading from '../components/Loading';
import Error from '../components/Error';
import { checkoutAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { validateCreditCard, formatCreditCard, formatExpiry } from '../utils/validation';

const CheckoutPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const affiliateCode = searchParams.get('ref') || undefined; // Capturar código de afiliado da URL
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'pix'>('credit');
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
    installments: '1'
  });
  const [cardErrors, setCardErrors] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const data = await checkoutAPI.getCourseInfo(id);
        setCourse(data.course);
      } catch (err: any) {
        setError('Erro ao carregar informações do curso');
        console.error('Erro ao buscar curso:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const validateForm = (): boolean => {
    if (paymentMethod === 'credit') {
      const errors: any = {};
      let isValid = true;

      if (!cardData.number || !validateCreditCard(cardData.number.replace(/\s/g, ''))) {
        errors.number = 'Número de cartão inválido';
        isValid = false;
      }

      if (!cardData.expiry || !/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
        errors.expiry = 'Data de validade inválida (MM/AA)';
        isValid = false;
      }

      if (!cardData.cvv || cardData.cvv.length < 3) {
        errors.cvv = 'CVV inválido';
        isValid = false;
      }

      if (!cardData.name || cardData.name.length < 3) {
        errors.name = 'Nome no cartão é obrigatório';
        isValid = false;
      }

      setCardErrors(errors);
      return isValid;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!id || !course) return;

    if (!validateForm()) {
      setError('Por favor, corrija os erros no formulário');
      return;
    }

    try {
      setIsProcessing(true);
      setError('');
      
      await checkoutAPI.process({
        courseId: id,
        paymentMethod,
        paymentData: paymentMethod === 'credit' ? cardData : {},
        affiliateCode: affiliateCode // Passar código de afiliado se houver
      });

      // Redirecionar para dashboard após sucesso
      navigate('/dashboard', { state: { message: 'Compra realizada com sucesso!' } });
    } catch (err: any) {
      setError(err.message || 'Erro ao processar pagamento. Tente novamente.');
      console.error('Erro ao processar pagamento:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <Loading message="Carregando informações do curso..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center px-4">
          <Error 
            message="Curso não encontrado" 
            onRetry={() => window.location.reload()}
          />
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) return null;

  const discount = course.originalPrice ? course.originalPrice - course.price : 0;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Seus Dados</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                  <input 
                    type="text" 
                    value={user?.name || ''}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                  <input 
                    type="email" 
                    value={user?.email || ''}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50" 
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Forma de Pagamento</h2>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setPaymentMethod('credit')}
                  className={`p-4 border-2 rounded-lg transition-all ${paymentMethod === 'credit' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <CreditCard className={`w-8 h-8 mb-2 ${paymentMethod === 'credit' ? 'text-primary-600' : 'text-gray-400'}`} />
                  <p className="font-semibold text-gray-900">Cartão de Crédito</p>
                </button>
                <button
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-4 border-2 rounded-lg transition-all ${paymentMethod === 'pix' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <QrCode className={`w-8 h-8 mb-2 ${paymentMethod === 'pix' ? 'text-primary-600' : 'text-gray-400'}`} />
                  <p className="font-semibold text-gray-900">PIX</p>
                </button>
              </div>

              {paymentMethod === 'credit' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Número do Cartão</label>
                    <input 
                      type="text" 
                      placeholder="0000 0000 0000 0000" 
                      value={cardData.number}
                      onChange={(e) => {
                        setCardData({...cardData, number: formatCreditCard(e.target.value)});
                        if (cardErrors.number) setCardErrors({...cardErrors, number: ''});
                      }}
                      maxLength={19}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent ${
                        cardErrors.number ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {cardErrors.number && (
                      <p className="mt-1 text-sm text-red-600">{cardErrors.number}</p>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Validade</label>
                      <input 
                        type="text" 
                        placeholder="MM/AA" 
                        value={cardData.expiry}
                        onChange={(e) => {
                          setCardData({...cardData, expiry: formatExpiry(e.target.value)});
                          if (cardErrors.expiry) setCardErrors({...cardErrors, expiry: ''});
                        }}
                        maxLength={5}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent ${
                          cardErrors.expiry ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {cardErrors.expiry && (
                        <p className="mt-1 text-sm text-red-600">{cardErrors.expiry}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                      <input 
                        type="text" 
                        placeholder="000" 
                        value={cardData.cvv}
                        onChange={(e) => {
                          setCardData({...cardData, cvv: e.target.value.replace(/\D/g, '').slice(0, 4)});
                          if (cardErrors.cvv) setCardErrors({...cardErrors, cvv: ''});
                        }}
                        maxLength={4}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent ${
                          cardErrors.cvv ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {cardErrors.cvv && (
                        <p className="mt-1 text-sm text-red-600">{cardErrors.cvv}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome no Cartão</label>
                    <input 
                      type="text" 
                      placeholder="Como está no cartão" 
                      value={cardData.name}
                      onChange={(e) => {
                        setCardData({...cardData, name: e.target.value});
                        if (cardErrors.name) setCardErrors({...cardErrors, name: ''});
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent ${
                        cardErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {cardErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{cardErrors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Parcelas</label>
                    <select 
                      value={cardData.installments}
                      onChange={(e) => setCardData({...cardData, installments: e.target.value})}
                      className="w-full px-4 py-3 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    >
                      <option value="1">1x de R$ {course.price.toFixed(2)}</option>
                      {[2, 3, 6, 12].map(p => (
                        <option key={p} value={p}>{p}x de R$ {(course.price / p).toFixed(2)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {paymentMethod === 'pix' && (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <div className="inline-block p-4 bg-white rounded-lg shadow-md mb-4">
                    <QrCode className="w-40 h-40 text-gray-800" />
                  </div>
                  <p className="text-gray-700 font-medium mb-2">Escaneie o QR Code com o app do seu banco</p>
                  <p className="text-sm text-gray-500">Ou use o PIX Copia e Cola</p>
                  <button className="mt-4 px-6 py-2 bg-primary-100 text-primary-700 font-semibold rounded-lg hover:bg-primary-200 transition-colors">
                    Copiar Código
                  </button>
                </div>
              )}
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-6 sticky top-24"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Resumo do Pedido</h2>
              <div className="flex items-start space-x-4 mb-6">
                <img src={course.thumbnail} alt={course.title} className="w-24 h-16 object-cover rounded-lg" />
                <div>
                  <h3 className="font-semibold text-gray-900">{course.title}</h3>
                  <p className="text-sm text-gray-600">Por {course.instructor}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-gray-700 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>R$ {course.originalPrice ? course.originalPrice.toFixed(2) : course.price.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Desconto</span>
                    <span>- R$ {discount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between font-bold text-xl text-gray-900 border-t pt-4 mb-6">
                <span>Total</span>
                <span>R$ {course.price.toFixed(2)}</span>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing || (paymentMethod === 'credit' && (!cardData.number || !cardData.expiry || !cardData.cvv || !cardData.name))}
                className="block w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-center rounded-lg font-bold text-lg hover:shadow-lg transition-all mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processando...' : 'Finalizar Compra'}
              </button>

              <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
                <Lock className="w-4 h-4" />
                <span>Compra 100% segura</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
