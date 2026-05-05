# kfupm-ezprint

kfupm-ezprint is a full-stack printing management system for university-style print services. It provides a public landing page, authenticated student and staff dashboards, quota and redeem-code management, secure print release, printer administration, notification tracking, reports, and a printer-screen release flow.

The project is split into a Next.js frontend and an Express/MongoDB backend.

## Main Features

- User login with JWT-based sessions.
- Role-based access for `User`, `SubAdmin`, and `Admin`.
- Student print submission, file upload, saved drafts, pending jobs, and recent jobs.
- Quota wallet, quota transactions, and redeem-code redemption.
- Admin dashboards for users, groups, shared accounts, printers, queues, notifications, logs, reports, and print release.
- Printer-screen endpoints for looking up and releasing jobs from a printer terminal.
- MongoDB Atlas persistence using Mongoose models.
- Socket-based printer dispatch support for raw print delivery.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB Atlas or local MongoDB |
| Auth | JWT, bcrypt password hashing |
| UI Libraries | Lucide React, Tabler Icons, Framer Motion, Recharts |

## Repository Structure

```text
kfupm-ezprint/
|-- frontend/                    # Next.js application
|   |-- app/                     # Routes, layouts, pages
|   |-- components/              # Reusable UI and shared components
|   |-- services/                # Browser API client and auth session helpers
|   |-- hooks/                   # React hooks
|   `-- lib/                     # Frontend utilities and mock data
|-- backend/                     # Express API
|   |-- src/
|   |   |-- config/              # Environment and database config
|   |   |-- middleware/          # Auth and role guards
|   |   |-- models/              # Mongoose schemas
|   |   |-- modules/             # Domain modules and route handlers
|   |   |-- routes/              # API route aggregator
|   |   |-- seeds/               # Database seed scripts
|   |   `-- utils/               # Backend helpers
|   `-- storage/                 # Runtime print-job storage, ignored by git
|-- docs/                        # Extended documentation
|-- shared/                      # Reserved cross-layer code
`-- README.md
```

## Getting Started

### Prerequisites

- Node.js 20 or newer. The project has also been run with Node.js 24.
- npm.
- MongoDB Atlas cluster or another MongoDB deployment.
- Optional printer reachable by IP if testing real socket dispatch.

### 1. Install Dependencies

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

### 2. Configure Backend Environment

Create `backend/.env`. Do not commit this file.

```env
NODE_ENV=development
PORT=5001
MONGO_URI=mongodb://<username>:<password>@<host-1>:27017,<host-2>:27017,<host-3>:27017/?tls=true&authSource=admin&replicaSet=<replica-set-name>&retryWrites=true&w=majority
MONGO_DB_NAME=kfupm_ezprint
MONGO_SERVER_SELECTION_TIMEOUT_MS=10000
DNS_SERVERS=192.168.8.1
CLIENT_ORIGIN=http://localhost:3000
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d

PRINT_UPLOAD_LIMIT=25mb
PRINT_TRANSPORT=socket
PRINT_SOCKET_PORT=9100
PRINT_TIMEOUT_MS=15000
PRINT_STORAGE_DIR=storage/print-jobs
PRINT_LP_RAW=false
PRINT_DEFAULT_PRINTER_IP=10.22.114.241
PRINT_DEFAULT_PRINTER_NAME=HP MFP M830
PRINT_DEFAULT_PRINTER_MODEL=HP MFP M830
PRINT_DEFAULT_PRINTER_BUILDING=22
PRINT_DEFAULT_PRINTER_ROOM=339
PRINT_DEFAULT_PRINTER_LOCATION_CODE=22/339
PRINT_DEFAULT_PRINTER_DEPARTMENT=CCM
PRINT_DEFAULT_QUEUE_NAME=CCM Secure Release Queue
PRINT_DEFAULT_COST_PER_PAGE=0.05
```

If MongoDB Atlas `mongodb+srv://` DNS lookup fails on your network, use the non-SRV multi-host URI shown above. It avoids Atlas SRV/TXT DNS lookup while still allowing the MongoDB driver to select the current primary through the replica set.

### 3. Configure Frontend Environment

Create `frontend/.env.local` if the backend is not using the default URL:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5001/api/v1
```

### 4. Seed the Database

From `backend/`:

```bash
npm run seed
npm run seed:required-users
npm run seed:local-demo-passwords
```

Useful local demo credentials depend on the seed script used. Common test logins include:

```text
User: 202279720 / 12345678
Admin: admin / admin123
```

If a login fails, rerun the relevant seed command and check `backend/src/seeds`.

### 5. Run the System

Start the backend:

```bash
cd backend
npm run dev
```

Health check:

```text
http://localhost:5001/api/v1/health
```

Start the frontend in a second terminal:

```bash
cd frontend
npm run dev
```

Open:

```text
http://localhost:3000
```

## Common Commands

### Backend

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start API with nodemon |
| `npm start` | Start API with Node |
| `npm run seed` | Seed sample data |
| `npm run seed:required-users` | Upsert required KFUPM users |
| `npm run seed:local-demo-passwords` | Backfill local demo passwords |

### Frontend

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Next.js development server |
| `npm run build` | Build production frontend |
| `npm start` | Start built Next.js app |
| `npm run lint` | Run ESLint |

## Documentation

Full system documentation is available in:

- [docs/SYSTEM_DOCUMENTATION.md](docs/SYSTEM_DOCUMENTATION.md)
- [docs/project-structure.md](docs/project-structure.md)
- [docs/page-function-inventory.md](docs/page-function-inventory.md)
- [docs/multi-printer-testing.md](docs/multi-printer-testing.md)
- [BACKEND_TECHNICAL_REPORT.md](BACKEND_TECHNICAL_REPORT.md)

## Troubleshooting

### MongoDB `querySrv ECONNREFUSED`

Node cannot resolve the Atlas SRV/TXT DNS records. Use a non-SRV MongoDB URI with the Atlas shard hosts and `replicaSet`, or set `DNS_SERVERS` in `backend/.env`.

### MongoDB `not primary`

The connection is pinned to a secondary node. Use a multi-host replica set URI instead of `directConnection=true`, or update the direct host to the current primary.

### `EADDRINUSE: address already in use :::5001`

Another backend process is already using port `5001`.

On Windows:

```powershell
Get-NetTCPConnection -LocalPort 5001 -State Listen
taskkill /PID <PID> /F
```

### Frontend cannot reach backend

Check that:

- Backend is running on `http://localhost:5001`.
- `frontend/.env.local` has `NEXT_PUBLIC_API_BASE_URL=http://localhost:5001/api/v1`.
- `CLIENT_ORIGIN` in `backend/.env` matches the frontend origin.

## Security Notes

- Never commit `.env` files or real MongoDB credentials.
- Rotate exposed MongoDB passwords immediately.
- Use a strong `JWT_SECRET` outside local development.
- Avoid `0.0.0.0/0` in MongoDB Atlas for production. Restrict access to known IPs.
- Treat uploaded print files as sensitive data and protect `backend/storage/`.
