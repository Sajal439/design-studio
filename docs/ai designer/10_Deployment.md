# Deployment & Infrastructure: HomeCraft AI
**Development and Production Environment Operations**

---

## 1. Local Development Architecture (`docker-compose.yml`)

For local environment scaffolding, we extend `infrastructure/docker/docker-compose.yml` to spin up supporting services:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: gt_postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: local_password
      POSTGRES_DB: design_studio_dev
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: gt_redis
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  redisdata:
```

---

## 2. Production Environment Specification

### A. Frontend & Gateway: Vercel
- The Next.js Turborepo workspace (`apps/web`) is deployed directly to **Vercel** with auto-building of static assets and Serverless Functions execution.
- Configured Environment Variables:
  - `DATABASE_URL`: Connection pooler URI from Supabase/Neon.
  - `JWT_SECRET_KEY`: High-entropy base64 string.
  - `CLOUDINARY_URL`: Storage asset synchronization endpoint.

### B. Transactional Database: Managed PostgreSQL (Supabase / Neon)
- Integrated with Connection Pooling (using PgBouncer or Neon connection pooler) to handle serverless connection spikes from Vercel edge functions.
- Run migrations during deployment pipelines using `prisma migrate deploy`.

### C. AI Generation Microservice: Serverless GPUs (Replicate / RunPod)
- Since hosting massive models like FLUX (24GB VRAM) on 24/7 dedicated GPUs is cost-prohibitive for startups, the generation tasks are offloaded to serverless GPU workers (Replicate / RunPod).
- FastAPI coordinates the webhook returns, saving the payload directly back to Supabase and emitting WebSocket alerts.

---

## 3. CI/CD Automation Workflow (GitHub Actions)

A `.github/workflows/deploy.yml` pipeline triggers on every pull request and merge to `main`:

```yaml
name: Test and Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      - name: Install Dependencies
        run: npm ci
      - name: Lint Codebase
        run: npm run lint
      - name: Check TypeScript Types
        run: npm run check-types
      - name: Verify Prisma Schema
        run: npx prisma validate --schema=packages/database/prisma/schema.prisma
```
