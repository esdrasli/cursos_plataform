import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, Plus, Trash2, X, Eye, Code, Monitor, Tablet, Smartphone,
  Image, Layout, FileText, Video, User, MessageSquare, MousePointerClick,
  GripVertical, Settings, Undo, Redo, ChevronDown
} from 'lucide-react';
import { coursesAPI } from '../../services/api';
import { Course } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

interface Section {
  id: string;
  type: 'banner' | 'modules' | 'features' | 'instructor' | 'testimonials' | 'cta' | 'text' | 'video';
  order: number;
  data: any;
  visible?: boolean;
}

const CourseVisualEditor: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showCode, setShowCode] = useState(false);

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
      setSections(data.sections || []);
    } catch (error: any) {
      console.error('Erro ao carregar curso:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await coursesAPI.update(courseId!, {
        ...course,
        sections
      });
      alert('Curso salvo com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar curso');
    } finally {
      setIsSaving(false);
    }
  };

  const addSection = (type: Section['type']) => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      type,
      order: sections.length,
      data: getDefaultSectionData(type),
      visible: true
    };
    setSections([...sections, newSection]);
    setSelectedSection(newSection.id);
  };

  const getDefaultSectionData = (type: Section['type']) => {
    switch (type) {
      case 'banner':
        return {
          title: course?.title || 'Título do Curso',
          subtitle: course?.description || 'Descrição do curso',
          image: course?.thumbnail || '',
          overlay: true,
          ctaText: 'Começar Agora',
          ctaLink: '#'
        };
      case 'modules':
        return {
          title: 'Módulos do Curso',
          modules: course?.modules || []
        };
      case 'features':
        return {
          title: 'O que você vai aprender',
          features: course?.features || []
        };
      case 'instructor':
        return {
          showAvatar: true,
          showBio: true
        };
      case 'cta':
        return {
          text: 'Garanta sua vaga agora!',
          buttonText: 'Comprar Curso',
          buttonLink: '#'
        };
      case 'text':
        return {
          content: 'Texto personalizado aqui...',
          align: 'left'
        };
      case 'video':
        return {
          videoUrl: '',
          title: 'Vídeo de Apresentação'
        };
      default:
        return {};
    }
  };

  const updateSection = (sectionId: string, data: any) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, data: { ...s.data, ...data } } : s
    ));
  };

  const deleteSection = (sectionId: string) => {
    setSections(sections.filter(s => s.id !== sectionId));
    if (selectedSection === sectionId) {
      setSelectedSection(null);
    }
  };

  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    const index = sections.findIndex(s => s.id === sectionId);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    const newSections = [...sections];
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    newSections[index].order = index;
    newSections[newIndex].order = newIndex;
    setSections(newSections);
  };

  const renderSection = (section: Section) => {
    switch (section.type) {
      case 'banner':
        return (
          <div 
            className="relative w-full h-96 bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center"
            style={{
              backgroundImage: section.data.image ? `url(${section.data.image})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {section.data.overlay && (
              <div className="absolute inset-0 bg-black/40" />
            )}
            <div className="relative z-10 text-center text-white px-4">
              <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{ fontFamily: 'cursive' }}>
                {section.data.title}
              </h1>
              <p className="text-xl mb-6">{section.data.subtitle}</p>
              {section.data.ctaText && (
                <button className="px-8 py-3 bg-white text-purple-600 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                  {section.data.ctaText}
                </button>
              )}
            </div>
            {selectedSection === section.id && (
              <div className="absolute top-2 left-2 flex space-x-2">
                <button className="p-2 bg-white rounded shadow-lg hover:bg-gray-100">
                  <Settings className="w-4 h-4" />
                </button>
                <button className="p-2 bg-white rounded shadow-lg hover:bg-gray-100">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            )}
          </div>
        );
      case 'modules':
        return (
          <div className="py-12 px-4 bg-white">
            <h2 className="text-3xl font-bold text-center mb-8">{section.data.title || 'Módulos do Curso'}</h2>
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
              {(section.data.modules || course?.modules || []).slice(0, 3).map((module: any, index: number) => (
                <div 
                  key={module.id || index}
                  className="relative rounded-lg overflow-hidden shadow-lg cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setSelectedSection(section.id)}
                >
                  <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                    <Image className="w-16 h-16 text-white opacity-50" />
                  </div>
                  <div className="p-4 bg-white">
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
            {selectedSection === section.id && (
              <div className="absolute top-2 right-2 flex space-x-2">
                <button className="p-2 bg-white rounded shadow-lg hover:bg-gray-100">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        );
      case 'features':
        return (
          <div className="py-12 px-4 bg-gray-50">
            <h2 className="text-3xl font-bold text-center mb-8">{section.data.title || 'O que você vai aprender'}</h2>
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
              {(section.data.features || course?.features || []).map((feature: string, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'cta':
        return (
          <div className="py-12 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">{section.data.text}</h2>
            <button className="px-8 py-3 bg-white text-purple-600 rounded-full font-semibold hover:bg-gray-100 transition-colors">
              {section.data.buttonText}
            </button>
          </div>
        );
      default:
        return <div className="p-8 bg-gray-100">Seção {section.type}</div>;
    }
  };

  const getViewWidth = () => {
    switch (viewMode) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      default: return '100%';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!course) {
    return <div>Curso não encontrado</div>;
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
          <span className="text-sm text-gray-500">Configurações</span>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded">
            <Undo className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded">
            <Redo className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setShowCode(!showCode)}
            className={`p-2 rounded ${showCode ? 'bg-purple-100 text-purple-600' : 'hover:bg-gray-100'}`}
          >
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
            {/* Sidebar Navigation */}
            <div className="bg-black text-white p-4">
              <div className="mb-4">
                <div className="bg-gradient-to-r from-amber-700 to-amber-900 p-4 rounded mb-2">
                  <h3 className="text-2xl font-bold" style={{ fontFamily: 'cursive' }}>
                    {course.title}
                  </h3>
                  <p className="text-sm opacity-90">Por {course.instructor}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 p-2 hover:bg-gray-800 rounded cursor-pointer">
                    <Layout className="w-4 h-4" />
                    <span>Home</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 hover:bg-gray-800 rounded cursor-pointer">
                    <Image className="w-4 h-4" />
                    <span>Instagram</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 hover:bg-gray-800 rounded cursor-pointer">
                    <MessageSquare className="w-4 h-4" />
                    <span>Suporte</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sections Preview */}
            {sections.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500 mb-4">Nenhuma seção adicionada ainda</p>
                <button
                  onClick={() => addSection('banner')}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
                >
                  Adicionar Primeira Seção
                </button>
              </div>
            ) : (
              sections
                .filter(s => s.visible !== false)
                .sort((a, b) => a.order - b.order)
                .map((section) => (
                  <div
                    key={section.id}
                    className={`relative ${selectedSection === section.id ? 'ring-2 ring-purple-500' : ''}`}
                    onClick={() => setSelectedSection(section.id)}
                  >
                    {renderSection(section)}
                    {selectedSection === section.id && (
                      <div className="absolute top-2 left-2 flex space-x-2 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveSection(section.id, 'up');
                          }}
                          className="p-2 bg-white rounded shadow-lg hover:bg-gray-100"
                        >
                          <GripVertical className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateSection(section.id, { visible: !section.visible });
                          }}
                          className="p-2 bg-white rounded shadow-lg hover:bg-gray-100"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSection(section.id);
                          }}
                          className="p-2 bg-white rounded shadow-lg hover:bg-gray-100"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
            )}

            {/* Add Section Button */}
            <div className="p-8 text-center">
              <button
                onClick={() => addSection('modules')}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
              >
                ADICIONAR SEÇÃO
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Editor */}
        <div className="w-80 bg-white border-l overflow-y-auto">
          <div className="p-4">
            <h3 className="font-bold text-lg mb-4">Início</h3>
            
            <div className="mb-6">
              <h4 className="font-semibold text-sm text-gray-700 mb-3">Seções</h4>
              
              {/* Banner Section */}
              <div className="mb-2">
                <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <Image className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Banner</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
                <div className="ml-6 mt-1">
                  <div className="flex items-center space-x-2 p-2 text-xs text-gray-600">
                    <Image className="w-3 h-3" />
                    <span>Slide - Slide de imagem</span>
                  </div>
                  <button className="ml-6 flex items-center space-x-2 text-xs text-gray-500 hover:text-gray-700">
                    <Plus className="w-3 h-3" />
                    <span>Adicionar slide (1/3)</span>
                  </button>
                </div>
              </div>

              {/* Modules Section */}
              <div className="mb-2">
                <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <Layout className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Módulos - {course.title}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
                <div className="ml-6 mt-1">
                  <button className="flex items-center space-x-2 text-xs text-gray-500 hover:text-gray-700">
                    <Plus className="w-3 h-3" />
                    <span>Adicionar seção</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Section Editor */}
            {selectedSection && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-sm text-gray-700 mb-3">Editar Seção</h4>
                {(() => {
                  const section = sections.find(s => s.id === selectedSection);
                  if (!section) return null;

                  switch (section.type) {
                    case 'banner':
                      return (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Título</label>
                            <input
                              type="text"
                              value={section.data.title || ''}
                              onChange={(e) => updateSection(selectedSection, { title: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Subtítulo</label>
                            <textarea
                              value={section.data.subtitle || ''}
                              onChange={(e) => updateSection(selectedSection, { subtitle: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                              rows={3}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">URL da Imagem</label>
                            <input
                              type="text"
                              value={section.data.image || ''}
                              onChange={(e) => updateSection(selectedSection, { image: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                              placeholder="https://..."
                            />
                          </div>
                          <div>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={section.data.overlay !== false}
                                onChange={(e) => updateSection(selectedSection, { overlay: e.target.checked })}
                                className="w-4 h-4"
                              />
                              <span className="text-xs text-gray-700">Overlay escuro</span>
                            </label>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Texto do Botão</label>
                            <input
                              type="text"
                              value={section.data.ctaText || ''}
                              onChange={(e) => updateSection(selectedSection, { ctaText: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            />
                          </div>
                        </div>
                      );
                    case 'modules':
                      return (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Título da Seção</label>
                            <input
                              type="text"
                              value={section.data.title || ''}
                              onChange={(e) => updateSection(selectedSection, { title: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <p className="text-xs text-gray-500">
                            Os módulos são carregados automaticamente do curso
                          </p>
                        </div>
                      );
                    default:
                      return <p className="text-xs text-gray-500">Edição não disponível para este tipo de seção</p>;
                  }
                })()}
              </div>
            )}

            {/* Add Section Types */}
            {!selectedSection && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-sm text-gray-700 mb-3">Adicionar Seção</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { type: 'banner', icon: Image, label: 'Banner' },
                    { type: 'modules', icon: Layout, label: 'Módulos' },
                    { type: 'features', icon: FileText, label: 'Features' },
                    { type: 'instructor', icon: User, label: 'Instrutor' },
                    { type: 'cta', icon: MousePointerClick, label: 'CTA' },
                    { type: 'text', icon: FileText, label: 'Texto' },
                    { type: 'video', icon: Video, label: 'Vídeo' },
                  ].map(({ type, icon: Icon, label }) => (
                    <button
                      key={type}
                      onClick={() => addSection(type as Section['type'])}
                      className="p-3 border rounded-lg hover:bg-gray-50 flex flex-col items-center space-y-2"
                    >
                      <Icon className="w-5 h-5 text-gray-600" />
                      <span className="text-xs text-gray-700">{label}</span>
                    </button>
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

export default CourseVisualEditor;

