import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Upload, Palette, Type, Image, Layout, Eye, RefreshCw } from 'lucide-react';
import { brandingAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface BrandingData {
  logo?: string;
  logoDark?: string;
  logoPosition?: 'left' | 'center' | 'right';
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
    textSecondary?: string;
    border?: string;
  };
  fontFamily?: string;
  headingFont?: string;
  bodyFont?: string;
  typography?: {
    h1?: { size?: string; weight?: string; lineHeight?: string };
    h2?: { size?: string; weight?: string; lineHeight?: string };
    h3?: { size?: string; weight?: string; lineHeight?: string };
    body?: { size?: string; weight?: string; lineHeight?: string };
  };
  coursesSection?: {
    layout?: 'grid' | 'list' | 'carousel';
    cardStyle?: 'default' | 'minimal' | 'elevated' | 'bordered';
    showInstructor?: boolean;
    showRating?: boolean;
    showPrice?: boolean;
    showCategory?: boolean;
    cardBorderRadius?: string;
    cardShadow?: string;
  };
  styles?: {
    borderRadius?: string;
    buttonStyle?: 'rounded' | 'square' | 'pill';
    buttonSize?: 'sm' | 'md' | 'lg';
    spacing?: 'compact' | 'comfortable' | 'spacious';
    animation?: boolean;
  };
  favicon?: string;
  meta?: {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
  };
}

const CreatorBrandingPage: React.FC = () => {
  const { user } = useAuth();
  const [branding, setBranding] = useState<BrandingData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'logo' | 'colors' | 'fonts' | 'courses' | 'preview'>('logo');
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    loadBranding();
  }, []);

  const loadBranding = async () => {
    try {
      setIsLoading(true);
      const data = await brandingAPI.getMyBranding();
      setBranding(data);
    } catch (error: any) {
      console.error('Erro ao carregar branding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await brandingAPI.updateBranding(branding);
      alert('Branding salvo com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar branding:', error);
      alert('Erro ao salvar branding');
    } finally {
      setIsSaving(false);
    }
  };

  const handleColorChange = (key: string, value: string) => {
    setBranding(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [key]: value,
      },
    }));
  };

  const handleCoursesSectionChange = (key: string, value: any) => {
    setBranding(prev => ({
      ...prev,
      coursesSection: {
        ...prev.coursesSection,
        [key]: value,
      },
    }));
  };

  const handleStyleChange = (key: string, value: any) => {
    setBranding(prev => ({
      ...prev,
      styles: {
        ...prev.styles,
        [key]: value,
      },
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Personalização da Plataforma</h1>
          <p className="text-gray-600 mt-2">Customize a aparência da sua plataforma de cursos</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="flex border-b overflow-x-auto">
          <button
            onClick={() => setActiveTab('logo')}
            className={`flex items-center space-x-2 px-6 py-4 font-medium whitespace-nowrap ${
              activeTab === 'logo' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Image className="w-5 h-5" />
            <span>Logo</span>
          </button>
          <button
            onClick={() => setActiveTab('colors')}
            className={`flex items-center space-x-2 px-6 py-4 font-medium whitespace-nowrap ${
              activeTab === 'colors' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Palette className="w-5 h-5" />
            <span>Cores</span>
          </button>
          <button
            onClick={() => setActiveTab('fonts')}
            className={`flex items-center space-x-2 px-6 py-4 font-medium whitespace-nowrap ${
              activeTab === 'fonts' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Type className="w-5 h-5" />
            <span>Tipografia</span>
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex items-center space-x-2 px-6 py-4 font-medium whitespace-nowrap ${
              activeTab === 'courses' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Layout className="w-5 h-5" />
            <span>Seção de Cursos</span>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center space-x-2 px-6 py-4 font-medium whitespace-nowrap ${
              activeTab === 'preview' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Eye className="w-5 h-5" />
            <span>Preview</span>
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'logo' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo (Modo Claro)</label>
                <div className="flex items-center space-x-4">
                  {branding.logo && (
                    <img src={branding.logo} alt="Logo" className="h-16 object-contain" />
                  )}
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="URL do logo ou faça upload"
                      value={branding.logo || ''}
                      onChange={(e) => setBranding(prev => ({ ...prev, logo: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Cole a URL da imagem do logo</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo (Modo Escuro) - Opcional</label>
                <div className="flex items-center space-x-4">
                  {branding.logoDark && (
                    <img src={branding.logoDark} alt="Logo Dark" className="h-16 object-contain bg-gray-800 p-2 rounded" />
                  )}
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="URL do logo para modo escuro"
                      value={branding.logoDark || ''}
                      onChange={(e) => setBranding(prev => ({ ...prev, logoDark: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Posição do Logo</label>
                <select
                  value={branding.logoPosition || 'left'}
                  onChange={(e) => setBranding(prev => ({ ...prev, logoPosition: e.target.value as any }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="left">Esquerda</option>
                  <option value="center">Centro</option>
                  <option value="right">Direita</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Favicon</label>
                <input
                  type="text"
                  placeholder="URL do favicon (16x16 ou 32x32)"
                  value={branding.favicon || ''}
                  onChange={(e) => setBranding(prev => ({ ...prev, favicon: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'colors' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cor Primária</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={branding.colors?.primary || '#4F46E5'}
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={branding.colors?.primary || '#4F46E5'}
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cor Secundária</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={branding.colors?.secondary || '#7C3AED'}
                      onChange={(e) => handleColorChange('secondary', e.target.value)}
                      className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={branding.colors?.secondary || '#7C3AED'}
                      onChange={(e) => handleColorChange('secondary', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cor de Destaque</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={branding.colors?.accent || '#EC4899'}
                      onChange={(e) => handleColorChange('accent', e.target.value)}
                      className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={branding.colors?.accent || '#EC4899'}
                      onChange={(e) => handleColorChange('accent', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cor de Fundo</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={branding.colors?.background || '#FFFFFF'}
                      onChange={(e) => handleColorChange('background', e.target.value)}
                      className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={branding.colors?.background || '#FFFFFF'}
                      onChange={(e) => handleColorChange('background', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cor do Texto</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={branding.colors?.text || '#1F2937'}
                      onChange={(e) => handleColorChange('text', e.target.value)}
                      className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={branding.colors?.text || '#1F2937'}
                      onChange={(e) => handleColorChange('text', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cor do Texto Secundário</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={branding.colors?.textSecondary || '#6B7280'}
                      onChange={(e) => handleColorChange('textSecondary', e.target.value)}
                      className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={branding.colors?.textSecondary || '#6B7280'}
                      onChange={(e) => handleColorChange('textSecondary', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Preview das Cores</h3>
                <div className="flex space-x-2">
                  <div
                    className="w-16 h-16 rounded-lg"
                    style={{ backgroundColor: branding.colors?.primary || '#4F46E5' }}
                  />
                  <div
                    className="w-16 h-16 rounded-lg"
                    style={{ backgroundColor: branding.colors?.secondary || '#7C3AED' }}
                  />
                  <div
                    className="w-16 h-16 rounded-lg"
                    style={{ backgroundColor: branding.colors?.accent || '#EC4899' }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fonts' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Família de Fonte Principal</label>
                <select
                  value={branding.fontFamily || 'Inter'}
                  onChange={(e) => setBranding(prev => ({ ...prev, fontFamily: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Raleway">Raleway</option>
                  <option value="Nunito">Nunito</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">A fonte será carregada do Google Fonts</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fonte para Títulos</label>
                <select
                  value={branding.headingFont || branding.fontFamily || 'Inter'}
                  onChange={(e) => setBranding(prev => ({ ...prev, headingFont: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Raleway">Raleway</option>
                  <option value="Nunito">Nunito</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fonte para Corpo do Texto</label>
                <select
                  value={branding.bodyFont || branding.fontFamily || 'Inter'}
                  onChange={(e) => setBranding(prev => ({ ...prev, bodyFont: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Raleway">Raleway</option>
                  <option value="Nunito">Nunito</option>
                </select>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-4">Preview da Tipografia</h3>
                <div style={{ fontFamily: branding.headingFont || branding.fontFamily || 'Inter' }}>
                  <h1 className="text-4xl font-bold mb-2" style={{ color: branding.colors?.text || '#1F2937' }}>
                    Título Principal
                  </h1>
                  <h2 className="text-2xl font-semibold mb-2" style={{ color: branding.colors?.text || '#1F2937' }}>
                    Subtítulo
                  </h2>
                  <p className="text-base" style={{ color: branding.colors?.textSecondary || '#6B7280', fontFamily: branding.bodyFont || branding.fontFamily || 'Inter' }}>
                    Este é um exemplo de texto do corpo. A tipografia escolhida será aplicada em toda a plataforma.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Layout da Seção de Cursos</label>
                <select
                  value={branding.coursesSection?.layout || 'grid'}
                  onChange={(e) => handleCoursesSectionChange('layout', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="grid">Grade (Grid)</option>
                  <option value="list">Lista</option>
                  <option value="carousel">Carrossel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estilo do Card</label>
                <select
                  value={branding.coursesSection?.cardStyle || 'default'}
                  onChange={(e) => handleCoursesSectionChange('cardStyle', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="default">Padrão</option>
                  <option value="minimal">Minimalista</option>
                  <option value="elevated">Elevado (com sombra)</option>
                  <option value="bordered">Com Borda</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Border Radius dos Cards</label>
                <input
                  type="text"
                  placeholder="8px"
                  value={branding.coursesSection?.cardBorderRadius || '8px'}
                  onChange={(e) => handleCoursesSectionChange('cardBorderRadius', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Elementos Visíveis nos Cards</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={branding.coursesSection?.showInstructor !== false}
                      onChange={(e) => handleCoursesSectionChange('showInstructor', e.target.checked)}
                      className="mr-2"
                    />
                    <span>Mostrar Instrutor</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={branding.coursesSection?.showRating !== false}
                      onChange={(e) => handleCoursesSectionChange('showRating', e.target.checked)}
                      className="mr-2"
                    />
                    <span>Mostrar Avaliação</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={branding.coursesSection?.showPrice !== false}
                      onChange={(e) => handleCoursesSectionChange('showPrice', e.target.checked)}
                      className="mr-2"
                    />
                    <span>Mostrar Preço</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={branding.coursesSection?.showCategory !== false}
                      onChange={(e) => handleCoursesSectionChange('showCategory', e.target.checked)}
                      className="mr-2"
                    />
                    <span>Mostrar Categoria</span>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Estilos Gerais</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estilo dos Botões</label>
                  <select
                    value={branding.styles?.buttonStyle || 'rounded'}
                    onChange={(e) => handleStyleChange('buttonStyle', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="rounded">Arredondado</option>
                    <option value="square">Quadrado</option>
                    <option value="pill">Pílula</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Espaçamento</label>
                  <select
                    value={branding.styles?.spacing || 'comfortable'}
                    onChange={(e) => handleStyleChange('spacing', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="compact">Compacto</option>
                    <option value="comfortable">Confortável</option>
                    <option value="spacious">Espaçoso</option>
                  </select>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={branding.styles?.animation !== false}
                    onChange={(e) => handleStyleChange('animation', e.target.checked)}
                    className="mr-2"
                  />
                  <span>Habilitar Animações</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-4">Preview da Plataforma</h3>
                <div className="bg-white rounded-lg p-6 shadow-sm" style={{ fontFamily: branding.fontFamily || 'Inter' }}>
                  {/* Header Preview */}
                  <div className="border-b pb-4 mb-6" style={{ borderColor: branding.colors?.border || '#E5E7EB' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {branding.logo && (
                          <img src={branding.logo} alt="Logo" className="h-10" />
                        )}
                        <span className="text-xl font-bold" style={{ color: branding.colors?.text || '#1F2937' }}>
                          {branding.meta?.title || 'Minha Plataforma'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Courses Section Preview */}
                  <div>
                    <h2 className="text-2xl font-bold mb-4" style={{ color: branding.colors?.text || '#1F2937' }}>
                      Nossos Cursos
                    </h2>
                    <div className={`grid ${branding.coursesSection?.layout === 'list' ? 'grid-cols-1' : 'grid-cols-3'} gap-4`}>
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`p-4 ${
                            branding.coursesSection?.cardStyle === 'elevated' ? 'shadow-lg' :
                            branding.coursesSection?.cardStyle === 'bordered' ? 'border-2' :
                            'border'
                          }`}
                          style={{
                            borderRadius: branding.coursesSection?.cardBorderRadius || '8px',
                            borderColor: branding.colors?.border || '#E5E7EB',
                            backgroundColor: branding.colors?.background || '#FFFFFF',
                          }}
                        >
                          <div className="h-32 bg-gray-200 rounded mb-2"></div>
                          <h3 className="font-semibold mb-1" style={{ color: branding.colors?.text || '#1F2937' }}>
                            Curso Exemplo {i}
                          </h3>
                          {branding.coursesSection?.showPrice !== false && (
                            <p className="font-bold" style={{ color: branding.colors?.primary || '#4F46E5' }}>
                              R$ 99,90
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Button Preview */}
                  <div className="mt-6">
                    <button
                      className={`px-6 py-3 font-semibold text-white ${
                        branding.styles?.buttonStyle === 'pill' ? 'rounded-full' :
                        branding.styles?.buttonStyle === 'square' ? 'rounded-none' :
                        'rounded-lg'
                      }`}
                      style={{
                        backgroundColor: branding.colors?.primary || '#4F46E5',
                      }}
                    >
                      Ver Curso
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorBrandingPage;

