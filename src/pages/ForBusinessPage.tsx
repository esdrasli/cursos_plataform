import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Users, 
  Award, 
  BarChart3, 
  Shield, 
  HeadphonesIcon,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Target,
  Zap,
  Globe
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ForBusinessPage: React.FC = () => {
  const features = [
    {
      icon: Users,
      title: 'Treinamento em Larga Escala',
      description: 'Capacite toda sua equipe com acesso ilimitado a milhares de cursos'
    },
    {
      icon: BarChart3,
      title: 'Relatórios Detalhados',
      description: 'Acompanhe o progresso e engajamento da sua equipe com dashboards completos'
    },
    {
      icon: Shield,
      title: 'Segurança e Privacidade',
      description: 'Seus dados protegidos com os mais altos padrões de segurança'
    },
    {
      icon: Award,
      title: 'Certificados Corporativos',
      description: 'Emissão automática de certificados para seus colaboradores'
    },
    {
      icon: HeadphonesIcon,
      title: 'Suporte Dedicado',
      description: 'Equipe especializada para ajudar sua empresa a ter sucesso'
    },
    {
      icon: Zap,
      title: 'Implementação Rápida',
      description: 'Comece em minutos com nossa plataforma intuitiva'
    }
  ];

  const benefits = [
    'Acesso ilimitado a todos os cursos da plataforma',
    'Painel administrativo para gerenciar equipes',
    'Relatórios de progresso e certificações',
    'Preços especiais para empresas',
    'Suporte prioritário 24/7',
    'Integração com sistemas corporativos',
    'Conteúdo atualizado constantemente',
    'Treinamentos personalizados sob demanda'
  ];

  const plans = [
    {
      name: 'Starter',
      price: 'R$ 99',
      period: '/mês',
      description: 'Ideal para pequenas equipes',
      features: [
        'Até 10 usuários',
        'Acesso a todos os cursos',
        'Relatórios básicos',
        'Suporte por email',
        'Certificados incluídos'
      ],
      popular: false
    },
    {
      name: 'Business',
      price: 'R$ 299',
      period: '/mês',
      description: 'Para empresas em crescimento',
      features: [
        'Até 50 usuários',
        'Acesso a todos os cursos',
        'Relatórios avançados',
        'Suporte prioritário',
        'Certificados corporativos',
        'Treinamentos personalizados',
        'API de integração'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Sob consulta',
      period: '',
      description: 'Soluções customizadas',
      features: [
        'Usuários ilimitados',
        'Acesso a todos os cursos',
        'Relatórios personalizados',
        'Suporte dedicado 24/7',
        'Certificados personalizados',
        'Conteúdo exclusivo',
        'Integração completa',
        'Gerente de conta dedicado'
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Building2 className="w-16 h-16 mx-auto mb-6" />
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Capacite sua Equipe com Educação de Qualidade
                </h1>
                <p className="text-xl text-primary-100 mb-8">
                  Transforme sua empresa com treinamentos online que desenvolvem habilidades e impulsionam resultados
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/login"
                    className="px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
                  >
                    Solicitar Demonstração
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                  <Link
                    to="#planos"
                    className="px-8 py-3 bg-primary-700 text-white rounded-lg font-semibold hover:bg-primary-800 transition-colors"
                  >
                    Ver Planos
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Estatísticas */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="text-4xl font-bold text-primary-600 mb-2">500+</div>
                <div className="text-gray-600">Empresas Confiam</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="text-4xl font-bold text-primary-600 mb-2">50K+</div>
                <div className="text-gray-600">Profissionais Treinados</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-4xl font-bold text-primary-600 mb-2">1000+</div>
                <div className="text-gray-600">Cursos Disponíveis</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="text-4xl font-bold text-primary-600 mb-2">98%</div>
                <div className="text-gray-600">Taxa de Satisfação</div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Por que escolher */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Por que Escolher Nossa Plataforma?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Soluções completas de treinamento corporativo que geram resultados reais
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow"
                >
                  <div className="bg-gradient-to-r from-primary-500 to-secondary-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefícios */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Benefícios para sua Empresa
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Nossa plataforma foi desenvolvida pensando nas necessidades das empresas modernas. 
                  Oferecemos ferramentas poderosas para capacitar sua equipe e alcançar resultados excepcionais.
                </p>
                <ul className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-3"
                    >
                      <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{benefit}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-white"
              >
                <Target className="w-16 h-16 mb-6" />
                <h3 className="text-2xl font-bold mb-4">Resultados Comprovados</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-6 h-6" />
                    <span>Aumento médio de 35% na produtividade</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Award className="w-6 h-6" />
                    <span>Redução de 40% no tempo de onboarding</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Globe className="w-6 h-6" />
                    <span>Melhoria de 50% na retenção de talentos</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Planos */}
        <section id="planos" className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Planos para Empresas
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Escolha o plano ideal para o tamanho da sua equipe
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white rounded-xl shadow-lg overflow-hidden ${
                    plan.popular ? 'ring-2 ring-primary-600 scale-105' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="bg-primary-600 text-white text-center py-2 text-sm font-semibold">
                      Mais Popular
                    </div>
                  )}
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-6">{plan.description}</p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      {plan.period && <span className="text-gray-600">{plan.period}</span>}
                    </div>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to="/login"
                      className={`block w-full text-center px-6 py-3 rounded-lg font-semibold transition-colors ${
                        plan.popular
                          ? 'bg-primary-600 text-white hover:bg-primary-700'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      Começar Agora
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para Transformar sua Empresa?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Entre em contato conosco e descubra como podemos ajudar sua equipe a alcançar novos patamares
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
              >
                Solicitar Demonstração
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <a
                href="mailto:empresas@mindx.com"
                className="px-8 py-3 bg-primary-700 text-white rounded-lg font-semibold hover:bg-primary-800 transition-colors"
              >
                Falar com Vendas
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ForBusinessPage;

