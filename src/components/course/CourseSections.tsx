import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Play } from 'lucide-react';
import { Course } from '../../types';
import { useCourseCustomization } from '../../hooks/useCourseCustomization';

interface Section {
  id: string;
  type: 'banner' | 'modules' | 'features' | 'instructor' | 'testimonials' | 'cta' | 'text' | 'video';
  order: number;
  data: any;
  visible?: boolean;
}

interface CourseSectionsProps {
  course: Course;
  sections?: Section[];
}

const CourseSections: React.FC<CourseSectionsProps> = ({ course, sections = [] }) => {
  const customization = useCourseCustomization(course?.customization);

  if (!sections || sections.length === 0) {
    return null;
  }

  const visibleSections = sections
    .filter(s => s.visible !== false)
    .sort((a, b) => a.order - b.order);

  const renderSection = (section: Section) => {
    switch (section.type) {
      case 'banner':
        return (
          <section
            className="relative w-full min-h-[400px] md:min-h-[500px] flex items-center justify-center"
            style={{
              backgroundImage: section.data.image ? `url(${section.data.image})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: section.data.image ? undefined : (course?.customization?.colors?.primary || '#7C3AED'),
            }}
          >
            {section.data.overlay && (
              <div className="absolute inset-0 bg-black/40" />
            )}
            <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
              <h1 
                className="text-4xl md:text-6xl font-bold mb-4"
                style={{
                  fontFamily: course?.customization?.typography?.headingFont || course?.customization?.typography?.fontFamily || 'inherit',
                  color: section.data.overlay ? '#FFFFFF' : (course?.customization?.colors?.text || '#FFFFFF'),
                }}
              >
                {section.data.title || course.title}
              </h1>
              {section.data.subtitle && (
                <p 
                  className="text-xl md:text-2xl mb-6"
                  style={{
                    color: section.data.overlay ? '#F3F4F6' : (course?.customization?.colors?.textSecondary || '#E5E7EB'),
                    fontFamily: course?.customization?.typography?.bodyFont || course?.customization?.typography?.fontFamily || 'inherit',
                  }}
                >
                  {section.data.subtitle}
                </p>
              )}
              {section.data.ctaText && (
                <Link
                  to={`/checkout/${course.id}`}
                  className={`inline-block px-8 py-3 font-semibold transition-colors ${customization.getButtonClassName()}`}
                  style={customization.getButtonStyle()}
                >
                  {section.data.ctaText}
                </Link>
              )}
            </div>
          </section>
        );

      case 'modules':
        return (
          <section 
            className="py-12 px-4"
            style={{
              backgroundColor: course?.customization?.colors?.background || '#FFFFFF',
            }}
          >
            <div className="max-w-7xl mx-auto">
              {section.data.title && (
                <h2 
                  className="text-3xl md:text-4xl font-bold text-center mb-8"
                  style={customization.getHeadingStyle()}
                >
                  {section.data.title}
                </h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(section.data.modules || course.modules || []).map((module: any, index: number) => (
                  <Link
                    key={module.id || index}
                    to={`/aprender/${course.id}`}
                    className="relative rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform cursor-pointer"
                    style={{
                      backgroundColor: course?.customization?.colors?.background || '#FFFFFF',
                      borderRadius: course?.customization?.coursesSection?.cardBorderRadius || '8px',
                    }}
                  >
                    <div 
                      className="h-48 flex items-center justify-center"
                      style={{
                        background: course?.customization?.colors?.primary 
                          ? `linear-gradient(135deg, ${course.customization.colors.primary}, ${course.customization.colors.secondary || course.customization.colors.primary})`
                          : 'linear-gradient(135deg, #A78BFA, #EC4899)',
                      }}
                    >
                      {course.thumbnail && (
                        <img 
                          src={course.thumbnail} 
                          alt={module.title}
                          className="w-full h-full object-cover opacity-50"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 
                        className="font-bold text-lg mb-2"
                        style={{
                          fontFamily: course?.customization?.typography?.headingFont || course?.customization?.typography?.fontFamily || 'inherit',
                          color: course?.customization?.colors?.text || '#1F2937',
                        }}
                      >
                        {module.title}
                      </h3>
                      {module.lessons && (
                        <p 
                          className="text-sm mb-2"
                          style={{
                            color: course?.customization?.colors?.textSecondary || '#6B7280',
                          }}
                        >
                          {module.lessons.length} aulas
                        </p>
                      )}
                      {index === 0 && course?.customization?.elements?.showProgressBar !== false && (
                        <div 
                          className="w-full rounded-full h-1 mt-2"
                          style={{
                            backgroundColor: course?.customization?.colors?.border || '#E5E7EB',
                          }}
                        >
                          <div 
                            className="h-1 rounded-full"
                            style={{ 
                              width: '30%',
                              backgroundColor: course?.customization?.colors?.primary || '#7C3AED',
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );

      case 'features':
        return (
          <section 
            className="py-12 px-4"
            style={{
              backgroundColor: course?.customization?.colors?.background || '#F9FAFB',
            }}
          >
            <div className="max-w-7xl mx-auto">
              {section.data.title && (
                <h2 
                  className="text-3xl md:text-4xl font-bold text-center mb-8"
                  style={customization.getHeadingStyle()}
                >
                  {section.data.title}
                </h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {(section.data.features || course.features || []).map((feature: string, index: number) => (
                  <div 
                    key={index} 
                    className="flex items-start space-x-3"
                  >
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        backgroundColor: course?.customization?.colors?.primary || '#10B981',
                      }}
                    >
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span 
                      style={{
                        color: course?.customization?.colors?.text || '#374151',
                        fontFamily: course?.customization?.typography?.bodyFont || course?.customization?.typography?.fontFamily || 'inherit',
                      }}
                    >
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'instructor':
        if (course?.customization?.elements?.showInstructorInfo === false) {
          return null;
        }
        return (
          <section 
            className="py-12 px-4"
            style={{
              backgroundColor: course?.customization?.colors?.background || '#FFFFFF',
            }}
          >
            <div className="max-w-4xl mx-auto">
              <h2 
                className="text-3xl font-bold mb-6"
                style={customization.getHeadingStyle()}
              >
                Sobre o Instrutor
              </h2>
              <div className="flex items-start space-x-6 bg-gray-50 p-6 rounded-lg">
                {section.data.showAvatar !== false && (
                  <img
                    src={course.instructorAvatar}
                    alt={course.instructor}
                    className="w-20 h-20 rounded-full"
                  />
                )}
                <div>
                  <h3 
                    className="text-xl font-bold mb-2"
                    style={{
                      color: course?.customization?.colors?.text || '#1F2937',
                      fontFamily: course?.customization?.typography?.headingFont || course?.customization?.typography?.fontFamily || 'inherit',
                    }}
                  >
                    {course.instructor}
                  </h3>
                  {section.data.showBio !== false && (
                    <p 
                      style={{
                        color: course?.customization?.colors?.textSecondary || '#6B7280',
                        fontFamily: course?.customization?.typography?.bodyFont || course?.customization?.typography?.fontFamily || 'inherit',
                      }}
                    >
                      Instrutor especializado com experiência em {course.category}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        );

      case 'cta':
        return (
          <section 
            className="py-12 px-4 text-center"
            style={{
              background: course?.customization?.colors?.primary 
                ? `linear-gradient(135deg, ${course.customization.colors.primary}, ${course.customization.colors.secondary || course.customization.colors.primary})`
                : 'linear-gradient(135deg, #7C3AED, #EC4899)',
              color: '#FFFFFF',
            }}
          >
            <div className="max-w-4xl mx-auto">
              <h2 
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{
                  fontFamily: course?.customization?.typography?.headingFont || course?.customization?.typography?.fontFamily || 'inherit',
                }}
              >
                {section.data.text || 'Garanta sua vaga agora!'}
              </h2>
              <Link
                to={`/checkout/${course.id}`}
                className={`inline-block px-8 py-3 font-semibold transition-colors ${customization.getButtonClassName()}`}
                style={{
                  backgroundColor: course?.customization?.colors?.button || '#FFFFFF',
                  color: course?.customization?.colors?.buttonText || course?.customization?.colors?.primary || '#7C3AED',
                }}
              >
                {section.data.buttonText || 'Comprar Curso'}
              </Link>
            </div>
          </section>
        );

      case 'text':
        return (
          <section 
            className="py-12 px-4"
            style={{
              backgroundColor: course?.customization?.colors?.background || '#FFFFFF',
            }}
          >
            <div 
              className="max-w-4xl mx-auto"
              style={{
                textAlign: section.data.align || 'left',
              }}
            >
              <div 
                className="prose prose-lg max-w-none"
                style={{
                  color: course?.customization?.colors?.text || '#374151',
                  fontFamily: course?.customization?.typography?.bodyFont || course?.customization?.typography?.fontFamily || 'inherit',
                }}
                dangerouslySetInnerHTML={{ __html: section.data.content || '' }}
              />
            </div>
          </section>
        );

      case 'video':
        if (!section.data.videoUrl) return null;
        const videoId = section.data.videoUrl.includes('youtube.com') || section.data.videoUrl.includes('youtu.be')
          ? new URL(section.data.videoUrl).searchParams.get('v') || section.data.videoUrl.split('/').pop()
          : null;
        
        return (
          <section 
            className="py-12 px-4"
            style={{
              backgroundColor: course?.customization?.colors?.background || '#F9FAFB',
            }}
          >
            <div className="max-w-4xl mx-auto">
              {section.data.title && (
                <h2 
                  className="text-3xl font-bold mb-6 text-center"
                  style={customization.getHeadingStyle()}
                >
                  {section.data.title}
                </h2>
              )}
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                {videoId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-16 h-16 text-white" />
                  </div>
                )}
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {visibleSections.map((section) => (
        <div key={section.id}>
          {renderSection(section)}
        </div>
      ))}
    </>
  );
};

export default CourseSections;

