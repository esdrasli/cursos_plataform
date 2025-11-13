import express, { Request, Response } from 'express';
import { AppDataSource } from '../config/database.js';
import { AppConfig } from '../entities/AppConfig.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { AuthRequest } from '../types/index.js';

const router = express.Router();

// Buscar todas as configurações (público para algumas, autenticado para outras)
router.get('/', async (req: Request, res: Response) => {
  try {
    const configRepository = AppDataSource.getRepository(AppConfig);
    const configs = await configRepository.find({
      order: { category: 'ASC', key: 'ASC' }
    });

    // Converter para objeto chave-valor
    const configObject: Record<string, any> = {};
    configs.forEach(config => {
      let value: any = config.value;
      
      // Converter baseado no tipo
      switch (config.type) {
        case 'number':
          value = parseFloat(config.value) || 0;
          break;
        case 'boolean':
          value = config.value === 'true' || config.value === '1';
          break;
        case 'json':
          try {
            value = JSON.parse(config.value);
          } catch {
            value = config.value;
          }
          break;
        default:
          value = config.value;
      }
      
      configObject[config.key] = value;
    });

    res.json(configObject);
  } catch (error: any) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({ message: 'Erro ao buscar configurações', error: error.message });
  }
});

// Buscar configuração por chave
router.get('/:key', async (req: Request<{ key: string }>, res: Response) => {
  try {
    const configRepository = AppDataSource.getRepository(AppConfig);
    const config = await configRepository.findOne({
      where: { key: req.params.key }
    });

    if (!config) {
      res.status(404).json({ message: 'Configuração não encontrada' });
      return;
    }

    let value: any = config.value;
    
    // Converter baseado no tipo
    switch (config.type) {
      case 'number':
        value = parseFloat(config.value) || 0;
        break;
      case 'boolean':
        value = config.value === 'true' || config.value === '1';
        break;
      case 'json':
        try {
          value = JSON.parse(config.value);
        } catch {
          value = config.value;
        }
        break;
    }

    res.json({ key: config.key, value, type: config.type, description: config.description });
  } catch (error: any) {
    console.error('Erro ao buscar configuração:', error);
    res.status(500).json({ message: 'Erro ao buscar configuração', error: error.message });
  }
});

// Criar ou atualizar configuração (apenas autenticado)
router.post('/', authenticate, async (req: AuthRequest<{}, {}, { key: string; value: any; type?: string; description?: string; category?: string }>, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const { key, value, type = 'string', description, category = 'general' } = req.body;

    if (!key) {
      res.status(400).json({ message: 'Chave é obrigatória' });
      return;
    }

    const configRepository = AppDataSource.getRepository(AppConfig);
    
    // Verificar se já existe
    let config = await configRepository.findOne({ where: { key } });

    // Converter valor para string baseado no tipo
    let stringValue = '';
    if (type === 'json') {
      stringValue = JSON.stringify(value);
    } else if (type === 'boolean') {
      stringValue = value ? 'true' : 'false';
    } else if (type === 'number') {
      stringValue = String(value);
    } else {
      stringValue = String(value);
    }

    if (config) {
      // Atualizar
      config.value = stringValue;
      config.type = type as any;
      if (description !== undefined) config.description = description;
      if (category !== undefined) config.category = category;
      await configRepository.save(config);
    } else {
      // Criar
      config = configRepository.create({
        key,
        value: stringValue,
        type: type as any,
        description,
        category
      });
      await configRepository.save(config);
    }

    res.json(config);
  } catch (error: any) {
    console.error('Erro ao salvar configuração:', error);
    res.status(500).json({ message: 'Erro ao salvar configuração', error: error.message });
  }
});

// Atualizar configuração (apenas autenticado)
router.put('/:key', authenticate, async (req: AuthRequest<{ key: string }, {}, { value: any; type?: string; description?: string; category?: string }>, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const configRepository = AppDataSource.getRepository(AppConfig);
    const config = await configRepository.findOne({
      where: { key: req.params.key }
    });

    if (!config) {
      res.status(404).json({ message: 'Configuração não encontrada' });
      return;
    }

    const { value, type, description, category } = req.body;

    // Converter valor para string baseado no tipo
    if (value !== undefined) {
      if (type === 'json' || config.type === 'json') {
        config.value = JSON.stringify(value);
      } else if (type === 'boolean' || config.type === 'boolean') {
        config.value = value ? 'true' : 'false';
      } else if (type === 'number' || config.type === 'number') {
        config.value = String(value);
      } else {
        config.value = String(value);
      }
    }

    if (type) config.type = type as any;
    if (description !== undefined) config.description = description;
    if (category !== undefined) config.category = category;

    await configRepository.save(config);

    res.json(config);
  } catch (error: any) {
    console.error('Erro ao atualizar configuração:', error);
    res.status(500).json({ message: 'Erro ao atualizar configuração', error: error.message });
  }
});

// Deletar configuração (apenas autenticado)
router.delete('/:key', authenticate, async (req: AuthRequest<{ key: string }>, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const configRepository = AppDataSource.getRepository(AppConfig);
    const config = await configRepository.findOne({
      where: { key: req.params.key }
    });

    if (!config) {
      res.status(404).json({ message: 'Configuração não encontrada' });
      return;
    }

    await configRepository.remove(config);

    res.json({ message: 'Configuração removida com sucesso' });
  } catch (error: any) {
    console.error('Erro ao deletar configuração:', error);
    res.status(500).json({ message: 'Erro ao deletar configuração', error: error.message });
  }
});

export default router;

