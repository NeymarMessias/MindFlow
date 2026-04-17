# 🚀 MindFlow v2.0 - Treinamento Diário e Social Media

**MindFlow** é uma plataforma inteligente de geração e distribuição de conteúdo que utiliza IA para criar artigos personalizados e enviá-los automaticamente via WhatsApp, com sistema de feedback para rastreamento de preferências do cliente.

**Versão:** 2.0.0  
**Status:** MVP Completo e Funcional  
**Data:** 17 de Abril de 2026  
**Stack:** Node.js 22 + React 19 + MySQL 8.0 + OpenAI

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Instalação](#instalação)
5. [Configuração](#configuração)
6. [Uso](#uso)
7. [API Endpoints](#api-endpoints)
8. [Funcionalidades](#funcionalidades)
9. [Banco de Dados](#banco-de-dados)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

MindFlow automatiza o processo de criação e distribuição de conteúdo educacional através de:

- **Geração de Conteúdo com IA** - Utiliza OpenAI GPT-3.5-turbo para criar artigos de alta qualidade
- **Envio Automático** - Distribui conteúdo via WhatsApp para contatos cadastrados
- **Envio Imediato** - Botão "Enviar Agora" para envio instantâneo
- **Feedback Inteligente** - Coleta avaliações com 5 estrelas para entender preferências
- **Rastreamento de Preferências** - Aprende quais temas cada cliente prefere
- **Agendamento Automático** - Envia conteúdo em horários pré-definidos
- **Dashboard em Tempo Real** - Visualiza estatísticas e preferências

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                 │
│  - Dashboard de Conteúdos                                   │
│  - Geração de Artigos                                       │
│  - Agendamento de Envios                                    │
│  - Envio Imediato (Botão "Enviar Agora")                    │
│  - Visualização de Preferências                             │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTP/REST
┌────────────────▼────────────────────────────────────────────┐
│                  Backend (Node.js + Express)                │
│  - API REST                                                 │
│  - Autenticação JWT                                         │
│  - Geração de Conteúdo (OpenAI)                             │
│  - Envio de Mensagens (WhatsApp UAZ)                        │
│  - Envio Imediato (/api/immediate/send-all)                 │
│  - Feedback & Preferências (/api/immediate/feedback)        │
│  - Agendamento (node-cron)                                  │
│  - Dashboard (/api/stats)                                   │
└────────────────┬────────────────────────────────────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
    ▼            ▼            ▼
┌────────┐  ┌─────────┐  ┌──────────┐
│ MySQL  │  │ OpenAI  │  │ WhatsApp │
│ DB     │  │ API     │  │ (UAZ)    │
└────────┘  └─────────┘  └──────────┘
```

---

## 💻 Stack Tecnológico

### Backend
- **Node.js 22** - Runtime JavaScript
- **Express.js 4** - Framework web
- **TypeScript** - Tipagem estática
- **MySQL 8.0** - Banco de dados relacional
- **Drizzle ORM** - ORM type-safe
- **node-cron** - Agendamento de tarefas
- **OpenAI SDK** - Integração com IA (GPT-3.5-turbo)
- **JWT** - Autenticação segura
- **Helmet** - Headers de segurança
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 19** - UI framework
- **Vite 6** - Build tool
- **Tailwind CSS 4** - Estilização
- **shadcn/ui** - Componentes UI
- **Wouter** - Roteamento client-side
- **TypeScript** - Tipagem estática

### Infraestrutura
- **GitHub** - Controle de versão
- **Manus** - Hosting
- **Docker** (opcional)

---

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- npm ou pnpm
- MySQL 8.0+
- Git

### Clonando o Repositório

```bash
git clone https://github.com/NeymarMessias/MindFlow.git
cd MindFlow
```

### Backend

```bash
cd backend
npm install
# ou
pnpm install
```

### Frontend

```bash
cd frontend
npm install
# ou
pnpm install
```

---

## ⚙️ Configuração

### Variáveis de Ambiente

#### Backend (.env)

```env
# Banco de Dados
DATABASE_URL=mysql://user:password@localhost:3306/mindflow

# OpenAI
OPENAI_API_KEY=sk-...

# WhatsApp (UAZ API)
WHATSAPP_API_URL=https://api.uaz.com.br
WHATSAPP_API_KEY=your-api-key

# JWT
JWT_SECRET=your-secret-key-here

# Server
PORT=3001
NODE_ENV=development
```

#### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001
VITE_APP_TITLE=MindFlow
```

### Banco de Dados

```bash
# Criar banco de dados
mysql -u root -p
CREATE DATABASE mindflow;
USE mindflow;

# Executar migrations (automático ao iniciar backend)
```

---

## 🚀 Uso

### Iniciar Backend

```bash
cd backend
npm run dev
# ou
pnpm dev
```

Backend rodará em `http://localhost:3001`

### Iniciar Frontend

```bash
cd frontend
npm run dev
# ou
pnpm dev
```

Frontend rodará em `http://localhost:3000`

### Build para Produção

#### Backend
```bash
cd backend
npm run build
npm start
```

#### Frontend
```bash
cd frontend
npm run build
```

---

## 🔌 API Endpoints

### Autenticação

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

### Conteúdo

#### Gerar Conteúdo
```http
POST /api/content/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "theme": "Tecnologia",
  "targetAudience": "Profissionais"
}

Response:
{
  "id": "uuid",
  "title": "Como a IA está revolucionando...",
  "content": "Artigo completo aqui...",
  "summary": "Resumo do artigo...",
  "wordCount": 437,
  "theme": "Tecnologia",
  "status": "generated",
  "createdAt": "2026-04-17T00:00:00Z"
}
```

#### Listar Conteúdos
```http
GET /api/contents
Authorization: Bearer <token>

Response:
{
  "contents": [
    {
      "id": "uuid",
      "title": "...",
      "theme": "Tecnologia",
      "status": "generated",
      "createdAt": "2026-04-17T00:00:00Z"
    }
  ]
}
```

### Envio Imediato ⭐ NOVO

#### Enviar para Todos os Contatos
```http
POST /api/immediate/send-all
Authorization: Bearer <token>
Content-Type: application/json

{
  "contentId": "uuid-do-conteudo"
}

Response:
{
  "success": true,
  "messagesSent": 5,
  "contactsReached": ["contact1", "contact2", ...]
}
```

#### Enviar para Contato Específico
```http
POST /api/immediate/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "contentId": "uuid",
  "contactId": "uuid"
}

Response:
{
  "success": true,
  "messageId": "msg-uuid",
  "status": "sent"
}
```

### Feedback com 5 Estrelas ⭐ NOVO

#### Registrar Feedback
```http
POST /api/immediate/feedback
Authorization: Bearer <token>
Content-Type: application/json

{
  "contentId": "uuid",
  "contactId": "uuid",
  "rating": 5,
  "feedback": "Excelente conteúdo!"
}

Response:
{
  "success": true,
  "feedbackId": "uuid",
  "rating": 5
}
```

### Preferências ⭐ NOVO

#### Obter Preferências do Contato
```http
GET /api/immediate/preferences/:contactId
Authorization: Bearer <token>

Response:
{
  "contactId": "uuid",
  "preferences": [
    {
      "theme": "Tecnologia",
      "averageRating": 4.5,
      "feedbackCount": 10
    },
    {
      "theme": "Economia",
      "averageRating": 3.8,
      "feedbackCount": 5
    }
  ]
}
```

### Dashboard

#### Obter Estatísticas
```http
GET /api/stats
Authorization: Bearer <token>

Response:
{
  "user": {
    "totalContacts": 25,
    "totalMessages": 150,
    "activeContacts": 20
  },
  "contacts": {
    "active": 20,
    "paused": 3,
    "unsubscribed": 2
  },
  "messages": {
    "sent": 150,
    "delivered": 145,
    "failed": 5
  },
  "schedules": {
    "pending": 3,
    "sent": 45,
    "failed": 2
  }
}
```

---

## ✨ Funcionalidades

### 1. Geração de Conteúdo com IA ✅
- Cria artigos de alta qualidade usando OpenAI GPT-3.5-turbo
- Suporta múltiplos temas (Tecnologia, Economia, Marketing, etc.)
- Gera título, conteúdo completo e resumo automático
- Conta palavras e estima tempo de leitura
- **Performance:** ~8-10 segundos por artigo

### 2. Envio Imediato (Enviar Agora) ✅ NOVO
- Botão verde na página de conteúdos
- Envia conteúdo imediatamente para todos os contatos ativos
- Rastreia status de envio (enviado, entregue, falhou)
- Suporta envio para contato específico
- **Performance:** ~1-2 segundos por contato

### 3. Pesquisa de Satisfação com 5 Estrelas ✅ NOVO
- Modal elegante após recebimento de mensagem
- Avaliação obrigatória de 1-5 estrelas
- Campo de comentário opcional
- Confirmação visual com toast
- Integração automática com WhatsApp

### 4. Rastreamento de Preferências ✅ NOVO
- Calcula média de ratings por tema
- Identifica temas preferidos do cliente
- Atualiza automaticamente após cada feedback
- Permite personalização futura de envios
- Dados persistidos no banco de dados

### 5. Agendamento Automático ✅
- Scheduler rodando a cada minuto
- Verifica agendamentos pendentes
- Envia conteúdo automaticamente no horário
- Suporta agendamentos recorrentes
- Usa node-cron para confiabilidade

### 6. Dashboard em Tempo Real ✅
- Estatísticas de contatos (ativo, pausado, desinscritos)
- Métricas de mensagens (enviadas, entregues, falhadas)
- Status de agendamentos
- Visualização de preferências
- Atualização em tempo real

---

## 🗄️ Banco de Dados

### Tabelas Principais

#### users
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  name VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### contents
```sql
CREATE TABLE contents (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36),
  title VARCHAR(255),
  content LONGTEXT,
  summary TEXT,
  theme VARCHAR(100),
  wordCount INT,
  status VARCHAR(50),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

#### contacts
```sql
CREATE TABLE contacts (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36),
  name VARCHAR(255),
  phone VARCHAR(20),
  status VARCHAR(50),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

#### messages
```sql
CREATE TABLE messages (
  id VARCHAR(36) PRIMARY KEY,
  contentId VARCHAR(36),
  contactId VARCHAR(36),
  status VARCHAR(50),
  sentAt TIMESTAMP,
  deliveredAt TIMESTAMP,
  FOREIGN KEY (contentId) REFERENCES contents(id),
  FOREIGN KEY (contactId) REFERENCES contacts(id)
);
```

#### content_feedback ⭐ NOVO
```sql
CREATE TABLE content_feedback (
  id VARCHAR(36) PRIMARY KEY,
  contentId VARCHAR(36),
  contactId VARCHAR(36),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contentId) REFERENCES contents(id),
  FOREIGN KEY (contactId) REFERENCES contacts(id)
);
```

#### contact_theme_preferences ⭐ NOVO
```sql
CREATE TABLE contact_theme_preferences (
  id VARCHAR(36) PRIMARY KEY,
  contactId VARCHAR(36),
  theme VARCHAR(100),
  averageRating DECIMAL(3,2),
  feedbackCount INT DEFAULT 0,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (contactId) REFERENCES contacts(id)
);
```

---

## 🔄 Fluxo de Dados

### Geração e Envio de Conteúdo

```
1. Usuário acessa página de Conteúdos
   ↓
2. Clica em "Gerar Novo Conteúdo"
   ↓
3. Seleciona tema e clica "Gerar Conteúdo"
   ↓
4. Backend chama OpenAI API
   ↓
5. Conteúdo é salvo no banco de dados
   ↓
6. Usuário vê conteúdo com botão "✉️ Enviar Agora"
   ↓
7. Clica "Enviar Agora"
   ↓
8. Backend envia para todos os contatos via WhatsApp
   ↓
9. Contatos recebem mensagem + link para pesquisa
   ↓
10. Clicam na pesquisa e avaliam com 5 estrelas
    ↓
11. Feedback é registrado no banco
    ↓
12. Preferências são atualizadas
    ↓
13. Dashboard mostra preferências do cliente
```

---

## 📁 Estrutura do Projeto

```
mindflow/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── contents.ts
│   │   │   ├── immediate.ts          ⭐ NOVO
│   │   │   ├── messages.ts
│   │   │   ├── schedules.ts
│   │   │   ├── stats.ts
│   │   │   ├── whatsapp.ts
│   │   │   └── webhooks.ts
│   │   ├── services/
│   │   │   ├── openaiService.ts
│   │   │   ├── immediateMessageService.ts  ⭐ NOVO
│   │   │   ├── schedulerService.ts
│   │   │   ├── whatsappService.ts
│   │   │   ├── authService.ts
│   │   │   └── statsService.ts
│   │   ├── db/
│   │   │   ├── schema.ts
│   │   │   └── index.ts
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── config/
│   │   ├── server.ts
│   │   └── index.ts
│   ├── public/
│   │   ├── index.html
│   │   ├── assets/
│   │   └── test.html
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Contents.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── Schedules.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── public/
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── README.md
├── .gitignore
└── .env.example
```

---

## 🛠️ Troubleshooting

### Problema: OpenAI API retorna erro 401
**Solução:** Verifique se a chave API está correta em `.env`

### Problema: WhatsApp não envia mensagens
**Solução:** Verifique credenciais da UAZ API e se contatos têm números válidos

### Problema: Frontend não conecta ao backend
**Solução:** Verifique se backend está rodando em `http://localhost:3001`

### Problema: Banco de dados não conecta
**Solução:** Verifique `DATABASE_URL` e se MySQL está rodando

### Problema: Agendamento não funciona
**Solução:** Verifique logs do backend para erros do node-cron

### Problema: Envio imediato retorna erro
**Solução:** Verifique se contatos estão com status "active" no banco de dados

---

## 📝 Logs

### Backend
Logs disponíveis em `/tmp/backend.log`

### Frontend
Logs disponíveis no console do navegador (F12)

---

## 🔐 Segurança

- ✅ Autenticação JWT
- ✅ Validação de entrada
- ✅ Rate limiting
- ✅ CORS configurado
- ✅ Helmet para headers de segurança
- ✅ Senhas com hash bcrypt
- ✅ Proteção contra SQL injection (Drizzle ORM)

---

## 📊 Performance

- Geração de conteúdo: ~8-10 segundos
- Envio de mensagens: ~1-2 segundos por contato
- Envio imediato: ~2-3 segundos para 5+ contatos
- Consultas de preferências: <100ms
- Dashboard: <500ms

---

## 🚀 Deploy

### Manus Hosting
Aplicação está disponível em:
```
https://3001-ixt97axeriathjorjukza-00138937.us2.manus.computer
```

### Variáveis de Ambiente em Produção
Todas as variáveis sensíveis devem ser configuradas no painel de hosting.

---

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório:
https://github.com/NeymarMessias/MindFlow/issues

---

## 📄 Licença

Este projeto é proprietário. Todos os direitos reservados.

---

## 👨‍💻 Autor

**Neymar Messias**  
GitHub: [@NeymarMessias](https://github.com/NeymarMessias)

---

## 📅 Histórico de Versões

### v2.0.0 (17 de Abril de 2026) ⭐ ATUAL
- ✅ Implementado envio imediato de conteúdo ("Enviar Agora")
- ✅ Sistema de feedback com 5 estrelas
- ✅ Rastreamento automático de preferências por tema
- ✅ Dashboard em tempo real com estatísticas
- ✅ Agendamento automático com cron
- ✅ Integração completa com OpenAI
- ✅ Integração completa com WhatsApp (UAZ)
- ✅ Banco de dados MySQL com schema completo
- ✅ Autenticação JWT
- ✅ Frontend React com Tailwind + shadcn/ui

### v1.0.0 (Inicial)
- ✅ Geração de conteúdo com OpenAI
- ✅ Autenticação JWT
- ✅ Integração WhatsApp
- ✅ Dashboard básico

---

## 🎯 Próximas Melhorias (v3.0)

- [ ] Personalização de conteúdo baseada em preferências
- [ ] Relatórios avançados com gráficos
- [ ] Integração com Instagram para auto-posting
- [ ] Suporte a múltiplos idiomas
- [ ] Análise de sentimento de feedback
- [ ] Recomendação automática de temas
- [ ] API pública para integrações

---

**Desenvolvido com ❤️ usando Node.js, React e IA**

**MindFlow v2.0 - Transformando Conteúdo em Oportunidades**
