// Utilitários para aplicar layouts de landing pages

export interface LayoutConfig {
  heroLayout?: 'centered' | 'split' | 'minimal';
  heroBackground?: 'gradient' | 'solid' | 'image';
  colorScheme?: 'primary' | 'bold' | 'elegant' | 'vibrant';
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography?: 'bold' | 'elegant' | 'modern';
  spacing?: 'compact' | 'comfortable' | 'spacious';
  ctaStyle?: 'small' | 'medium' | 'large';
  ctaPosition?: 'left' | 'center' | 'right';
}

export function getHeroClasses(layout: LayoutConfig | undefined) {
  if (!layout) {
    return {
      container: 'relative bg-gradient-to-r from-gray-900 to-gray-800 text-white py-24 px-4',
      content: 'max-w-4xl mx-auto text-center relative z-10',
      title: 'text-5xl md:text-6xl font-bold mb-6',
      subtitle: 'text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto',
    };
  }

  const { heroLayout, heroBackground, colors, spacing, typography } = layout;

  // Classes base
  let containerClasses = 'relative text-white px-4';
  let contentClasses = 'mx-auto relative z-10';
  let titleClasses = 'font-bold mb-6';
  let subtitleClasses = 'mb-8 mx-auto';

  // Layout do hero
  switch (heroLayout) {
    case 'minimal':
      containerClasses += ' py-16';
      contentClasses += ' max-w-3xl text-center';
      titleClasses += ' text-4xl md:text-5xl';
      subtitleClasses += ' text-lg md:text-xl text-gray-300 max-w-2xl text-center';
      break;
    case 'split':
      containerClasses += ' py-24';
      contentClasses += ' max-w-6xl grid md:grid-cols-2 gap-8 items-center';
      titleClasses += ' text-4xl md:text-5xl';
      subtitleClasses += ' text-lg md:text-xl text-gray-300';
      break;
    case 'centered':
    default:
      containerClasses += ' py-24';
      contentClasses += ' max-w-4xl text-center';
      titleClasses += ' text-5xl md:text-6xl';
      subtitleClasses += ' text-xl md:text-2xl text-gray-200 max-w-3xl text-center';
      break;
  }

  // Background
  if (heroBackground === 'image') {
    containerClasses += ' bg-cover bg-center bg-no-repeat';
  } else if (heroBackground === 'solid' && colors) {
    containerClasses += ` bg-[${colors.primary}]`;
  } else {
    // gradient padrão
    if (colors) {
      containerClasses += ` bg-gradient-to-r from-[${colors.primary}] to-[${colors.secondary}]`;
    } else {
      containerClasses += ' bg-gradient-to-r from-gray-900 to-gray-800';
    }
  }

  // Spacing
  switch (spacing) {
    case 'compact':
      containerClasses = containerClasses.replace('py-24', 'py-12').replace('py-16', 'py-8');
      break;
    case 'spacious':
      containerClasses = containerClasses.replace('py-24', 'py-32').replace('py-16', 'py-24');
      break;
  }

  // Typography
  switch (typography) {
    case 'elegant':
      titleClasses += ' font-light';
      subtitleClasses += ' font-light';
      break;
    case 'modern':
      titleClasses += ' font-normal';
      subtitleClasses += ' font-normal';
      break;
    case 'bold':
    default:
      titleClasses += ' font-bold';
      subtitleClasses += ' font-medium';
      break;
  }

  return {
    container: containerClasses,
    content: contentClasses,
    title: titleClasses,
    subtitle: subtitleClasses,
  };
}

export function getCTAClasses(layout: LayoutConfig | undefined) {
  if (!layout) {
    return 'inline-block px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105';
  }

  const { ctaStyle, ctaPosition, colors } = layout;
  let classes = 'inline-block text-white rounded-lg font-bold hover:shadow-xl transition-all transform hover:scale-105';

  // Tamanho do CTA
  switch (ctaStyle) {
    case 'small':
      classes += ' px-6 py-2 text-base';
      break;
    case 'large':
      classes += ' px-10 py-5 text-xl';
      break;
    case 'medium':
    default:
      classes += ' px-8 py-4 text-lg';
      break;
  }

  // Posição do CTA
  switch (ctaPosition) {
    case 'left':
      classes += ' mr-auto';
      break;
    case 'right':
      classes += ' ml-auto';
      break;
    case 'center':
    default:
      classes += ' mx-auto block';
      break;
  }

  // Cores do CTA
  if (colors) {
    classes += ` bg-gradient-to-r from-[${colors.primary}] to-[${colors.secondary}]`;
  } else {
    classes += ' bg-gradient-to-r from-primary-600 to-secondary-600';
  }

  return classes;
}

export function getSectionSpacing(layout: LayoutConfig | undefined) {
  if (!layout) return 'py-16';

  switch (layout.spacing) {
    case 'compact':
      return 'py-8';
    case 'spacious':
      return 'py-24';
    case 'comfortable':
    default:
      return 'py-16';
  }
}

