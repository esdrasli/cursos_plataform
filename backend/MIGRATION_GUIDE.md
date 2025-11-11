# Guia de Migração MongoDB → PostgreSQL

## ✅ Concluído

1. ✅ Dependências instaladas (pg, typeorm, reflect-metadata)
2. ✅ Configuração do TypeORM criada (`src/config/database.ts`)
3. ✅ Todas as entities criadas:
   - User
   - Course
   - Enrollment
   - Sale
   - LandingPage
   - Lesson (embeddable)
   - ModuleEntity (embeddable)
4. ✅ Types atualizados (removidas referências ao Mongoose)
5. ✅ Server.ts atualizado para usar TypeORM
6. ✅ Middleware de autenticação atualizado
7. ✅ Rotas atualizadas:
   - auth.routes.ts ✅
   - courses.routes.ts ✅

## 🔄 Pendente

### Rotas que precisam ser atualizadas:
- `dashboard.routes.ts` - Substituir `Enrollment.find()` por `repository.find()`
- `checkout.routes.ts` - Substituir modelos Mongoose por TypeORM
- `learning.routes.ts` - Substituir `Enrollment.findOne()` por TypeORM
- `creator.routes.ts` - Substituir todos os modelos por TypeORM repositories

### Padrão de conversão:

**ANTES (Mongoose):**
```typescript
import Course from '../models/Course.js';
const course = await Course.findById(id);
const courses = await Course.find({ category: 'Web' });
await course.save();
```

**DEPOIS (TypeORM):**
```typescript
import { AppDataSource } from '../config/database.js';
import { Course } from '../entities/Course.js';
const courseRepository = AppDataSource.getRepository(Course);
const course = await courseRepository.findOne({ where: { id } });
const courses = await courseRepository.find({ where: { category: 'Web' } });
await courseRepository.save(course);
```

### Seed Script:
- Atualizar `src/seed.ts` para usar TypeORM repositories
- Remover referências ao Mongoose

## 📝 Configuração do Banco de Dados

### Variáveis de ambiente (.env):
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=cursos_plataform
```

### Criar banco de dados:
```sql
CREATE DATABASE cursos_plataform;
```

### TypeORM vai criar as tabelas automaticamente em desenvolvimento (synchronize: true)

## 🚀 Próximos Passos

1. Instalar PostgreSQL se ainda não tiver
2. Criar o banco de dados `cursos_plataform`
3. Atualizar as rotas restantes seguindo o padrão acima
4. Atualizar o seed.ts
5. Testar a aplicação
6. Remover mongoose do package.json (já feito)

## ⚠️ Mudanças Importantes

- `_id` → `id` (UUID ao invés de ObjectId)
- `findById()` → `findOne({ where: { id } })`
- `find()` → `find({ where: {...} })`
- `populate()` → `relations: ['fieldName']`
- `new Model()` → `repository.create()`
- `.save()` → `repository.save()`
- `.remove()` → `repository.remove()`

