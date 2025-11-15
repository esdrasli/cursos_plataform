import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const entitiesDir = join(__dirname, 'src/entities');
const entities = [
  'User.ts',
  'Course.ts',
  'Enrollment.ts',
  'Sale.ts',
  'LandingPage.ts',
  'Affiliate.ts',
  'AffiliateSale.ts',
  'AppConfig.ts',
  'Branding.ts',
  'Module.ts'
];

const schema = process.env.DB_SCHEMA_PROD || 'cursos';

entities.forEach(entityFile => {
  const filePath = join(entitiesDir, entityFile);
  try {
    let content = readFileSync(filePath, 'utf-8');
    
    // Verificar se já tem schema
    if (content.includes(`schema: '${schema}'`) || content.includes(`schema: "${schema}"`)) {
      console.log(`✅ ${entityFile} já tem schema configurado`);
      return;
    }
    
    // Adicionar schema ao @Entity
    const entityRegex = /@Entity\(['"]([^'"]+)['"]\)/;
    const match = content.match(entityRegex);
    
    if (match) {
      const tableName = match[1];
      const newEntity = `@Entity({ name: '${tableName}', schema: '${schema}' })`;
      content = content.replace(entityRegex, newEntity);
      writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ Schema adicionado em ${entityFile}`);
    } else {
      console.log(`⚠️  Não foi possível encontrar @Entity em ${entityFile}`);
    }
  } catch (error: any) {
    console.error(`❌ Erro ao processar ${entityFile}:`, error.message);
  }
});

console.log(`\n✅ Schema '${schema}' adicionado às entidades!`);

