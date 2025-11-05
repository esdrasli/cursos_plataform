import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Image as ImageIcon, Type, Palette } from 'lucide-react';
import { mockLandingPages, mockCourses } from '../../data/mockData';
import { LandingPage } from '../../types';

const CreatorPageEditor: React.FC = () => {
  const { pageId } = useParams();
  const isNewPage = pageId === undefined;
  
  const [pageData, setPageData] = useState<Partial<LandingPage>>({
    hero: { title: '', subtitle: '', cta: '', image: '' }
  });

  useEffect(() => {
    if (pageId) {
      const existingPage = mockLandingPages.find(p => p.id === pageId);
      if (existingPage) {
        setPageData(existingPage);
      }
    }
  }, [pageId]);

  const handleInputChange = (section: keyof LandingPage, field: string, value: string) => {
    setPageData(prev => ({
      ...prev,
      [section]: {
        // @ts-ignore
        ...prev[section],
        [field]: value,
      },
    }));
  };

  return (
    <div className="h-full flex flex-col">
      <header className="flex-shrink-0 flex justify-between items-center mb-8">
        <div>
          <Link to="/creator/pages" className="flex items-center text-sm text-gray-500 hover:text-gray-800 mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Páginas
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {isNewPage ? 'Nova Página de Vendas' : `Editando: ${pageData.title}`}
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50">
            <Eye className="w-5 h-5" />
            <span>Visualizar</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700">
            <Save className="w-5 h-5" />
            <span>Salvar</span>
          </button>
        </div>
      </header>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden">
        {/* Painel de Controle */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6 overflow-y-auto">
          <h2 className="text-xl font-bold mb-6">Editor</h2>
          <div className="space-y-6">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Título da Página</label>
              <input type="text" value={pageData.title || ''} onChange={(e) => setPageData({...pageData, title: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Curso Associado</label>
              <select className="w-full px-3 py-2 border bg-white border-gray-300 rounded-lg">
                {mockCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold flex items-center"><Type className="w-5 h-5 mr-2 text-primary-600"/>Seção Principal (Hero)</h3>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Título</label>
                <input type="text" value={pageData.hero?.title || ''} onChange={(e) => handleInputChange('hero', 'title', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Subtítulo</label>
                <textarea value={pageData.hero?.subtitle || ''} onChange={(e) => handleInputChange('hero', 'subtitle', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={3}></textarea>
              </div>
               <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Texto do Botão (CTA)</label>
                <input type="text" value={pageData.hero?.cta || ''} onChange={(e) => handleInputChange('hero', 'cta', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">URL da Imagem</label>
                <input type="text" value={pageData.hero?.image || ''} onChange={(e) => handleInputChange('hero', 'image', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Visualização */}
        <div className="lg:col-span-2 bg-gray-200 rounded-xl p-4 overflow-y-auto">
           <div className="bg-white rounded-lg shadow-lg w-full h-full p-4 overflow-y-auto">
              <h3 className="text-center font-semibold text-gray-500 mb-4">Visualização em Tempo Real</h3>
              <section className="bg-gray-900 text-white py-20 px-8 rounded-lg">
                <h1 className="text-4xl font-bold mb-4">{pageData.hero?.title || 'Título da sua página aqui'}</h1>
                <p className="text-xl text-gray-300 mb-8">{pageData.hero?.subtitle || 'Descreva o seu curso de forma atraente para convencer seus futuros alunos.'}</p>
                <button className="px-8 py-3 bg-primary-600 text-white rounded-lg font-bold text-lg">
                  {pageData.hero?.cta || 'Chamada para Ação'}
                </button>
              </section>
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-center mb-6">Mais seções aparecerão aqui...</h2>
                {pageData.hero?.image && <img src={pageData.hero.image} alt="Preview" className="w-full rounded-lg object-cover mt-4" />}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorPageEditor;
