import React, { useState } from 'react';
import { User, Lock, Bell } from 'lucide-react';

const CreatorSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
              <input type="text" defaultValue="Lucas Silva" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
              <input type="email" defaultValue="lucas.silva@creator.com" disabled className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea rows={4} defaultValue="Desenvolvedor Full Stack com mais de 10 anos de experiência..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"></textarea>
            </div>
          </div>
        );
      case 'password':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Senha Atual</label>
              <input type="password" placeholder="********" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nova Senha</label>
              <input type="password" placeholder="Nova senha" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Nova Senha</label>
              <input type="password" placeholder="Confirme a nova senha" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input id="new-sale" name="new-sale" type="checkbox" defaultChecked className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded" />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="new-sale" className="font-medium text-gray-700">Nova Venda</label>
                <p className="text-gray-500">Receber notificação por e-mail quando uma nova venda for realizada.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input id="new-student" name="new-student" type="checkbox" className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded" />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="new-student" className="font-medium text-gray-700">Novo Aluno</label>
                <p className="text-gray-500">Receber notificação quando um novo aluno se inscrever em um de seus cursos.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input id="weekly-summary" name="weekly-summary" type="checkbox" defaultChecked className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded" />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="weekly-summary" className="font-medium text-gray-700">Resumo Semanal</label>
                <p className="text-gray-500">Receber um resumo de suas vendas e atividades toda semana.</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Configurações</h1>
      <div className="bg-white rounded-xl shadow-sm">
        <div className="flex border-b">
          <button onClick={() => setActiveTab('profile')} className={`flex items-center space-x-2 p-4 font-medium ${activeTab === 'profile' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:bg-gray-50'}`}>
            <User className="w-5 h-5" /> <span>Perfil</span>
          </button>
          <button onClick={() => setActiveTab('password')} className={`flex items-center space-x-2 p-4 font-medium ${activeTab === 'password' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Lock className="w-5 h-5" /> <span>Senha</span>
          </button>
          <button onClick={() => setActiveTab('notifications')} className={`flex items-center space-x-2 p-4 font-medium ${activeTab === 'notifications' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Bell className="w-5 h-5" /> <span>Notificações</span>
          </button>
        </div>
        <div className="p-6">
          {renderContent()}
        </div>
        <div className="bg-gray-50 p-4 rounded-b-xl text-right">
          <button className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors">
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatorSettingsPage;
