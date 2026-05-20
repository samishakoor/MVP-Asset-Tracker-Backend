# AssetTrack — Backend API

Express.js REST API for **AssetTrack**, an internal asset management system. Handles authentication, inventory, employee assignments, support tickets, audit events, and admin dashboard summaries.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js (ES modules) |
| Framework | Express 4 |
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
├── prisma/
│   ├── schema.prisma       # Database schema and enums
│   ├── seed.js             # Default admin + employee users
│   └── migrations/         # SQL migrations
├── src/
│   ├── app.js              # Express app (middleware, /api mount)
│   ├── server.js           # HTTP server entry point
│   ├── config/
│   │   ├── database.js     # Prisma client singleton
│   │   └── index.js        # Env: PORT, JWT, CORS URLs
│   ├── constants/          # Roles, statuses, error/success messages
│   ├── controllers/        # HTTP handlers (Joi + catchAsync)
│   ├── middlewares/        # auth, roles, errorHandler, notFound
│   ├── models/             # Prisma data access (class per entity)
│   ├── routes/             # Route modules mounted under /api
│   ├── services/           # Business logic and transactions
│   ├── utils/              # JWT, passwords, APIError, event helpers
│   └── validators/         # Joi schemas per resource
├── nodemon.json
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL running locally (or remote instance)
- npm

### Installation

From the `asset_tracker/` directory:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

API base: `http://localhost:3000/api`  
Health check: `GET /api/ping`

### Seed users

After `npm run prisma:seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@test.com` | `Admin123!` |
| Employee | `employee@test.com` | `Employee123!` |

## Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| Dev | `npm run dev` | Nodemon with auto-restart |
| Start | `npm start` | Production server |
| Generate client | `npm run prisma:generate` | Regenerate Prisma Client |
| Migrate (dev) | `npm run prisma:migrate` | Create/apply migrations |
| Migrate (prod) | `npm run prisma:migrate:deploy` | Deploy migrations |
| Push schema | `npm run prisma:push` | Push schema without migration (dev only) |
| Studio | `npm run prisma:studio` | Database GUI |
| Seed | `npm run prisma:seed` | Insert default users |

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
| PATCH | `/assignments/:id/acknowledge` | Employee | Acknowledge receipt |

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
- **`resolveEventTargetEmployeeNames`** — enriches audit events with employee names from metadata, assignments, or tickets

## Database

### Migrations

```bash
npm run prisma:migrate          # development: create + apply
npm run prisma:migrate:deploy   # production: apply pending only
```

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
3. Register router in `src/routes/index.js`
4. Add Joi schema in `src/validators/` if the endpoint accepts input
5. Mirror constants in `src/constants/index.js` when adding enums

## Related Documentation

- Frontend app: `../client/README.md`
- API and service conventions: `../.cursor/rules/api_guidelines.mdc`
- Prisma / Postgres tooling: `../.cursor/rules/postgres_mcp.mdc`

## License

ISC
