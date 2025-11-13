import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { brandingAPI } from '../services/api';

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

interface BrandingContextType {
  branding: BrandingData | null;
  loading: boolean;
  loadBranding: (creatorId: string) => Promise<void>;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export const BrandingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [branding, setBranding] = useState<BrandingData | null>(null);
  const [loading, setLoading] = useState(false);

  const loadBranding = async (creatorId: string) => {
    try {
      setLoading(true);
      const data = await brandingAPI.getBrandingByCreator(creatorId);
      setBranding(data);
      
      // Aplicar estilos no documento
      if (data.colors) {
        const root = document.documentElement;
        if (data.colors.primary) root.style.setProperty('--color-primary', data.colors.primary);
        if (data.colors.secondary) root.style.setProperty('--color-secondary', data.colors.secondary);
        if (data.colors.accent) root.style.setProperty('--color-accent', data.colors.accent);
        if (data.colors.background) root.style.setProperty('--color-background', data.colors.background);
        if (data.colors.text) root.style.setProperty('--color-text', data.colors.text);
        if (data.colors.textSecondary) root.style.setProperty('--color-text-secondary', data.colors.textSecondary);
        if (data.colors.border) root.style.setProperty('--color-border', data.colors.border);
      }

      // Aplicar fontes
      if (data.fontFamily) {
        document.body.style.fontFamily = data.fontFamily;
        // Carregar fonte do Google Fonts
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${data.fontFamily.replace(/\s+/g, '+')}:wght@400;500;600;700&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }

      if (data.headingFont && data.headingFont !== data.fontFamily) {
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${data.headingFont.replace(/\s+/g, '+')}:wght@400;500;600;700&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }

      if (data.bodyFont && data.bodyFont !== data.fontFamily) {
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${data.bodyFont.replace(/\s+/g, '+')}:wght@400;500;600;700&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }

      // Aplicar favicon
      if (data.favicon) {
        const existingFavicon = document.querySelector("link[rel='icon']");
        if (existingFavicon) {
          existingFavicon.setAttribute('href', data.favicon);
        } else {
          const link = document.createElement('link');
          link.rel = 'icon';
          link.href = data.favicon;
          document.head.appendChild(link);
        }
      }

      // Aplicar meta tags
      if (data.meta) {
        if (data.meta.title) {
          document.title = data.meta.title;
        }
        if (data.meta.description) {
          const metaDesc = document.querySelector("meta[name='description']");
          if (metaDesc) {
            metaDesc.setAttribute('content', data.meta.description);
          } else {
            const meta = document.createElement('meta');
            meta.name = 'description';
            meta.content = data.meta.description;
            document.head.appendChild(meta);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar branding:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BrandingContext.Provider value={{ branding, loading, loadBranding }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
};

