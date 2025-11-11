# 🔧 Solução para Erro 403 na Hostinger

## ⚡ Solução Rápida (Tente nesta ordem)

### Passo 1: Verificar Permissões

No **File Manager** da Hostinger:

1. Vá até `public_html/` (raiz do seu site)
2. Selecione TODOS os arquivos e pastas
3. Clique com botão direito → **"Alterar Permissões"**
4. Defina:
   - **Arquivos**: `644`
   - **Pastas**: `755`
5. Aplique recursivamente (todas as subpastas)

### Passo 2: Testar Versões do .htaccess

Tente estas versões **em ordem**:

#### Opção A: Versão Atual (principal)
Arquivo: `.htaccess` (já está na pasta public/)

#### Opção B: Versão Simples
1. No File Manager, renomeie `.htaccess` para `.htaccess.backup`
2. Renomeie `.htaccess.simple` para `.htaccess`
3. Teste o site

#### Opção C: Versão Mínima
1. Renomeie `.htaccess` para `.htaccess.backup`
2. Renomeie `.htaccess.minimal` para `.htaccess`
3. Teste o site

#### Opção D: Sem .htaccess (teste)
1. Renomeie `.htaccess` para `.htaccess.backup`
2. Teste se o `index.html` carrega
3. Se carregar, o problema é o `.htaccess`
4. Se não carregar, o problema são as permissões

### Passo 3: Verificar Estrutura

Certifique-se de que a estrutura está assim:

```
public_html/
├── index.html          ← DEVE estar aqui
├── .htaccess          ← DEVE estar aqui
├── favicon.ico        ← opcional
└── assets/
    ├── index-xxx.js
    ├── index-xxx.css
    └── ...
```

## 🎯 Solução Específica por Erro

### Erro 403 no index.html

**Causa mais comum**: Permissões incorretas

**Solução**:
1. Verifique permissão do `index.html` = `644`
2. Verifique permissão da pasta `public_html/` = `755`
3. Tente a versão mínima do `.htaccess`

### Erro 403 em assets (CSS/JS não carregam)

**Causa**: .htaccess bloqueando ou permissões da pasta assets

**Solução**:
1. Permissão da pasta `assets/` = `755`
2. Permissão dos arquivos dentro = `644`
3. Use a versão mínima do `.htaccess`

### Erro 403 em todas as rotas (SPA)

**Causa**: SPA routing não configurado

**Solução**:
1. Certifique-se de que o `.htaccess` tem as regras Rewrite
2. Use a versão mínima se necessário

## 📋 Checklist Completo

Execute este checklist na ordem:

- [ ] **Permissões corretas**:
  - [ ] `index.html` = 644
  - [ ] `.htaccess` = 644
  - [ ] Pasta `assets/` = 755
  - [ ] Arquivos dentro de `assets/` = 644

- [ ] **Arquivos presentes**:
  - [ ] `index.html` existe na raiz
  - [ ] `.htaccess` existe na raiz
  - [ ] Pasta `assets/` existe
  - [ ] Arquivos CSS/JS dentro de `assets/`

- [ ] **Teste de versões**:
  - [ ] Testou versão atual do `.htaccess`
  - [ ] Testou versão simples (`.htaccess.simple`)
  - [ ] Testou versão mínima (`.htaccess.minimal`)
  - [ ] Testou sem `.htaccess` (para diagnóstico)

## 🔍 Diagnóstico Avançado

### Teste 1: Sem .htaccess
```bash
# Renomeie temporariamente
mv .htaccess .htaccess.test
```
- Se funcionar → Problema no `.htaccess`
- Se não funcionar → Problema nas permissões

### Teste 2: Verificar Logs
No painel da Hostinger:
1. Vá em **Logs** ou **Error Logs**
2. Procure por mensagens sobre permissões ou `.htaccess`
3. Anote a mensagem de erro exata

### Teste 3: Verificar via SSH (se disponível)
```bash
# Ver permissões
ls -la public_html/

# Testar acesso
curl -I http://seusite.com/
```

## 💡 Dicas Importantes

1. **Sempre faça backup** antes de alterar `.htaccess`
2. **Teste uma mudança por vez** para identificar o problema
3. **Limpe o cache** do navegador após mudanças (Ctrl+F5)
4. **Aguarde alguns segundos** após mudanças (cache do servidor)

## 🆘 Se Nada Funcionar

1. **Contate o suporte da Hostinger**:
   - Informe que está tendo erro 403
   - Mencione que é uma SPA (Single Page Application)
   - Peça para verificar se `mod_rewrite` está habilitado

2. **Informações para fornecer**:
   - Versão do `.htaccess` que está usando
   - Permissões dos arquivos
   - Mensagem de erro completa do navegador
   - Screenshot do File Manager mostrando permissões

## ✅ Versão que Funciona na Maioria dos Casos

Use esta versão **ultra-simples**:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

Salve como `.htaccess` e teste.

