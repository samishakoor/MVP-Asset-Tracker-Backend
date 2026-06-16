# AssetTrack — Backend API

Express.js REST API for **AssetTrack**, an internal asset management system. Handles authentication, inventory, employee assignments, support tickets, audit events, and admin dashboard summaries.

The backend is deployed on **Vercel as serverless functions** — each route group in `api/` runs as its own function. Local development uses a traditional Express server via `npm run dev`.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js (ES modules) |
| Framework | Express 4 |
| Deployment | Vercel serverless functions (`@vercel/node`) |
| Database | PostgreSQL |
| ORM | Prisma 5 |
| Auth | JWT (`jsonwebtoken`) + bcrypt password hashing |
| Validation | Joi |
| Security | Helmet, CORS, compression |

## Domain Model

| Model | Purpose |
|-------|---------|
| **User** | Admin or employee accounts (`admin`, `employee` roles) |
| **Asset** | Hardware inventory (type, serial, condition, status) |
| **Assignment** | Links an asset to an employee; tracks acknowledge/return |
| **SupportTicket** | Employee-reported issues on an assignment |
| **AssetEvent** | Immutable audit log (registered, assigned, acknowledged, returned, ticket/repair events) |

### Enums (see `prisma/schema.prisma`)

- **AssetStatus**: `available`, `assigned`, `acknowledged`, `pending_review`, `under_repair`
- **TicketStatus**: `open`, `under_review`, `resolved`
- **EventType**: `registered`, `assigned`, `acknowledged`, `returned`, `ticket_opened`, `repair_started`, `repair_completed`

Assignment and ticket workflows update asset status and append `AssetEvent` rows (with optional `metadata` for employee/assignment/ticket lookups).

## Project Structure

```
asset_tracker/
├── api/                        # Vercel serverless entry points (one function per route group)
│   ├── auth.js                 # /api/auth/*
│   ├── users.js                # /api/users/*
│   ├── assets.js               # /api/assets/*
│   ├── assignments.js          # /api/assignments/*
│   ├── support-tickets.js      # /api/support-tickets/*
│   ├── admin.js                # /api/admin/*
│   ├── notifications.js        # /api/notifications/*
│   └── ping.js                 # /api/ping
├── prisma/
│   ├── schema.prisma           # Database schema and enums
│   ├── seed.js                 # Default admin user (runs on Vercel build)
│   └── migrations/             # SQL migrations
├── scripts/
│   └── vercel-build.mjs        # Vercel build: prisma generate, db push, seed
├── src/
│   ├── app.js                  # Express app (shared middleware only)
│   ├── server.js               # Local dev server entry point (not deployed to Vercel)
│   ├── createServerlessApp.js  # Wrapper: mount routes + register error handlers
│   ├── config/
│   │   ├── database.js         # Prisma client singleton
│   │   └── index.js            # Env: PORT, JWT, CORS URLs
│   ├── constants/              # Roles, statuses, error/success messages
│   ├── controllers/            # HTTP handlers (Joi + catchAsync)
│   ├── middlewares/            # auth, roles, errorHandler, notFound
│   ├── models/                 # Prisma data access (class per entity)
│   ├── routes/                 # Route modules (shared by local dev + serverless)
│   ├── services/               # Business logic and transactions
│   ├── utils/                  # JWT, passwords, APIError, event helpers
│   └── validators/             # Joi schemas per resource
├── vercel.json                 # Vercel builds, routes, and build command
├── nodemon.json
└── package.json
```

## Serverless Architecture

Each file in `api/` is a separate Vercel serverless function. `vercel.json` maps incoming URLs to the correct function:

| URL pattern | Serverless function |
|-------------|---------------------|
| `/api/auth/*` | `api/auth.js` |
| `/api/users/*` | `api/users.js` |
| `/api/assets/*` | `api/assets.js` |
| `/api/assignments/*` | `api/assignments.js` |
| `/api/support-tickets/*` | `api/support-tickets.js` |
| `/api/admin/*` | `api/admin.js` |
| `/api/notifications/*` | `api/notifications.js` |
| `/api/ping` | `api/ping.js` |

Each function uses `createServerlessApp()` to mount its route module and register shared error handlers:

```js
import { createServerlessApp } from '../src/createServerlessApp.js';
import authRouter from '../src/routes/authRoutes.js';

export default createServerlessApp((app) => {
  app.use('/api/auth', authRouter);
});
```

**Local dev** mounts all routes together via `src/server.js`. **Production** splits them across serverless functions — controllers, services, and route logic are unchanged.

```
Local:   Request → src/server.js → src/routes/* → controller → service → Prisma

Vercel:  Request → vercel.json route → api/*.js → src/routes/* → controller → service → Prisma
```

## Getting Started (Local)

### Prerequisites

- Node.js 18+
- PostgreSQL running locally (or remote instance)
- npm

### Installation

From the `asset_tracker/` directory:

```bash
cp .env.example .env   # edit with your local values
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

API base: `http://localhost:3000/api`  
Health check: `GET /api/ping`  
Swagger docs: `http://localhost:3000/api-docs`

### Seed users

`prisma/seed.js` creates a default admin if one does not already exist. Check that file for the seeded email and password.

## Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| Dev | `npm run dev` | Local Express server with Nodemon |
| Vercel build | `npm run vercel-build` | Runs on deploy: `prisma generate`, `db push`, seed |
| Generate client | `npm run prisma:generate` | Regenerate Prisma Client |
| Migrate (dev) | `npm run prisma:migrate` | Create/apply migrations |
| Migrate (prod) | `npm run prisma:migrate:deploy` | Deploy migrations |
| Push schema | `npm run prisma:push` | Push schema without migration (dev only) |
| Studio | `npm run prisma:studio` | Database GUI |
| Seed | `npm run prisma:seed` | Insert default admin user |

## Deploying to Vercel

### 1. Connect the project

Import the repository in the [Vercel dashboard](https://vercel.com/dashboard) or deploy with the CLI:

```bash
npm i -g vercel
vercel login
vercel --prod
```

If deploying from the monorepo root, set **Root Directory** to `asset_tracker`.

### 2. Environment variables

Set these in Vercel (Production and Preview):

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (required at build time) |
| `JWT_SECRET` | JWT signing secret |
| `CLIENT_URL` | Frontend URL (no trailing slash) |
| `GOOGLE_OAUTH_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_OAUTH_CALLBACK_URL` | `https://<your-backend>.vercel.app/api/auth/google/callback` |
| `OAUTH_CLIENT_ID` | Email OAuth client ID |
| `OAUTH_CLIENT_SECRET` | Email OAuth client secret |
| `OAUTH_REFRESH_TOKEN` | Email OAuth refresh token |
| `OAUTH_EMAIL` | Sender email address |
| `SEED_ON_BUILD` | Set to `false` to skip seeding on deploy (default: runs seed) |

See `.env.example` for the full list.

### 3. Build and database sync

On each deploy, Vercel runs `vercel-build` (`scripts/vercel-build.mjs`), which:

1. Generates the Prisma Client
2. Runs `prisma db push` to sync the schema
3. Runs `prisma/seed.js` (unless `SEED_ON_BUILD=false`)

`DATABASE_URL` must be available at **build time**, not just runtime.

### 4. Test the deployment

```bash
curl https://<your-backend>.vercel.app/api/ping
```

Expected response:

```json
{"status":"OK","message":"pong"}
```

Set the frontend API URL:

```bash
VITE_API_BASE_URL=https://<your-backend>.vercel.app/api
```

## API Documentation

**Interactive API documentation is available via Swagger UI (local dev only):**

```
http://localhost:3000/api-docs
```

The Swagger UI provides:
- Complete list of all API endpoints
- Interactive testing interface
- Request/response schemas
- Authentication flow
- Example requests and responses

## Authentication

Protected routes use `Authorization: Bearer <token>` from login/signup.

- `POST /api/auth/signup` — register (public)
- `POST /api/auth/login` — login; returns JWT and sanitized user

Role checks use `requireRoles(UserRole.ADMIN)` or employee-only logic on specific routes.

## API Endpoints

All routes are prefixed with `/api`.

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/ping` | No | `{ status: 'OK', message: 'pong' }` |

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/signup` | No | Create account |
| POST | `/auth/login` | No | Login and receive JWT |

### Admin summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/summary` | Admin | Dashboard stats, assets per employee, recent events with target employee names |

### Users

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/users/me/assets` | Employee | Active assignments for logged-in employee |
| GET | `/users/me/assets/:assetId` | Employee | Single assigned asset detail |
| GET | `/users/me/history` | Employee | Returned assignment history |
| POST | `/users` | Admin | Create user |
| GET | `/users` | Admin | List users |
| GET | `/users/:id` | Admin | User by ID |
| PUT | `/users/:id` | Admin | Update user |
| DELETE | `/users/:id` | Admin | Delete user |

### Assets

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/assets` | Admin | Register asset |
| GET | `/assets` | Admin | List/filter assets |
| GET | `/assets/types` | Admin | Distinct asset types |
| GET | `/assets/:id` | Admin | Detail with assignments, tickets, audit events |
| PUT | `/assets/:id` | Admin | Update asset |
| DELETE | `/assets/:id` | Admin | Delete (blocked if active assignments) |

### Assignments

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/assignments` | Admin | Assign asset to employee |
| PATCH | `/assignments/:id/status` | Admin | Update assignment/asset status |
| PATCH | `/assignments/:id/return` | Admin | Return asset from employee |
| PATCH | `/assignments/:id/acknowledge` | Employee | Acknowledge asset |

### Support tickets

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/support-tickets` | Employee | Open ticket on active assignment |
| GET | `/support-tickets` | Admin | List tickets (filterable) |
| PATCH | `/support-tickets/:id/review` | Admin | Review ticket (`start_repair` or `resolve`) |

### Example: login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Admin123!"}'
```

Use the returned `token` on subsequent requests:

```bash
curl http://localhost:3000/api/assets \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Architecture

Request flow:

```
HTTP Request → Route → Controller (Joi validate) → Service → Model → Prisma → PostgreSQL
```

| Layer | Responsibility |
|-------|----------------|
| **Routes** | Mount paths, `authenticateUser`, `requireRoles` |
| **Controllers** | Parse request, validate body/params, call service, send JSON |
| **Services** | Business rules, transactions, event creation |
| **Models** | Prisma queries and includes |
| **Validators** | Joi schemas shared by controllers |

Cross-cutting:

- **`catchAsync`** — wraps async controllers; errors go to `errorHandler`
- **`APIError`** — structured errors with status codes and types
- **`createServerlessApp`** — mounts routes and registers `notFound` + `errorHandler` for each Vercel function
- **`resolveEventTargetEmployeeNames`** — enriches audit events with employee names from metadata, assignments, or tickets

## Database

### Migrations

```bash
npm run prisma:migrate          # development: create + apply
npm run prisma:migrate:deploy   # production: apply pending only
```

On Vercel, `prisma db push` runs automatically during deploy via `vercel-build`. For production teams preferring migrations, switch the build script to `prisma migrate deploy`.

### Reset (deletes all data)

```bash
npx prisma migrate reset
```

### Studio

```bash
npm run prisma:studio
```

## Adding Features

1. Update `prisma/schema.prisma` and run `npm run prisma:migrate`
2. Add or extend **model** → **service** → **controller** → **routes**
3. Register router in `src/routes/index.js` (for local dev)
4. If the route group is new, create a matching `api/<name>.js` serverless entry and add a route in `vercel.json`
5. Add Joi schema in `src/validators/` if the endpoint accepts input
6. Mirror constants in `src/constants/index.js` when adding enums

### Adding a new serverless function

1. Create `api/my-feature.js`:

```js
import { createServerlessApp } from '../src/createServerlessApp.js';
import myFeatureRouter from '../src/routes/myFeatureRoutes.js';

export default createServerlessApp((app) => {
  app.use('/api/my-feature', myFeatureRouter);
});
```

2. Add a route in `vercel.json`:

```json
{
  "src": "/api/my-feature/(.*)",
  "dest": "/api/my-feature.js"
}
```

3. Redeploy to Vercel.

## Related Documentation

- Frontend app: `../client/README.md`
- API and service conventions: `../.cursor/rules/api_guidelines.mdc`
- Prisma / Postgres tooling: `../.cursor/rules/postgres_mcp.mdc`

## License

ISC
