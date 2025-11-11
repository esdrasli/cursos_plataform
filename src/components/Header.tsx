import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Search, User, ShoppingCart, GraduationCap, Edit, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { getTotalItems } = useCart();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-2 rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              MindX
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/cursos" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Cursos
            </Link>
            <Link to="/categorias" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Categorias
            </Link>
            <Link to="/empresas" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Para Empresas
            </Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Search className="w-5 h-5 text-gray-600" />
            </button>
            <Link
              to="/carrinho"
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-gray-600" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {getTotalItems() > 9 ? '9+' : getTotalItems()}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/creator" className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200">
                  <Edit className="w-5 h-5" />
                  <span className="font-medium">Modo Criador</span>
                </Link>
                <Link to="/affiliate" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium">
                  Afiliados
                </Link>
                <Link to="/dashboard" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <span className="font-medium">{user?.name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sair</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <User className="w-5 h-5" />
                  <span className="font-medium">Entrar</span>
                </Link>
                <Link to="/dashboard" className="px-6 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-medium hover:shadow-lg transition-all">
                  Minha Área
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t"
          >
            <div className="px-4 py-4 space-y-3">
              <Link to="/cursos" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                Cursos
              </Link>
              <Link to="/carrinho" className="relative block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                Carrinho
                {getTotalItems() > 0 && (
                  <span className="ml-2 bg-primary-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
                    {getTotalItems()}
                  </span>
                )}
              </Link>
              <Link to="/categorias" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                Categorias
              </Link>
              <Link to="/empresas" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                Para Empresas
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/creator" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                    Modo Criador
                  </Link>
                  <Link to="/affiliate" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                    Afiliados
                  </Link>
                  <Link to="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                    Minha Área
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-left"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                    Entrar
                  </Link>
                  <Link to="/dashboard" className="block px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg text-center font-medium">
                    Minha Área
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
