# Migração de Configurações Mockadas para Banco de Dados

## ✅ Mudanças Implementadas

### 1. Entidade AppConfig
- ✅ Criada entidade `AppConfig` para armazenar configurações no banco
- ✅ Suporta tipos: `string`, `number`, `boolean`, `json`
- ✅ Categorização por `category` (ai, payment, affiliate, etc.)
- ✅ Chave única para cada configuração

### 2. Rotas de Configuração
- ✅ `GET /api/config` - Buscar todas as configurações
- ✅ `GET /api/config/:key` - Buscar configuração específica
- ✅ `POST /api/config` - Criar/atualizar configuração (autenticado)
- ✅ `PUT /api/config/:key` - Atualizar configuração (autenticado)
- ✅ `DELETE /api/config/:key` - Deletar configuração (autenticado)

### 3. Seed de Configurações
- ✅ Adicionado seed de configurações padrão no `seed.ts`
- ✅ Configurações iniciais:
  - `colorPalettes` (JSON) - Paletas de cores para layouts
  - `defaultHeroImage` (string) - Imagem padrão para hero sections
  - `defaultBenefits` (string) - Benefícios padrão para cursos

### 4. Backend - Geração de IA
- ✅ Função `generateSmartContent` agora busca configurações do banco
- ✅ Usa `colorPalettes` do banco ao invés de valores hardcoded
- ✅ Usa `defaultHeroImage` do banco
- ✅ Usa `defaultBenefits` do banco
- ✅ Fallback para valores padrão se não encontrar no banco

### 5. Frontend - API de Configurações
- ✅ Adicionado `configAPI` em `api.ts`
- ✅ Métodos disponíveis:
  - `getAll()` - Buscar todas as configurações
  - `getByKey(key)` - Buscar por chave
  - `set(key, value, type, description, category)` - Criar/atualizar
  - `update(key, value, type, description, category)` - Atualizar
  - `delete(key)` - Deletar

## 📋 Configurações Padrão Criadas

### Categoria: `ai`
1. **colorPalettes** (json)
   - Paletas de cores para layouts de landing pages
   - Inclui: primary, bold, elegant, vibrant

2. **defaultHeroImage** (string)
   - Imagem padrão para hero sections
   - URL: `https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=450&fit=crop`

3. **defaultBenefits** (string)
   - Benefícios padrão para cursos
   - Texto: `Acesso vitalício • Certificado reconhecido • Suporte exclusivo • Atualizações gratuitas • Projetos práticos`

## 🔄 Como Usar

### No Backend
As configurações são automaticamente buscadas quando a IA gera conteúdo. Não é necessário fazer nada adicional.

### No Frontend
```typescript
import { configAPI } from './services/api';

// Buscar todas as configurações
const configs = await configAPI.getAll();

// Buscar configuração específica
const colorPalettes = await configAPI.getByKey('colorPalettes');

// Atualizar configuração
await configAPI.set('defaultHeroImage', 'https://nova-imagem.com/image.jpg', 'string', 'Nova imagem padrão', 'ai');
```

## 🎯 Próximos Passos (Opcional)

1. Criar interface de administração para gerenciar configurações
2. Adicionar mais categorias de configurações (payment, affiliate, etc.)
3. Adicionar validação de configurações
4. Adicionar histórico de mudanças

## ✅ Status

Todas as configurações mockadas foram migradas para o banco de dados. A aplicação agora busca configurações dinamicamente do PostgreSQL.

