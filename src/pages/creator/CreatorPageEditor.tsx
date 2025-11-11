import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Type, Sparkles, Loader2, CheckCircle, X } from 'lucide-react';
import { creatorAPI, coursesAPI } from '../../services/api';
import { LandingPage } from '../../types';
import { generateLandingPageContent } from '../../services/aiService';
import { getHeroClasses, getCTAClasses } from '../../utils/layoutUtils';

// Componente para preview do Hero com layout aplicado
const HeroPreview: React.FC<{ hero?: any; layout?: any }> = ({ hero, layout }) => {
  const classes = getHeroClasses(layout);
  const ctaClasses = getCTAClasses(layout);
  
  const backgroundStyle: React.CSSProperties = {};
  if (layout?.heroBackground === 'image' && hero?.image) {
    backgroundStyle.backgroundImage = `url(${hero.image})`;
    backgroundStyle.backgroundSize = 'cover';
    backgroundStyle.backgroundPosition = 'center';
    backgroundStyle.backgroundBlendMode = 'overlay';
  } else if (layout?.colors) {
    if (layout.heroBackground === 'solid') {
      backgroundStyle.backgroundColor = layout.colors.primary;
    } else {
      backgroundStyle.background = `linear-gradient(to right, ${layout.colors.primary}, ${layout.colors.secondary})`;
    }
  }

  return (
    <section 
      className={classes.container}
      style={backgroundStyle}
    >
      <div className={classes.content}>
        <h1 className={classes.title}>
          {hero?.title || 'Título da sua página aqui'}
        </h1>
        <p className={classes.subtitle}>
          {hero?.subtitle || 'Descreva o seu curso de forma atraente para convencer seus futuros alunos.'}
        </p>
        <button className={ctaClasses}>
          {hero?.cta || 'Chamada para Ação'}
        </button>
      </div>
    </section>
  );
};

const CreatorPageEditor: React.FC = () => {
  const { pageId } = useParams<{ pageId?: string }>();
  const navigate = useNavigate();
  const isNewPage = pageId === undefined;
  
  const [pageData, setPageData] = useState<Partial<LandingPage>>({
    hero: { title: '', subtitle: '', cta: '', image: '' }
  });
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Estados para IA
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Buscar cursos do criador
        const coursesData = await coursesAPI.getMyCourses();
        setCourses(coursesData);
        
        // Se for edição, buscar dados da página
        if (pageId) {
          const existingPage = await creatorAPI.getLandingPage(pageId);
          setPageData({
            id: existingPage._id,
            title: existingPage.title,
            courseId: existingPage.courseId,
            courseTitle: existingPage.courseTitle,
            hero: existingPage.hero,
            status: existingPage.status,
            lastUpdated: existingPage.lastUpdated
          });
          setSelectedCourseId(existingPage.courseId);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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

  const handleSave = async () => {
    if (!selectedCourseId || !pageData.title || !pageData.hero?.title) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setIsSaving(true);
      
      const pagePayload = {
        title: pageData.title,
        courseId: selectedCourseId,
        hero: pageData.hero,
        sections: pageData.sections || [],
        layout: pageData.layout || null,
        status: pageData.status || 'Rascunho'
      };

      if (isNewPage) {
        await creatorAPI.createLandingPage(pagePayload);
      } else {
        await creatorAPI.updateLandingPage(pageId!, pagePayload);
      }

      navigate('/creator/pages');
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      alert(error.response?.data?.message || 'Erro ao salvar landing page');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) {
      setAiError('Por favor, digite um prompt');
      return;
    }

    const selectedCourse = courses.find(c => (c._id || c.id) === selectedCourseId);
    
    try {
      setIsGenerating(true);
      setAiError('');
      setAiResult(null);

      const result = await generateLandingPageContent({
        prompt: aiPrompt,
        courseTitle: selectedCourse?.title || pageData.title || '',
        courseDescription: selectedCourse?.description || '',
        context: `Criar landing page de vendas para curso online. ${aiPrompt}`,
      });

      setAiResult(result);
    } catch (error: any) {
      console.error('Erro ao gerar com IA:', error);
      setAiError(error.message || 'Erro ao gerar conteúdo. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyAIResult = (applyLayout: boolean = true) => {
    if (!aiResult?.hero) return;

    setPageData(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        title: aiResult.hero.title || prev.hero?.title || '',
        subtitle: aiResult.hero.subtitle || prev.hero?.subtitle || '',
        cta: aiResult.hero.cta || prev.hero?.cta || '',
        image: aiResult.hero.image || prev.hero?.image || '',
      },
      sections: aiResult.sections || prev.sections || [],
      layout: applyLayout && aiResult.layout ? {
        ...prev.layout,
        ...aiResult.layout,
      } : prev.layout,
    }));

    // Fechar resultado da IA após aplicar
    setAiResult(null);
    setAiPrompt('');
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

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
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{isSaving ? 'Salvando...' : 'Salvar'}</span>
          </button>
        </div>
      </header>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden">
        {/* Painel de Controle */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6 overflow-y-auto">
          <h2 className="text-xl font-bold mb-6">Editor</h2>
          <div className="space-y-6">
            {/* Seção de IA */}
            <div className="space-y-4 p-4 border-2 border-primary-200 rounded-lg bg-gradient-to-br from-primary-50 to-purple-50">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-primary-900">Gerador de Conteúdo com IA</h3>
              </div>
              <p className="text-xs text-gray-600">
                Descreva o que você quer na sua landing page e a IA criará o conteúdo para você.
              </p>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Prompt (descreva sua landing page)
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ex: Landing page persuasiva para curso de React, focada em resultados práticos e transformação de carreira..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                  rows={4}
                  disabled={isGenerating}
                />
              </div>

              <button
                onClick={handleGenerateAI}
                disabled={isGenerating || !aiPrompt.trim() || !selectedCourseId}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Gerando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Gerar com IA</span>
                  </>
                )}
              </button>

              {!selectedCourseId && (
                <p className="text-xs text-amber-600">
                  ⚠️ Selecione um curso primeiro para melhor resultado
                </p>
              )}

              {aiError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-700">{aiError}</p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Título da Página</label>
              <input 
                type="text" 
                value={pageData.title || ''} 
                onChange={(e) => setPageData({...pageData, title: e.target.value})} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Curso Associado</label>
              <select 
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-3 py-2 border bg-white border-gray-300 rounded-lg"
                required
              >
                <option value="">Selecione um curso</option>
                {courses.map((c: any) => (
                  <option key={c._id || c.id} value={c._id || c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select 
                value={pageData.status || 'Rascunho'}
                onChange={(e) => setPageData({...pageData, status: e.target.value as 'Publicada' | 'Rascunho'})}
                className="w-full px-3 py-2 border bg-white border-gray-300 rounded-lg"
              >
                <option value="Rascunho">Rascunho</option>
                <option value="Publicada">Publicada</option>
              </select>
            </div>
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold flex items-center">
                <Type className="w-5 h-5 mr-2 text-primary-600"/>
                Seção Principal (Hero)
              </h3>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Título</label>
                <input 
                  type="text" 
                  value={pageData.hero?.title || ''} 
                  onChange={(e) => handleInputChange('hero', 'title', e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Subtítulo</label>
                <textarea 
                  value={pageData.hero?.subtitle || ''} 
                  onChange={(e) => handleInputChange('hero', 'subtitle', e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
                  rows={3}
                  required
                ></textarea>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Texto do Botão (CTA)</label>
                <input 
                  type="text" 
                  value={pageData.hero?.cta || ''} 
                  onChange={(e) => handleInputChange('hero', 'cta', e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">URL da Imagem</label>
                <input 
                  type="text" 
                  value={pageData.hero?.image || ''} 
                  onChange={(e) => handleInputChange('hero', 'image', e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Visualização */}
        <div className="lg:col-span-2 bg-gray-200 rounded-xl p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-full h-full p-4 overflow-y-auto">
            {/* Resultado da IA */}
            {aiResult && (
              <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-purple-50 border-2 border-primary-200 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-primary-600" />
                    <h3 className="font-bold text-primary-900">Resultado da IA</h3>
                  </div>
                  <button
                    onClick={() => setAiResult(null)}
                    className="p-1 hover:bg-white rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Título:</p>
                    <p className="text-sm font-semibold text-gray-900">{aiResult.hero.title}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Subtítulo:</p>
                    <p className="text-sm text-gray-700">{aiResult.hero.subtitle}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">CTA:</p>
                    <p className="text-sm text-primary-600 font-medium">{aiResult.hero.cta}</p>
                  </div>
                  
                  {/* Configurações de Layout */}
                  {aiResult.layout && (
                    <div className="mt-4 pt-4 border-t border-primary-200">
                      <p className="text-xs font-bold text-primary-900 mb-2">🎨 Sugestões de Layout:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white p-2 rounded">
                          <p className="text-gray-500">Layout Hero:</p>
                          <p className="font-semibold text-gray-900 capitalize">{aiResult.layout.heroLayout || 'centered'}</p>
                        </div>
                        <div className="bg-white p-2 rounded">
                          <p className="text-gray-500">Fundo:</p>
                          <p className="font-semibold text-gray-900 capitalize">{aiResult.layout.heroBackground || 'gradient'}</p>
                        </div>
                        <div className="bg-white p-2 rounded">
                          <p className="text-gray-500">Esquema de Cores:</p>
                          <p className="font-semibold text-gray-900 capitalize">{aiResult.layout.colorScheme || 'primary'}</p>
                        </div>
                        <div className="bg-white p-2 rounded">
                          <p className="text-gray-500">Tipografia:</p>
                          <p className="font-semibold text-gray-900 capitalize">{aiResult.layout.typography || 'bold'}</p>
                        </div>
                      </div>
                      {aiResult.layout.colors && (
                        <div className="mt-2 flex items-center space-x-2">
                          <p className="text-xs text-gray-500">Cores:</p>
                          <div className="flex space-x-1">
                            <div 
                              className="w-4 h-4 rounded-full border border-gray-300" 
                              style={{ backgroundColor: aiResult.layout.colors.primary }}
                              title="Cor Primária"
                            />
                            <div 
                              className="w-4 h-4 rounded-full border border-gray-300" 
                              style={{ backgroundColor: aiResult.layout.colors.secondary }}
                              title="Cor Secundária"
                            />
                            <div 
                              className="w-4 h-4 rounded-full border border-gray-300" 
                              style={{ backgroundColor: aiResult.layout.colors.accent }}
                              title="Cor de Destaque"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => handleApplyAIResult(true)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Aplicar Conteúdo + Layout</span>
                  </button>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApplyAIResult(false)}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Apenas Conteúdo
                    </button>
                    <button
                      onClick={() => setAiResult(null)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Descartar
                    </button>
                  </div>
                </div>
              </div>
            )}

            <h3 className="text-center font-semibold text-gray-500 mb-4">
              {aiResult ? 'Pré-visualização do Resultado da IA' : 'Visualização em Tempo Real'}
            </h3>
            
            <HeroPreview 
              hero={aiResult?.hero || pageData.hero} 
              layout={aiResult?.layout || pageData.layout}
            />
            
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-center mb-6">Mais seções aparecerão aqui...</h2>
              {(aiResult?.hero?.image || pageData.hero?.image) && (
                <img 
                  src={aiResult?.hero?.image || pageData.hero?.image} 
                  alt="Preview" 
                  className="w-full rounded-lg object-cover mt-4" 
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorPageEditor;
