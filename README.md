# 🚀 MindFlow v2.0

**Plataforma de Treinamento Diário e Social Media com WhatsApp B2B2C**

Versão: 2.0  
Status: Em Desenvolvimento (MVP)  
Stack: Node.js 22 + React 19 + MySQL 8.0 + Redis 7

---

## 📋 Sobre o Projeto

MindFlow é uma plataforma que gera conteúdos estratégicos diários sobre Tecnologia, Negócio, Marketing e Contabilidade, enviando materiais educativos via WhatsApp para usuários aprenderem e postarem no Instagram.

### Modelo de Negócio: B2B2C

- **MindFlow** contrata 1 instância da UAZ API
- **Usuários** enviam mensagem "Quero me conectar com o MindFlow"
- **MindFlow** armazena o contato e passa a enviar conteúdos
- **Sem risco de banimento** (usuário iniciou o contato)

---

## 🛠️ Stack Tecnológico

### Frontend
- React 19 + TypeScript
- Vite 6 (Build)
- Tailwind CSS 4 + shadcn/ui
- Zustand (State Management)
- TanStack Query (Data Fetching)
- React Router 7 (Routing)

### Backend
- Node.js 22 LTS + TypeScript
- Express.js 4
- Drizzle ORM
- MySQL 8.0
- Redis 7
- Bull (Job Queue)

### DevOps
- Docker + Docker Compose
- GitHub Actions (CI/CD)

---

## 🚀 Quick Start

### Pré-requisitos
- Docker e Docker Compose
- Node.js 22+ (para desenvolvimento local)
- pnpm (recomendado)

### Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd mindflow

# Instale as dependências
cd backend && pnpm install && cd ..
cd frontend && pnpm install && cd ..

# Inicie os containers
docker-compose up -d

# Verifique o status
docker-compose ps

# Veja os logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### URLs
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001
- **API Docs:** http://localhost:3001/api-docs (futuro)
- **MySQL:** localhost:3306
- **Redis:** localhost:6379

---

## 📁 Estrutura do Projeto

```
mindflow/
├── frontend/                 # React + Vite
│   ├── src/
│   │   ├── pages/           # Páginas da aplicação
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── hooks/           # Custom hooks
│   │   ├── stores/          # Zustand stores
│   │   ├── services/        # API clients
│   │   └── lib/             # Utilitários
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                  # Express + TypeScript
│   ├── src/
│   │   ├── routes/          # Rotas da API
│   │   ├── controllers/     # Controladores
│   │   ├── services/        # Lógica de negócio
│   │   ├── db/              # Database schema
│   │   ├── middleware/      # Middlewares
│   │   ├── utils/           # Utilitários
│   │   ├── config/          # Configurações
│   │   ├── server.ts        # Setup do servidor
│   │   └── index.ts         # Entry point
│   ├── tsconfig.json
│   ├── .env
│   ├── .env.example
│   └── package.json
│
├── docker-compose.yml       # Orquestração de containers
├── .gitignore
└── README.md
```

---

## 🔄 Fluxo de Desenvolvimento

### Fase 1: MVP (2-3 semanas)
- [x] Estrutura de diretórios
- [x] Git configurado
- [x] Docker Compose setup
- [ ] Backend com webhooks
- [ ] Frontend com dashboard
- [ ] Integração WhatsApp

### Fase 2: Automação (2-3 semanas)
- [ ] Agendamento automático
- [ ] Job queue com Bull
- [ ] Dashboard de estatísticas
- [ ] Filtros por tema/dia/hora

### Fase 3: Escala (2-3 semanas)
- [ ] Otimização para 10k+ contatos
- [ ] Monitoramento e alertas
- [ ] Relatórios avançados

### Fase 4: Monetização (1-2 semanas)
- [ ] Planos (Freemium/Pro/Enterprise)
- [ ] Stripe integration
- [ ] Dashboard de billing

---

## 📝 Variáveis de Ambiente

### Backend (.env)
```
NODE_ENV=development
PORT=3001
DATABASE_URL=mysql://mindflow:mindflow_password@mysql:3306/mindflow
REDIS_URL=redis://redis:6379
JWT_SECRET=dev-secret-key
JWT_EXPIRY=7d
UAZ_API_URL=https://api.uazapi.com
UAZ_ADMIN_TOKEN=your-admin-token-here
LOG_LEVEL=debug
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001
```

---

## 🔗 Endpoints da API

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/me` - Obter dados do usuário

### WhatsApp
- `POST /api/webhooks/whatsapp` - Webhook para receber mensagens
- `POST /api/whatsapp/send` - Enviar mensagem
- `POST /api/whatsapp/broadcast` - Enviar em massa
- `GET /api/whatsapp/contacts` - Listar contatos
- `POST /api/whatsapp/contacts/:id/pause` - Pausar contato
- `POST /api/whatsapp/contacts/:id/resume` - Retomar contato
- `POST /api/whatsapp/contacts/:id/unsubscribe` - Desinscrever

---

## 🧪 Testes

```bash
# Backend
cd backend
pnpm run test          # Executar testes
pnpm run test:ui       # UI de testes

# Frontend
cd frontend
pnpm run test          # Executar testes
pnpm run test:ui       # UI de testes
```

---

## 📚 Documentação

- [Documentação Completa](./docs/DOCUMENTACAO_COMPLETA.md)
- [Plano de Implementação](./docs/PLANO_IMPLEMENTACAO.md)
- [Modelo de Negócio B2B2C](./docs/MODELO_B2B2C.md)
- [Stack Tecnológico](./docs/STACK_TECNOLOGICO.md)

---

## 🤝 Contribuindo

1. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
2. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
3. Push para a branch (`git push origin feature/AmazingFeature`)
4. Abra um Pull Request

---

## 📞 Suporte

Para suporte, envie um email para team@mindflow.com ou abra uma issue no repositório.

---

## 📄 Licença

Este projeto está sob licença proprietária. Todos os direitos reservados.

---

**Desenvolvido com ❤️ pelo MindFlow Team**
