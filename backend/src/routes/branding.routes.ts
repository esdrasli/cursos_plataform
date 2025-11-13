import express, { Request, Response } from 'express';
import { AppDataSource } from '../config/database.js';
import { Branding } from '../entities/Branding.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { AuthRequest } from '../types/index.js';

const router = express.Router();

// Obter branding do criador (público - para exibir na plataforma)
router.get('/creator/:creatorId', async (req: Request<{ creatorId: string }>, res: Response) => {
  try {
    const brandingRepository = AppDataSource.getRepository(Branding);
    const branding = await brandingRepository.findOne({
      where: { creatorId: req.params.creatorId },
      relations: ['creator']
    });

    if (!branding) {
      // Retornar valores padrão se não houver branding configurado
      res.json({
        logo: null,
        colors: {
          primary: '#4F46E5',
          secondary: '#7C3AED',
          accent: '#EC4899',
          background: '#FFFFFF',
          text: '#1F2937',
        },
        fontFamily: 'Inter',
        coursesSection: {
          layout: 'grid',
          cardStyle: 'default',
        },
      });
      return;
    }

    res.json(branding);
  } catch (error: any) {
    console.error('Erro ao buscar branding:', error);
    res.status(500).json({ message: 'Erro ao buscar branding', error: error.message });
  }
});

// Obter branding do criador autenticado
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const brandingRepository = AppDataSource.getRepository(Branding);
    let branding = await brandingRepository.findOne({
      where: { creatorId: req.user.id },
      relations: ['creator']
    });

    if (!branding) {
      // Criar branding padrão se não existir
      branding = brandingRepository.create({
        creatorId: req.user.id,
        logoPosition: 'left',
        colors: {
          primary: '#4F46E5',
          secondary: '#7C3AED',
          accent: '#EC4899',
          background: '#FFFFFF',
          text: '#1F2937',
        },
        fontFamily: 'Inter',
        coursesSection: {
          layout: 'grid',
          cardStyle: 'default',
          showInstructor: true,
          showRating: true,
          showPrice: true,
          showCategory: true,
        },
        styles: {
          borderRadius: '8px',
          buttonStyle: 'rounded',
          buttonSize: 'md',
          spacing: 'comfortable',
          animation: true,
        },
      });
      await brandingRepository.save(branding);
    }

    res.json(branding);
  } catch (error: any) {
    console.error('Erro ao buscar branding:', error);
    res.status(500).json({ message: 'Erro ao buscar branding', error: error.message });
  }
});

// Criar ou atualizar branding
router.post('/me', authenticate, async (req: AuthRequest<{}, {}, Partial<Branding>>, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const brandingRepository = AppDataSource.getRepository(Branding);
    let branding = await brandingRepository.findOne({
      where: { creatorId: req.user.id }
    });

    const {
      logo,
      logoDark,
      logoPosition,
      colors,
      fontFamily,
      headingFont,
      bodyFont,
      typography,
      coursesSection,
      styles,
      favicon,
      meta,
    } = req.body;

    if (branding) {
      // Atualizar
      if (logo !== undefined) branding.logo = logo;
      if (logoDark !== undefined) branding.logoDark = logoDark;
      if (logoPosition !== undefined) branding.logoPosition = logoPosition;
      if (colors !== undefined) branding.colors = colors;
      if (fontFamily !== undefined) branding.fontFamily = fontFamily;
      if (headingFont !== undefined) branding.headingFont = headingFont;
      if (bodyFont !== undefined) branding.bodyFont = bodyFont;
      if (typography !== undefined) branding.typography = typography;
      if (coursesSection !== undefined) branding.coursesSection = coursesSection;
      if (styles !== undefined) branding.styles = styles;
      if (favicon !== undefined) branding.favicon = favicon;
      if (meta !== undefined) branding.meta = meta;

      await brandingRepository.save(branding);
    } else {
      // Criar novo
      branding = brandingRepository.create({
        creatorId: req.user.id,
        logo,
        logoDark,
        logoPosition: logoPosition || 'left',
        colors: colors || {
          primary: '#4F46E5',
          secondary: '#7C3AED',
          accent: '#EC4899',
          background: '#FFFFFF',
          text: '#1F2937',
        },
        fontFamily: fontFamily || 'Inter',
        headingFont,
        bodyFont,
        typography,
        coursesSection: coursesSection || {
          layout: 'grid',
          cardStyle: 'default',
        },
        styles: styles || {
          borderRadius: '8px',
          buttonStyle: 'rounded',
          buttonSize: 'md',
          spacing: 'comfortable',
        },
        favicon,
        meta,
      });
      await brandingRepository.save(branding);
    }

    res.json(branding);
  } catch (error: any) {
    console.error('Erro ao salvar branding:', error);
    res.status(500).json({ message: 'Erro ao salvar branding', error: error.message });
  }
});

// Upload de logo (apenas URL por enquanto - em produção, implementar upload de arquivo)
router.post('/me/logo', authenticate, async (req: AuthRequest<{}, {}, { logoUrl: string; type?: 'light' | 'dark' }>, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const { logoUrl, type = 'light' } = req.body;

    if (!logoUrl) {
      res.status(400).json({ message: 'URL do logo é obrigatória' });
      return;
    }

    const brandingRepository = AppDataSource.getRepository(Branding);
    let branding = await brandingRepository.findOne({
      where: { creatorId: req.user.id }
    });

    if (!branding) {
      branding = brandingRepository.create({
        creatorId: req.user.id,
        logoPosition: 'left',
      });
    }

    if (type === 'dark') {
      branding.logoDark = logoUrl;
    } else {
      branding.logo = logoUrl;
    }

    await brandingRepository.save(branding);

    res.json(branding);
  } catch (error: any) {
    console.error('Erro ao salvar logo:', error);
    res.status(500).json({ message: 'Erro ao salvar logo', error: error.message });
  }
});

export default router;

