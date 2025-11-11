# 🔧 Troubleshooting - Erro de Conexão

## Problema: Erro "Erro de conexão. Verifique sua internet e tente novamente"

### Verificações

1. **Verificar se o backend está rodando:**
   ```bash
   curl http://localhost:3001/api/health
   ```
   Deve retornar: `{"status":"ok","message":"API está funcionando",...}`

2. **Verificar containers:**
   ```bash
   docker ps --filter "name=cursos"
   ```
   Todos os 3 containers devem estar "Up"

3. **Verificar logs do backend:**
   ```bash
   docker-compose -f docker-compose.dev.yml logs backend --tail=20
   ```

4. **Verificar logs do frontend:**
   ```bash
   docker-compose -f docker-compose.dev.yml logs frontend --tail=20
   ```

5. **No navegador (F12):**
   - Abra o Console (F12)
   - Procure por: `🔧 API URL configurada:`
   - Deve mostrar: `http://localhost:3001/api`
   - Verifique erros de CORS ou rede na aba Network

### Soluções

#### Solução 1: Limpar cache do navegador
- Chrome/Edge: `Ctrl+Shift+Delete` (Windows) ou `Cmd+Shift+Delete` (Mac)
- Ou fazer Hard Refresh: `Ctrl+Shift+R` (Windows) ou `Cmd+Shift+R` (Mac)

#### Solução 2: Verificar CORS
Se houver erro de CORS no console:
```bash
# Verificar se o backend aceita a origem
curl -v -H "Origin: http://localhost:5173" http://localhost:3001/api/health
```

#### Solução 3: Reiniciar containers
```bash
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d --build
```

#### Solução 4: Testar manualmente
No console do navegador (F12), execute:
```javascript
fetch('http://localhost:3001/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

### Se nada funcionar

1. Verificar se a porta 3001 não está em uso:
   ```bash
   lsof -i :3001
   ```

2. Verificar firewall/antivírus bloqueando conexões

3. Tentar acessar diretamente no navegador:
   - http://localhost:3001/api/health
   - Deve retornar JSON com status "ok"


