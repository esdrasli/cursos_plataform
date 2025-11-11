import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const CartPage: React.FC = () => {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const totalPrice = getTotalPrice();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/carrinho');
      return;
    }

    if (items.length === 0) return;

    // Se houver apenas um item, redireciona para checkout direto
    if (items.length === 1) {
      navigate(`/checkout/${items[0].course.id}`);
    } else {
      // Para múltiplos itens, você pode criar uma página de checkout múltiplo
      // Por enquanto, vamos redirecionar para o primeiro item
      navigate(`/checkout/${items[0].course.id}`);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center px-4 py-16">
          <div className="text-center max-w-md">
            <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Seu carrinho está vazio</h2>
            <p className="text-gray-600 mb-8">
              Adicione cursos ao carrinho para continuar comprando
            </p>
            <Link
              to="/cursos"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Explorar Cursos</span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Carrinho de Compras</h1>
          <p className="text-gray-600">{items.length} {items.length === 1 ? 'curso' : 'cursos'} no carrinho</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Itens */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const coursePrice = typeof item.course.price === 'number' 
                ? item.course.price 
                : parseFloat(item.course.price) || 0;
              const itemTotal = coursePrice * item.quantity;

              return (
                <motion.div
                  key={item.course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm p-6 flex flex-col sm:flex-row gap-4"
                >
                  <Link to={`/curso/${item.course.id}`} className="flex-shrink-0">
                    <img
                      src={item.course.thumbnail || 'https://via.placeholder.com/200x120'}
                      alt={item.course.title}
                      className="w-full sm:w-40 h-24 object-cover rounded-lg"
                    />
                  </Link>

                  <div className="flex-grow flex flex-col sm:flex-row sm:justify-between gap-4">
                    <div className="flex-grow">
                      <Link to={`/curso/${item.course.id}`}>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-primary-600 transition-colors">
                          {item.course.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600 mb-2">{item.course.instructor}</p>
                      <p className="text-xl font-bold text-primary-600">
                        R$ {coursePrice.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Controle de Quantidade */}
                      <div className="flex items-center space-x-2 border border-gray-300 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.course.id, item.quantity - 1)}
                          className="p-2 hover:bg-gray-100 transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="px-4 py-2 font-medium text-gray-900 min-w-[3rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.course.id, item.quantity + 1)}
                          className="p-2 hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>

                      {/* Preço Total do Item */}
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="text-lg font-bold text-gray-900">
                          R$ {itemTotal.toFixed(2)}
                        </p>
                      </div>

                      {/* Botão Remover */}
                      <button
                        onClick={() => removeFromCart(item.course.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remover do carrinho"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Botão Limpar Carrinho */}
            <div className="flex justify-end">
              <button
                onClick={clearCart}
                className="text-red-600 hover:text-red-700 font-medium text-sm"
              >
                Limpar Carrinho
              </button>
            </div>
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Resumo do Pedido</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} itens)</span>
                  <span>R$ {totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Taxa de processamento</span>
                  <span>Grátis</span>
                </div>
                <div className="border-t pt-4 flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>R$ {totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-center rounded-lg font-bold text-lg hover:shadow-lg transition-all mb-4"
              >
                Finalizar Compra
              </button>

              <Link
                to="/cursos"
                className="block w-full px-6 py-3 bg-gray-100 text-gray-900 text-center rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Continuar Comprando
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CartPage;

