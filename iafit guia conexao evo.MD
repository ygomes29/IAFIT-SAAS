# 🔌 IAFIT Control — Guia Prático de Conexão com W12/EVO
## Academia: CONCEITO FIT | Token: IAFIT

---

## 1. SUAS CREDENCIAIS (geradas agora)

```
DNS (usuário):  evo
Token (senha):  C1869B22-54B0-426F-9D4A-4EF9A78F3C3C
Base URL:       https://evo-integracao-api.w12app.com.br
Auth:           Basic Authentication (DNS:Token em Base64)
Base64:         ZXZvOkMxODY5QjIyLTU0QjAtNDI2Ri05RDRBLTRFRjlBNzhGM0MzQw==
```

**Permissões ativas:** Todas (Atividade, Cliente, Colaboradores, Configuração, Contas Bancárias, Contas Pagar, Contas Receber, Contratos, Controle Acesso, Entradas, Notas Fiscais, Notificações, Oportunidade, Permissões, Serviços, Treinos, Vendas, Voucher, Webhooks)

---

## 2. TESTAR CONEXÃO (Cole no Terminal)

### Teste 1 — Verificar configuração da filial
```bash
curl -s -X GET "https://evo-integracao-api.w12app.com.br/api/v1/configuration" \
  -H "Authorization: Basic ZXZvOkMxODY5QjIyLTU0QjAtNDI2Ri05RDRBLTRFRjlBNzhGM0MzQw==" \
  -H "Content-Type: application/json" | python3 -m json.tool
```

### Teste 2 — Listar membros ativos (primeiros 5)
```bash
curl -s -X GET "https://evo-integracao-api.w12app.com.br/api/v1/members?take=5&skip=0&onlyPersonalData=false" \
  -H "Authorization: Basic ZXZvOkMxODY5QjIyLTU0QjAtNDI2Ri05RDRBLTRFRjlBNzhGM0MzQw==" \
  -H "Content-Type: application/json" | python3 -m json.tool
```

### Teste 3 — Consultar entradas/check-ins (últimos 7 dias)
```bash
curl -s -X GET "https://evo-integracao-api.w12app.com.br/api/v1/entries?registerDateStart=$(date -v-7d '+%Y-%m-%d')&registerDateEnd=$(date '+%Y-%m-%d')&take=10" \
  -H "Authorization: Basic ZXZvOkMxODY5QjIyLTU0QjAtNDI2Ri05RDRBLTRFRjlBNzhGM0MzQw==" \
  -H "Content-Type: application/json" | python3 -m json.tool
```

### Teste 4 — Consultar inadimplentes (Receivables)
```bash
curl -s -X GET "https://evo-integracao-api.w12app.com.br/api/v1/receivables?take=10" \
  -H "Authorization: Basic ZXZvOkMxODY5QjIyLTU0QjAtNDI2Ri05RDRBLTRFRjlBNzhGM0MzQw==" \
  -H "Content-Type: application/json" | python3 -m json.tool
```

### Teste 5 — Clientes não renovados (para reativação)
```bash
curl -s -X GET "https://evo-integracao-api.w12app.com.br/api/v1/management/non-renewed?take=10" \
  -H "Authorization: Basic ZXZvOkMxODY5QjIyLTU0QjAtNDI2Ri05RDRBLTRFRjlBNzhGM0MzQw==" \
  -H "Content-Type: application/json" | python3 -m json.tool
```

### Teste 6 — Gerar QR Code PIX (para cobrança inteligente)
```bash
curl -s -X GET "https://evo-integracao-api.w12app.com.br/api/v1/pix/qr-code?idReceivable=COLOQUE_ID_AQUI" \
  -H "Authorization: Basic ZXZvOkMxODY5QjIyLTU0QjAtNDI2Ri05RDRBLTRFRjlBNzhGM0MzQw==" \
  -H "Content-Type: application/json" | python3 -m json.tool
```

---

## 3. CRIAR WEBHOOK NO EVO (para receber eventos no n8n)

### Registrar webhook de Nova Venda
```bash
curl -s -X POST "https://evo-integracao-api.w12app.com.br/api/v1/webhook" \
  -H "Authorization: Basic ZXZvOkMxODY5QjIyLTU0QjAtNDI2Ri05RDRBLTRFRjlBNzhGM0MzQw==" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "NewSale",
    "urlCallback": "https://SEU-N8N.com/webhook/iafit-new-sale",
    "headers": [
      {
        "key": "x-iafit-secret",
        "value": "SEU_SECRET_AQUI"
      }
    ]
  }' | python3 -m json.tool
```

### Registrar webhook de Novo Membro
```bash
curl -s -X POST "https://evo-integracao-api.w12app.com.br/api/v1/webhook" \
  -H "Authorization: Basic ZXZvOkMxODY5QjIyLTU0QjAtNDI2Ri05RDRBLTRFRjlBNzhGM0MzQw==" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "CreateMember",
    "urlCallback": "https://SEU-N8N.com/webhook/iafit-new-member",
    "headers": [
      {
        "key": "x-iafit-secret",
        "value": "SEU_SECRET_AQUI"
      }
    ]
  }' | python3 -m json.tool
```

### Registrar webhook de Alteração de Membro
```bash
curl -s -X POST "https://evo-integracao-api.w12app.com.br/api/v1/webhook" \
  -H "Authorization: Basic ZXZvOkMxODY5QjIyLTU0QjAtNDI2Ri05RDRBLTRFRjlBNzhGM0MzQw==" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "AlterMember",
    "urlCallback": "https://SEU-N8N.com/webhook/iafit-alter-member",
    "headers": [
      {
        "key": "x-iafit-secret",
        "value": "SEU_SECRET_AQUI"
      }
    ]
  }' | python3 -m json.tool
```

### Listar webhooks ativos
```bash
curl -s -X GET "https://evo-integracao-api.w12app.com.br/api/v1/webhook" \
  -H "Authorization: Basic ZXZvOkMxODY5QjIyLTU0QjAtNDI2Ri05RDRBLTRFRjlBNzhGM0MzQw==" \
  -H "Content-Type: application/json" | python3 -m json.tool
```

---

## 4. ENDPOINTS POR AGENTE IAFIT

### 🎯 AGENTE: Follow-up Pós-Visita
| Ação | Endpoint | Método |
|------|----------|--------|
| Capturar visitas recentes | `/api/v1/entries?registerDateStart=YYYY-MM-DD&take=50` | GET |
| Dados do visitante | `/api/v1/members/{idMember}` | GET |
| Verificar se converteu | `/api/v1/management/active-clients` | GET |
| Buscar prospects | `/api/v1/prospects?take=50` | GET |
| Webhook: nova entrada | `eventType: "CreateMember"` | POST webhook |

### 💙 AGENTE: Customer Success
| Ação | Endpoint | Método |
|------|----------|--------|
| Entradas por período | `/api/v1/entries?registerDateStart=YYYY-MM-DD&registerDateEnd=YYYY-MM-DD` | GET |
| Membros ativos | `/api/v2/members?status=active` | GET |
| Contratos ativos | `/api/v1/member-membership?status=active` | GET |
| Enviar notificação push | `/api/v1/notifications` | POST |
| Webhook: alteração de membro | `eventType: "AlterMember"` | POST webhook |

### 🔄 AGENTE: Motor de Reativação
| Ação | Endpoint | Método |
|------|----------|--------|
| Clientes não renovados | `/api/v1/management/non-renewed` | GET |
| Contratos cancelados | `/api/v1/member-membership?status=canceled` | GET |
| Criar voucher promocional | `/api/v1/voucher` | POST |
| Converter prospect em membro | `/api/v1/prospects/convert` | POST |
| Webhook: nova venda | `eventType: "NewSale"` | POST webhook |

### 💳 AGENTE: Cobrança Inteligente
| Ação | Endpoint | Método |
|------|----------|--------|
| Inadimplentes | `/api/v1/receivables?status=pending` | GET |
| Detalhe da dívida | `/api/v1/receivables/{id}` | GET |
| Gerar PIX QR Code | `/api/v1/pix/qr-code?idReceivable={id}` | GET |
| Marcar como pago | `/api/v1/receivables/mark-received` | PUT |
| Cobrança em lote | `/api/v1/receivables/batch-collection` | POST |
| Webhook: nova venda (pagamento) | `eventType: "NewSale"` | POST webhook |

---

## 5. CONFIGURAÇÃO NO N8N

### Node: HTTP Request (EVO API)
```json
{
  "method": "GET",
  "url": "https://evo-integracao-api.w12app.com.br/api/v1/{{ endpoint }}",
  "authentication": "genericCredentialType",
  "genericAuthType": "httpBasicAuth",
  "httpBasicAuth": {
    "user": "evo",
    "password": "C1869B22-54B0-426F-9D4A-4EF9A78F3C3C"
  },
  "options": {
    "response": {
      "response": {
        "responseFormat": "json"
      }
    }
  }
}
```

### Credential no n8n (salvar uma vez)
1. Ir em **Credentials** → **New Credential**
2. Tipo: **HTTP Basic Auth**
3. Nome: `EVO API - CONCEITO FIT`
4. User: `evo`
5. Password: `C1869B22-54B0-426F-9D4A-4EF9A78F3C3C`

### Webhook Node (receber eventos do EVO)
1. Criar **Webhook Node** no n8n
2. Method: POST
3. Path: `/iafit-events`
4. Copiar a URL gerada (ex: `https://seu-n8n.com/webhook/iafit-events`)
5. Registrar essa URL no EVO via POST `/api/v1/webhook`
6. Adicionar header `x-iafit-secret` para validação

---

## 6. FLUXO DE EXECUÇÃO POR AGENTE

### Follow-up Pós-Visita (Schedule: a cada 6h)
```
[Schedule Trigger] → [HTTP Request: GET /entries últimas 24h] → [Filter: só primeiras visitas]
→ [HTTP Request: GET /members/{id}] → [Verificar se já é aluno ativo]
→ [Se NÃO é aluno] → [Evolution API: enviar WhatsApp follow-up]
```

### Customer Success (Schedule: diário 10h)
```
[Schedule Trigger] → [HTTP Request: GET /members ativos] → [HTTP Request: GET /entries últimos 7d]
→ [Comparar: quem NÃO tem entrada nos 7 dias] → [Marcar como "em risco"]
→ [Evolution API: enviar WhatsApp incentivo]
```

### Motor de Reativação (Schedule: semanal segunda 9h)
```
[Schedule Trigger] → [HTTP Request: GET /management/non-renewed]
→ [Filter: cancelados há 90+ dias] → [Segmentar por tipo de plano]
→ [HTTP Request: POST /voucher (criar cupom)] 
→ [Evolution API: enviar WhatsApp campanha + cupom]
```

### Cobrança Inteligente (Schedule: diário 14h)
```
[Schedule Trigger] → [HTTP Request: GET /receivables pendentes]
→ [Filter: vencidos há 2+ dias] → [HTTP Request: GET /pix/qr-code]
→ [Evolution API: enviar WhatsApp amigável + PIX copia e cola]
→ [Aguardar pagamento] → [HTTP Request: PUT /receivables/mark-received]
```

---

## 7. RATE LIMITS E BOAS PRÁTICAS

- Paginação padrão: 50 registros (usar `take` e `skip`)
- Alguns endpoints aceitam até 100
- Header `total` indica quantidade total disponível
- Implementar retry com backoff exponencial
- Cachear dados que não mudam frequentemente (memberships, services)
- Usar webhooks ao invés de polling quando possível

---

## 8. PRÓXIMOS PASSOS

1. ✅ Token criado no EVO (FEITO)
2. ⬜ Testar curl no terminal (copiar comandos acima)
3. ⬜ Criar credential no n8n
4. ⬜ Registrar webhooks no EVO
5. ⬜ Montar primeiro fluxo (sugestão: Follow-up Pós-Visita)
6. ⬜ Conectar Evolution API para disparo WhatsApp
7. ⬜ Testar ciclo completo
8. ⬜ Ativar schedules em produção

---

*Gerado para CONCEITO FIT — IAFIT Control*
*Token: IAFIT | DNS: evo | Versão EVO: 2026.03.31.2*