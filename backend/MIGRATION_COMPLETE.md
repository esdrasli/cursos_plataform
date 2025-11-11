# ✅ Migração MongoDB → PostgreSQL COMPLETA

## 🎉 Status: CONCLUÍDA

A migração completa do MongoDB para PostgreSQL foi realizada com sucesso!

## 📋 O que foi feito

### 1. Dependências
- ✅ Removido: `mongoose`
- ✅ Adicionado: `pg`, `typeorm`, `reflect-metadata`, `@types/pg`

### 2. Configuração
- ✅ Criado `src/config/database.ts` com configuração TypeORM
- ✅ Atualizado `tsconfig.json` (decorators habilitados)
- ✅ Atualizado `env.example.txt` com variáveis PostgreSQL

### 3. Entities (Modelos)
Todas as entities TypeORM foram criadas:
- ✅ `User.ts` - Usuários do sistema
- ✅ `Course.ts` - Cursos
- ✅ `Enrollment.ts` - Matrículas
- ✅ `Sale.ts` - Vendas
- ✅ `LandingPage.ts` - Landing Pages
- ✅ `Lesson.ts` - Lições (embeddable)
- ✅ `Module.ts` - Módulos (embeddable)

### 4. Rotas Atualizadas
Todas as rotas foram convertidas para TypeORM:
- ✅ `auth.routes.ts`
- ✅ `courses.routes.ts`
- ✅ `dashboard.routes.ts`
- ✅ `checkout.routes.ts`
- ✅ `learning.routes.ts`
- ✅ `creator.routes.ts`

### 5. Outros Arquivos
- ✅ `server.ts` - Atualizado para usar TypeORM
- ✅ `middleware/auth.middleware.ts` - Atualizado
- ✅ `seed.ts` - Convertido para TypeORM
- ✅ `types/index.ts` - Removidas referências ao Mongoose
- ✅ Modelos antigos do Mongoose removidos

## 🚀 Como usar

### 1. Instalar PostgreSQL

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Baixe e instale do site oficial: https://www.postgresql.org/download/

### 2. Criar banco de dados

```bash
createdb cursos_plataform
```

Ou via psql:
```bash
psql -U postgres
CREATE DATABASE cursos_plataform;
\q
```

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` na pasta `backend/`:

```env
PORT=3001
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=cursos_plataform
NODE_ENV=development
```

### 4. Instalar dependências

```bash
cd backend
npm install
```

### 5. Rodar seed (popular banco)

```bash
npm run seed
```

O TypeORM criará as tabelas automaticamente em desenvolvimento (`synchronize: true`).

### 6. Iniciar servidor

```bash
npm run dev
```

## 📊 Mudanças Importantes

### IDs
- **Antes:** `_id` (ObjectId do MongoDB)
- **Agora:** `id` (UUID do PostgreSQL)

### Queries
- **Antes:** `Model.findById(id)`
- **Agora:** `repository.findOne({ where: { id } })`

- **Antes:** `Model.find({ category: 'Web' })`
- **Agora:** `repository.find({ where: { category: 'Web' } })`

### Relações
- **Antes:** `.populate('field')`
- **Agora:** `relations: ['field']`

### Criação
- **Antes:** `new Model(data)`
- **Agora:** `repository.create(data)`

### Salvamento
- **Antes:** `model.save()`
- **Agora:** `repository.save(entity)`

## ⚠️ Notas Importantes

1. **Synchronize:** Em desenvolvimento, o TypeORM cria/atualiza tabelas automaticamente. Em produção, use migrations.

2. **UUIDs:** Todos os IDs agora são UUIDs ao invés de ObjectIds.

3. **JSONB:** Campos complexos (modules, hero, etc.) são armazenados como JSONB no PostgreSQL.

4. **Relações:** As relações ManyToOne e ManyToMany estão configuradas corretamente.

## 🧪 Testando

1. Verifique se o PostgreSQL está rodando:
   ```bash
   psql -U postgres -d cursos_plataform -c "SELECT version();"
   ```

2. Rode o seed:
   ```bash
   npm run seed
   ```

3. Inicie o servidor:
   ```bash
   npm run dev
   ```

4. Teste a API:
   ```bash
   curl http://localhost:3001/api/health
   ```

## 📝 Credenciais de Teste

Após rodar o seed, você pode usar:

**Criadores:**
- Email: `lucas@creator.com` / Senha: `123456`
- Email: `marina@creator.com` / Senha: `123456`

**Alunos:**
- Email: `carlos@student.com` / Senha: `123456`
- Email: `juliana@student.com` / Senha: `123456`

## ✅ Compilação

A compilação TypeScript está passando sem erros:
```bash
npm run build
```

## 🎯 Próximos Passos (Opcional)

1. Criar migrations para produção
2. Configurar connection pooling
3. Adicionar índices para otimização
4. Configurar backup do banco de dados

