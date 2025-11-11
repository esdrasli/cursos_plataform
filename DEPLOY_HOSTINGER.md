# 🚀 Deploy na Hostinger - Guia Completo

## ⚠️ Problema Identificado: Docker vs Produção

O Docker **NÃO interfere** no build de produção, mas há uma configuração importante:

### ❌ Problema Atual
- O frontend está configurado para usar `localhost:3001` (Docker)
- Em produção na Hostinger, isso **não funcionará**
- A Hostinger não suporta Docker - apenas arquivos estáticos

### ✅ Solução

## 📋 Passo a Passo para Deploy

### 1. Configurar URL da API em Produção

O frontend precisa saber onde está o backend em produção. Você tem 2 opções:

#### Opção A: Backend em outro servidor (Recomendado)
Se o backend está em outro servidor (ex: Railway, Render, Heroku):

1. Crie um arquivo `.env.production` na raiz do projeto:
```bash
VITE_API_URL=https://seu-backend.com/api
```

2. Rebuild o projeto:
```bash
npm run build:hostinger
```

#### Opção B: Backend na mesma Hostinger (se suportar Node.js)
Se a Hostinger suporta Node.js e você vai hospedar o backend lá:

1. Configure a URL do backend:
```bash
VITE_API_URL=https://api.form.arenaec.com/api
```

### 2. Build para Produção

```bash
npm run build:hostinger
```

Isso vai:
- ✅ Gerar arquivos estáticos (HTML, CSS, JS)
- ✅ Copiar para pasta `public/`
- ✅ Preservar `.htaccess`
- ✅ **NÃO usar Docker** (apenas build estático)

### 3. Upload para Hostinger

1. Acesse o **File Manager** da Hostinger
2. Vá até `public_html/` (ou pasta do domínio)
3. Faça upload de **TODOS os arquivos** da pasta `public/`:
   - `index.html`
   - `.htaccess`
   - Pasta `assets/` (com todos os arquivos dentro)
   - `favicon.ico` (se houver)

### 4. Verificar Permissões

No File Manager:
- **Arquivos**: `644`
- **Pastas**: `755`

### 5. Configurar DNS (se ainda não fez)

Veja o arquivo `CONFIGURAR_DNS_HOSTINGER.md` para configurar o DNS.

## 🔧 Configuração da API

### Arquivo: `.env.production`

Crie este arquivo na raiz do projeto:

```bash
# URL da API em produção
VITE_API_URL=https://seu-backend.com/api

# Exemplos:
# VITE_API_URL=https://api.form.arenaec.com/api
# VITE_API_URL=https://backend.railway.app/api
# VITE_API_URL=https://seu-backend.herokuapp.com/api
```

### Como funciona

1. **Desenvolvimento (Docker)**: Usa `localhost:3001` automaticamente
2. **Produção**: Usa `VITE_API_URL` do `.env.production`
3. **Build**: Vite injeta a variável no código durante o build

## 📁 Estrutura de Arquivos na Hostinger

Após o upload, deve ficar assim:

```
public_html/
├── index.html          ← Página principal
├── .htaccess          ← Configuração Apache (SPA routing)
├── favicon.ico        ← Ícone do site (opcional)
└── assets/
    ├── index-xxx.js   ← JavaScript da aplicação
    ├── index-xxx.css ← Estilos
    └── ...            ← Outros assets
```

## ✅ Checklist de Deploy

- [ ] Criado `.env.production` com URL da API
- [ ] Executado `npm run build:hostinger`
- [ ] Verificado que pasta `public/` contém todos os arquivos
- [ ] Upload feito para `public_html/` na Hostinger
- [ ] Permissões configuradas (arquivos: 644, pastas: 755)
- [ ] DNS configurado (ver `CONFIGURAR_DNS_HOSTINGER.md`)
- [ ] `.htaccess` está presente na raiz
- [ ] Testado acesso ao site

## 🐛 Troubleshooting

### Erro: "API não responde"
- Verifique se `VITE_API_URL` está correto no `.env.production`
- Verifique se o backend está acessível publicamente
- Verifique CORS no backend (deve permitir o domínio da Hostinger)

### Erro: 403 Forbidden
- Verifique permissões (arquivos: 644, pastas: 755)
- Teste versões diferentes do `.htaccess`
- Veja `SOLUCAO_403.md`

### Erro: DNS_PROBE_FINISHED_NXDOMAIN
- Configure DNS na Hostinger
- Veja `CONFIGURAR_DNS_HOSTINGER.md`

### Frontend carrega mas API não funciona
- Verifique console do navegador (F12)
- Verifique se `VITE_API_URL` foi injetado corretamente
- Rebuild o projeto após alterar `.env.production`

## 🔗 Onde Hospedar o Backend

Se você precisa hospedar o backend separadamente:

1. **Railway** (https://railway.app) - Fácil e gratuito
2. **Render** (https://render.com) - Gratuito com limitações
3. **Heroku** (https://heroku.com) - Pago
4. **DigitalOcean** (https://digitalocean.com) - VPS
5. **AWS/GCP/Azure** - Cloud providers

## 💡 Dicas Importantes

1. **Docker é apenas para desenvolvimento** - Não é usado no build de produção
2. **Build gera arquivos estáticos** - Não precisa de Node.js na Hostinger
3. **Backend precisa estar acessível publicamente** - Configure CORS
4. **Variáveis de ambiente** - Use `.env.production` para produção
5. **Sempre rebuild** - Após alterar `.env.production`, refaça o build

## 📞 Próximos Passos

1. Configure `.env.production` com a URL do seu backend
2. Execute `npm run build:hostinger`
3. Faça upload dos arquivos
4. Configure DNS (se necessário)
5. Teste o site

