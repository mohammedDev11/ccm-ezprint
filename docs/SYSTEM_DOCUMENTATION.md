# kfupm-ezprint System Documentation

## 1. System Overview

kfupm-ezprint is a printing management platform designed for a university environment. It connects students, faculty, staff, administrators, printers, print queues, quota balances, and release workflows into one system.

The system has three main surfaces:

- Public frontend: landing, about, SSO/login entry, FAQ, and contact pages.
- Authenticated user portal: dashboard, print submission, pending jobs, recent jobs, wallet/quota, redeem codes, notifications, profile, and settings.
- Authenticated admin portal: dashboards and management pages for users, groups, shared accounts, jobs, printers, queues, notifications, logs, reports, redeem codes, and settings.

A fourth surface, the printer screen, supports print release from a printer-side interface.

## 2. Architecture

```text
Browser
  |
  | Next.js pages and components
  v
Frontend API client
  |
  | HTTP/JSON, JWT bearer tokens, file uploads
  v
Express API
  |
  | Mongoose models and services
  v
MongoDB
  |
  | print dispatch metadata and optional socket dispatch
  v
Printer / print storage
```

### Frontend

The frontend is a Next.js App Router application. It handles routing, role-aware navigation, local token storage, UI state, forms, charts, tables, and print-file upload.

Important paths:

- `frontend/app`: pages, route layouts, and page-level composition.
- `frontend/components`: reusable UI, shared tables, navigation, settings, and role guards.
- `frontend/services/api.ts`: centralized API client, login, token storage, authenticated requests, public requests, downloads, single-file uploads, and batch uploads.
- `frontend/hooks`: reusable React hooks.
- `frontend/lib`: utility code and frontend-only mock data.

### Backend

The backend is an Express API organized by domain modules. It uses Mongoose for MongoDB persistence, JWT for authentication, and route-level role middleware for authorization.

Important paths:

- `backend/src/server.js`: application startup, database connection, default printer provisioning, local password backfill, and HTTP listener.
- `backend/src/app.js`: Express app setup, security middleware, CORS, body parsing, API mounting, and error handling.
- `backend/src/config/env.js`: environment parsing.
- `backend/src/config/db.js`: MongoDB connection setup.
- `backend/src/middleware`: authentication and role authorization.
- `backend/src/models`: Mongoose schemas.
- `backend/src/modules`: controllers, services, validation, and routes by feature.
- `backend/src/routes/index.js`: API v1 route aggregator.
- `backend/src/seeds`: sample and required data setup.

## 3. Roles and Permissions

### User

Normal users can:

- View profile and dashboard data.
- Submit print jobs.
- Save and manage print drafts.
- View pending and recent jobs.
- Release eligible jobs.
- Redeem quota codes.
- View quota overview and transactions.
- Manage personal preferences.
- View and manage personal notifications.

### SubAdmin

SubAdmins can access selected administrative operations:

- Users overview.
- Groups.
- Shared accounts.
- Notifications.
- Logs.
- Quota adjustments.
- Redeem-code management.
- Admin preferences.

### Admin

Admins have full administrative access, including:

- Printer management.
- Queue management.
- Admin print release.
- Reports and exports.
- System settings.
- All SubAdmin capabilities.

Role checks are implemented through `requireAuth` and `requireRole(...)` middleware.

## 4. Authentication and Session Flow

Authentication is handled by the backend auth module:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

Login accepts `emailOrUsername` and `password`. On success, the backend returns a JWT and safe user profile data. The frontend stores tokens in `localStorage` with separate user and admin scopes:

- `kfupm_ezprint_user_token`
- `kfupm_ezprint_admin_token`
- `kfupm_ezprint_user_profile`
- `kfupm_ezprint_admin_profile`
- `kfupm_ezprint_current_scope`

The frontend attaches the JWT to protected requests:

```http
Authorization: Bearer <token>
```

The backend verifies the token, attaches user identity and role to the request, and then applies any role-specific middleware.

## 5. Data Model

The backend stores application data in MongoDB through these Mongoose models:

| Model | Purpose |
| --- | --- |
| `User` | Identity, role, profile, printing preferences, quota, statistics, and account status |
| `Group` | Printing groups and group-level rules |
| `PrintJob` | Submitted jobs, release status, print options, accounting, and dispatch metadata |
| `PrintDraft` | Saved draft uploads and metadata before submission |
| `Printer` | Printer inventory, capabilities, status, location, and socket configuration |
| `Queue` | Print queues and queue-to-printer relationships |
| `QuotaTransaction` | Quota deductions, top-ups, refunds, and redeem activity |
| `RedeemCode` | Generated quota codes and redemption status |
| `Notification` | User and admin notification records |
| `SharedAccount` | Shared account relationships and account notes |
| `AuditLog` | Administrative and system activity records |
| `SystemSettings` | System-level preferences and settings |

## 6. Backend Modules

### Health

Provides a lightweight runtime check.

- `GET /api/v1/health`

### Auth

Handles registration, login, and current-user verification.

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

### Users

User-facing profile, dashboard, quota, and redemption endpoints.

- `GET /api/v1/user/profile`
- `GET /api/v1/user/quota/overview`
- `GET /api/v1/user/quota/transactions`
- `GET /api/v1/user/dashboard`
- `POST /api/v1/user/redeem`

Admin-facing user list:

- `GET /api/v1/admin/users`

### Jobs

User print-job endpoints:

- `GET /api/v1/user/jobs/options`
- `GET /api/v1/user/jobs/drafts`
- `POST /api/v1/user/jobs/drafts`
- `POST /api/v1/user/jobs/drafts/batch`
- `GET /api/v1/user/jobs/drafts/:draftId/files/:fileId`
- `DELETE /api/v1/user/jobs/drafts`
- `DELETE /api/v1/user/jobs/drafts/:draftId`
- `POST /api/v1/user/jobs`
- `POST /api/v1/user/jobs/upload-print`
- `POST /api/v1/user/jobs/upload-print-batch`
- `GET /api/v1/user/jobs/recent`
- `GET /api/v1/user/jobs/pending-release`
- `POST /api/v1/user/jobs/release-selected`
- `POST /api/v1/user/jobs/release-all`
- `POST /api/v1/user/jobs/:jobId/cancel-save-draft`
- `POST /api/v1/user/jobs/:jobId/release`
- `DELETE /api/v1/user/jobs/:jobId`

Admin print-release endpoints:

- `GET /api/v1/admin/jobs/pending-release`
- `POST /api/v1/admin/jobs/release-selected`
- `POST /api/v1/admin/jobs/release-all`
- `POST /api/v1/admin/jobs/:jobId/release`
- `DELETE /api/v1/admin/jobs/:jobId`

### Printer Screen

Public printer-screen flow for printer-side job lookup and release.

- `GET /api/v1/printer-screen`
- `POST /api/v1/printer-screen/lookup`
- `POST /api/v1/printer-screen/release`

### Printers and Queues

Printer administration:

- `GET /api/v1/admin/printers`
- `PATCH /api/v1/admin/printers/:printerId`
- `DELETE /api/v1/admin/printers/:printerId`

Queue administration:

- `GET /api/v1/admin/queues`

### Quota

User quota redemption:

- `POST /api/v1/user/quota/redeem`

Admin quota operations:

- `POST /api/v1/admin/quota/adjustments`
- `POST /api/v1/admin/quota/jobs/:jobId/refund`

### Redeem Codes

Admin redeem-code management:

- `GET /api/v1/admin/redeem-codes`
- `POST /api/v1/admin/redeem-codes/generate`
- `PATCH /api/v1/admin/redeem-codes/bulk/disable`
- `POST /api/v1/admin/redeem-codes/bulk/delete`
- `PATCH /api/v1/admin/redeem-codes/:id/disable`
- `DELETE /api/v1/admin/redeem-codes/:id`

### Groups and Shared Accounts

Group management:

- `GET /api/v1/admin/groups`
- `GET /api/v1/admin/groups/:groupId`
- `POST /api/v1/admin/groups`
- `PATCH /api/v1/admin/groups/:groupId`
- `DELETE /api/v1/admin/groups/:groupId`

Shared account management:

- `GET /api/v1/admin/accounts`
- `POST /api/v1/admin/accounts`
- `PATCH /api/v1/admin/accounts/:accountId`
- `PATCH /api/v1/admin/accounts/:accountId/primary`
- `PATCH /api/v1/admin/accounts/:accountId/link`
- `PATCH /api/v1/admin/accounts/:accountId/notes`
- `DELETE /api/v1/admin/accounts/:accountId`

### Notifications

User notifications:

- `GET /api/v1/user/notifications`
- `PATCH /api/v1/user/notifications/bulk/read`
- `POST /api/v1/user/notifications/bulk/delete`
- `PATCH /api/v1/user/notifications/:notificationId/read`
- `PATCH /api/v1/user/notifications/:notificationId/archive`
- `DELETE /api/v1/user/notifications/:notificationId`

Admin notifications:

- `GET /api/v1/admin/notifications`
- `PATCH /api/v1/admin/notifications/bulk/read`
- `POST /api/v1/admin/notifications/bulk/delete`
- `PATCH /api/v1/admin/notifications/:notificationId/read`
- `PATCH /api/v1/admin/notifications/:notificationId/resolve`
- `PATCH /api/v1/admin/notifications/:notificationId/dismiss`
- `DELETE /api/v1/admin/notifications/:notificationId`

### Logs, Reports, Dashboard, and Settings

Logs:

- `GET /api/v1/admin/logs`
- `GET /api/v1/admin/logs/audit`

Admin dashboard:

- `GET /api/v1/admin/dashboard/summary`

Reports:

- `GET /api/v1/admin/reports/summary`
- `POST /api/v1/admin/reports/export`

User settings:

- `GET /api/v1/user/settings`
- `PATCH /api/v1/user/settings/preferences`

Admin settings:

- `GET /api/v1/admin/settings`
- `PATCH /api/v1/admin/settings/preferences`
- `PATCH /api/v1/admin/settings/system`

## 7. Frontend Routes

### Public Pages

| Path | Purpose |
| --- | --- |
| `/` | Landing page |
| `/sections/about` | About page |
| `/sections/printer` | Printer-screen UI |

### User Pages

| Path | Purpose |
| --- | --- |
| `/sections/user/dashboard` | User overview, quota, quick actions, charts |
| `/sections/user/print` | File upload and print-job creation |
| `/sections/user/pending-jobs` | Jobs waiting for release |
| `/sections/user/recent-print-jobs` | Recent print history |
| `/sections/user/history` | Quota and transaction history |
| `/sections/user/wallet` | Quota wallet |
| `/sections/user/redeem` | Redeem quota code |
| `/sections/user/notifications` | User notifications |
| `/sections/user/profile` | Profile information |
| `/sections/user/settings` | Preferences and settings |

### Admin Pages

| Path | Purpose |
| --- | --- |
| `/sections/admin/dashboard` | Admin KPI dashboard and printer status |
| `/sections/admin/users` | User account management |
| `/sections/admin/groups` | Printing group management |
| `/sections/admin/accounts` | Shared account management |
| `/sections/admin/print-release` | Admin release queue |
| `/sections/admin/printers` | Printer inventory |
| `/sections/admin/queue-manger` | Queue management page |
| `/sections/admin/notifications` | Admin notification inbox |
| `/sections/admin/logs` | Activity and audit logs |
| `/sections/admin/redeem-codes` | Redeem-code generation and maintenance |
| `/sections/admin/reports` | Reporting and export |
| `/sections/admin/settings` | Admin and system preferences |

Note: the route folder is currently named `queue-manger`; keep links consistent with the existing folder name unless the route is renamed in code.

## 8. Print Workflow

1. User logs in and opens the print page.
2. Frontend requests print options from `/api/v1/user/jobs/options`.
3. User uploads one or more files.
4. Frontend sends raw file data or batch JSON to the jobs API.
5. Backend validates options, stores print metadata, deducts or reserves quota, and creates a `PrintJob`.
6. Job appears in pending release.
7. User or admin releases the job.
8. Backend dispatches the print job using configured printer transport.
9. Backend updates job status, user statistics, quota transactions, logs, and notifications.

Drafts follow the same file handling path but remain saved as `PrintDraft` records until submitted or deleted.

## 9. Printer Dispatch

Printer dispatch is configured through backend environment variables:

| Variable | Purpose |
| --- | --- |
| `PRINT_TRANSPORT` | Dispatch mode, currently socket-oriented |
| `PRINT_SOCKET_PORT` | Printer socket port, commonly `9100` |
| `PRINT_TIMEOUT_MS` | Printer connection timeout |
| `PRINT_STORAGE_DIR` | Local storage directory for print files |
| `PRINT_LP_RAW` | Enables raw LP behavior when supported |
| `PRINT_DEFAULT_PRINTER_IP` | Default printer IP |
| `PRINT_DEFAULT_PRINTER_NAME` | Default display name |
| `PRINT_DEFAULT_QUEUE_NAME` | Default queue name |

Additional printers can be configured with indexed environment variables:

```env
PRINT_PRINTER_2_IP=10.22.104.249
PRINT_PRINTER_2_NAME=New Secure Release Printer
PRINT_PRINTER_2_MODEL=New Secure Release Printer
PRINT_PRINTER_2_BUILDING=22
PRINT_PRINTER_2_ROOM=Unknown
PRINT_PRINTER_2_LOCATION_CODE=22/Unknown
PRINT_PRINTER_2_DEPARTMENT=CCM
PRINT_PRINTER_2_QUEUE_NAME=CCM Secure Release Queue
PRINT_PRINTER_2_COST_PER_PAGE=0.05
PRINT_PRINTER_2_CAPABILITIES=B&W,Duplex,Secure Release,PDF
```

## 10. Environment Variables

### Backend

| Variable | Required | Description |
| --- | --- | --- |
| `NODE_ENV` | No | Runtime mode |
| `PORT` | No | API port, commonly `5001` locally |
| `MONGO_URI` | Yes | MongoDB connection string |
| `MONGO_DB_NAME` | No | Database name, defaults to `kfupm_ezprint` |
| `MONGO_SERVER_SELECTION_TIMEOUT_MS` | No | MongoDB connection timeout |
| `DNS_SERVERS` | No | Comma-separated DNS servers for Node DNS lookups |
| `CLIENT_ORIGIN` | Yes | Allowed frontend origin for CORS |
| `JWT_SECRET` | Yes | JWT signing secret |
| `JWT_EXPIRES_IN` | No | JWT lifetime, defaults to `7d` |
| `PRINT_UPLOAD_LIMIT` | No | Upload size limit |
| `PRINT_TRANSPORT` | No | Printer dispatch mode |
| `PRINT_SOCKET_PORT` | No | Printer socket port |
| `PRINT_TIMEOUT_MS` | No | Printer dispatch timeout |
| `PRINT_STORAGE_DIR` | No | Print-job storage directory |
| `PRINT_DEFAULT_*` | No | Default printer and queue metadata |
| `PRINT_PRINTER_<N>_*` | No | Additional printer metadata |

### Frontend

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | No | API base URL, defaults to `http://localhost:5001/api/v1` |

## 11. Database Setup

Use MongoDB Atlas or another MongoDB deployment.

For Atlas:

1. Create a cluster.
2. Create a database user.
3. Add a network access rule for your machine.
4. Use a strong password.
5. Put the connection string in `backend/.env`.

If `mongodb+srv://` fails because of DNS, use the non-SRV multi-host URI:

```env
MONGO_URI=mongodb://<username>:<password>@<host-1>:27017,<host-2>:27017,<host-3>:27017/?tls=true&authSource=admin&replicaSet=<replica-set-name>&retryWrites=true&w=majority
```

This avoids SRV/TXT DNS lookup while preserving primary election support through `replicaSet`.

## 12. Seeding

Seed scripts live in `backend/src/seeds`.

Run from `backend/`:

```bash
npm run seed
npm run seed:required-users
npm run seed:local-demo-passwords
```

The main seed creates practical sample data for users, quota transactions, print jobs, printers, and queues. Required-user seeding upserts fixed user accounts. Local password seeding ensures demo login compatibility.

## 13. API Response Pattern

Most backend responses use this shape:

```json
{
  "success": true,
  "message": "Optional message",
  "data": {}
}
```

Errors typically use:

```json
{
  "success": false,
  "message": "Human-readable error"
}
```

The frontend API client unwraps `payload.data` when present.

## 14. File Upload Pattern

Single uploads use raw request bodies with headers:

- `Authorization: Bearer <token>`
- `Content-Type: <file mime type>`
- `X-kfupm-ezprint-File-Name`
- `X-kfupm-ezprint-Original-File-Name`

Batch uploads use:

```http
Content-Type: application/vnd.kfupm-ezprint.print-batch+json
```

The frontend encodes files as Base64 for batch uploads.

## 15. Security

Current security controls:

- JWT bearer authentication.
- Role-based route authorization.
- Password hashing with bcrypt.
- CORS restricted by `CLIENT_ORIGIN`.
- Helmet security middleware.
- Sensitive `.env` files ignored by git.

Operational requirements:

- Rotate any exposed MongoDB password.
- Use a strong, private `JWT_SECRET`.
- Limit MongoDB Atlas IP access in production.
- Protect uploaded print files in `backend/storage`.
- Avoid using demo passwords in production.
- Review role permissions before deployment.

## 16. Local Development Checklist

1. Install backend and frontend dependencies.
2. Create `backend/.env`.
3. Create `frontend/.env.local` if needed.
4. Confirm MongoDB access.
5. Run backend seed scripts.
6. Start backend on port `5001`.
7. Open `/api/v1/health`.
8. Start frontend on port `3000`.
9. Log in with seeded credentials.
10. Test user print flow and admin flow.

## 17. Troubleshooting

### `querySrv ECONNREFUSED`

Node cannot perform Atlas SRV DNS lookup. Use `DNS_SERVERS` or switch to a non-SRV multi-host MongoDB URI.

### `not primary`

The app connected directly to a secondary node. Use a multi-host replica set URI, or connect directly to the current primary only for temporary testing.

### `EADDRINUSE`

The configured backend port is already used.

Windows:

```powershell
Get-NetTCPConnection -LocalPort 5001 -State Listen
taskkill /PID <PID> /F
```

### Frontend gets unauthorized errors

Clear old tokens from browser local storage and log in again. The frontend stores separate user and admin session data.

### CORS error

Set backend `CLIENT_ORIGIN` to the exact frontend URL, for example:

```env
CLIENT_ORIGIN=http://localhost:3000
```

### Printer dispatch timeout

Check the printer IP, socket port, VPN/campus network, firewall, and `PRINT_TIMEOUT_MS`.

## 18. Extension Points

Good places to extend the system:

- Add new API modules under `backend/src/modules/<feature>`.
- Register new routes in `backend/src/routes/index.js`.
- Add new Mongoose models under `backend/src/models`.
- Add frontend pages under `frontend/app/sections`.
- Add shared UI components under `frontend/components`.
- Add cross-layer constants or schemas under `shared` only when both frontend and backend need them.

## 19. Known Notes

- `shared/` is reserved and currently light.
- `frontend/lib/mock-data` is for frontend-only mock data.
- The admin queue route folder is named `queue-manger`; rename carefully if changing public route paths.
- `.env` files are ignored by git and should remain local.
