import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, X, Video, ChevronDown, ChevronUp, Palette, Eye } from 'lucide-react';
import { coursesAPI } from '../../services/api';
import { Course, Module, Lesson } from '../../types';
import VideoInput from '../../components/VideoInput';

const CreatorCourseEditor: React.FC = () => {
  const { courseId } = useParams<{ courseId?: string }>();
  const navigate = useNavigate();
  const isNewCourse = !courseId;

  const [courseData, setCourseData] = useState<Partial<Course>>({
    title: '',
    description: '',
    thumbnail: '',
    price: 0,
    originalPrice: undefined,
    category: '',
    level: 'Iniciante',
    duration: '',
    features: [],
    modules: [],
    status: 'draft'
  });

  const [newFeature, setNewFeature] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());
  const [showCustomization, setShowCustomization] = useState(false);

  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  const loadCourse = async () => {
    try {
      setIsLoading(true);
      const course = await coursesAPI.getById(courseId!);
      
      console.log('📚 CreatorCourseEditor - Curso carregado:', {
        courseIdFromParams: courseId,
        courseIdFromResponse: course.id || course._id,
        courseObject: course
      });
      
      // Adaptar dados do backend para o formato esperado
      // Garantir que sempre temos um ID válido (usar courseId do useParams como fallback)
      const courseIdValue = course.id || course._id || courseId;
      
      setCourseData({
        id: courseIdValue,
        title: course.title || '',
        description: course.description || '',
        thumbnail: course.thumbnail || '',
        price: course.price || 0,
        originalPrice: course.originalPrice,
        category: course.category || '',
        level: course.level || 'Iniciante',
        duration: course.duration || '',
        features: course.features || [],
        modules: course.modules || [],
        status: course.status || 'draft',
        customization: course.customization || undefined
      });
      
      console.log('📚 CreatorCourseEditor - courseData atualizado:', {
        courseDataId: courseIdValue,
        courseIdType: typeof courseIdValue
      });
    } catch (error: any) {
      console.error('Erro ao carregar curso:', error);
      setError('Erro ao carregar curso. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof Course, value: any) => {
    setCourseData(prev => ({ ...prev, [field]: value }));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setCourseData(prev => ({
        ...prev,
        features: [...(prev.features || []), newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setCourseData(prev => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index) || []
    }));
  };

  const addModule = () => {
    const newModule: Module = {
      id: `module-${Date.now()}`,
      title: 'Novo Módulo',
      duration: '0 min',
      lessons: []
    };
    setCourseData(prev => ({
      ...prev,
      modules: [...(prev.modules || []), newModule]
    }));
  };

  const updateModule = (index: number, field: keyof Module, value: any) => {
    setCourseData(prev => {
      const modules = [...(prev.modules || [])];
      modules[index] = { ...modules[index], [field]: value };
      return { ...prev, modules };
    });
  };

  const removeModule = (index: number) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules?.filter((_, i) => i !== index) || []
    }));
  };

  const addLesson = (moduleIndex: number) => {
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: 'Nova Aula',
      duration: '0 min',
      videoUrl: ''
    };
    updateModule(moduleIndex, 'lessons', [
      ...(courseData.modules?.[moduleIndex]?.lessons || []),
      newLesson
    ]);
  };

  const updateLesson = (moduleIndex: number, lessonIndex: number, field: keyof Lesson, value: any) => {
    const modules = [...(courseData.modules || [])];
    const lessons = [...(modules[moduleIndex].lessons || [])];
    lessons[lessonIndex] = { ...lessons[lessonIndex], [field]: value };
    modules[moduleIndex] = { ...modules[moduleIndex], lessons };
    setCourseData(prev => ({ ...prev, modules }));
  };

  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    const modules = [...(courseData.modules || [])];
    modules[moduleIndex].lessons = modules[moduleIndex].lessons?.filter((_, i) => i !== lessonIndex) || [];
    setCourseData(prev => ({ ...prev, modules }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações básicas
    if (!courseData.title?.trim()) {
      setError('O título do curso é obrigatório');
      return;
    }
    if (!courseData.description?.trim()) {
      setError('A descrição do curso é obrigatória');
      return;
    }
    if (!courseData.thumbnail?.trim()) {
      setError('A URL da thumbnail é obrigatória');
      return;
    }
    if (!courseData.category?.trim()) {
      setError('A categoria é obrigatória');
      return;
    }

    try {
      setIsSaving(true);
      
      if (isNewCourse) {
        await coursesAPI.create(courseData);
      } else {
        await coursesAPI.update(courseId!, courseData);
      }
      
      navigate('/creator/courses');
    } catch (error: any) {
      console.error('Erro ao salvar curso:', error);
      setError(error.message || 'Erro ao salvar curso. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/creator/courses')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isNewCourse ? 'Criar Novo Curso' : 'Editar Curso'}
          </h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          <span>{isSaving ? 'Salvando...' : 'Salvar Curso'}</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informações Básicas */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-6">Informações Básicas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título do Curso *
              </label>
              <input
                type="text"
                value={courseData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição *
              </label>
              <textarea
                value={courseData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL da Thumbnail *
              </label>
              <input
                type="url"
                value={courseData.thumbnail || ''}
                onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <input
                type="text"
                value={courseData.category || ''}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="Ex: Programação, Design, Marketing"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nível *
              </label>
              <select
                value={courseData.level || 'Iniciante'}
                onChange={(e) => handleInputChange('level', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="Iniciante">Iniciante</option>
                <option value="Intermediário">Intermediário</option>
                <option value="Avançado">Avançado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duração *
              </label>
              <input
                type="text"
                value={courseData.duration || ''}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                placeholder="Ex: 10 horas"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={courseData.price || 0}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço Original (R$) - Opcional
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={courseData.originalPrice || ''}
                onChange={(e) => handleInputChange('originalPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="Para exibir desconto"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={courseData.status || 'draft'}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-6">Recursos do Curso</h2>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
              placeholder="Adicionar recurso (ex: Certificado, Suporte)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={addFeature}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {courseData.features?.map((feature, index) => (
              <span
                key={index}
                className="inline-flex items-center space-x-2 px-3 py-1 bg-primary-100 text-primary-800 rounded-full"
              >
                <span>{feature}</span>
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="hover:text-primary-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Módulos e Aulas */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Módulos e Aulas</h2>
            <button
              type="button"
              onClick={addModule}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Adicionar Módulo</span>
            </button>
          </div>

          <div className="space-y-6">
            {courseData.modules?.map((module, moduleIndex) => (
              <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={module.title}
                      onChange={(e) => updateModule(moduleIndex, 'title', e.target.value)}
                      placeholder="Título do Módulo"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      value={module.duration}
                      onChange={(e) => updateModule(moduleIndex, 'duration', e.target.value)}
                      placeholder="Duração (ex: 2 horas)"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeModule(moduleIndex)}
                    className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {module.lessons?.map((lesson, lessonIndex) => {
                    const lessonKey = `${moduleIndex}-${lessonIndex}`;
                    const isExpanded = expandedLessons.has(lessonKey);
                    
                    return (
                      <div key={lesson.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Cabeçalho da Aula */}
                        <div className="bg-gray-50 p-4 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              const newExpanded = new Set(expandedLessons);
                              if (isExpanded) {
                                newExpanded.delete(lessonKey);
                              } else {
                                newExpanded.add(lessonKey);
                              }
                              setExpandedLessons(newExpanded);
                            }}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-600" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-600" />
                            )}
                          </button>
                          
                          <Video className="w-5 h-5 text-primary-600" />
                          
                          <input
                            type="text"
                            value={lesson.title}
                            onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'title', e.target.value)}
                            placeholder="Título da Aula"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                          />
                          
                          <input
                            type="text"
                            value={lesson.duration}
                            onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'duration', e.target.value)}
                            placeholder="Duração (ex: 10 min)"
                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                          />
                          
                          <button
                            type="button"
                            onClick={() => removeLesson(moduleIndex, lessonIndex)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remover aula"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Área expandida para vídeo */}
                        {isExpanded && (
                          <div className="p-4 bg-white border-t border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                              Vídeo da Aula
                            </label>
                            <VideoInput
                              value={lesson.videoUrl || ''}
                              onChange={(url) => updateLesson(moduleIndex, lessonIndex, 'videoUrl', url)}
                              placeholder="URL do vídeo ou faça upload"
                              courseId={(() => {
                                // Priorizar courseData.id, depois courseId do useParams
                                const finalCourseId = courseData.id || courseId;
                                console.log('📚 CreatorCourseEditor - courseId para VideoInput:', {
                                  courseDataId: courseData.id,
                                  courseIdFromParams: courseId,
                                  finalCourseId,
                                  finalCourseIdType: typeof finalCourseId
                                });
                                return finalCourseId || undefined;
                              })()}
                              lessonNumber={(() => {
                                // Calcular número sequencial da aula somando aulas de módulos anteriores
                                let lessonNumber = 1;
                                for (let i = 0; i < moduleIndex; i++) {
                                  lessonNumber += (courseData.modules?.[i]?.lessons?.length || 0);
                                }
                                lessonNumber += lessonIndex;
                                return lessonNumber;
                              })()}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => addLesson(moduleIndex)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Aula</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Personalização Visual */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Palette className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-bold">Personalização Visual</h2>
            </div>
            <button
              type="button"
              onClick={() => setShowCustomization(!showCustomization)}
              className="flex items-center space-x-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <Eye className="w-5 h-5" />
              <span>{showCustomization ? 'Ocultar' : 'Mostrar'}</span>
            </button>
          </div>

          {showCustomization && (
            <div className="space-y-6">
              {/* Cores */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Cores</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { key: 'primary', label: 'Primária' },
                    { key: 'secondary', label: 'Secundária' },
                    { key: 'accent', label: 'Destaque' },
                    { key: 'background', label: 'Fundo' },
                    { key: 'text', label: 'Texto' },
                    { key: 'button', label: 'Botão' },
                    { key: 'buttonText', label: 'Texto Botão' },
                    { key: 'header', label: 'Cabeçalho' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={courseData.customization?.colors?.[key as keyof typeof courseData.customization.colors] || '#4F46E5'}
                          onChange={(e) => {
                            const newCustomization = {
                              ...courseData.customization,
                              colors: {
                                ...courseData.customization?.colors,
                                [key]: e.target.value
                              }
                            };
                            setCourseData(prev => ({ ...prev, customization: newCustomization }));
                          }}
                          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={courseData.customization?.colors?.[key as keyof typeof courseData.customization.colors] || '#4F46E5'}
                          onChange={(e) => {
                            const newCustomization = {
                              ...courseData.customization,
                              colors: {
                                ...courseData.customization?.colors,
                                [key]: e.target.value
                              }
                            };
                            setCourseData(prev => ({ ...prev, customization: newCustomization }));
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tipografia */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Tipografia</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fonte Principal</label>
                    <select
                      value={courseData.customization?.typography?.fontFamily || 'Inter'}
                      onChange={(e) => {
                        const newCustomization = {
                          ...courseData.customization,
                          typography: {
                            ...courseData.customization?.typography,
                            fontFamily: e.target.value
                          }
                        };
                        setCourseData(prev => ({ ...prev, customization: newCustomization }));
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fonte para Títulos</label>
                    <select
                      value={courseData.customization?.typography?.headingFont || courseData.customization?.typography?.fontFamily || 'Inter'}
                      onChange={(e) => {
                        const newCustomization = {
                          ...courseData.customization,
                          typography: {
                            ...courseData.customization?.typography,
                            headingFont: e.target.value
                          }
                        };
                        setCourseData(prev => ({ ...prev, customization: newCustomization }));
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Layout */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Layout</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estilo do Cabeçalho</label>
                    <select
                      value={courseData.customization?.layout?.headerStyle || 'default'}
                      onChange={(e) => {
                        const newCustomization = {
                          ...courseData.customization,
                          layout: {
                            ...courseData.customization?.layout,
                            headerStyle: e.target.value as any
                          }
                        };
                        setCourseData(prev => ({ ...prev, customization: newCustomization }));
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="default">Padrão</option>
                      <option value="minimal">Minimalista</option>
                      <option value="centered">Centralizado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estilo dos Botões</label>
                    <select
                      value={courseData.customization?.layout?.buttonStyle || 'rounded'}
                      onChange={(e) => {
                        const newCustomization = {
                          ...courseData.customization,
                          layout: {
                            ...courseData.customization?.layout,
                            buttonStyle: e.target.value as any
                          }
                        };
                        setCourseData(prev => ({ ...prev, customization: newCustomization }));
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="rounded">Arredondado</option>
                      <option value="square">Quadrado</option>
                      <option value="pill">Pílula</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Background */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Background</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                    <select
                      value={courseData.customization?.background?.type || 'color'}
                      onChange={(e) => {
                        const newCustomization = {
                          ...courseData.customization,
                          background: {
                            ...courseData.customization?.background,
                            type: e.target.value as any
                          }
                        };
                        setCourseData(prev => ({ ...prev, customization: newCustomization }));
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="color">Cor Sólida</option>
                      <option value="gradient">Gradiente</option>
                      <option value="image">Imagem</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {courseData.customization?.background?.type === 'image' ? 'URL da Imagem' : 
                       courseData.customization?.background?.type === 'gradient' ? 'Gradiente (ex: linear-gradient(45deg, #667eea, #764ba2))' :
                       'Cor'}
                    </label>
                    <input
                      type="text"
                      value={courseData.customization?.background?.value || ''}
                      onChange={(e) => {
                        const newCustomization = {
                          ...courseData.customization,
                          background: {
                            ...courseData.customization?.background,
                            value: e.target.value
                          }
                        };
                        setCourseData(prev => ({ ...prev, customization: newCustomization }));
                      }}
                      placeholder={courseData.customization?.background?.type === 'image' ? 'https://...' : 
                                   courseData.customization?.background?.type === 'gradient' ? 'linear-gradient(...)' :
                                   '#FFFFFF'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Elementos Visuais */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Elementos Visuais</h3>
                <div className="space-y-2">
                  {[
                    { key: 'showProgressBar', label: 'Mostrar Barra de Progresso' },
                    { key: 'showModuleNumbers', label: 'Mostrar Números dos Módulos' },
                    { key: 'showLessonDuration', label: 'Mostrar Duração das Aulas' },
                    { key: 'showInstructorInfo', label: 'Mostrar Informações do Instrutor' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={courseData.customization?.elements?.[key as keyof typeof courseData.customization.elements] !== false}
                        onChange={(e) => {
                          const newCustomization = {
                            ...courseData.customization,
                            elements: {
                              ...courseData.customization?.elements,
                              [key]: e.target.checked
                            }
                          };
                          setCourseData(prev => ({ ...prev, customization: newCustomization }));
                        }}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Logo Personalizado (URL)</label>
                    <input
                      type="text"
                      value={courseData.customization?.elements?.customLogo || ''}
                      onChange={(e) => {
                        const newCustomization = {
                          ...courseData.customization,
                          elements: {
                            ...courseData.customization?.elements,
                            customLogo: e.target.value
                          }
                        };
                        setCourseData(prev => ({ ...prev, customization: newCustomization }));
                      }}
                      placeholder="https://..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-4">Preview</h3>
                <div 
                  className="p-6 rounded-lg"
                  style={{
                    backgroundColor: courseData.customization?.background?.type === 'color' 
                      ? courseData.customization?.background?.value || '#FFFFFF'
                      : 'transparent',
                    backgroundImage: courseData.customization?.background?.type === 'image'
                      ? `url(${courseData.customization?.background?.value})`
                      : courseData.customization?.background?.type === 'gradient'
                      ? courseData.customization?.background?.value
                      : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    fontFamily: courseData.customization?.typography?.fontFamily || 'Inter',
                  }}
                >
                  <h2 
                    className="text-2xl font-bold mb-2"
                    style={{ 
                      color: courseData.customization?.colors?.text || '#1F2937',
                      fontFamily: courseData.customization?.typography?.headingFont || courseData.customization?.typography?.fontFamily || 'Inter'
                    }}
                  >
                    {courseData.title || 'Título do Curso'}
                  </h2>
                  <p 
                    className="mb-4"
                    style={{ color: courseData.customization?.colors?.textSecondary || '#6B7280' }}
                  >
                    Preview da personalização visual
                  </p>
                  <button
                    type="button"
                    className={`px-6 py-3 font-semibold text-white ${
                      courseData.customization?.layout?.buttonStyle === 'pill' ? 'rounded-full' :
                      courseData.customization?.layout?.buttonStyle === 'square' ? 'rounded-none' :
                      'rounded-lg'
                    }`}
                    style={{
                      backgroundColor: courseData.customization?.colors?.button || courseData.customization?.colors?.primary || '#4F46E5',
                      color: courseData.customization?.colors?.buttonText || '#FFFFFF'
                    }}
                  >
                    Botão de Ação
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreatorCourseEditor;


