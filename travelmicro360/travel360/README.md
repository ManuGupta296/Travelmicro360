# Travel360

Enterprise travel-booking platform — Spring Boot microservices (config-server, eureka,
api-gateway, auth, booking, payment, inventory, customer, notification, compliance) + a React frontend.

## Prerequisites
- Java 17+, Maven
- Node.js + npm
- MySQL 8 running on `localhost:3306`

## Environment variables / secrets

Secrets are **not** hardcoded in the repo. Each service reads them via `${VAR:default}`
placeholders in `application.properties` and the `config-server` YAML. Real values are
supplied through environment variables; safe placeholder defaults keep the app from
crashing if a var is missing.

| Variable | Purpose | Default (placeholder) |
|----------|---------|------------------------|
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USERNAME` | MySQL user | `root` |
| `DB_PASSWORD` | MySQL password | `changeme` ← **set this** |
| `JWT_SECRET` | JWT signing key (≥32 bytes, **same value across all services**) | a dev-only placeholder |

> ⚠️ The defaults are placeholders, not real credentials. You **must** provide a real
> `DB_PASSWORD` (and a strong `JWT_SECRET` for any non-local environment).

### Setup (local)
1. In `backend/`, copy the example file and fill in real values:
   ```
   cd backend
   copy .env.example .env        # Windows  (cp .env.example .env on macOS/Linux)
   ```
   Edit `backend/.env` and set `DB_PASSWORD` to your MySQL password. `.env` is **gitignored**.
2. Start the backend — `start-all.bat` auto-loads `backend/.env` into the environment:
   ```
   cd backend
   start-all.bat
   ```
3. Start the frontend:
   ```
   cd frontend
   npm install
   npm start
   ```

### Running from an IDE (IntelliJ, etc.)
`start-all.bat` only sets the vars for its own launched processes. For IDE runs, either:
- set `DB_PASSWORD` / `JWT_SECRET` in each Run Configuration's **Environment variables**, or
- set them once as **OS user environment variables** so every run inherits them.

Generate a strong JWT secret with, e.g.: `openssl rand -base64 48`

## Security notes
- `backend/.env` holds real secrets and is gitignored — never commit it. Commit only `backend/.env.example`.
- If the old real secret/password was ever pushed to a public repo, **rotate them** (change the MySQL
  password and generate a new `JWT_SECRET`) — git history still contains the old values.
