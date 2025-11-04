import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, CreditCard, QrCode, CheckCircle, ArrowLeft, Tag } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { mockCourses } from '../data/mockData';

const CheckoutPage: React.FC = () => {
  const { id } = useParams();
  const course = mockCourses.find(c => c.id === id);
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'pix'>('credit');

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center text-center px-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Curso não encontrado</h1>
            <Link to="/cursos" className="inline-flex items-center text-primary-600 hover:underline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para a lista de cursos
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const discount = course.originalPrice ? course.originalPrice - course.price : 0;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                  <input type="text" placeholder="Seu nome" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                  <input type="email" placeholder="seu@email.com" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CPF</label>
                  <input type="text" placeholder="000.000.000-00" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent" />
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
                    <input type="text" placeholder="0000 0000 0000 0000" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Validade</label>
                      <input type="text" placeholder="MM/AA" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                      <input type="text" placeholder="000" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome no Cartão</label>
                    <input type="text" placeholder="Como está no cartão" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Parcelas</label>
                    <select className="w-full px-4 py-3 border bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent">
                      <option>1x de R$ {course.price.toFixed(2)}</option>
                      {[2, 3, 6, 12].map(p => (
                        <option key={p}>{p}x de R$ {(course.price / p).toFixed(2)}</option>
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

              <div className="mb-6">
                <div className="flex">
                  <input type="text" placeholder="Cupom de desconto" className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-l-lg focus:ring-1 focus:ring-primary-600 focus:border-transparent" />
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-r-lg hover:bg-gray-300 transition-colors text-sm">Aplicar</button>
                </div>
              </div>

              <Link
                to="/dashboard"
                className="block w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-center rounded-lg font-bold text-lg hover:shadow-lg transition-all mb-4"
              >
                Finalizar Compra
              </Link>

              <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
                <Lock className="w-4 h-4" />
                <span>Compra 100% segura</span>
              </div>

              <div className="mt-6 pt-6 border-t space-y-3">
                {course.features.slice(0, 2).map((feature, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ))}
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
