import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, BookCopy, BarChart2, Users, Settings, GraduationCap, Menu, X, Bell, User, LayoutTemplate, Palette, BarChart3 } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/creator', icon: LayoutDashboard },
  { name: 'Admin', href: '/creator/admin', icon: BarChart3 },
  { name: 'Cursos', href: '/creator/courses', icon: BookCopy },
  { name: 'Vendas', href: '/creator/sales', icon: BarChart2 },
  { name: 'Alunos', href: '/creator/students', icon: Users },
  { name: 'Páginas', href: '/creator/pages', icon: LayoutTemplate },
  { name: 'Personalização', href: '/creator/branding', icon: Palette },
  { name: 'Configurações', href: '/creator/settings', icon: Settings },
];

const SidebarContent: React.FC<{onLinkClick: () => void}> = ({ onLinkClick }) => {
  const location = useLocation();

  return (
    <div className="bg-gray-900 text-gray-300 h-full flex flex-col">
      <div className="p-4 flex items-center space-x-3 border-b border-gray-800">
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-2 rounded-lg">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold text-white">MindX Creator</span>
      </div>
      <nav className="flex-grow p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.href}
                onClick={onLinkClick}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                  location.pathname.startsWith(item.href) && (item.href !== '/creator' || location.pathname === '/creator')
                    ? 'bg-primary-600 text-white font-semibold'
                    : 'hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-800">
        <Link to="/" className="text-sm text-gray-400 hover:text-white">
          Voltar para a plataforma
        </Link>
      </div>
    </div>
  );
};

const CreatorLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  const handleLinkClick = () => {
    if (isSidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-100 flex">
      <div className="hidden lg:block w-64 h-full flex-shrink-0">
        <SidebarContent onLinkClick={() => {}} />
      </div>

      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 z-30"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="lg:hidden w-64 h-full shadow-lg z-40 fixed top-0 left-0"
            >
              <SidebarContent onLinkClick={handleLinkClick} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center z-20 flex-shrink-0">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 rounded-full hover:bg-gray-100">
            {isSidebarOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
          </button>
          <div className="hidden lg:block"></div>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-2">
              <img src="https://i.pravatar.cc/150?img=12" alt="Lucas Silva" className="w-8 h-8 rounded-full" />
              <span className="font-medium text-gray-700 hidden sm:block">Lucas Silva</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CreatorLayout;
