# Alpha Queue Backend Technical Report

Date: 2026-04-24

This report explains the current backend implementation of Alpha Queue from the ground up. It is written for someone who is new to the backend, but it stays technically accurate and tied to the actual source files.

## 1. Project Overview

The backend is an Express.js API for a printing management system. It uses MongoDB through Mongoose and exposes REST API endpoints under:

```txt
/api/v1
```

The system is designed to support:

- User registration and login.
- Role-based access for Admin, SubAdmin, and User accounts.
- User profiles and printing quota/balance.
- Print job submission, file upload, pending release, release, cancellation, and refund.
- Printer and queue data for admin screens.
- Groups and group-based access.
- Notifications for job and quota events.
- Audit logs.
- Report summary aggregation.

In printing-management terms, the backend acts as the server that knows:

- Who the user is.
- Whether the user is allowed to print.
- Which queues and printers are available.
- How much quota the user has.
- Which print jobs are waiting for release.
- Whether a job has been released, printed, cancelled, failed, or refunded.

It also has early real-printer dispatch support through raw socket printing or the system `lp` command, but that integration is incomplete and should be treated as a demo/prototype path.

## 2. Architecture & Structure

The backend lives in:

```txt
backend/
```

Important folders and files:

```txt
backend/src/app.js
backend/src/server.js
backend/src/config/
backend/src/middleware/
backend/src/models/
backend/src/modules/
backend/src/routes/
backend/src/seeds/
backend/src/utils/
backend/storage/print-jobs/
```

### Application Entry Files

`src/server.js`

- Connects to MongoDB.
- Calls `ensureDefaultPrinterSetup()`.
- Starts the Express server.

`src/app.js`

- Creates the Express app.
- Enables security middleware with `helmet`.
- Enables CORS using `CLIENT_ORIGIN`.
- Parses JSON and URL-encoded requests.
- Enables request logging with `morgan`.
- Mounts all routes at `/api/v1`.
- Handles 404 errors.
- Handles central errors.

### Config

`src/config/env.js`

- Reads environment variables.
- Defines defaults for port, MongoDB database name, JWT, frontend origin, printing transport, upload limits, default printer, default queue, and printer socket settings.

`src/config/db.js`

- Connects to MongoDB with Mongoose.
- Requires `MONGO_URI`.

### Middleware

`src/middleware/auth.middleware.js`

- Reads `Authorization: Bearer <token>`.
- Verifies the JWT.
- Adds `req.userId`, `req.userRole`, and `req.userEmail`.

`src/middleware/role.middleware.js`

- Restricts endpoints to allowed roles.
- Used heavily for admin endpoints.

### Models

Models are Mongoose schemas:

- `User`
- `PrintJob`
- `Printer`
- `Queue`
- `Group`
- `QuotaTransaction`
- `Notification`
- `AuditLog`

### Modules

The backend is organized by feature module:

- `auth`: register, login, current user.
- `users`: user profile, dashboard, quota overview, admin user list.
- `jobs`: print job submission, upload, pending release, release, cancel.
- `quota`: quota adjustment, refund, redeem placeholder.
- `printers`: admin printer listing and default printer provisioning.
- `queues`: admin queue listing.
- `groups`: admin group CRUD.
- `notifications`: user/admin notification listing and status updates.
- `logs`: audit log listing.
- `reports`: admin report summary and export placeholder.
- `health`: basic health check.

Each module usually follows this pattern:

```txt
module.routes.js      -> Express routes and middleware
module.controller.js  -> Request/response handling
module.service.js     -> Business logic and database operations
module.validation.js  -> Input normalization/validation, when needed
```

## 3. User Model & Database

The user schema is defined in:

```txt
backend/src/models/User.js
```

### Main User Fields

`username`

- Required.
- Unique.
- Trimmed and lowercased.
- Used as login identity and university/user ID in some UI data.

`fullName`

- Required.
- Display name.

`email`

- Unique.
- Trimmed and lowercased.
- Used for login and token payload.

`phone`

- Optional.

`passwordHash`

- Required.
- Hidden from normal queries with `select: false`.
- Set through `user.setPassword(password)`.
- Validated through `user.validatePassword(password)`.

`systemRole`

- Enum: `Admin`, `SubAdmin`, `User`.
- Defaults to `User`.
- Indexed.

`userType`

- Enum: `Student`, `Faculty`, `Staff`.
- Defaults to `Student`.

`department`

- Department name.
- Used for queue access filtering.

`standing`

- Academic/user status text.
- Defaults to `Active`.

`groupId`

- Optional reference to `Group`.
- Used for group access and group statistics.

`isActive`

- Boolean account state.
- Defaults to `true`.
- Important note: login currently does not check `isActive`.

### Auth Fields

`auth.ssoProvider`

- Placeholder for SSO provider name.

`auth.externalId`

- Placeholder for external SSO ID.

`auth.lastLoginAt`

- Updated during local login.

There is no real SSO login flow implemented yet.

### Printing Fields

The most important backend printing state lives inside `user.printing`.

`printing.enabled`

- Boolean.
- Defaults to `true`.
- If `false`, the user cannot submit or release jobs.

`printing.restricted`

- Boolean.
- Defaults to `false`.
- If `true`, the user cannot submit or release jobs.

The backend checks restriction with:

```js
user.printing?.enabled === false || user.printing?.restricted === true
```

`printing.quota.remaining`

- Number.
- Defaults to `0`.
- Minimum value is `0`.
- Represents the user's current printing balance/quota.

`printing.quota.lastResetAt`

- Placeholder for quota reset tracking.

`printing.quota.resetPeriod`

- Placeholder for reset schedule.

`printing.quota.maxAccumulation`

- Placeholder for maximum quota accumulation.

`printing.primaryCardId`

- Placeholder for card-based printer authentication.

`printing.printerPinHash`

- Hidden field.
- Placeholder for printer PIN authentication.

`printing.defaultQueueId`

- Optional reference to `Queue`.
- Used when selecting default print queue.

`printing.pinLoginEnabled`, `failedPinAttempts`, `pinLockedUntil`

- PIN security placeholders.
- No complete PIN authentication flow is implemented.

### Statistics Fields

`statistics.totalPagesPrinted`

- Incremented when jobs are successfully released/printed.

`statistics.totalJobsSubmitted`

- Incremented when jobs are submitted/uploaded.

`statistics.lastActivityAt`

- Updated on login, quota changes, job submission, and printing.

### Virtual Fields

The schema exposes compatibility virtuals:

- `role` maps to `systemRole`.
- `restricted` maps to `printing.restricted`.
- `lastActivity` maps to `statistics.lastActivityAt`.
- `ssoProvider` maps to `auth.ssoProvider`.
- `ssoExternalId` maps to `auth.externalId`.

### Safe User Output

`user.toSafeObject()` returns a safe object for APIs. It excludes password fields and includes:

- id
- username
- fullName
- email
- phone
- role
- userType
- standing
- department
- restricted
- printing
- quota
- balance
- groupId
- notes
- isActive
- lastActivity
- createdAt
- updatedAt

Important note: `printing` is returned as a whole object. It does not include hidden `printerPinHash` unless explicitly selected, but the API still exposes many printing internals.

## 4. Authentication & Roles

Authentication is JWT-based.

### Register

`POST /api/v1/auth/register`

- Creates a local user.
- Hashes password with bcrypt.
- Returns a JWT.
- Allows caller to pass `role`, which is a security risk unless this endpoint is protected or role assignment is restricted.

### Login

`POST /api/v1/auth/login`

- Accepts email or username plus password.
- Looks up the user.
- Validates bcrypt password.
- Updates last login and activity.
- Returns a JWT.

### JWT Payload

The token contains:

```json
{
  "sub": "userMongoId",
  "role": "Admin",
  "email": "admin@example.com"
}
```

### Role Middleware

Routes use:

```js
requireRole("Admin", "SubAdmin")
```

to protect admin-style endpoints.

### Roles

Admin

- Can access all admin endpoints currently protected by `Admin` or `SubAdmin`.
- Can list users, groups, printers, queues, jobs, notifications, logs, quota, and reports.
- Can release/cancel any pending job through admin job endpoints.
- Can adjust quota and refund jobs.

SubAdmin

- Has the same backend permissions as Admin in the current code for protected admin routes.
- There is no finer permission split yet.

User

- Can access user endpoints.
- Can see own profile, quota, dashboard, notifications, jobs.
- Can submit/upload own jobs.
- Can release or cancel own jobs.
- Cannot access admin endpoints.

## 5. Printing System Logic

Printing is centered around:

- `User.printing`
- `PrintJob`
- `Queue`
- `Printer`
- `QuotaTransaction`

### Print Job Submission

There are two submission paths:

1. Metadata-only job creation:

```txt
POST /api/v1/user/jobs
```

2. Real file upload:

```txt
POST /api/v1/user/jobs/upload-print
```

The upload path is more complete because it stores a PDF file on disk.

### How Queue and Printer Are Selected

When a user submits a job:

1. Backend loads the user.
2. Backend resolves the selected queue or default printer setup.
3. Backend checks if the queue is active.
4. Backend checks if the user is restricted.
5. Backend checks allowed roles.
6. Backend checks allowed departments.
7. Backend checks allowed groups.
8. Backend checks restricted users for that queue.
9. Backend resolves a printer for the queue.

If no default printer IP is configured, default provisioning returns no printer/queue.

### How the Job Is Stored

`PrintJob` stores:

- job ID
- document name
- user snapshot
- queue/printer snapshot
- document metadata
- print settings
- source/client info
- status
- cost
- release information
- dispatch information
- error message

For upload jobs, the file is written to:

```txt
backend/storage/print-jobs/
```

The stored job includes:

- `document.storagePath`
- `document.storedFileName`
- `document.storedAt`
- `document.checksumSha256`
- `document.fileSize`

### File Handling

Current upload support accepts only PDF files.

Validation:

- MIME type must be `application/pdf`, or filename extension must be `.pdf`.
- Page count is estimated by scanning the PDF bytes for `/Type /Page`.
- This page counting is simple and may be inaccurate for some PDFs.

### Cost Calculation

Cost is calculated during job creation:

```txt
totalPages = pages * copies
totalCost = totalPages * printer.costPerPage
```

Default cost per page is usually `0.05` unless printer config says otherwise.

### Quota Check

Quota is checked during release, not during upload/submission.

Before release:

- If quota already deducted, skip deduction.
- If quota not deducted and user balance is less than job cost, reject with `409`.
- Create an insufficient-balance notification.

On successful release:

- Deduct quota using `applyQuotaChange`.
- Create a `QuotaTransaction` of type `Print Deduction`.
- Mark `job.cost.quotaDeducted = true`.

### Release Logic

When a job is released:

1. Load job by Mongo `_id` or `jobId`.
2. Confirm ownership unless admin scope.
3. Confirm job status is `Pending Release` or `Held`.
4. Load the job owner.
5. Reject if user printing is disabled/restricted.
6. Resolve queue and printer.
7. Check quota.
8. If the job has a stored file, dispatch it to printer.
9. Deduct quota.
10. Mark job as `Printed`.
11. Update user, queue, printer, and group statistics.
12. Refresh queue pending job count.
13. Create notification.
14. Create audit log.

### Real Printer Dispatch

The dispatch code supports two transports:

`socket`

- Sends raw bytes to printer host/port.
- Default port is `9100`.
- Requires printer IP or default printer IP.

`lp`

- Calls the local operating system `lp` command.
- Requires `PRINT_DESTINATION` or printer name.

Important limitation:

- The backend sends the PDF bytes directly.
- There is no full driver/rendering pipeline.
- Printers that do not accept raw PDF over socket may fail.

### Printing Enabled/Disabled Per User

The backend blocks submission and release when:

```txt
printing.enabled === false
```

or:

```txt
printing.restricted === true
```

This check is used in queue-access and release logic.

## 6. API Endpoints

All URLs are prefixed with:

```txt
/api/v1
```

Most endpoints return:

```json
{
  "success": true,
  "data": {}
}
```

Errors return:

```json
{
  "success": false,
  "message": "Error message"
}
```

### Public / General Routes

#### GET /

URL:

```txt
GET /api/v1/
```

What it does:

- Confirms API version is reachable.

Response example:

```json
{
  "success": true,
  "message": "Alpha Queue API v1"
}
```

#### GET /health

URL:

```txt
GET /api/v1/health
```

What it does:

- Basic health check.

Response example:

```json
{
  "success": true,
  "message": "Alpha Queue backend is running",
  "timestamp": "2026-04-24T18:30:00.000Z"
}
```

### Auth Routes

#### POST /auth/register

URL:

```txt
POST /api/v1/auth/register
```

What it does:

- Creates a local user account.
- Hashes password.
- Returns JWT and user.

Request body:

```json
{
  "username": "202400001",
  "fullName": "New User",
  "email": "new.user@example.com",
  "password": "password123",
  "role": "User"
}
```

Response example:

```json
{
  "success": true,
  "data": {
    "token": "jwt-token",
    "user": {
      "id": "mongo-id",
      "username": "202400001",
      "fullName": "New User",
      "email": "new.user@example.com",
      "role": "User",
      "quota": 0,
      "balance": 0
    }
  }
}
```

#### POST /auth/login

URL:

```txt
POST /api/v1/auth/login
```

What it does:

- Logs in using email or username.
- Returns JWT and safe user object.

Request body:

```json
{
  "emailOrUsername": "admin",
  "password": "admin123"
}
```

Response example:

```json
{
  "success": true,
  "data": {
    "token": "jwt-token",
    "user": {
      "id": "mongo-id",
      "username": "admin",
      "fullName": "System Administrator",
      "role": "Admin",
      "quota": 500
    }
  }
}
```

#### GET /auth/me

URL:

```txt
GET /api/v1/auth/me
```

Auth:

- Requires Bearer token.

What it does:

- Returns the current authenticated user.

Response example:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "mongo-id",
      "username": "admin",
      "role": "Admin"
    }
  }
}
```

### User Routes

#### GET /user/profile

URL:

```txt
GET /api/v1/user/profile
```

Auth:

- Any logged-in user.

What it does:

- Returns user object plus structured profile sections.

Response example:

```json
{
  "success": true,
  "data": {
    "user": {
      "username": "202279720",
      "role": "User",
      "quota": 24.5
    },
    "informationSections": [
      {
        "id": "personal-information",
        "title": "Personal Information",
        "fields": []
      }
    ]
  }
}
```

#### GET /user/quota/overview

URL:

```txt
GET /api/v1/user/quota/overview
```

What it does:

- Returns current quota and wallet summary cards.

Response example:

```json
{
  "success": true,
  "data": {
    "quota": 24.5,
    "balance": 24.5,
    "walletSummaryCards": []
  }
}
```

#### GET /user/quota/transactions

URL:

```txt
GET /api/v1/user/quota/transactions
```

What it does:

- Returns quota transaction history for current user.

Response example:

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "transaction-id",
        "description": "Print release deduction",
        "type": "Print Deduction",
        "amount": 1.2,
        "status": "Completed",
        "direction": "out",
        "balanceAfter": 23.3
      }
    ]
  }
}
```

#### GET /user/dashboard

URL:

```txt
GET /api/v1/user/dashboard?period=Today
```

What it does:

- Returns user dashboard card data, user info, and quick actions.

Response example:

```json
{
  "success": true,
  "data": {
    "period": "Today",
    "cards": [
      {
        "title": "Current Quota",
        "value": "24.50"
      }
    ],
    "quickActions": []
  }
}
```

#### GET /user/jobs/options

URL:

```txt
GET /api/v1/user/jobs/options
```

What it does:

- Returns queues the current user can access.
- Returns accepted MIME types and max file count.

Response example:

```json
{
  "success": true,
  "data": {
    "queues": [
      {
        "id": "queue-id",
        "name": "HP MFP M830 Secure Release Queue",
        "secureRelease": true,
        "printerId": "printer-id",
        "printerName": "HP MFP M830"
      }
    ],
    "defaultQueueId": "queue-id",
    "acceptedMimeTypes": ["application/pdf"],
    "maxFiles": 1
  }
}
```

#### POST /user/jobs

URL:

```txt
POST /api/v1/user/jobs
```

What it does:

- Creates a print job record without storing a file.
- Useful for metadata-only/test jobs.

Request body:

```json
{
  "queueId": "queue-id",
  "documentName": "assignment.pdf",
  "fileName": "assignment.pdf",
  "fileType": "pdf",
  "fileSize": 100000,
  "pages": 4,
  "copies": 1,
  "colorMode": "B&W",
  "mode": "Simplex",
  "paperSize": "A4",
  "quality": "Normal",
  "notes": "Optional note"
}
```

Response example:

```json
{
  "success": true,
  "data": {
    "job": {
      "id": "mongo-id",
      "jobId": "job-abc123",
      "documentName": "assignment.pdf",
      "status": "Pending Release",
      "cost": 0.2
    }
  }
}
```

#### POST /user/jobs/upload-print

URL:

```txt
POST /api/v1/user/jobs/upload-print
```

What it does:

- Uploads a raw PDF request body.
- Stores it in `storage/print-jobs`.
- Creates a pending release job.

Request:

- Body is raw PDF bytes.
- Content type should be `application/pdf`.

Headers:

```txt
x-alpha-file-name: assignment.pdf
x-alpha-original-file-name: assignment.pdf
x-alpha-queue-id: queue-id
x-alpha-document-name: Assignment
x-alpha-copies: 1
x-alpha-color-mode: B&W
x-alpha-mode: Simplex
x-alpha-paper-size: A4
x-alpha-quality: Normal
```

Response example:

```json
{
  "success": true,
  "data": {
    "job": {
      "jobId": "job-abc123",
      "documentName": "Assignment",
      "status": "Pending Release",
      "fileStorage": "storage/print-jobs/job-abc123-assignment.pdf"
    }
  }
}
```

#### GET /user/jobs/recent

URL:

```txt
GET /api/v1/user/jobs/recent
```

What it does:

- Returns current user's printed, failed, and refunded jobs.

Response example:

```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "job-001",
        "documentName": "slides.pdf",
        "pages": 12,
        "cost": 1.2,
        "status": "Printed"
      }
    ]
  }
}
```

#### GET /user/jobs/pending-release

URL:

```txt
GET /api/v1/user/jobs/pending-release
```

What it does:

- Returns current user's pending release jobs.

Response example:

```json
{
  "success": true,
  "data": {
    "pendingReleaseQuota": 24.5,
    "balance": 24.5,
    "jobs": [
      {
        "id": "job-001",
        "documentName": "thesis.pdf",
        "cost": 2.4,
        "estimatedReady": "Ready now"
      }
    ]
  }
}
```

#### POST /user/jobs/:jobId/release

URL:

```txt
POST /api/v1/user/jobs/job-001/release
```

What it does:

- Releases one pending job owned by current user.
- Dispatches file if file exists.
- Deducts quota.
- Marks job printed.

Request body:

```json
{}
```

Response example:

```json
{
  "success": true,
  "data": {
    "job": {
      "jobId": "job-001",
      "documentName": "thesis.pdf",
      "status": "Printed",
      "quotaDeducted": 2.4
    }
  }
}
```

#### POST /user/jobs/release-selected

URL:

```txt
POST /api/v1/user/jobs/release-selected
```

What it does:

- Releases selected current-user jobs.

Request body:

```json
{
  "jobIds": ["job-001", "job-002"]
}
```

Response example:

```json
{
  "success": true,
  "data": {
    "releasedCount": 1,
    "skippedCount": 1,
    "jobs": [],
    "skipped": [
      {
        "id": "job-002",
        "message": "Insufficient balance to release this job."
      }
    ]
  }
}
```

#### POST /user/jobs/release-all

URL:

```txt
POST /api/v1/user/jobs/release-all
```

What it does:

- Releases all eligible current-user pending jobs.
- For user scope, respects queue `allowReleaseAllJobs`.

Response example:

```json
{
  "success": true,
  "data": {
    "releasedCount": 2,
    "skippedCount": 0,
    "jobs": []
  }
}
```

#### DELETE /user/jobs/:jobId

URL:

```txt
DELETE /api/v1/user/jobs/job-001
```

What it does:

- Cancels current user's pending job.
- Refunds quota only if quota had already been deducted.

Response example:

```json
{
  "success": true,
  "data": {
    "job": {
      "jobId": "job-001",
      "status": "Cancelled",
      "refundedAmount": 0
    },
    "refundTransaction": null
  }
}
```

#### POST /user/quota/redeem

URL:

```txt
POST /api/v1/user/quota/redeem
```

What it does:

- Intended for redeem cards/codes.
- Currently not implemented.

Request body:

```json
{
  "code": "ABC-123"
}
```

Current response:

```json
{
  "success": false,
  "message": "Redeem code persistence is not configured yet. Add a RedeemCode model or external voucher provider before enabling this endpoint."
}
```

#### GET /user/notifications

URL:

```txt
GET /api/v1/user/notifications
```

Query filters:

- `search`
- `type`
- `severity`
- `status`
- `source`

What it does:

- Returns notifications visible to current user.

Response example:

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notification-id",
        "title": "Print job released successfully",
        "type": "print-job",
        "status": "unread"
      }
    ],
    "summary": {
      "total": 1,
      "unread": 1,
      "critical": 0,
      "actionRequired": 0
    }
  }
}
```

#### PATCH /user/notifications/:notificationId/read

URL:

```txt
PATCH /api/v1/user/notifications/notification-id/read
```

What it does:

- Marks a user-owned notification as read.

Response example:

```json
{
  "success": true,
  "data": {
    "notification": {
      "id": "notification-id",
      "status": "read"
    }
  }
}
```

#### PATCH /user/notifications/bulk/read

URL:

```txt
PATCH /api/v1/user/notifications/bulk/read
```

Request body:

```json
{
  "notificationIds": ["id-1", "id-2"]
}
```

What it does:

- Marks multiple user-owned notifications as read.

#### PATCH /user/notifications/:notificationId/archive

URL:

```txt
PATCH /api/v1/user/notifications/notification-id/archive
```

What it does:

- Archives a user-owned notification.

#### DELETE /user/notifications/:notificationId

URL:

```txt
DELETE /api/v1/user/notifications/notification-id
```

What it does:

- Deletes a user-owned notification.

#### POST /user/notifications/bulk/delete

URL:

```txt
POST /api/v1/user/notifications/bulk/delete
```

Request body:

```json
{
  "notificationIds": ["id-1", "id-2"]
}
```

What it does:

- Deletes multiple user-owned notifications.

### Admin Routes

All admin routes require:

```txt
Authorization: Bearer <token>
```

and role:

```txt
Admin or SubAdmin
```

#### GET /admin/users

URL:

```txt
GET /api/v1/admin/users
```

What it does:

- Lists all users with quota, restriction status, pages, jobs, and last activity.

Response example:

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user-id",
        "username": "202279720",
        "fullName": "Mohammed Alshammasi",
        "role": "User",
        "quota": 24.5,
        "restricted": "Unrestricted",
        "pages": 40,
        "jobs": 3
      }
    ]
  }
}
```

#### GET /admin/jobs/pending-release

URL:

```txt
GET /api/v1/admin/jobs/pending-release
```

What it does:

- Lists all pending release jobs.

Response example:

```json
{
  "success": true,
  "data": {
    "summary": {
      "total": 3,
      "totalPages": 40,
      "totalCost": 2
    },
    "jobs": []
  }
}
```

#### POST /admin/jobs/:jobId/release

URL:

```txt
POST /api/v1/admin/jobs/job-001/release
```

What it does:

- Admin releases any pending job.

Response:

- Same shape as user release endpoint.

#### POST /admin/jobs/release-selected

URL:

```txt
POST /api/v1/admin/jobs/release-selected
```

Request body:

```json
{
  "jobIds": ["job-001", "job-002"]
}
```

What it does:

- Admin releases selected jobs.

#### POST /admin/jobs/release-all

URL:

```txt
POST /api/v1/admin/jobs/release-all
```

What it does:

- Admin releases all pending jobs.
- Admin scope does not check queue `allowReleaseAllJobs`.

#### DELETE /admin/jobs/:jobId

URL:

```txt
DELETE /api/v1/admin/jobs/job-001
```

What it does:

- Admin cancels any pending job.

#### GET /admin/printers

URL:

```txt
GET /api/v1/admin/printers
```

What it does:

- Lists all printers for admin UI.

Response example:

```json
{
  "success": true,
  "data": {
    "printers": [
      {
        "id": "printer-id",
        "name": "HP LaserJet 401",
        "model": "HP LaserJet 401",
        "status": "Online",
        "ipAddress": "10.10.22.41",
        "costPerPage": 0.05
      }
    ]
  }
}
```

#### GET /admin/queues

URL:

```txt
GET /api/v1/admin/queues
```

What it does:

- Lists queues, assigned printers, access rules, and queue settings.

Response example:

```json
{
  "success": true,
  "data": {
    "queues": [
      {
        "id": "queue-id",
        "name": "Faculty Secure Queue",
        "status": "Active",
        "assignedPrinters": ["HP LaserJet 401"],
        "secureRelease": true
      }
    ]
  }
}
```

#### GET /admin/groups

URL:

```txt
GET /api/v1/admin/groups
```

What it does:

- Lists groups and summary counts.

Response example:

```json
{
  "success": true,
  "data": {
    "summary": {
      "total": 3,
      "restricted": 0,
      "selectedByDefault": 0,
      "totalMembers": 10
    },
    "groups": []
  }
}
```

#### GET /admin/groups/:groupId

URL:

```txt
GET /api/v1/admin/groups/group-id
```

What it does:

- Returns one group with members and allowed queues.

#### POST /admin/groups

URL:

```txt
POST /api/v1/admin/groups
```

What it does:

- Creates a group.
- Syncs user `groupId` for members.
- Validates allowed queue IDs.

Request body:

```json
{
  "name": "Software Engineering Group",
  "description": "Software Engineering students",
  "groupType": "Department",
  "memberUserIds": ["user-id"],
  "allowedQueueIds": ["queue-id"],
  "restricted": false,
  "selectedByDefault": false,
  "enabled": true,
  "canUpload": true,
  "canRelease": true,
  "initialCredit": 50,
  "perUserAllocation": 10,
  "resetPeriod": "Monthly",
  "costLimit": 100
}
```

Response:

- Returns group details.

#### PATCH /admin/groups/:groupId

URL:

```txt
PATCH /api/v1/admin/groups/group-id
```

What it does:

- Updates group fields, members, and allowed queues.

Request body:

- Same normalized fields as create.

#### DELETE /admin/groups/:groupId

URL:

```txt
DELETE /api/v1/admin/groups/group-id
```

What it does:

- Deletes a group.
- Clears `groupId` from users in that group.
- Removes group from queue access rules.

#### POST /admin/quota/adjustments

URL:

```txt
POST /api/v1/admin/quota/adjustments
```

What it does:

- Adds or subtracts quota from a user.
- Creates a quota transaction.
- Creates notification.
- Creates audit log.

Request body:

```json
{
  "userId": "user-id",
  "amount": 25,
  "transactionType": "Credit Addition",
  "reason": "Manual top-up",
  "comment": "Added by admin",
  "method": "Admin Adjustment"
}
```

Response example:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "username": "202279720",
      "quota": 49.5
    },
    "transaction": {
      "id": "transaction-id",
      "type": "Credit Addition",
      "amount": 25,
      "amountBefore": 24.5,
      "amountAfter": 49.5
    }
  }
}
```

#### POST /admin/quota/jobs/:jobId/refund

URL:

```txt
POST /api/v1/admin/quota/jobs/job-mongo-id/refund
```

What it does:

- Refunds a job if it has deducted quota and refundable amount remains.

Request body:

```json
{
  "amount": 1.5,
  "reason": "Printer failed",
  "comment": "Partial refund",
  "method": "Manual Refund"
}
```

Response example:

```json
{
  "success": true,
  "data": {
    "job": {
      "id": "job-id",
      "jobId": "job-001",
      "status": "Refunded",
      "refundedAmount": 1.5
    },
    "transaction": {
      "id": "transaction-id",
      "amount": 1.5,
      "type": "Refund"
    }
  }
}
```

Important note:

- This endpoint uses `PrintJob.findById(jobId)`, so it expects Mongo `_id`, not the string `jobId`.

#### GET /admin/notifications

URL:

```txt
GET /api/v1/admin/notifications
```

What it does:

- Lists notifications for admin dashboard.

Query filters:

- `search`
- `type`
- `severity`
- `status`
- `source`

Response example:

```json
{
  "success": true,
  "data": {
    "notifications": [],
    "summary": {
      "total": 0,
      "unread": 0,
      "critical": 0,
      "resolved": 0
    }
  }
}
```

#### PATCH /admin/notifications/:notificationId/read

Marks an admin-visible notification as read.

#### PATCH /admin/notifications/bulk/read

Request body:

```json
{
  "notificationIds": ["id-1", "id-2"]
}
```

Marks many admin-visible notifications as read.

#### PATCH /admin/notifications/:notificationId/resolve

Marks notification as resolved.

#### PATCH /admin/notifications/:notificationId/dismiss

Marks notification as dismissed.

#### DELETE /admin/notifications/:notificationId

Deletes notification.

#### POST /admin/notifications/bulk/delete

Request body:

```json
{
  "notificationIds": ["id-1", "id-2"]
}
```

Deletes many notifications.

#### GET /admin/logs

URL:

```txt
GET /api/v1/admin/logs
```

What it does:

- Returns audit logs.

Query filters:

- `search`
- `category`
- `success`
- `startDate`
- `endDate`
- `limit`

Response example:

```json
{
  "success": true,
  "data": {
    "total": 1,
    "count": 1,
    "logs": [
      {
        "id": "log-id",
        "title": "Job Released",
        "type": "Print Job",
        "status": "Success",
        "user": "admin@example.com"
      }
    ],
    "auditLogs": []
  }
}
```

#### GET /admin/logs/audit

URL:

```txt
GET /api/v1/admin/logs/audit
```

What it does:

- Same implementation as `/admin/logs`.

#### GET /admin/reports/summary

URL:

```txt
GET /api/v1/admin/reports/summary?period=Last%2030%20days
```

What it does:

- Aggregates report summary data.
- Counts users, active printers, active queues, unread notifications.
- Aggregates jobs, top users, top printers, quota summary, group summary.

Response example:

```json
{
  "success": true,
  "data": {
    "period": "Last 30 days",
    "overviewCards": [],
    "systemSummary": {
      "totalUsers": 4,
      "activePrinters": 3,
      "totalJobs": 5
    },
    "jobStatusBreakdown": [],
    "topUsers": [],
    "topPrinters": [],
    "quotaSummary": [],
    "groupSummary": []
  }
}
```

#### POST /admin/reports/export

URL:

```txt
POST /api/v1/admin/reports/export
```

What it does:

- Intended to export report files.
- Currently not implemented.

Current response:

```json
{
  "success": false,
  "message": "Report export generation is not implemented yet. The summary aggregation endpoint is ready, but file export still needs a PDF/HTML/Excel writer."
}
```

## 7. Services & Business Logic

### auth.service.js

Handles:

- JWT creation.
- Local registration.
- Local login.
- Password hashing/validation through model methods.

Important rules:

- Duplicate email or username returns conflict.
- Login accepts username or email.

### users.service.js

Handles:

- Profile sections.
- Quota overview.
- Quota transaction mapping.
- User dashboard.
- Admin user table data.

Important rules:

- User dashboard counts all user jobs.
- Printed page count only counts jobs with status `Printed`.
- Admin user stats are aggregated from `PrintJob`.

### jobs.service.js

This is the main print-business service.

Handles:

- Queue/printer resolution.
- Queue access checks.
- Job creation.
- File-upload job creation.
- Pending/recent job mapping.
- Job release.
- Release selected/all.
- Job cancellation.
- Stats updates.
- Notifications.
- Audit logs.

Important rules:

- User must not be restricted.
- Queue must be active.
- Queue role/department/group restrictions are checked.
- Quota is checked at release.
- Quota is deducted at successful release.
- Admin can release/cancel any pending job.
- User can only manage own jobs.

### print-dispatch.service.js

Handles:

- PDF validation.
- File storage.
- Simple PDF page counting.
- SHA-256 checksum.
- Raw socket dispatch.
- `lp` command dispatch.

Important rules:

- Only PDF is supported.
- Socket printing needs printer IP.
- `lp` printing needs destination.

### quota.service.js

Handles:

- Applying quota changes.
- Creating quota transactions.
- Refunding job quota.
- Admin adjustment.
- Redeem placeholder.

Important rules:

- Quota cannot go below zero.
- Every quota change creates a `QuotaTransaction`.
- Quota changes create notifications for user-visible credit/refund events.
- Quota changes create audit logs.

### notifications.service.js

Handles:

- Creating notifications.
- Listing user-visible notifications.
- Listing admin notifications.
- Marking notifications read/resolved/dismissed/archived.
- Deleting notifications.

Important rules:

- User visibility depends on specific user, role, department, group, expiry, or public audience.
- Users can only mutate notifications targeted specifically to exactly one user.
- Shared notification per-user read state is not implemented.

### logs.service.js

Handles:

- Creating audit logs.
- Listing logs with filters.
- Mapping logs into UI-friendly records.

### reports.service.js

Handles:

- Summary aggregation.
- Export endpoint placeholder.

Important rules:

- Supported periods are Last 7 days, Last 30 days, Last 90 days, This year.
- Export is not implemented.

### groups.service.js

Handles:

- List groups.
- Group details.
- Create/update/delete groups.
- Sync group membership onto users.
- Validate allowed queues.
- Remove group references from users and queues on delete.

### printers.service.js

Handles:

- Admin printer list.

### printer.provision.service.js

Handles:

- Auto-provisioning a default printer and secure-release queue from environment variables.

Important condition:

- If `PRINT_DEFAULT_PRINTER_IP` is missing, no default printer/queue is created.

### queues.service.js

Handles:

- Admin queue list.

### health.service.js

Handles:

- Basic health response.

## 8. Logs, Reports, Notifications

### Logs

Implemented:

- Audit log schema.
- Audit log creation from job, quota, group, notification actions.
- Admin log listing.
- Filtering by search, category, success, date range, limit.

Partially implemented:

- Logs depend on code paths calling `recordAuditLog`.
- Not every possible admin action exists, so not every action can be logged.

Missing:

- No automatic request logging into database for every endpoint.
- No log export.
- No pagination beyond limit.

### Reports

Implemented:

- Summary endpoint.
- Counts users, printers, queues, notifications.
- Aggregates job status, top users, top printers, quota changes, group summary.

Partially implemented:

- Report data is good for dashboard cards and tables.

Missing:

- Export generation.
- Scheduled reports.
- PDF/Excel/CSV generation.
- Report persistence.

### Notifications

Implemented:

- Notification model.
- User notification listing.
- Admin notification listing.
- Mark read, resolve, dismiss/archive, delete.
- Notifications created during job queue, release, failed release, cancellation, quota updates, refunds.

Partially implemented:

- In-app notifications exist.

Missing:

- Email delivery.
- SMS delivery.
- Push delivery.
- Per-recipient read receipts for shared notifications.
- Notification creation admin endpoint.

## 9. Missing / Incomplete Features

Printing execution:

- Real printer integration is prototype-level.
- Raw socket dispatch may not work for printers that need a driver or print language conversion.
- No confirmation from printer that pages actually printed.
- Job is marked `Printed` after successful dispatch, not after device-confirmed completion.
- No SNMP/device polling.
- No print server integration.

Printer integration:

- No CRUD endpoints for printers.
- No live printer status checks.
- No toner/paper polling.
- No printer error ingestion.
- Default printer is created only if `PRINT_DEFAULT_PRINTER_IP` exists.

File handling:

- Only PDF upload is supported.
- No multipart/form-data support; upload uses raw request body.
- No virus scanning.
- No file preview generation.
- No file deletion/retention cleanup.
- No robust PDF page counting.
- No DOCX/PPTX conversion.

Auth:

- Registration can accept a role, which can allow privilege escalation if exposed publicly.
- No refresh tokens.
- No password reset.
- No email verification.
- No SSO login despite schema placeholders.
- No account lockout for password login.
- `isActive` is not checked during login or auth middleware.

Roles:

- Admin and SubAdmin currently have the same backend access.
- No granular permissions.

Quota:

- Redeem cards/codes are not implemented.
- Scheduled quota resets are not implemented.
- Group allocation is modeled but not automated.
- Max accumulation is modeled but not enforced.

Queues:

- Only list endpoint exists for admin.
- No queue create/update/delete endpoints.
- No automatic expiry of pending jobs.
- No approval workflow.

Users:

- Admin user list exists.
- No admin endpoints to create/update/restrict/delete users.

Reports:

- Export endpoint is not implemented.

Notifications:

- No email/SMS/push delivery.
- Shared notification read state is limited.

## 10. Full Print Flow Story

Here is the intended flow as a story.

1. User logs in.

The frontend sends email/username and password to `/api/v1/auth/login`. The backend checks the password and returns a JWT. The frontend uses that token for all protected requests.

2. User opens the print page.

The frontend calls `/api/v1/user/jobs/options`. The backend loads the user, checks which queues are active and accessible, resolves printers, and returns available queues plus PDF upload rules.

3. User uploads a PDF.

The frontend sends raw PDF bytes to `/api/v1/user/jobs/upload-print` with headers like file name, queue ID, copies, color mode, paper size, and quality.

4. Backend validates the file.

The backend checks that the file is a PDF. It stores the PDF in `storage/print-jobs`. It calculates a checksum and estimates page count.

5. Backend checks access.

The backend checks:

- The user exists.
- Printing is enabled.
- The user is not restricted.
- The queue is active.
- The user's role is allowed.
- The user's department is allowed if the queue restricts departments.
- The user's group is allowed if the queue restricts groups.
- The user is not listed as restricted on that queue.

6. Backend creates the job.

The backend creates a `PrintJob` with status `Pending Release`. It calculates cost based on page count, copies, and printer cost per page. It does not deduct quota yet.

7. User sees pending job.

The frontend calls `/api/v1/user/jobs/pending-release`. The backend returns jobs waiting for release and the user's current quota.

8. User releases the job.

The frontend calls `/api/v1/user/jobs/:jobId/release`.

9. Backend checks quota.

If the job cost is higher than the user's remaining quota, the backend rejects the release and creates an insufficient-balance notification.

10. Backend sends the file to printer.

If the job has a stored file, the backend dispatches it using either raw socket printing or the `lp` command.

11. Backend deducts quota.

If dispatch succeeds, the backend subtracts the job cost from the user's quota and creates a `QuotaTransaction`.

12. Backend marks job printed.

The job status changes to `Printed`. The backend updates user, queue, printer, and group statistics.

13. Backend notifies and logs.

The backend creates a success notification and audit log.

14. User sees job in recent history.

The frontend calls `/api/v1/user/jobs/recent`, and the job appears as printed.

Important reality check:

- The backend marks the job printed after dispatch succeeds, not after physical paper output is confirmed by the printer.

## 11. Issues or Risks

Security risks:

- Public registration allows `role` in request body. A caller may create Admin/SubAdmin accounts unless this is blocked elsewhere.
- JWT secret has a weak default: `change-this-secret-in-production`.
- `isActive` is not enforced in login/auth.
- No rate limiting on login/register.
- No password strength validation.
- No CSRF strategy, though JWT bearer auth reduces classic cookie CSRF exposure.
- CORS allows configured frontend origin, but deployment must ensure correct `CLIENT_ORIGIN`.

Printing risks:

- Raw socket printing can fail depending on printer capabilities.
- No printer status confirmation.
- No spooler/job tracking after dispatch.
- No file cleanup.
- No malware scanning.
- No strict file extension/content validation beyond simple PDF checks.

Data consistency risks:

- Release quota deduction and job status update are not wrapped in a MongoDB transaction.
- If something fails between quota deduction and job save, state could become inconsistent.
- Statistics are updated manually and may drift.
- `recordSuccessfulPrintStats` exists but release logic duplicates stat updates instead of using it.

Validation risks:

- Some endpoints have strong normalization, but many admin list endpoints do not need body validation.
- Group update normalization defaults many missing booleans/numbers, so partial PATCH may unintentionally reset fields.
- Admin refund expects Mongo `_id`, while other job endpoints accept `_id` or string `jobId`.

API design risks:

- Admin and SubAdmin have identical backend permissions.
- Some endpoints return UI-shaped data rather than raw domain objects. This is convenient for frontend but can make API reuse harder.
- Notification delete permanently deletes records rather than soft-deleting per recipient.

Operational risks:

- No automated tests were found in backend scripts.
- No migrations.
- No API documentation generation.
- No pagination for many list endpoints.
- No production file storage strategy.

## 12. Summary

### Done

- Express API application.
- MongoDB connection.
- Environment configuration.
- JWT auth.
- Local register/login/me.
- Role middleware.
- User profile, quota overview, quota transactions, dashboard.
- Admin users list.
- User job options.
- Metadata job creation.
- Raw PDF upload job creation.
- Pending and recent jobs.
- User/admin job release.
- User/admin selected release.
- User/admin release all.
- User/admin pending cancellation.
- Quota adjustment.
- Job refund.
- Quota transaction records.
- Printer list.
- Queue list.
- Group CRUD.
- Notifications list/update/delete.
- Audit logs.
- Report summary.
- Default printer/queue provisioning from environment.

### Partially Done

- Real print dispatch.
- File upload.
- Printer integration.
- Notifications.
- Logs.
- Reports.
- Group quota/access model.
- Queue access model.
- SSO/PIN/card authentication model fields.
- Quota reset/allocation model fields.

### Not Done

- Redeem code persistence.
- Report export generation.
- Printer CRUD.
- Queue CRUD.
- User admin CRUD/restrict endpoints.
- Real printer status polling.
- Confirmed physical print completion.
- File cleanup/retention jobs.
- DOCX/PPTX conversion.
- Robust PDF parsing.
- Email/SMS/push notifications.
- SSO login.
- PIN/card release flow.
- Granular SubAdmin permissions.
- Scheduled quota resets.
- Group quota allocation automation.
- Automated tests.
- MongoDB transactions for quota/job release consistency.
