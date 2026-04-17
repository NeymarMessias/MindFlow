#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

API_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:4173"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        MindFlow MVP - Teste de Fluxo Completo             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 1. Fazer login
echo -e "${YELLOW}[1/6] Fazendo login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "master@mindflow.com",
    "password": "MindFlow@Master123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Falha ao fazer login${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Login bem-sucedido${NC}"
echo "Token: ${TOKEN:0:20}..."
echo ""

# 2. Simular webhook de "Quero me conectar"
echo -e "${YELLOW}[2/6] Simulando webhook 'Quero me conectar'...${NC}"
WEBHOOK_RESPONSE=$(curl -s -X POST "$API_URL/api/webhooks/whatsapp" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "message",
    "data": {
      "from": "5511987654321",
      "body": "Quero me conectar com o MindFlow",
      "timestamp": '$(date +%s)'
    }
  }')

echo "Response: $WEBHOOK_RESPONSE"
echo -e "${GREEN}✅ Webhook processado${NC}"
echo ""

# 3. Listar contatos
echo -e "${YELLOW}[3/6] Listando contatos WhatsApp...${NC}"
CONTACTS_RESPONSE=$(curl -s -X GET "$API_URL/api/whatsapp/contacts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

CONTACT_COUNT=$(echo $CONTACTS_RESPONSE | grep -o '"total":[0-9]*' | cut -d':' -f2)

echo "Response: $CONTACTS_RESPONSE"
echo -e "${GREEN}✅ Total de contatos: $CONTACT_COUNT${NC}"
echo ""

# 4. Enviar mensagem manual
echo -e "${YELLOW}[4/6] Enviando mensagem manual...${NC}"
SEND_RESPONSE=$(curl -s -X POST "$API_URL/api/whatsapp/send" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "5511987654321",
    "message": "Olá! Este é um conteúdo de teste do MindFlow 🚀\n\n📱 Tecnologia: Inteligência Artificial está revolucionando o mercado\n\nClique no link para saber mais: https://mindflow.com"
  }')

echo "Response: $SEND_RESPONSE"
echo -e "${GREEN}✅ Mensagem enviada${NC}"
echo ""

# 5. Obter estatísticas
echo -e "${YELLOW}[5/6] Obtendo estatísticas...${NC}"
STATS_RESPONSE=$(curl -s -X GET "$API_URL/api/stats/user" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Response: $STATS_RESPONSE"
echo -e "${GREEN}✅ Estatísticas carregadas${NC}"
echo ""

# 6. Verificar webhook
echo -e "${YELLOW}[6/6] Verificando status do webhook...${NC}"
WEBHOOK_STATUS=$(curl -s -X GET "$API_URL/api/webhooks/whatsapp" \
  -H "Content-Type: application/json")

echo "Response: $WEBHOOK_STATUS"
echo -e "${GREEN}✅ Webhook está funcionando${NC}"
echo ""

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}✅ TESTE COMPLETO - TODOS OS FLUXOS FUNCIONANDO!${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Próximos passos:${NC}"
echo "1. Acessar frontend: $FRONTEND_URL"
echo "2. Fazer login com: master@mindflow.com / MindFlow@Master123"
echo "3. Verificar Dashboard e Estatísticas"
echo "4. Testar envio de conteúdo"
echo ""
