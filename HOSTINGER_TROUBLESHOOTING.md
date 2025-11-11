# Troubleshooting - Erro 403 na Hostinger

## 🔍 Diagnóstico Rápido

### 1. Verificar Permissões

No File Manager da Hostinger, verifique as permissões:

- **Arquivos** (index.html, .htaccess, etc.): `644`
- **Pastas** (assets, etc.): `755`

**Como ajustar:**
1. File Manager → Selecione arquivo/pasta
2. Botão direito → "Alterar Permissões"
3. Defina: Arquivos = 644, Pastas = 755

### 2. Testar Versões do .htaccess

Tente estas versões em ordem:

#### Versão 1: Atual (principal)
Arquivo: `.htaccess`
- Se não funcionar, renomeie para `.htaccess.backup`

#### Versão 2: Simples
Arquivo: `.htaccess.simple`
- Renomeie para `.htaccess`
- Teste novamente

#### Versão 3: Alternativa
Arquivo: `.htaccess.alternative`
- Renomeie para `.htaccess`
- Teste novamente

### 3. Verificar se index.html existe

Certifique-se de que o arquivo `index.html` está na raiz do site (`public_html/`).

### 4. Testar sem .htaccess

1. Renomeie `.htaccess` para `.htaccess.backup`
2. Acesse o site
3. Se funcionar, o problema está no `.htaccess`
4. Se não funcionar, o problema são as permissões

### 5. Verificar Estrutura de Arquivos

A estrutura deve ser:

```
public_html/
├── index.html          (644)
├── .htaccess           (644)
├── favicon.ico         (644) - opcional
└── assets/
    ├── index-xxx.js    (644)
    ├── index-xxx.css  (644)
    └── ...
```

## 🛠️ Soluções Específicas

### Erro 403 no index.html

**Causa**: Permissões ou .htaccess bloqueando

**Solução**:
1. Verifique permissões do `index.html` (deve ser 644)
2. Tente a versão simples do `.htaccess`
3. Verifique se não há outro `.htaccess` em pastas pai

### Erro 403 em assets (CSS/JS)

**Causa**: .htaccess bloqueando arquivos estáticos

**Solução**:
1. Use a versão alternativa do `.htaccess`
2. Verifique permissões da pasta `assets/` (755)
3. Verifique permissões dos arquivos dentro (644)

### Erro 403 em todas as rotas

**Causa**: SPA routing não configurado

**Solução**:
1. Certifique-se de que o `.htaccess` tem as regras de Rewrite
2. Verifique se `mod_rewrite` está habilitado (geralmente está)
3. Use a versão simples do `.htaccess`

## 📝 Checklist de Verificação

- [ ] Permissões corretas (arquivos: 644, pastas: 755)
- [ ] Arquivo `index.html` existe na raiz
- [ ] Arquivo `.htaccess` existe na raiz
- [ ] Estrutura de pastas está correta
- [ ] Todos os arquivos foram enviados
- [ ] Não há outro `.htaccess` conflitante

## 🔄 Processo de Teste

1. **Teste sem .htaccess**:
   ```bash
   # Renomeie temporariamente
   mv .htaccess .htaccess.test
   # Teste o site
   # Se funcionar, o problema é o .htaccess
   ```

2. **Teste com versão simples**:
   ```bash
   # Use a versão simples
   cp .htaccess.simple .htaccess
   # Teste o site
   ```

3. **Verifique logs**:
   - No painel da Hostinger, verifique os logs de erro
   - Procure por mensagens específicas sobre permissões

## 💡 Dicas Importantes

1. **Sempre teste localmente primeiro**: Use `npm run preview` para testar o build
2. **Faça backup**: Antes de alterar `.htaccess`, faça backup
3. **Limpe cache**: Após mudanças, limpe o cache do navegador (Ctrl+F5)
4. **Verifique case sensitivity**: Linux é case-sensitive, certifique-se dos nomes dos arquivos

## 🆘 Se Nada Funcionar

1. Entre em contato com o suporte da Hostinger
2. Forneça:
   - Mensagem de erro completa
   - Versão do .htaccess que está usando
   - Permissões dos arquivos
   - Screenshot do File Manager

## 📞 Comandos Úteis

```bash
# Verificar permissões (via SSH se disponível)
ls -la public_html/

# Testar .htaccess localmente (se tiver Apache)
apachectl configtest
```

