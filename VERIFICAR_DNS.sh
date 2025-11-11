#!/bin/bash
# Script para verificar configuração DNS do domínio

DOMAIN="form.arenaec.com"

echo "🔍 Verificando DNS para: $DOMAIN"
echo ""

echo "1️⃣ Verificando se o domínio resolve:"
if nslookup $DOMAIN &> /dev/null; then
    echo "✅ Domínio resolve corretamente"
    nslookup $DOMAIN
else
    echo "❌ Domínio NÃO resolve - DNS não configurado"
fi

echo ""
echo "2️⃣ Verificando registro A:"
dig +short $DOMAIN A

echo ""
echo "3️⃣ Verificando nameservers:"
dig +short $DOMAIN NS

echo ""
echo "4️⃣ Testando conectividade:"
if ping -c 1 $DOMAIN &> /dev/null; then
    echo "✅ Servidor responde"
else
    echo "❌ Servidor não responde"
fi

echo ""
echo "5️⃣ Verificando HTTP:"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN 2>/dev/null)
if [ "$HTTP_CODE" != "000" ]; then
    echo "✅ HTTP responde com código: $HTTP_CODE"
else
    echo "❌ HTTP não responde"
fi

echo ""
echo "📋 Resumo:"
echo "Se o domínio não resolve, configure o DNS na Hostinger."
echo "Se resolve mas HTTP não funciona, verifique permissões e .htaccess."

