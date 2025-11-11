import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, LogIn } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { validateEmail, validatePassword } from '../utils/validation';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; name?: string }>({});
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const validateFields = (): boolean => {
    const errors: any = {};
    let isValid = true;

    if (!isLogin) {
      if (!name || name.length < 3) {
        errors.name = 'Nome deve ter pelo menos 3 caracteres';
        isValid = false;
      }
    }

    if (!email || !validateEmail(email)) {
      errors.email = 'Email inválido';
      isValid = false;
    }

    const passwordValidation = validatePassword(password);
    if (!password || !passwordValidation.valid) {
      errors.password = passwordValidation.message || 'Senha inválida';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg"
        >
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-primary-600 to-secondary-600 p-3 rounded-xl mb-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              {isLogin ? 'Acesse sua conta' : 'Crie sua conta'}
            </h2>
            <p className="mt-2 text-gray-600">
              {isLogin ? 'Bem-vindo de volta!' : 'Comece a aprender agora mesmo.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form 
            className="space-y-6"
            onSubmit={async (e) => {
              e.preventDefault();
              setError('');
              setFieldErrors({});
              
              if (!validateFields()) {
                return;
              }

              setIsLoading(true);
              
              try {
                if (isLogin) {
                  await login(email, password);
                  navigate('/dashboard');
                } else {
                  await register(name, email, password);
                  navigate('/dashboard');
                }
              } catch (err: any) {
                setError(err.message || 'Erro ao fazer login. Tente novamente.');
              } finally {
                setIsLoading(false);
              }
            }}
          >
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                <input
                  type="text"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (fieldErrors.name) setFieldErrors({...fieldErrors, name: undefined});
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent ${
                    fieldErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
                )}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors({...fieldErrors, email: undefined});
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent ${
                  fieldErrors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
              <input
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors({...fieldErrors, password: undefined});
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent ${
                  fieldErrors.password ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
              )}
            </div>
            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Lembrar-me</label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-medium text-primary-600 hover:text-primary-500">Esqueceu a senha?</a>
                </div>
              </div>
            )}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogIn className="w-5 h-5 mr-2" />
                {isLoading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
              <button onClick={() => setIsLogin(!isLogin)} className="font-medium text-primary-600 hover:text-primary-500 ml-1">
                {isLogin ? 'Crie uma agora' : 'Faça login'}
              </button>
            </p>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;
