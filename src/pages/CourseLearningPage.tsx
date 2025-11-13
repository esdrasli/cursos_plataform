import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, CheckCircle, Lock, ChevronDown, ChevronUp, Menu, X, ArrowLeft, BookOpen, FileText, MessageSquare } from 'lucide-react';
import { learningAPI } from '../services/api';
import { Course, Lesson, Module } from '../types';
import { useCourseCustomization } from '../hooks/useCourseCustomization';
import CourseSections from '../components/course/CourseSections';
import LearningPlatformLayout from '../components/course/LearningPlatformLayout';

const CourseLearningPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [openModules, setOpenModules] = useState<Set<string>>(new Set());
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;

      try {
        setIsLoading(true);
        const data = await learningAPI.getCourse(courseId);
        
        // Mapear os dados do backend para o formato do frontend
        const mappedCourse: Course = {
          id: data.course._id,
          title: data.course.title,
          description: data.course.description,
          thumbnail: data.course.thumbnail,
          price: data.course.price,
          originalPrice: data.course.originalPrice,
          instructor: data.course.instructor,
          instructorAvatar: data.course.instructorAvatar,
          rating: data.course.rating,
          totalStudents: data.course.totalStudents,
          duration: data.course.duration,
          level: data.course.level,
          category: data.course.category,
          modules: data.course.modules || [],
          features: data.course.features || [],
          customization: data.course.customization,
          sections: data.course.sections,
          platformConfig: data.course.platformConfig
        };

        setCourse(mappedCourse);
        setProgress(data.enrollment.progress);

        // Abrir primeiro módulo e definir primeira lição ativa
        if (mappedCourse.modules.length > 0) {
          const firstModule = mappedCourse.modules[0];
          setOpenModules(new Set([firstModule.id]));
          
          if (firstModule.lessons.length > 0) {
            const firstUnlockedLesson = firstModule.lessons.find(l => !l.locked) || firstModule.lessons[0];
            setActiveLesson(firstUnlockedLesson);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar curso:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const toggleModule = (moduleId: string) => {
    setOpenModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const handleCompleteLesson = async () => {
    if (!courseId || !activeLesson) return;

    // Encontrar o módulo da lição ativa
    const module = course?.modules.find(m => m.lessons.some(l => l.id === activeLesson.id));
    if (!module) return;

    try {
      setIsCompleting(true);
      await learningAPI.completeLesson({
        courseId,
        moduleId: module.id,
        lessonId: activeLesson.id
      });

      // Atualizar estado local
      if (course) {
        const updatedModules = course.modules.map(m => {
          if (m.id === module.id) {
            const updatedLessons = m.lessons.map(l => {
              if (l.id === activeLesson.id) {
                return { ...l, completed: true, locked: false };
              }
              return l;
            });
            return { ...m, lessons: updatedLessons };
          }
          return m;
        });
        setCourse({ ...course, modules: updatedModules });
        setActiveLesson({ ...activeLesson, completed: true, locked: false });
        
        // Atualizar progresso
        const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
        const completedLessons = updatedModules.reduce((sum, m) => sum + m.lessons.filter(l => l.completed).length, 0);
        setProgress(Math.round((completedLessons / totalLessons) * 100));
      }
    } catch (error) {
      console.error('Erro ao completar lição:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const customization = useCourseCustomization(course?.customization);
  
  // Verificar se há configurações da plataforma
  const hasPlatformConfig = course?.platformConfig && Object.keys(course.platformConfig).length > 0;
  
  // Verificar se há seções personalizadas
  const hasCustomSections = course?.sections && course.sections.length > 0;

  // Extrair videoId se houver lição ativa
  const videoId = activeLesson?.videoUrl ? new URL(activeLesson.videoUrl).searchParams.get('v') : null;

  if (isLoading || !course) {
    return (
      <div 
        className="h-screen w-screen flex items-center justify-center"
        style={{
          backgroundColor: course?.customization?.colors?.background || '#F3F4F6',
        }}
      >
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: course?.customization?.colors?.primary || '#4F46E5' }}
        ></div>
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="bg-white h-full flex flex-col">
      <div className="p-4 border-b">
        <Link to="/dashboard" className="flex items-center text-sm text-gray-600 hover:text-primary-600 mb-3">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Dashboard
        </Link>
        <h2 
          className="font-bold text-xl"
          style={customization.getHeadingStyle()}
        >
          {course.title}
        </h2>
        {course.customization?.elements?.showProgressBar !== false && (
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div 
              className="h-2 rounded-full transition-all"
              style={{ 
                width: `${progress}%`,
                backgroundColor: course.customization?.colors?.primary || '#4F46E5'
              }}
            ></div>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-1">{progress}% completo</p>
      </div>
      <div className="flex-grow overflow-y-auto">
        {course.modules.map((module: Module) => (
          <div key={module.id} className="border-b">
            <button
              onClick={() => toggleModule(module.id)}
              className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50"
            >
              <div>
                <h3 className="font-semibold text-gray-800">{module.title}</h3>
                <p className="text-xs text-gray-500">{module.lessons.length} aulas · {module.duration}</p>
              </div>
              {openModules.has(module.id) ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
            </button>
            <AnimatePresence>
              {openModules.has(module.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  {module.lessons.map((lesson: Lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => !lesson.locked && setActiveLesson(lesson)}
                      disabled={lesson.locked}
                      className={`w-full text-left p-4 pl-6 flex items-start space-x-3 text-sm transition-colors ${
                        activeLesson?.id === lesson.id ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'
                      } ${lesson.locked ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'}`}
                    >
                      {lesson.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : lesson.locked ? (
                        <Lock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Play className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      )}
                      <span>{lesson.title}</span>
                      <span className="ml-auto text-xs text-gray-500 flex-shrink-0">{lesson.duration}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );

  // Se houver configurações da plataforma, usar layout personalizado
  if (hasPlatformConfig) {
    return (
      <LearningPlatformLayout
        course={course}
        progress={progress}
        activeLesson={activeLesson}
        openModules={openModules}
        onToggleModule={toggleModule}
        onSelectLesson={(lesson) => !lesson.locked && setActiveLesson(lesson)}
        videoId={videoId}
        onCompleteLesson={handleCompleteLesson}
        isCompleting={isCompleting}
      />
    );
  }

  // Se houver seções personalizadas, renderizar layout com seções
  if (hasCustomSections) {
    return (
      <div 
        className="min-h-screen"
        style={{
          ...customization.getBackgroundStyle(),
          backgroundColor: course?.customization?.background?.type !== 'image' && course?.customization?.background?.type !== 'gradient'
            ? (course?.customization?.colors?.background || '#F3F4F6')
            : undefined,
        }}
      >
        <CourseSections course={course} sections={course.sections} />
        
        {/* Área de aprendizado abaixo das seções personalizadas */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar de módulos */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
                <h3 className="font-bold text-lg mb-4" style={customization.getHeadingStyle()}>
                  {course.title}
                </h3>
                {course.customization?.elements?.showProgressBar !== false && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className="h-2 rounded-full transition-all"
                      style={{ 
                        width: `${progress}%`,
                        backgroundColor: course.customization?.colors?.primary || '#4F46E5'
                      }}
                    />
                  </div>
                )}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {course.modules.map((module: Module) => (
                    <div key={module.id} className="border-b pb-2">
                      <h4 className="font-semibold text-sm mb-2" style={customization.getHeadingStyle()}>
                        {module.title}
                      </h4>
                      <div className="space-y-1">
                        {module.lessons.map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => setActiveLesson(lesson)}
                            className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                              activeLesson?.id === lesson.id
                                ? 'bg-purple-100 text-purple-700'
                                : 'hover:bg-gray-100'
                            }`}
                            disabled={lesson.locked}
                          >
                            <div className="flex items-center space-x-2">
                              {lesson.completed ? (
                                <CheckCircle className="w-3 h-3 text-green-600" />
                              ) : lesson.locked ? (
                                <Lock className="w-3 h-3 text-gray-400" />
                              ) : (
                                <Play className="w-3 h-3 text-gray-400" />
                              )}
                              <span className={lesson.locked ? 'text-gray-400' : ''}>
                                {lesson.title}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Área principal de vídeo */}
            <div className="lg:col-span-3">
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

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold" style={customization.getHeadingStyle()}>
                        {activeLesson.title}
                      </h2>
                      {activeLesson && !activeLesson.completed && !activeLesson.locked && (
                        <button
                          onClick={handleCompleteLesson}
                          disabled={isCompleting}
                          className={`px-4 py-2 text-white font-semibold text-sm flex items-center space-x-2 disabled:opacity-50 ${customization.getButtonClassName()}`}
                          style={{
                            backgroundColor: course?.customization?.colors?.button || course?.customization?.colors?.primary || '#10B981',
                            color: course?.customization?.colors?.buttonText || '#FFFFFF',
                          }}
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>{isCompleting ? 'Marcando...' : 'Marcar como concluída'}</span>
                        </button>
                      )}
                    </div>
                    <p className="text-gray-700 leading-relaxed" style={customization.getTextStyle()}>
                      {activeLesson.title} - Assista a aula completa acima.
                    </p>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <p className="text-gray-600" style={customization.getTextStyle()}>
                    Selecione uma aula para começar
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Layout padrão (com sidebar e player tradicional)
  return (
    <div 
      className="h-screen w-screen flex"
      style={{
        ...customization.getBackgroundStyle(),
        backgroundColor: course?.customization?.background?.type !== 'image' && course?.customization?.background?.type !== 'gradient'
          ? (course?.customization?.colors?.background || '#F3F4F6')
          : undefined,
      }}
    >
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-80 h-full flex-shrink-0 shadow-lg z-20 absolute lg:relative"
          >
            <SidebarContent />
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col h-full">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 rounded-full hover:bg-gray-100">
            {isSidebarOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
          </button>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-gray-900">{activeLesson?.title || 'Selecione uma lição'}</h1>
          </div>
          {activeLesson && !activeLesson.completed && !activeLesson.locked && (
            <button
              onClick={handleCompleteLesson}
              disabled={isCompleting}
              className={`px-4 py-2 text-white font-semibold text-sm flex items-center space-x-2 disabled:opacity-50 ${customization.getButtonClassName()}`}
              style={{
                backgroundColor: course?.customization?.colors?.button || course?.customization?.colors?.primary || '#10B981',
                color: course?.customization?.colors?.buttonText || '#FFFFFF',
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
        </header>

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
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <p>Vídeo não disponível</p>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex border-b mb-4">
                  <button className="py-3 px-4 text-primary-600 border-b-2 border-primary-600 font-semibold flex items-center space-x-2">
                    <BookOpen className="w-5 h-5" /><span>Sobre a aula</span>
                  </button>
                  <button className="py-3 px-4 text-gray-600 hover:text-gray-900 font-medium flex items-center space-x-2">
                    <FileText className="w-5 h-5" /><span>Recursos</span>
                  </button>
                  <button className="py-3 px-4 text-gray-600 hover:text-gray-900 font-medium flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5" /><span>Comentários</span>
                  </button>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Descrição</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Nesta aula, vamos mergulhar nos conceitos fundamentais do React.js. Você aprenderá sobre o que é o React, por que ele se tornou tão popular e como ele pode ajudar a construir interfaces de usuário modernas e eficientes. Abordaremos a filosofia por trás da biblioteca, incluindo o Virtual DOM, componentes e o fluxo de dados unidirecional. Prepare-se para dar o primeiro passo na sua jornada para se tornar um desenvolvedor React!
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-600">Selecione uma lição para começar</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CourseLearningPage;
