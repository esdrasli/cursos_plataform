# Deploy na Hostinger

Guia para fazer deploy da aplicação na Hostinger.

## 📋 Pré-requisitos

1. Conta na Hostinger com acesso FTP/File Manager
2. Node.js instalado localmente para fazer o build
3. Acesso ao painel de controle da Hostinger

## 🚀 Passo a Passo

### 1. Fazer Build Local

Execute o script de build específico para Hostinger:

```bash
npm run build:hostinger
# ou
./build/hostinger.sh
```

Isso irá:
- Fazer build do frontend
- Copiar todos os arquivos para a pasta `public/`
- Preparar os arquivos para upload

### 2. Upload para Hostinger

#### Opção A: Via File Manager (Recomendado)

1. Acesse o painel da Hostinger
2. Vá em **File Manager**
3. Navegue até a pasta `public_html` (ou a pasta raiz do seu domínio)
4. Faça upload de **todos os arquivos** da pasta `public/` do projeto
5. Certifique-se de que o arquivo `.htaccess` foi enviado

#### Opção B: Via FTP

1. Use um cliente FTP (FileZilla, WinSCP, etc.)
2. Conecte-se ao servidor da Hostinger
3. Navegue até `public_html`
4. Faça upload de todos os arquivos da pasta `public/`

### 3. Verificar Permissões

Certifique-se de que os arquivos têm as permissões corretas:

- Arquivos: `644`
- Pastas: `755`
- `.htaccess`: `644`

### 4. Configurar Backend

O backend precisa estar rodando em um servidor separado. Opções:

1. **Servidor Node.js da Hostinger** (se disponível)
2. **Serviço externo** (Railway, Render, Heroku, etc.)
3. **VPS separado**

Configure a URL do backend no arquivo `.env` ou nas variáveis de ambiente.

## 🔧 Configurações Importantes

### Arquivo .htaccess

O arquivo `.htaccess` já está configurado para:
- ✅ SPA Routing (React Router)
- ✅ Compressão Gzip
- ✅ Cache de arquivos estáticos
- ✅ Headers de segurança

### Favicon

Se você tiver um favicon personalizado:
1. Coloque o arquivo `favicon.ico` na pasta `public/`
2. O arquivo será copiado automaticamente durante o build

### Variáveis de Ambiente

Se precisar configurar variáveis de ambiente no frontend:
1. Crie um arquivo `.env.production` na raiz do projeto
2. Defina `VITE_API_URL` com a URL do seu backend
3. Refaça o build

## 🐛 Troubleshooting

### Erro 403 Forbidden

**Causa**: Permissões incorretas ou arquivo `.htaccess` ausente

**Solução**:
1. Verifique se o `.htaccess` está na pasta raiz
2. Verifique permissões (644 para arquivos, 755 para pastas)
3. No File Manager, clique com botão direito no arquivo → Permissions

### Erro 404 em rotas

**Causa**: `.htaccess` não está funcionando ou não foi enviado

**Solução**:
1. Verifique se o `.htaccess` está na pasta raiz do site
2. Certifique-se de que o módulo `mod_rewrite` está habilitado (geralmente está)
3. Verifique se o conteúdo do `.htaccess` está correto

### Favicon não aparece

**Causa**: Arquivo `favicon.ico` não existe ou está em local errado

**Solução**:
1. Coloque um arquivo `favicon.ico` na pasta `public/`
2. Refaça o build
3. Faça upload novamente

### Assets não carregam (CSS/JS)

**Causa**: Caminhos relativos incorretos

**Solução**:
1. Certifique-se de que todos os arquivos foram enviados
2. Verifique se a estrutura de pastas está correta
3. Limpe o cache do navegador (Ctrl+F5)

## 📝 Estrutura de Arquivos na Hostinger

Após o upload, a estrutura deve ser:

```
public_html/
├── index.html
├── .htaccess
├── favicon.ico
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
└── [outros arquivos estáticos]
```

## 🔄 Atualizações

Para atualizar a aplicação:

1. Faça as alterações no código
2. Execute `npm run build:hostinger`
3. Faça upload dos novos arquivos (substitua os antigos)
4. Limpe o cache do navegador

## ⚠️ Importante

- **Nunca** faça upload da pasta `node_modules`
- **Sempre** faça build antes de fazer upload
- **Mantenha** o arquivo `.htaccess` na raiz
- **Verifique** as permissões dos arquivos após upload

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs de erro no painel da Hostinger
2. Teste localmente primeiro com `npm run preview`
3. Verifique a documentação da Hostinger sobre hospedagem de SPAs

