import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, Monitor, Tablet, Smartphone, Undo, Redo, Code,
  Image, Upload, Palette, Globe, Sun, Moon, Layout, Home, Instagram, Headphones,
  Settings, X, Plus, Trash2, GripVertical
} from 'lucide-react';
import ImageUpload from '../../components/ImageUpload';
import ImageEditor, { ImageConfig } from '../../components/ImageEditor';
import { coursesAPI } from '../../services/api';
import { Course } from '../../types';
import { motion } from 'framer-motion';

interface PlatformConfig {
  // Header/Banner
  headerBanner?: {
    image?: string | ImageConfig;
    title?: string;
    subtitle?: string;
    show?: boolean;
  };
  
  // Logo
  logo?: string;
  logoDark?: string;
  logoSize?: 'small' | 'medium' | 'large';
  
  // Background
  background?: {
    type?: 'color' | 'image' | 'gradient';
    color?: string;
    image?: string;
    gradient?: string;
  };
  
  // Tema
  theme?: 'light' | 'dark';
  
  // Área de membro
  memberAreaName?: string;
  
  // Domínio
  customDomain?: string;
  
  // Sidebar
  sidebar?: {
    logo?: string;
    backgroundColor?: string;
    textColor?: string;
    menuItems?: Array<{
      id: string;
      label: string;
      icon?: string;
      url?: string;
      visible?: boolean;
    }>;
  };
  
  // Imagem de compartilhamento
  shareImage?: string;
  
  // Imagem de capa
  coverImage?: string;
}

const CoursePlatformEditor: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [config, setConfig] = useState<PlatformConfig>({
    headerBanner: {
      show: true,
      title: '',
      subtitle: '',
      image: ''
    },
    theme: 'light',
    memberAreaName: 'Área de Membros',
    sidebar: {
      menuItems: [
        { id: 'home', label: 'Home', icon: 'home', url: '/', visible: true },
        { id: 'instagram', label: 'Instagram', icon: 'instagram', url: '#', visible: true },
        { id: 'support', label: 'Suporte', icon: 'headphones', url: '#', visible: true }
      ]
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'domain' | 'menu'>('general');

  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  const loadCourse = async () => {
    try {
      setIsLoading(true);
      const data = await coursesAPI.getById(courseId!);
      setCourse(data);
      
      // Carregar configurações do curso ou usar padrões
      if (data.platformConfig) {
        setConfig(data.platformConfig);
      } else {
        setConfig({
          ...config,
          headerBanner: {
            show: true,
            title: data.title,
            subtitle: `Por ${data.instructor}`,
            image: data.thumbnail
          },
          memberAreaName: data.title || 'Área de Membros'
        });
      }
    } catch (error: any) {
      console.error('Erro ao carregar curso:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const updatedCourse = {
        ...course,
        platformConfig: config
      };
      await coursesAPI.update(courseId!, updatedCourse);
      setCourse(updatedCourse as Course);
      alert('Configurações salvas com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  const updateConfig = (path: string, value: any) => {
    setConfig(prev => {
      const keys = path.split('.');
      const newConfig = { ...prev };
      let current: any = newConfig;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        } else {
          current[keys[i]] = { ...current[keys[i]] };
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  const addMenuItem = () => {
    const newItem = {
      id: `item-${Date.now()}`,
      label: 'Novo Item',
      icon: 'home',
      url: '#',
      visible: true
    };
    updateConfig('sidebar.menuItems', [...(config.sidebar?.menuItems || []), newItem]);
  };

  const removeMenuItem = (id: string) => {
    updateConfig('sidebar.menuItems', config.sidebar?.menuItems?.filter(item => item.id !== id) || []);
  };

  const updateMenuItem = (id: string, field: string, value: any) => {
    updateConfig('sidebar.menuItems', config.sidebar?.menuItems?.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ) || []);
  };

  const getViewWidth = () => {
    switch (viewMode) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      default: return '100%';
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'home': return <Home className="w-4 h-4" />;
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'headphones': return <Headphones className="w-4 h-4" />;
      default: return <Layout className="w-4 h-4" />;
    }
  };

  if (isLoading || !course) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Top Bar */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between z-50">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/creator/courses')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{course.title}</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Início</span>
          <span className="text-sm text-gray-500">Menu</span>
          <span className="text-sm text-gray-500">Login</span>
          <span className="text-sm text-gray-500 bg-blue-100 px-2 py-1 rounded">Configurações</span>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded">
            <Undo className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded">
            <Redo className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded">
            <Code className="w-4 h-4" />
          </button>
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('desktop')}
              className={`p-2 ${viewMode === 'desktop' ? 'bg-purple-600 text-white' : 'bg-white'}`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('tablet')}
              className={`p-2 border-l ${viewMode === 'tablet' ? 'bg-purple-600 text-white' : 'bg-white'}`}
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`p-2 border-l ${viewMode === 'mobile' ? 'bg-purple-600 text-white' : 'bg-white'}`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50"
          >
            {isSaving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Preview */}
        <div className="flex-1 overflow-y-auto bg-gray-200 p-4">
          <div 
            className="bg-white mx-auto shadow-2xl min-h-full"
            style={{ 
              width: getViewWidth(),
              maxWidth: viewMode === 'desktop' ? '100%' : getViewWidth()
            }}
          >
            {/* Header Banner */}
            {config.headerBanner?.show && (() => {
              const bannerImage = config.headerBanner?.image;
              let imageUrl = '';
              let imageStyle: React.CSSProperties = {
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              };

              if (bannerImage) {
                if (typeof bannerImage === 'string') {
                  imageUrl = bannerImage;
                } else {
                  imageUrl = bannerImage.url;
                  const scale = bannerImage.scale || 1;
                  const position = bannerImage.position || { x: 50, y: 50 };
                  const rotation = bannerImage.rotation || 0;
                  
                  imageStyle = {
                    ...imageStyle,
                    backgroundSize: `${scale * 100}%`,
                    backgroundPosition: `${position.x}% ${position.y}%`,
                    transform: `rotate(${rotation}deg)`,
                    transformOrigin: 'center center'
                  };
                }
              }

              return (
                <div 
                  className="relative w-full h-64 flex items-center justify-center overflow-hidden"
                  style={{
                    backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
                    backgroundColor: imageUrl ? undefined : (config.background?.color || '#7C3AED'),
                    ...imageStyle
                  }}
                >
                  {imageUrl && (
                    <div className="absolute inset-0 bg-black/40" />
                  )}
                  <div className="relative z-10 text-center text-white px-4">
                    {config.headerBanner?.title && (
                      <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ fontFamily: 'cursive' }}>
                        {config.headerBanner.title}
                      </h1>
                    )}
                    {config.headerBanner?.subtitle && (
                      <p className="text-xl opacity-90">{config.headerBanner.subtitle}</p>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Main Content Area */}
            <div className="flex min-h-screen" style={{
              backgroundColor: config.theme === 'dark' ? '#1F2937' : '#F9FAFB',
              color: config.theme === 'dark' ? '#FFFFFF' : '#111827'
            }}>
              {/* Sidebar */}
              <div 
                className="w-64 flex-shrink-0 flex flex-col"
                style={{
                  backgroundColor: config.sidebar?.backgroundColor || (config.theme === 'dark' ? '#111827' : '#FFFFFF'),
                  color: config.sidebar?.textColor || (config.theme === 'dark' ? '#FFFFFF' : '#111827')
                }}
              >
                <div className="p-4 border-b" style={{ borderColor: config.theme === 'dark' ? '#374151' : '#E5E7EB' }}>
                  {config.sidebar?.logo ? (
                    <img src={config.sidebar.logo} alt="Logo" className="h-12 object-contain" />
                  ) : (
                    <div className="h-12 flex items-center">
                      <span className="text-xl font-bold">{config.memberAreaName || course.title}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 p-4 space-y-2">
                  {config.sidebar?.menuItems?.filter(item => item.visible).map((item) => (
                    <a
                      key={item.id}
                      href={item.url}
                      className="flex items-center space-x-2 p-2 rounded hover:bg-gray-800 transition-colors cursor-pointer"
                      style={{
                        backgroundColor: config.theme === 'dark' ? 'transparent' : undefined,
                        color: config.sidebar?.textColor || (config.theme === 'dark' ? '#FFFFFF' : '#111827')
                      }}
                    >
                      {getIconComponent(item.icon || 'home')}
                      <span>{item.label}</span>
                    </a>
                  ))}
                </div>

                <div className="p-4 border-t" style={{ borderColor: config.theme === 'dark' ? '#374151' : '#E5E7EB' }}>
                  <div className="flex items-center space-x-2 text-sm opacity-70">
                    <span>?</span>
                    <span className="truncate">leticiavenancioacade...</span>
                    <span>⌃</span>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-8">
                <div className="max-w-4xl">
                  <h2 className="text-3xl font-bold mb-6">Bem-vindo à {config.memberAreaName || 'Área de Membros'}</h2>
                  
                  {/* Course Modules Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {course.modules?.slice(0, 3).map((module: any, index: number) => (
                      <div 
                        key={module.id || index}
                        className="rounded-lg overflow-hidden shadow-lg cursor-pointer hover:scale-105 transition-transform"
                        style={{
                          backgroundColor: config.theme === 'dark' ? '#374151' : '#FFFFFF'
                        }}
                      >
                        <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                          {course.thumbnail && (
                            <img src={course.thumbnail} alt={module.title} className="w-full h-full object-cover opacity-50" />
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'cursive' }}>
                            {module.title}
                          </h3>
                          {index === 0 && (
                            <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                              <div className="bg-pink-500 h-1 rounded-full" style={{ width: '30%' }}></div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
                    ADICIONAR SEÇÃO
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Settings */}
        <div className="w-80 bg-white border-l overflow-y-auto">
          <div className="p-4">
            <h3 className="font-bold text-lg mb-4">Configurações gerais</h3>
            
            {/* Tabs */}
            <div className="flex border-b mb-4">
              <button
                onClick={() => setActiveTab('general')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'general' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'
                }`}
              >
                Geral
              </button>
              <button
                onClick={() => setActiveTab('appearance')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'appearance' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'
                }`}
              >
                Aparência
              </button>
              <button
                onClick={() => setActiveTab('domain')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'domain' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'
                }`}
              >
                Domínio
              </button>
              <button
                onClick={() => setActiveTab('menu')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'menu' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'
                }`}
              >
                Menu
              </button>
            </div>

            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                {/* Logo Upload */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Logo</label>
                  <ImageUpload
                    value={config.logo}
                    onChange={(url) => updateConfig('logo', url)}
                    placeholder="Selecione do computador ou arraste/solte aqui"
                    maxSize={15}
                    recommendedSize="64x64 pixels"
                  />
                </div>

                {/* Share Image */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2 flex items-center">
                    Imagem para compartilhamento
                    <span className="ml-1 text-gray-400">?</span>
                  </label>
                  <ImageUpload
                    value={config.shareImage}
                    onChange={(url) => updateConfig('shareImage', url)}
                    placeholder="Selecione do computador ou arraste/solte aqui"
                    maxSize={15}
                    recommendedSize="1200x630 pixels"
                  />
                </div>

                {/* Cover Image */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Imagem de capa?</label>
                  <ImageUpload
                    value={config.coverImage}
                    onChange={(url) => updateConfig('coverImage', url)}
                    placeholder="Selecione do computador ou arraste/solte aqui"
                    maxSize={15}
                  />
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                {/* Header Banner */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Banner do Header</label>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={config.headerBanner?.show !== false}
                        onChange={(e) => updateConfig('headerBanner.show', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-xs text-gray-700">Mostrar banner</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Título do banner"
                      value={config.headerBanner?.title || ''}
                      onChange={(e) => updateConfig('headerBanner.title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Subtítulo"
                      value={config.headerBanner?.subtitle || ''}
                      onChange={(e) => updateConfig('headerBanner.subtitle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                    <ImageEditor
                      value={typeof config.headerBanner?.image === 'string' 
                        ? config.headerBanner.image 
                        : (config.headerBanner?.image ? JSON.stringify(config.headerBanner.image) : '')}
                      onChange={(imageConfig) => updateConfig('headerBanner.image', imageConfig)}
                      placeholder="Selecione do computador ou arraste/solte aqui"
                      maxSize={15}
                    />
                  </div>
                </div>

                {/* Theme */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Tema</label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateConfig('theme', 'light')}
                      className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded border ${
                        config.theme === 'light' ? 'border-purple-600 bg-purple-50' : 'border-gray-300'
                      }`}
                    >
                      <Sun className="w-4 h-4" />
                      <span className="text-xs">Claro</span>
                    </button>
                    <button
                      onClick={() => updateConfig('theme', 'dark')}
                      className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded border ${
                        config.theme === 'dark' ? 'border-purple-600 bg-purple-50' : 'border-gray-300'
                      }`}
                    >
                      <Moon className="w-4 h-4" />
                      <span className="text-xs">Escuro</span>
                    </button>
                  </div>
                </div>

                {/* Background */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Background</label>
                  <select
                    value={config.background?.type || 'color'}
                    onChange={(e) => updateConfig('background.type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-2"
                  >
                    <option value="color">Cor</option>
                    <option value="image">Imagem</option>
                    <option value="gradient">Gradiente</option>
                  </select>
                  {config.background?.type === 'color' && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={config.background?.color || '#F9FAFB'}
                        onChange={(e) => updateConfig('background.color', e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.background?.color || '#F9FAFB'}
                        onChange={(e) => updateConfig('background.color', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  )}
                  {config.background?.type === 'image' && (
                    <ImageUpload
                      value={config.background?.image}
                      onChange={(url) => updateConfig('background.image', url)}
                      placeholder="Selecione do computador ou arraste/solte aqui"
                      maxSize={15}
                    />
                  )}
                  {config.background?.type === 'gradient' && (
                    <input
                      type="text"
                      placeholder="linear-gradient(...)"
                      value={config.background?.gradient || ''}
                      onChange={(e) => updateConfig('background.gradient', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                  )}
                </div>

                {/* Sidebar Logo */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Logo na Barra Lateral</label>
                  <ImageUpload
                    value={config.sidebar?.logo}
                    onChange={(url) => updateConfig('sidebar.logo', url)}
                    placeholder="Selecione do computador ou arraste/solte aqui"
                    maxSize={15}
                    recommendedSize="200x60 pixels"
                  />
                </div>

                {/* Sidebar Colors */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Cor de Fundo da Sidebar</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={config.sidebar?.backgroundColor || (config.theme === 'dark' ? '#111827' : '#FFFFFF')}
                      onChange={(e) => updateConfig('sidebar.backgroundColor', e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.sidebar?.backgroundColor || (config.theme === 'dark' ? '#111827' : '#FFFFFF')}
                      onChange={(e) => updateConfig('sidebar.backgroundColor', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Cor do Texto da Sidebar</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={config.sidebar?.textColor || (config.theme === 'dark' ? '#FFFFFF' : '#111827')}
                      onChange={(e) => updateConfig('sidebar.textColor', e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.sidebar?.textColor || (config.theme === 'dark' ? '#FFFFFF' : '#111827')}
                      onChange={(e) => updateConfig('sidebar.textColor', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Domain Tab */}
            {activeTab === 'domain' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2 flex items-center">
                    <Globe className="w-4 h-4 mr-2" />
                    Domínio Personalizado
                  </label>
                  <input
                    type="text"
                    placeholder="exemplo.com"
                    value={config.customDomain || ''}
                    onChange={(e) => updateConfig('customDomain', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Configure o DNS apontando para este servidor
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Nome da Área de Membros</label>
                  <input
                    type="text"
                    placeholder="Área de Membros"
                    value={config.memberAreaName || ''}
                    onChange={(e) => updateConfig('memberAreaName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
            )}

            {/* Menu Tab */}
            {activeTab === 'menu' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-gray-700">Itens do Menu Lateral</label>
                  <button
                    onClick={addMenuItem}
                    className="flex items-center space-x-1 px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Adicionar</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {config.sidebar?.menuItems?.map((item, index) => (
                    <div key={item.id} className="border border-gray-300 rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                          <span className="text-xs font-medium">Item {index + 1}</span>
                        </div>
                        <button
                          onClick={() => removeMenuItem(item.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Label"
                        value={item.label}
                        onChange={(e) => updateMenuItem(item.id, 'label', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs mb-2"
                      />
                      <input
                        type="text"
                        placeholder="URL"
                        value={item.url}
                        onChange={(e) => updateMenuItem(item.id, 'url', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs mb-2"
                      />
                      <select
                        value={item.icon || 'home'}
                        onChange={(e) => updateMenuItem(item.id, 'icon', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs mb-2"
                      >
                        <option value="home">Home</option>
                        <option value="instagram">Instagram</option>
                        <option value="headphones">Suporte</option>
                      </select>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={item.visible !== false}
                          onChange={(e) => updateMenuItem(item.id, 'visible', e.target.checked)}
                          className="w-3 h-3"
                        />
                        <span className="text-xs text-gray-700">Visível</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlatformEditor;

