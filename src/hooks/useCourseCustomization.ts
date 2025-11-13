import { useEffect } from 'react';

interface CourseCustomization {
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
    textSecondary?: string;
    button?: string;
    buttonText?: string;
    header?: string;
    headerText?: string;
  };
  typography?: {
    fontFamily?: string;
    headingFont?: string;
    bodyFont?: string;
    headingSize?: string;
    bodySize?: string;
  };
  layout?: {
    headerStyle?: 'default' | 'minimal' | 'centered';
    buttonStyle?: 'rounded' | 'square' | 'pill';
    cardStyle?: 'default' | 'minimal' | 'elevated';
    sidebarStyle?: 'default' | 'minimal';
  };
  background?: {
    type?: 'color' | 'gradient' | 'image';
    value?: string;
    overlay?: boolean;
  };
  elements?: {
    showProgressBar?: boolean;
    showModuleNumbers?: boolean;
    showLessonDuration?: boolean;
    showInstructorInfo?: boolean;
    customLogo?: string;
  };
}

export const useCourseCustomization = (customization?: CourseCustomization) => {
  useEffect(() => {
    if (!customization) {
      // Cleanup: remover variáveis CSS customizadas se não houver customização
      const root = document.documentElement;
      const vars = [
        '--course-primary',
        '--course-secondary',
        '--course-accent',
        '--course-background',
        '--course-text',
        '--course-text-secondary',
        '--course-button',
        '--course-button-text',
        '--course-header',
        '--course-header-text',
      ];
      vars.forEach(v => root.style.removeProperty(v));
      return;
    }

    const root = document.documentElement;

    // Aplicar cores
    if (customization.colors) {
      if (customization.colors.primary) {
        root.style.setProperty('--course-primary', customization.colors.primary);
      }
      if (customization.colors.secondary) {
        root.style.setProperty('--course-secondary', customization.colors.secondary);
      }
      if (customization.colors.accent) {
        root.style.setProperty('--course-accent', customization.colors.accent);
      }
      if (customization.colors.background) {
        root.style.setProperty('--course-background', customization.colors.background);
      }
      if (customization.colors.text) {
        root.style.setProperty('--course-text', customization.colors.text);
      }
      if (customization.colors.textSecondary) {
        root.style.setProperty('--course-text-secondary', customization.colors.textSecondary);
      }
      if (customization.colors.button) {
        root.style.setProperty('--course-button', customization.colors.button);
      }
      if (customization.colors.buttonText) {
        root.style.setProperty('--course-button-text', customization.colors.buttonText);
      }
      if (customization.colors.header) {
        root.style.setProperty('--course-header', customization.colors.header);
      }
      if (customization.colors.headerText) {
        root.style.setProperty('--course-header-text', customization.colors.headerText);
      }
    }

    // Aplicar fontes
    if (customization.typography?.fontFamily) {
      const fontFamily = customization.typography.fontFamily.replace(/\s+/g, '+');
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${fontFamily}:wght@400;500;600;700&display=swap`;
      link.rel = 'stylesheet';
      if (!document.querySelector(`link[href*="${fontFamily}"]`)) {
        document.head.appendChild(link);
      }
    }

    if (customization.typography?.headingFont && customization.typography.headingFont !== customization.typography.fontFamily) {
      const headingFont = customization.typography.headingFont.replace(/\s+/g, '+');
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${headingFont}:wght@400;500;600;700&display=swap`;
      link.rel = 'stylesheet';
      if (!document.querySelector(`link[href*="${headingFont}"]`)) {
        document.head.appendChild(link);
      }
    }

    // Cleanup
    return () => {
      // Remover variáveis CSS customizadas ao desmontar
      const vars = [
        '--course-primary',
        '--course-secondary',
        '--course-accent',
        '--course-background',
        '--course-text',
        '--course-text-secondary',
        '--course-button',
        '--course-button-text',
        '--course-header',
        '--course-header-text',
      ];
      vars.forEach(v => root.style.removeProperty(v));
    };
  }, [customization]);

  return {
    getButtonClassName: () => {
      if (!customization?.layout?.buttonStyle) return 'rounded-lg';
      switch (customization.layout.buttonStyle) {
        case 'pill':
          return 'rounded-full';
        case 'square':
          return 'rounded-none';
        default:
          return 'rounded-lg';
      }
    },
    getButtonStyle: () => ({
      backgroundColor: customization?.colors?.button || customization?.colors?.primary || '#4F46E5',
      color: customization?.colors?.buttonText || '#FFFFFF',
    }),
    getTextStyle: () => ({
      color: customization?.colors?.text || '#1F2937',
      fontFamily: customization?.typography?.bodyFont || customization?.typography?.fontFamily || 'Inter',
    }),
    getHeadingStyle: () => ({
      color: customization?.colors?.text || '#1F2937',
      fontFamily: customization?.typography?.headingFont || customization?.typography?.fontFamily || 'Inter',
    }),
    getBackgroundStyle: () => {
      if (!customization?.background) return {};
      
      const { type, value } = customization.background;
      
      if (type === 'image' && value) {
        return {
          backgroundImage: `url(${value})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        };
      }
      
      if (type === 'gradient' && value) {
        return {
          background: value,
        };
      }
      
      if (type === 'color' && value) {
        return {
          backgroundColor: value,
        };
      }
      
      return {};
    },
    customization,
  };
};

