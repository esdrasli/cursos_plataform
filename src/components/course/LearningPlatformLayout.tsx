import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Instagram, Headphones, ArrowLeft, Play, CheckCircle, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { Course, Lesson, Module } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

interface LearningPlatformLayoutProps {
  course: Course;
  progress: number;
  activeLesson: Lesson | null;
  openModules: Set<string>;
  onToggleModule: (moduleId: string) => void;
  onSelectLesson: (lesson: Lesson) => void;
  videoId: string | null;
  onCompleteLesson?: () => void;
  isCompleting?: boolean;
}

const LearningPlatformLayout: React.FC<LearningPlatformLayoutProps> = ({
  course,
  progress,
  activeLesson,
  openModules,
  onToggleModule,
  onSelectLesson,
  videoId,
  onCompleteLesson,
  isCompleting = false
}) => {
  const config = course.platformConfig || {};
  const theme = config.theme || 'light';
  const isDark = theme === 'dark';

  const getIconComponent = (iconName?: string) => {
    switch (iconName) {
      case 'home': return <Home className="w-4 h-4" />;
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'headphones': return <Headphones className="w-4 h-4" />;
      default: return <Home className="w-4 h-4" />;
    }
  };

  const getBackgroundStyle = () => {
    if (config.background?.type === 'image' && config.background.image) {
      return {
        backgroundImage: `url(${config.background.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    } else if (config.background?.type === 'gradient' && config.background.gradient) {
      return {
        background: config.background.gradient
      };
    } else {
      return {
        backgroundColor: config.background?.color || (isDark ? '#1F2937' : '#F9FAFB')
      };
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={getBackgroundStyle()}>
      {/* Header Banner */}
      {config.headerBanner?.show !== false && (() => {
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
          {config.headerBanner?.image && (
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

      {/* Main Layout */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <div 
          className="w-64 flex-shrink-0 flex flex-col border-r"
          style={{
            backgroundColor: config.sidebar?.backgroundColor || (isDark ? '#111827' : '#FFFFFF'),
            color: config.sidebar?.textColor || (isDark ? '#FFFFFF' : '#111827'),
            borderColor: isDark ? '#374151' : '#E5E7EB'
          }}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b" style={{ borderColor: isDark ? '#374151' : '#E5E7EB' }}>
            <Link to="/dashboard" className="flex items-center text-sm mb-3 opacity-70 hover:opacity-100 transition-opacity">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Link>
            {config.sidebar?.logo ? (
              <img src={config.sidebar.logo} alt="Logo" className="h-12 object-contain" />
            ) : (
              <div className="h-12 flex items-center">
                <span className="text-xl font-bold">{config.memberAreaName || course.title}</span>
              </div>
            )}
            {course.customization?.elements?.showProgressBar !== false && (
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3" style={{ backgroundColor: isDark ? '#374151' : '#E5E7EB' }}>
                <div 
                  className="h-2 rounded-full transition-all"
                  style={{ 
                    width: `${progress}%`,
                    backgroundColor: course.customization?.colors?.primary || config.background?.color || '#4F46E5'
                  }}
                />
              </div>
            )}
            <p className="text-xs opacity-70 mt-1">{progress}% completo</p>
          </div>

          {/* Menu Items */}
          <div className="flex-1 p-4 space-y-2">
            {config.sidebar?.menuItems?.filter(item => item.visible !== false).map((item) => (
              <a
                key={item.id}
                href={item.url}
                className="flex items-center space-x-2 p-2 rounded hover:opacity-80 transition-opacity cursor-pointer"
                style={{
                  backgroundColor: isDark ? 'transparent' : undefined
                }}
              >
                {getIconComponent(item.icon)}
                <span>{item.label}</span>
              </a>
            ))}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t" style={{ borderColor: isDark ? '#374151' : '#E5E7EB' }}>
            <div className="flex items-center space-x-2 text-sm opacity-70">
              <span>?</span>
              <span className="truncate">leticiavenancioacade...</span>
              <span>⌃</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <div 
            className="p-4 border-b flex items-center justify-between"
            style={{
              backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
              borderColor: isDark ? '#374151' : '#E5E7EB'
            }}
          >
            <h2 className="text-lg font-semibold" style={{ color: isDark ? '#FFFFFF' : '#111827' }}>
              {activeLesson?.title || 'Selecione uma lição'}
            </h2>
            {activeLesson && !activeLesson.completed && !activeLesson.locked && onCompleteLesson && (
              <button
                onClick={onCompleteLesson}
                disabled={isCompleting}
                className="px-4 py-2 text-white font-semibold text-sm flex items-center space-x-2 disabled:opacity-50 rounded-lg"
                style={{
                  backgroundColor: course.customization?.colors?.button || course.customization?.colors?.primary || '#10B981'
                }}
              >
                <CheckCircle className="w-4 h-4" />
                <span>{isCompleting ? 'Marcando...' : 'Marcar como concluída'}</span>
              </button>
            )}
            {activeLesson?.completed && (
              <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold text-sm flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Concluída</span>
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            {activeLesson ? (
              <>
                <div className="aspect-video bg-black rounded-lg mb-6 shadow-xl">
                  {videoId ? (
                    <iframe
                      className="w-full h-full rounded-lg"
                      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <p>Vídeo não disponível</p>
                    </div>
                  )}
                </div>

                <div 
                  className="rounded-lg shadow-sm p-6"
                  style={{
                    backgroundColor: isDark ? '#374151' : '#FFFFFF',
                    color: isDark ? '#FFFFFF' : '#111827'
                  }}
                >
                  <h3 className="text-xl font-bold mb-4">{activeLesson.title}</h3>
                  <p className="leading-relaxed opacity-80">
                    {activeLesson.title} - Assista a aula completa acima.
                  </p>
                </div>
              </>
            ) : (
              <div 
                className="rounded-lg shadow-sm p-12 text-center"
                style={{
                  backgroundColor: isDark ? '#374151' : '#FFFFFF',
                  color: isDark ? '#FFFFFF' : '#111827'
                }}
              >
                <p className="opacity-70">Selecione uma aula para começar</p>
              </div>
            )}
          </div>
        </div>

        {/* Modules Sidebar */}
        <div 
          className="w-80 flex-shrink-0 border-l overflow-y-auto"
          style={{
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
            borderColor: isDark ? '#374151' : '#E5E7EB'
          }}
        >
          <div className="p-4">
            <h3 className="font-bold text-lg mb-4" style={{ color: isDark ? '#FFFFFF' : '#111827' }}>
              Módulos
            </h3>
            <div className="space-y-2">
              {course.modules.map((module: Module) => (
                <div key={module.id} className="border-b pb-2" style={{ borderColor: isDark ? '#374151' : '#E5E7EB' }}>
                  <button
                    onClick={() => onToggleModule(module.id)}
                    className="w-full text-left flex items-center justify-between p-2 hover:opacity-80 transition-opacity"
                    style={{ color: isDark ? '#FFFFFF' : '#111827' }}
                  >
                    <h4 className="font-semibold text-sm">{module.title}</h4>
                    {openModules.has(module.id) ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  <AnimatePresence>
                    {openModules.has(module.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-1 pl-2">
                          {module.lessons.map((lesson: Lesson) => (
                            <button
                              key={lesson.id}
                              onClick={() => !lesson.locked && onSelectLesson(lesson)}
                              disabled={lesson.locked}
                              className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                                activeLesson?.id === lesson.id
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'hover:bg-gray-100'
                              } ${lesson.locked ? 'opacity-50 cursor-not-allowed' : ''}`}
                              style={{
                                backgroundColor: activeLesson?.id === lesson.id && isDark ? '#4B5563' : undefined,
                                color: isDark ? '#FFFFFF' : undefined
                              }}
                            >
                              <div className="flex items-center space-x-2">
                                {lesson.completed ? (
                                  <CheckCircle className="w-3 h-3 text-green-600" />
                                ) : lesson.locked ? (
                                  <Lock className="w-3 h-3 text-gray-400" />
                                ) : (
                                  <Play className="w-3 h-3 text-gray-400" />
                                )}
                                <span>{lesson.title}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPlatformLayout;

