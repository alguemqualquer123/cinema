# Cinema System 🎬

Sistema completo de gerenciamento de cinema com backend NestJS e frontend Next.js.

## Tecnologias

### Backend
- **NestJS** - Framework Node.js
- **TypeORM** - ORM com PostgreSQL
- **Prisma 7** - Cliente ORM
- **JWT** - Autenticação
- **Passport** - Estratégias de autenticação

### Frontend
- **Next.js 16** - Framework React
- **Tailwind CSS 4** - Estilização
- **Framer Motion** - Animações
- **QRCode** - Geração de QR codes

## Estrutura

```
cinema/
├── backend/          # API NestJS
│   ├── src/
│   │   ├── modules/    # Módulos (auth, catalogo, sala, etc.)
│   │   └── prisma/     # Configuração Prisma
│   └── prisma/         # Schema do banco
├── frontend/         # App Next.js
│   └── src/
│       ├── app/        # Páginas (App Router)
│       ├── components/  # Componentes React
│       └── lib/        # Utilitários e API
└── README.md
```

## Pré-requisitos

- Node.js 18+
- PostgreSQL
- pnpm (ou npm/yarn)

## Configuração

1. **Clone o projeto**
```bash
git clone https://github.com/alguemqualquer123/cinema.git
cd cinema
```

2. **Configure o banco de dados**
```bash
# Crie um banco PostgreSQL e configure as variáveis de ambiente
cp backend/.env.example backend/.env
# Edite .env com sua URL do banco
```

3. **Instale as dependências**
```bash
# Backend
cd backend && pnpm install

# Frontend
cd ../frontend && pnpm install
```

4. **Gere o cliente Prisma**
```bash
cd backend && npx prisma generate
```

5. **Inicie o banco (seed)**
```bash
# Execute as migrações
npx prisma migrate dev
```

## Executando

### Backend (porta 3001)
```bash
cd backend
pnpm run start:dev
```

### Frontend (porta 3000)
```bash
cd frontend
pnpm run dev
```

## API Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/catalog/movies` | Listar filmes |
| GET | `/catalog/movies/:id` | Detalhes do filme |
| GET | `/catalog/sessions` | Listar sessões |
| GET | `/catalog/sessions/:id/seats` | Assentos da sessão |
| POST | `/orders` | Criar pedido |
| POST | `/payments/create-intent/:orderId` | Criar pagamento |
| POST | `/payments/confirm/:orderId` | Confirmar pagamento |
| GET | `/tickets/my-tickets` | Meus ingressos |

## Funcionalidades

- 🎥 Catálogo de filmes com sessões
- 🪑 Seleção de assentos interativa
- 🔐 Autenticação (JWT + Google OAuth)
- 💳 Pagamento de pedidos
- 🎟️ Geração de QR codes para ingressos
- 🎁 Sistema de pacotes e produtos
- 🔖 Descontos e cupons
- 📊 Painel admin

## Licença

MIT
