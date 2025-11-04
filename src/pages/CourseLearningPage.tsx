import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, CheckCircle, Lock, ChevronDown, ChevronUp, Menu, X, ArrowLeft, MessageSquare, FileText, BookOpen } from 'lucide-react';
import { mockCourses } from '../data/mockData';
import { Course, Lesson, Module } from '../types';

const CourseLearningPage: React.FC = () => {
  const { courseId } = useParams();
  const course = mockCourses.find(c => c.id === courseId) as Course;
  
  const [activeLesson, setActiveLesson] = useState<Lesson>(course.modules[0].lessons[0]);
  const [openModules, setOpenModules] = useState<Set<string>>(new Set([course.modules[0].id]));
  const [isSidebarOpen, setSidebarOpen] = useState(true);

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

  const videoId = new URL(activeLesson.videoUrl).searchParams.get('v');

  const SidebarContent = () => (
    <div className="bg-white h-full flex flex-col">
      <div className="p-4 border-b">
        <Link to="/dashboard" className="flex items-center text-sm text-gray-600 hover:text-primary-600 mb-3">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Dashboard
        </Link>
        <h2 className="font-bold text-xl text-gray-900">{course.title}</h2>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
          <div className="bg-primary-600 h-2 rounded-full" style={{ width: '45%' }}></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">45% completo</p>
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
                        activeLesson.id === lesson.id ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'
                      } ${lesson.locked ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'}`}
                    >
                      {lesson.completed ? <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" /> : (lesson.locked ? <Lock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" /> : <Play className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />)}
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

  return (
    <div className="h-screen w-screen bg-gray-100 flex">
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
            <h1 className="text-lg font-semibold text-gray-900">{activeLesson.title}</h1>
          </div>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>Marcar como concluída</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="aspect-video bg-black rounded-lg mb-6 shadow-xl">
            <iframe
              className="w-full h-full rounded-lg"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
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
        </div>
      </main>
    </div>
  );
};

export default CourseLearningPage;
