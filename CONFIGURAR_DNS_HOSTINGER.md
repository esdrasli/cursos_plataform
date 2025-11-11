# 🔧 Configurar DNS na Hostinger - Solução DNS_PROBE_FINISHED_NXDOMAIN

## ❌ Erro Atual
```
DNS_PROBE_FINISHED_NXDOMAIN
Não é possível acessar esse site
```

Este erro significa que o **domínio não está configurado** ou **não está apontando** para o servidor da Hostinger.

## ✅ Solução Passo a Passo

### Passo 1: Verificar se o Domínio está na Hostinger

1. Acesse o **painel da Hostinger** (hpanel.hostinger.com)
2. Vá em **Domínios** → **Gerenciar Domínios**
3. Verifique se o domínio `form.arenaec.com` está listado
4. Se **NÃO estiver**, você precisa:
   - **Adicionar o domínio** na Hostinger, OU
   - **Conectar um domínio existente** de outro provedor

### Passo 2: Configurar Registros DNS

#### Opção A: Domínio Registrado na Hostinger

Se o domínio foi registrado na Hostinger:

1. No painel, vá em **Domínios** → Selecione `form.arenaec.com`
2. Vá em **DNS / Nameservers**
3. Verifique se os **Nameservers** estão corretos:
   ```
   ns1.dns-parking.com
   ns2.dns-parking.com
   ```
   (Ou os nameservers específicos da Hostinger)

#### Opção B: Domínio Registrado em Outro Provedor

Se o domínio está registrado em outro provedor (GoDaddy, Registro.br, etc.):

1. **Na Hostinger:**
   - Vá em **Domínios** → **Adicionar Domínio**
   - Digite `form.arenaec.com`
   - Escolha **"Conectar um domínio que você já possui"**
   - Anote os **Nameservers** fornecidos (exemplo):
     ```
     ns1.dns-parking.com
     ns2.dns-parking.com
     ```

2. **No Provedor do Domínio** (onde você registrou):
   - Acesse o painel de controle do domínio
   - Vá em **DNS** ou **Nameservers**
   - Altere os Nameservers para os fornecidos pela Hostinger
   - Salve as alterações

3. **Aguarde a propagação DNS** (pode levar de 1 a 48 horas)

### Passo 3: Configurar Registro A (se necessário)

Se você precisa configurar manualmente os registros DNS:

1. No painel da Hostinger, vá em **Domínios** → **DNS Zone Editor**
2. Adicione ou verifique o **Registro A**:
   ```
   Tipo: A
   Nome: @ (ou form.arenaec.com)
   Valor: [IP do servidor Hostinger]
   TTL: 3600
   ```

3. Para subdomínio `form`:
   ```
   Tipo: A
   Nome: form
   Valor: [IP do servidor Hostinger]
   TTL: 3600
   ```

**Como encontrar o IP do servidor:**
- No painel Hostinger, vá em **Hospedagem** → **Detalhes**
- O IP do servidor estará listado lá

### Passo 4: Verificar Configuração do Site

1. No painel Hostinger, vá em **Hospedagem** → **Gerenciar**
2. Verifique se o domínio `form.arenaec.com` está **conectado** ao plano de hospedagem
3. Se não estiver, clique em **"Conectar Domínio"** e selecione `form.arenaec.com`

### Passo 5: Verificar Estrutura de Arquivos

Certifique-se de que os arquivos estão na pasta correta:

- **Se usar subdomínio**: Arquivos devem estar em `public_html/form/` ou `public_html/`
- **Se usar domínio principal**: Arquivos devem estar em `public_html/`

**Na Hostinger:**
1. Vá em **File Manager**
2. Navegue até `public_html/`
3. Verifique se `index.html` e `.htaccess` estão lá
4. Se estiver usando subdomínio, pode precisar criar `public_html/form/`

## 🔍 Verificar se DNS está Funcionando

### Teste 1: Verificar Propagação DNS

Use ferramentas online:
- https://www.whatsmydns.net/
- https://dnschecker.org/

Digite `form.arenaec.com` e verifique se o DNS está propagado.

### Teste 2: Verificar via Terminal

```bash
# Verificar registros DNS
nslookup form.arenaec.com

# Verificar se o domínio resolve
ping form.arenaec.com

# Verificar registros A
dig form.arenaec.com A
```

### Teste 3: Verificar Nameservers

```bash
# Verificar nameservers
dig NS arenaec.com
```

## ⚠️ Problemas Comuns

### Problema 1: Domínio não está na Hostinger
**Solução**: Adicione o domínio no painel da Hostinger primeiro.

### Problema 2: Nameservers incorretos
**Solução**: Altere os nameservers no provedor do domínio para os da Hostinger.

### Problema 3: Propagação DNS ainda não completou
**Solução**: Aguarde até 48 horas. Use ferramentas de verificação DNS para acompanhar.

### Problema 4: Subdomínio não configurado
**Solução**: 
- Se `form` é um subdomínio, configure um registro A ou CNAME para `form.arenaec.com`
- Ou configure o subdomínio no painel da Hostinger

### Problema 5: Domínio apontando para IP errado
**Solução**: Verifique o IP do servidor na Hostinger e atualize o registro A.

## 📋 Checklist Completo

- [ ] Domínio está adicionado na Hostinger
- [ ] Nameservers estão configurados corretamente
- [ ] Registro A está apontando para o IP correto
- [ ] Domínio está conectado ao plano de hospedagem
- [ ] Arquivos estão na pasta correta (`public_html/`)
- [ ] Aguardou propagação DNS (se necessário)
- [ ] Verificou propagação com ferramentas online

## 🆘 Se Ainda Não Funcionar

1. **Contate o Suporte da Hostinger**:
   - Informe que está recebendo `DNS_PROBE_FINISHED_NXDOMAIN`
   - Forneça o domínio: `form.arenaec.com`
   - Peça para verificar a configuração DNS

2. **Informações para fornecer**:
   - Domínio: `form.arenaec.com`
   - Onde o domínio foi registrado
   - Nameservers configurados
   - IP do servidor (se souber)

## 💡 Dicas Importantes

1. **Propagação DNS pode levar tempo**: De 1 a 48 horas
2. **Limpe o cache DNS local**:
   ```bash
   # macOS
   sudo dscacheutil -flushcache
   
   # Windows
   ipconfig /flushdns
   ```
3. **Use navegador anônimo** para testar (evita cache)
4. **Verifique se o domínio está ativo** no provedor de registro

## 🔗 Links Úteis

- [Hostinger - Como Conectar Domínio](https://support.hostinger.com/pt-br/articles/1583304)
- [Hostinger - Configurar DNS](https://support.hostinger.com/pt-br/articles/1583304)
- [Verificar Propagação DNS](https://www.whatsmydns.net/)

