# Samy — User & Posts Management Portal

Fullstack technical challenge: a production-like portal to manage Users and Posts.

## Stack

- Backend
  - NestJS
  - Prisma ORM
  - PostgreSQL (Docker for local, Neon for production)
  - JWT auth in HttpOnly cookie
  - RBAC (VIEWER | EDITOR | ADMIN)
  - Swagger/OpenAPI
  - Structured logging with request tracing (`X-Request-ID`)
- Frontend
  - Next.js (App Router)
  - Tailwind CSS
  - Zustand (session + activity feed)
  - TanStack Query
  - Axios

## Prerequisites

- Node.js 22+
- pnpm
- Docker

## Local setup

### 1) Install dependencies

From repo root:

```bash
pnpm install
```

### 2) Start the database

From repo root:

```bash
docker compose up -d
```

PostgreSQL is exposed on `localhost:5432` (local development).

**Production Database**: [Neon](https://neon.tech) PostgreSQL is used for the deployed backend.

Optional DB UI:

- Pgweb: http://localhost:8081

### 3) Backend env

Create `apps/backend/.env` based on `apps/backend/.env.example`.

Make sure `DATABASE_URL` matches your docker-compose credentials.

Example:

```env
DATABASE_URL=postgresql://samy:samy@localhost:5432/portal_db
PORT=3000
CORS_ORIGIN=http://localhost:3001
JWT_COOKIE_NAME=auth
```

### 4) Run migrations

From repo root:

```bash
pnpm --filter backend prisma migrate dev
```

### 5) Start backend

```bash
pnpm --filter backend start
```

Backend base URL:

- http://localhost:3000/api

Swagger (non-production):

- http://localhost:3000/api/docs

### 6) Frontend env

Create `apps/frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=/api
```

The frontend proxies `/api/*` to the backend using `next.config.ts` rewrites.

### 7) Start frontend

```bash
pnpm --filter frontend dev
```

Frontend:

- http://localhost:3001

## Usage flow

1) Login

- Go to `/login`
- Use any email/password (fallback mode enabled) or ReqRes credentials (`eve.holt@reqres.in` / `cityslicka`)
- Set `REQRES_ALLOW_FALLBACK=true` in backend `.env` to allow any email for testing

2) Import a user locally

- Go to `/users`
- Import a ReqRes user id (e.g. 2)

3) RBAC / Admin role

- Roles are stored in the local database on the `users.role` field.
- JWT role is taken from DB on every login.

To become admin for testing:

- Import your own user with role `ADMIN` (send `{ "role": "ADMIN" }` in `POST /api/users/import/:id`) or update a saved user role once you already have an admin session.
- Logout and login again to receive a JWT with the updated role.

4) Posts

- Create posts in `/posts/new`
- List posts in `/posts`
- View details in `/posts/:id`
- Edit in `/posts/:id/edit`

Only `ADMIN` can delete posts and users.

## Deployment (AWS Lambda)

### Backend

The backend is configured for AWS Lambda deployment via Serverless Framework.

**Prerequisites:**
- AWS CLI configured with credentials
- Serverless Framework: `npm install -g serverless`

**Deploy:**
```bash
cd apps/backend
serverless login
serverless deploy
```

**Required AWS Systems Manager (SSM) parameters:**
- `/portal/DATABASE_URL` - PostgreSQL connection string
- `/portal/JWT_SECRET` - Secret for JWT signing
- `/portal/JWT_EXPIRES_IN` - Token expiration (e.g., "7d")
- `/portal/CORS_ORIGIN` - Frontend URL (e.g., "https://yourapp.vercel.app")
- `/portal/COOKIE_DOMAIN` - Cookie domain (e.g., ".vercel.app")

**Or use environment variables directly** (see `serverless.yml`)

### Frontend (Vercel/Netlify)

```bash
cd apps/frontend
vercel deploy
```

Update `NEXT_PUBLIC_API_URL` to point to your Lambda URL.

## Observability / Request tracing

- Backend generates or forwards `X-Request-ID` on every request.
- Backend logs include `requestId`, method/path, status code, latency.
- Frontend error UI displays `Request ID` when present in response headers.

## Testing

**Backend:**
```bash
pnpm --filter backend test
```

**Frontend:**
```bash
pnpm --filter frontend test
```

## Scripts

From repo root:

- Backend dev: `pnpm dev:backend`
- Frontend dev: `pnpm dev:frontend`

