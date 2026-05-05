# kfupm-ezprint Page / Function Inventory

Generated from code inspection on 2026-04-22.

## Section 1: Project structure summary

### Frontend structure

- Routing uses the Next.js App Router only. There is no `frontend/pages/` directory.
- Public routes live under `frontend/app/`.
- Admin routes live under `frontend/app/sections/admin/`.
- User routes live under `frontend/app/sections/user/`.
- Shared UI is concentrated in:
  - `frontend/components/shared`
  - `frontend/components/ui`
  - `frontend/services`
  - `frontend/lib`
- `frontend/hooks/`, `frontend/lib/api/`, and `frontend/components/lib/` currently exist but contain no active files.
- Global state management is not implemented. The codebase relies on component-local `useState` / `useEffect`.
- API access is funneled through `frontend/services/api.ts`, which only exposes `apiGet()` and silently auto-logins with demo credentials.

### Backend structure

- Express app bootstrap: `backend/src/app.js`
- DB connection: `backend/src/config/db.js`
- API router root: `backend/src/routes/index.js`
- Active backend modules:
  - `auth`
  - `users`
  - `jobs`
  - `printers`
  - `queues`
  - `health`
- Shared backend middleware:
  - `backend/src/middleware/auth.middleware.js`
  - `backend/src/middleware/role.middleware.js`
- Shared backend helper:
  - `backend/src/utils/formatters.js`
- `backend/src/controllers/` and `backend/src/services/` are currently empty and appear to be leftovers from the old structure.

### MongoDB / Mongoose structure

Active model files in `backend/src/models/`:

- `User`
- `Group`
- `Queue`
- `Printer`
- `PrintJob`
- `QuotaTransaction`
- `Notification`
- `AuditLog` via `Log.js`

Current route-to-model coverage is partial:

- Wired to routes/services:
  - `User`
  - `PrintJob`
  - `QuotaTransaction`
  - `Printer`
  - `Queue`
- Present in schema layer but not exposed through visible feature routes:
  - `Group`
  - `Notification`
  - `AuditLog`

### Complete page list

| Route | Page Type | Status |
| --- | --- | --- |
| `/` | Public landing page | Live UI, no backend |
| `/sections/about` | Public page | Placeholder |
| `/sections/admin/dashboard` | Admin | Mock-only |
| `/sections/admin/users` | Admin | Live read, local-only edits |
| `/sections/admin/groups` | Admin | Mock-only |
| `/sections/admin/accounts` | Admin | Mock-only |
| `/sections/admin/printers` | Admin | Live read, local-only modal actions |
| `/sections/admin/queue-manger` | Admin | Live read, local-only modal actions |
| `/sections/admin/print-release` | Admin | Mock-only |
| `/sections/admin/reports` | Admin | Mock-only |
| `/sections/admin/logs` | Admin | Mock-only |
| `/sections/admin/notifications` | Admin | Mock-only |
| `/sections/admin/settings` | Admin | Placeholder |
| `/sections/user/dashboard` | User | Hybrid: cards/info/actions live, charts mock |
| `/sections/user/print` | User | UI-only, no backend submit |
| `/sections/user/recent-print-jobs` | User | Live read |
| `/sections/user/pending-jobs` | User | Live read |
| `/sections/user/history` | User | Mock-only |
| `/sections/user/wallet` | User | Hybrid: overview/transactions live, chart/actions mock |
| `/sections/user/redeem` | User | UI-only |
| `/sections/user/profile` | User | Live read |
| `/sections/user/notifications` | User | Mock-only |
| `/sections/user/settings` | User | Placeholder |

## Section 2: Page-by-page analysis

### PAGE NAME: Public Landing
- ROUTE: `/`
- FILE PATH: `frontend/app/page.tsx`
- ACCESS LEVEL: Public
- PURPOSE: Marketing and entry page for kfupm-ezprint, with navigation into the user and admin experiences.
- UI COMPONENTS USED:
  - `MainNavbar`
  - `Content`
  - `Hero`
  - `Features`
  - `HowItWorks`
  - `SecurePrivate`
  - `Questions`
  - `ContactUs`
  - `Footer`
- PAGE-SPECIFIC FUNCTIONS:
  - anchor navigation
  - mobile menu toggle
  - login modal open/close
  - hover preview for the “Start Printing” CTA
  - hero CTA links to user and admin sections
  - FAQ accordion
  - “Need More Help?” modal
  - contact form UI
  - scroll-to-top button
- API CALLS / DATA FETCHING: None
- BACKEND ENDPOINTS USED: None
- DATABASE COLLECTIONS / MODELS INVOLVED: None
- SHARED COMPONENTS USED:
  - `ThemeToggle`
  - `Button`
  - `Modal`
  - `FloatingInput`
  - `ProgressSteps`
- SHARED HOOKS / UTILS / HELPERS USED:
  - none beyond React hooks
- STATE MANAGEMENT USED:
  - local `useState` and `useEffect` in `MainNavbar`, `Content`, `Questions`, and `AskQuestion`
- VALIDATIONS / GUARDS:
  - no route guard
  - no form validation beyond browser defaults
- NOTES / ISSUES:
  - login modal SSO button is not wired to backend auth
  - `AskQuestion` only logs to console
  - `ContactUs` renders a form but has no submission handler
  - public CTAs navigate directly to admin and user sections even though those sections are intended to be role-scoped

### PAGE NAME: About
- ROUTE: `/sections/about`
- FILE PATH: `frontend/app/sections/about/page.tsx`
- ACCESS LEVEL: Public
- PURPOSE: Placeholder public informational page.
- UI COMPONENTS USED:
  - `PageIntro`
- PAGE-SPECIFIC FUNCTIONS: None
- API CALLS / DATA FETCHING: None
- BACKEND ENDPOINTS USED: None
- DATABASE COLLECTIONS / MODELS INVOLVED: None
- SHARED COMPONENTS USED:
  - `PageIntro`
- SHARED HOOKS / UTILS / HELPERS USED: None
- STATE MANAGEMENT USED: None
- VALIDATIONS / GUARDS: None
- NOTES / ISSUES:
  - page is only a header right now

### PAGE NAME: Admin Dashboard
- ROUTE: `/sections/admin/dashboard`
- FILE PATH: `frontend/app/sections/admin/dashboard/page.tsx`
- ACCESS LEVEL: Admin / Sub-Admin
- PURPOSE: Show high-level admin printing metrics, charts, and printer status.
- UI COMPONENTS USED:
  - `PageIntro`
  - `TopCards`
  - `GeneralLineChart`
  - `GeneralDonutChart`
  - `PrinterStatusTable`
- PAGE-SPECIFIC FUNCTIONS:
  - time-period switching
  - top-metric card carousel
  - chart filtering
  - printer search
  - printer sort
  - printer status filter modal
- API CALLS / DATA FETCHING: None
- BACKEND ENDPOINTS USED: None
- DATABASE COLLECTIONS / MODELS INVOLVED:
  - Current: none
  - Intended likely: `Printer`, `PrintJob`, `Queue`, `AuditLog`
- SHARED COMPONENTS USED:
  - `PageIntro`
  - `Card`
  - `GeneralLineChart`
  - `GeneralDonutChart`
  - `Button`
  - `Modal`
  - `FloatingInput`
- SHARED HOOKS / UTILS / HELPERS USED:
  - `cn`
- STATE MANAGEMENT USED:
  - page-local and component-local React state
- VALIDATIONS / GUARDS:
  - no frontend auth guard
  - admin shell is visual only
- NOTES / ISSUES:
  - fully mock-driven
  - no matching backend dashboard/reporting endpoint exists

### PAGE NAME: Admin Users
- ROUTE: `/sections/admin/users`
- FILE PATH: `frontend/app/sections/admin/users/page.tsx`
- ACCESS LEVEL: Admin / Sub-Admin
- PURPOSE: Review user accounts, quotas, restrictions, and activity.
- UI COMPONENTS USED:
  - `PageIntro`
  - `UserAccountsTable`
- PAGE-SPECIFIC FUNCTIONS:
  - search
  - sort
  - row selection
  - select all
  - filter modal
  - user detail modal
  - local quota edit
  - local restriction toggle
  - export users modal
  - assign quota modal
  - bulk delete / restrict / unrestrict actions
- API CALLS / DATA FETCHING:
  - `apiGet("/admin/users", "admin")`
- BACKEND ENDPOINTS USED:
  - `GET /api/v1/admin/users`
  - `users.controller#getAdminUsers`
  - `users.service#getAdminUsersData`
- DATABASE COLLECTIONS / MODELS INVOLVED:
  - `User`
  - `PrintJob`
- SHARED COMPONENTS USED:
  - `PageIntro`
  - `Table.tsx` primitives
  - `StatusBadge`
  - `Button`
  - `ExpandedButton`
  - `Dropdown`
  - `Input`
  - `Modal`
- SHARED HOOKS / UTILS / HELPERS USED:
  - `apiGet`
- STATE MANAGEMENT USED:
  - large amount of local table and modal state with `useState`
  - initial fetch via `useEffect`
- VALIDATIONS / GUARDS:
  - frontend: none
  - backend: `requireAuth` + `requireRole("Admin", "SubAdmin")`
- NOTES / ISSUES:
  - backend only provides a read endpoint
  - quota/restriction edits are local UI changes and are not persisted
  - if the API fails, the page falls back to mock data

### PAGE NAME: Admin Groups
- ROUTE: `/sections/admin/groups`
- FILE PATH: `frontend/app/sections/admin/groups/page.tsx`
- ACCESS LEVEL: Admin / Sub-Admin
- PURPOSE: Manage user groups, quota defaults, and restrictions.
- UI COMPONENTS USED:
  - `PageIntro`
  - `PrintingGroupsTable`
  - `AddGroupModal`
  - `FilterGroupsModal`
  - `GroupActionModal`
  - `GroupDetailsModal`
- PAGE-SPECIFIC FUNCTIONS:
  - search
  - sort
  - row selection
  - select all
  - restriction filter
  - period filter
  - quota range filter
  - add group
  - edit group details
  - assign quota
  - export selected groups
  - delete selected groups
  - inline restrict / unrestrict
- API CALLS / DATA FETCHING: None
- BACKEND ENDPOINTS USED: None
- DATABASE COLLECTIONS / MODELS INVOLVED:
  - Current: none
  - Intended likely: `Group`, `User`, `Queue`, `QuotaTransaction`
- SHARED COMPONENTS USED:
  - `PageIntro`
  - `Table.tsx` primitives
  - `Button`
  - `Dropdown`
  - `Modal`
  - `RangeSlider`
  - `SegmentToggle`
- SHARED HOOKS / UTILS / HELPERS USED: None
- STATE MANAGEMENT USED:
  - entirely local React state
- VALIDATIONS / GUARDS:
  - no frontend auth guard
- NOTES / ISSUES:
  - fully mock-driven
  - backend `Group` model exists, but there is no groups module or API route yet

### PAGE NAME: Admin Accounts
- ROUTE: `/sections/admin/accounts`
- FILE PATH: `frontend/app/sections/admin/accounts/page.tsx`
- ACCESS LEVEL: Admin / Sub-Admin
- PURPOSE: Switch between shared account management and transaction review.
- UI COMPONENTS USED:
  - `PageIntro`
  - `SegmentToggle`
  - `SharedAccountsTable`
  - `TransactionsTable`
- PAGE-SPECIFIC FUNCTIONS:
  - tab switching
  - shared account search
  - shared account sort
  - selection and bulk actions
  - account details modal
  - create grouping modal
  - linked accounts search
  - transaction search
  - transaction filter
  - transaction details modal
- API CALLS / DATA FETCHING: None
- BACKEND ENDPOINTS USED: None
- DATABASE COLLECTIONS / MODELS INVOLVED:
  - Current: none
  - Intended likely: `QuotaTransaction`, `User`, and a missing shared-account / cost-center model
- SHARED COMPONENTS USED:
  - `PageIntro`
  - `SegmentToggle`
  - `Table.tsx` primitives
  - `StatusBadge`
  - `Button`
  - `Input`
  - `Modal`
  - `Dropdown`
- SHARED HOOKS / UTILS / HELPERS USED:
  - `cn`
- STATE MANAGEMENT USED:
  - local React state in both table variants
- VALIDATIONS / GUARDS:
  - no frontend guard
- NOTES / ISSUES:
  - fully mock-driven
  - no backend module exists for shared accounts / cost centers

### PAGE NAME: Admin Printers
- ROUTE: `/sections/admin/printers`
- FILE PATH: `frontend/app/sections/admin/printers/page.tsx`
- ACCESS LEVEL: Admin / Sub-Admin
- PURPOSE: Monitor printer fleet status and open printer management modals.
- UI COMPONENTS USED:
  - `PageIntro`
  - `PrintersGrid`
  - `PrinterCard`
  - `AddPrinterModal`
  - `PrinterDetailsModal`
- PAGE-SPECIFIC FUNCTIONS:
  - search
  - printer-status filter
  - grid density toggle
  - open add printer modal
  - open printer details modal
- API CALLS / DATA FETCHING:
  - `apiGet("/admin/printers", "admin")`
- BACKEND ENDPOINTS USED:
  - `GET /api/v1/admin/printers`
  - `printers.controller#getAdminPrinters`
  - `printers.service#getAdminPrintersData`
- DATABASE COLLECTIONS / MODELS INVOLVED:
  - `Printer`
- SHARED COMPONENTS USED:
  - `PageIntro`
  - `SegmentToggle`
  - `Button`
  - `Dropdown`
  - `Modal`
- SHARED HOOKS / UTILS / HELPERS USED:
  - `apiGet`
- STATE MANAGEMENT USED:
  - local fetch state and modal state
- VALIDATIONS / GUARDS:
  - frontend: none
  - backend: `requireAuth` + `requireRole("Admin", "SubAdmin")`
- NOTES / ISSUES:
  - list can load from backend
  - add/edit flows are still local UI only

### PAGE NAME: Admin Queue Manager
- ROUTE: `/sections/admin/queue-manger`
- FILE PATH: `frontend/app/sections/admin/queue-manger/page.tsx`
- ACCESS LEVEL: Admin / Sub-Admin
- PURPOSE: Inspect queues, queue settings, assigned printers, and access rules.
- UI COMPONENTS USED:
  - `PageIntro`
  - `PrintQueuesTable`
- PAGE-SPECIFIC FUNCTIONS:
  - search
  - sort
  - row selection
  - select all
  - add queue modal
  - edit queue modal
  - tabbed queue form
  - configure printers
  - configure role/group/department/user access
  - configure secure release settings
  - configure job retention settings
- API CALLS / DATA FETCHING:
  - `apiGet("/admin/queues", "admin")`
- BACKEND ENDPOINTS USED:
  - `GET /api/v1/admin/queues`
  - `queues.controller#getAdminQueues`
  - `queues.service#getAdminQueuesData`
- DATABASE COLLECTIONS / MODELS INVOLVED:
  - `Queue`
  - `Printer`
  - `Group`
  - `User`
- SHARED COMPONENTS USED:
  - `PageIntro`
  - `SegmentToggle`
  - `Table.tsx` primitives
  - `StatusBadge`
  - `Button`
  - `Dropdown`
  - `FormFieldInput`
  - `Modal`
- SHARED HOOKS / UTILS / HELPERS USED:
  - `apiGet`
  - `cn`
- STATE MANAGEMENT USED:
  - large local form and modal state
- VALIDATIONS / GUARDS:
  - frontend: none
  - backend: `requireAuth` + `requireRole("Admin", "SubAdmin")`
- NOTES / ISSUES:
  - read path is wired
  - create/edit/delete actions are not persisted
  - route folder is misspelled as `queue-manger`

### PAGE NAME: Admin Print Release
- ROUTE: `/sections/admin/print-release`
- FILE PATH: `frontend/app/sections/admin/print-release/page.tsx`
- ACCESS LEVEL: Admin / Sub-Admin
- PURPOSE: Operate a held-job queue and release or delete pending print jobs.
- UI COMPONENTS USED:
  - `PageIntro`
  - `PrintReleaseTable`
- PAGE-SPECIFIC FUNCTIONS:
  - search
  - sort
  - row selection
  - select all
  - refresh timer
  - printer filter
  - status filter
  - color-only filter
  - duplex-only filter
  - single-job release
  - release all
  - release selected
  - delete selected
  - export queue
  - details modal
- API CALLS / DATA FETCHING: None
- BACKEND ENDPOINTS USED: None
- DATABASE COLLECTIONS / MODELS INVOLVED:
  - Current: none
  - Intended likely: `PrintJob`, `Printer`, `Queue`, `User`
- SHARED COMPONENTS USED:
  - `PageIntro`
  - `Table.tsx` primitives
  - `Button`
  - `ExpandedButton`
  - `Dropdown`
  - `Input`
  - `Modal`
- SHARED HOOKS / UTILS / HELPERS USED: None
- STATE MANAGEMENT USED:
  - entirely local React state
- VALIDATIONS / GUARDS:
  - no frontend guard
- NOTES / ISSUES:
  - core print-release flow is not connected to backend even though it is central to the product scope

### PAGE NAME: Admin Reports
- ROUTE: `/sections/admin/reports`
- FILE PATH: `frontend/app/sections/admin/reports/page.tsx`
- ACCESS LEVEL: Admin / Sub-Admin
- PURPOSE: Browse report categories and trigger report exports.
- UI COMPONENTS USED:
  - `PageIntro`
  - `ReportsPanel`
  - `ReportExportButton`
  - `UsageProgress`
  - `Card`
- PAGE-SPECIFIC FUNCTIONS:
  - category tabs
  - per-report period selection
  - export format selection
  - quick export actions
  - readiness display
- API CALLS / DATA FETCHING: None
- BACKEND ENDPOINTS USED: None
- DATABASE COLLECTIONS / MODELS INVOLVED:
  - Current: none
  - Intended likely: `PrintJob`, `Printer`, `Group`, `QuotaTransaction`, `User`, `AuditLog`
- SHARED COMPONENTS USED:
  - `PageIntro`
  - `Dropdown`
  - `Card`
  - `UsageProgress`
- SHARED HOOKS / UTILS / HELPERS USED:
  - `cn`
- STATE MANAGEMENT USED:
  - local category and per-row period state
- VALIDATIONS / GUARDS:
  - no frontend guard
- NOTES / ISSUES:
  - export buttons only `console.log`
  - no backend reporting module exists yet

### PAGE NAME: Admin Logs
- ROUTE: `/sections/admin/logs`
- FILE PATH: `frontend/app/sections/admin/logs/page.tsx`
- ACCESS LEVEL: Admin / Sub-Admin
- PURPOSE: Review activity log data for monitoring and troubleshooting.
- UI COMPONENTS USED:
  - `PageIntro`
  - `ActivityLogTable`
- PAGE-SPECIFIC FUNCTIONS:
  - search
  - type filter
  - status filter
  - sort
  - row selection
  - export selected
  - details modal
  - show/hide device IP and serial number in modal
- API CALLS / DATA FETCHING: None
- BACKEND ENDPOINTS USED: None
- DATABASE COLLECTIONS / MODELS INVOLVED:
  - Current: none
  - Intended likely: `AuditLog`, `User`, `PrintJob`, `Printer`, `Queue`
- SHARED COMPONENTS USED:
  - `PageIntro`
  - `Table.tsx` primitives
  - `StatusBadge`
  - `Dropdown`
  - `Button`
  - `Modal`
- SHARED HOOKS / UTILS / HELPERS USED: None
- STATE MANAGEMENT USED:
  - local filter, sort, selection, and modal state
- VALIDATIONS / GUARDS:
  - no frontend guard
- NOTES / ISSUES:
  - backend `AuditLog` model exists but is not connected to any route or page

### PAGE NAME: Admin Notifications
- ROUTE: `/sections/admin/notifications`
- FILE PATH: `frontend/app/sections/admin/notifications/page.tsx`
- ACCESS LEVEL: Admin / Sub-Admin
- PURPOSE: Monitor system notifications and configure notification rules.
- UI COMPONENTS USED:
  - `PageIntro`
  - `NotificationSummaryCards`
  - `NotificationTable`
  - `NotificationSettingsPanel`
- PAGE-SPECIFIC FUNCTIONS:
  - tab switching between notifications and settings
  - search
  - type / severity / status / source filtering
  - sort
  - row selection
  - refresh timer
  - bulk mark read / resolve / dismiss / delete
  - row resolve / dismiss / delete
  - local settings toggles and threshold editing
- API CALLS / DATA FETCHING: None
- BACKEND ENDPOINTS USED: None
- DATABASE COLLECTIONS / MODELS INVOLVED:
  - Current: none
  - Intended likely: `Notification`, `Printer`, `Queue`, `User`, `Group`
- SHARED COMPONENTS USED:
  - `PageIntro`
  - `Button`
  - `StatusBadge`
  - `Dropdown`
  - `Card`
  - `FloatingInput`
- SHARED HOOKS / UTILS / HELPERS USED: None
- STATE MANAGEMENT USED:
  - local page container state
  - derived filtered list via `useMemo`
- VALIDATIONS / GUARDS:
  - no frontend guard
- NOTES / ISSUES:
  - fully mock-driven
  - notification settings save is local only
  - backend `Notification` schema exists but has no route/service/page integration

### PAGE NAME: Admin Settings
- ROUTE: `/sections/admin/settings`
- FILE PATH: `frontend/app/sections/admin/settings/page.tsx`
- ACCESS LEVEL: Admin / Sub-Admin
- PURPOSE: Placeholder for admin settings.
- UI COMPONENTS USED:
  - `PageIntro`
- PAGE-SPECIFIC FUNCTIONS: None
- API CALLS / DATA FETCHING: None
- BACKEND ENDPOINTS USED: None
- DATABASE COLLECTIONS / MODELS INVOLVED: None
- SHARED COMPONENTS USED:
  - `PageIntro`
- SHARED HOOKS / UTILS / HELPERS USED: None
- STATE MANAGEMENT USED: None
- VALIDATIONS / GUARDS: None
- NOTES / ISSUES:
  - placeholder only

### PAGE NAME: User Dashboard
- ROUTE: `/sections/user/dashboard`
- FILE PATH: `frontend/app/sections/user/dashboard/page.tsx`
- ACCESS LEVEL: User
- PURPOSE: Central user summary page for balance, usage, and shortcuts.
- UI COMPONENTS USED:
  - `PageIntro`
  - `UserTopCards`
  - `UserDashboardCharts`
  - `UserInformationCard`
  - `UserQuickActionsCard`
- PAGE-SPECIFIC FUNCTIONS:
  - period selection for top cards
  - horizontal card scrolling
  - usage chart filtering
  - user info sensitive value toggle
  - quick-action deep links
- API CALLS / DATA FETCHING:
  - `apiGet("/user/dashboard", "user")` in:
    - `UserTopCards`
    - `UserInformationCard`
    - `UserQuickActionsCard`
- BACKEND ENDPOINTS USED:
  - `GET /api/v1/user/dashboard`
  - `users.controller#getDashboard`
  - `users.service#getDashboardData`
- DATABASE COLLECTIONS / MODELS INVOLVED:
  - `User`
  - `PrintJob`
- SHARED COMPONENTS USED:
  - `PageIntro`
  - `Card`
  - `Dropdown`
  - `GeneralLineChart`
  - `GeneralDonutChart`
- SHARED HOOKS / UTILS / HELPERS USED:
  - `apiGet`
- STATE MANAGEMENT USED:
  - local fetch state
  - local filter and visibility state
- VALIDATIONS / GUARDS:
  - frontend: none
  - backend: `requireAuth`
- NOTES / ISSUES:
  - hybrid page
  - cards, user info, and quick actions can load from backend
  - charts are still fed by mock data
  - fallback quick-action routes in `frontend/lib/mock-data/User/dashboard.ts` are wrong and point to non-existent pages

### PAGE NAME: User Print
- ROUTE: `/sections/user/print`
- FILE PATH: `frontend/app/sections/user/print/page.tsx`
- ACCESS LEVEL: User
- PURPOSE: Upload a file and configure a print job.
- UI COMPONENTS USED:
  - `PageIntro`
  - `FileUploadDemo`
  - `FileUpload`
  - `PrintJobModal`
  - `Button`
- PAGE-SPECIFIC FUNCTIONS:
  - multi-file selection
  - open modal on submit
  - 2-step print configuration
  - job naming
  - queue selection
  - copy count
  - color selection
  - duplex selection
- API CALLS / DATA FETCHING: None
- BACKEND ENDPOINTS USED: None
- DATABASE COLLECTIONS / MODELS INVOLVED:
  - Current: none
  - Intended likely: `PrintJob`, `Queue`, `User`
- SHARED COMPONENTS USED:
  - `PageIntro`
  - `Button`
  - `Modal`
  - `Dropdown`
  - `FileUpload`
- SHARED HOOKS / UTILS / HELPERS USED:
  - `FileUpload` internally uses browser `localStorage` for draft persistence
- STATE MANAGEMENT USED:
  - local form state and modal state
- VALIDATIONS / GUARDS:
  - no frontend validation beyond simple number minimum
- NOTES / ISSUES:
  - submit only `console.log`s the job
  - files are not sent to backend
  - queue list is static, not fetched

### PAGE NAME: User Recent Print Jobs
- ROUTE: `/sections/user/recent-print-jobs`
- FILE PATH: `frontend/app/sections/user/recent-print-jobs/page.tsx`
- ACCESS LEVEL: User
- PURPOSE: Review completed, failed, or refunded print jobs.
- UI COMPONENTS USED:
  - `PageIntro`
  - `RecentPrintJobsTable`
- PAGE-SPECIFIC FUNCTIONS:
  - search
  - status filter dropdown
  - additional filter modal
  - sort
  - row selection
  - select all
  - job details modal
- API CALLS / DATA FETCHING:
  - `apiGet("/user/jobs/recent", "user")`
- BACKEND ENDPOINTS USED:
  - `GET /api/v1/user/jobs/recent`
  - `jobs.controller#getRecentJobs`
  - `jobs.service#getRecentJobsData`
- DATABASE COLLECTIONS / MODELS INVOLVED:
  - `PrintJob`
  - `Printer`
- SHARED COMPONENTS USED:
  - `PageIntro`
  - `Table.tsx` primitives
  - `StatusBadge`
  - `Button`
  - `Dropdown`
  - `Modal`
- SHARED HOOKS / UTILS / HELPERS USED:
  - `apiGet`
  - `cn`
- STATE MANAGEMENT USED:
  - local fetch, filter, sort, selection, and modal state
- VALIDATIONS / GUARDS:
  - frontend: none
  - backend: `requireAuth`
- NOTES / ISSUES:
  - backend powers the list
  - any download/retry-like UI behavior is not backed by mutation endpoints

### PAGE NAME: User Pending Jobs
- ROUTE: `/sections/user/pending-jobs`
- FILE PATH: `frontend/app/sections/user/pending-jobs/page.tsx`
- ACCESS LEVEL: User
- PURPOSE: Review held jobs waiting for secure release.
- UI COMPONENTS USED:
  - `PageIntro`
  - `JobsPendingReleaseTable`
- PAGE-SPECIFIC FUNCTIONS:
  - sort
  - row selection
  - select all
  - quota balance display
  - selected-cost aggregation
  - release selected button
  - delete selected button
  - readiness progress display
  - job detail modal
- API CALLS / DATA FETCHING:
  - `apiGet("/user/jobs/pending-release", "user")`
- BACKEND ENDPOINTS USED:
  - `GET /api/v1/user/jobs/pending-release`
  - `jobs.controller#getPendingReleaseJobs`
  - `jobs.service#getPendingReleaseJobsData`
- DATABASE COLLECTIONS / MODELS INVOLVED:
  - `User`
  - `PrintJob`
  - `Printer`
- SHARED COMPONENTS USED:
  - `PageIntro`
  - `Table.tsx` primitives
  - `UsageProgress`
  - `Button`
  - `Modal`
- SHARED HOOKS / UTILS / HELPERS USED:
  - `apiGet`
  - `cn`
- STATE MANAGEMENT USED:
  - local fetch, sort, selection, derived totals, and modal state
- VALIDATIONS / GUARDS:
  - frontend: none
  - backend: `requireAuth`
- NOTES / ISSUES:
  - backend read path exists
  - release/delete actions are not connected to backend mutations

### PAGE NAME: User History
- ROUTE: `/sections/user/history`
- FILE PATH: `frontend/app/sections/user/history/page.tsx`
- ACCESS LEVEL: User
- PURPOSE: Review quota-related transaction history in a dedicated table view.
- UI COMPONENTS USED:
  - `PageIntro`
  - `UserTransactionHistoryTable`
- PAGE-SPECIFIC FUNCTIONS:
  - search
  - type filtering
  - sort
  - row selection
  - select all
  - filter modal
  - details modal
  - export button UI
- API CALLS / DATA FETCHING: None
- BACKEND ENDPOINTS USED: None
- DATABASE COLLECTIONS / MODELS INVOLVED:
  - Current: none
  - Intended likely: `QuotaTransaction`
- SHARED COMPONENTS USED:
  - `PageIntro`
  - `Table.tsx` primitives
  - `StatusBadge`
  - `Button`
  - `ExpandedButton`
  - `Dropdown`
  - `Modal`
  - `FloatingInput`
- SHARED HOOKS / UTILS / HELPERS USED:
  - `cn`
- STATE MANAGEMENT USED:
  - local table state only
- VALIDATIONS / GUARDS:
  - no frontend guard
- NOTES / ISSUES:
  - duplicates the wallet transaction concept but is not wired to `/user/quota/transactions`

### PAGE NAME: User Wallet
- ROUTE: `/sections/user/wallet`
- FILE PATH: `frontend/app/sections/user/wallet/page.tsx`
- ACCESS LEVEL: User
- PURPOSE: Show balance, wallet summary, and quota transaction activity.
- UI COMPONENTS USED:
  - `WalletOverview`
  - `WalletTransactionsTable`
  - `GeneralLineChart`
  - `Card`
  - `Button`
- PAGE-SPECIFIC FUNCTIONS:
  - load wallet summary cards
  - load quota balance
  - load transactions
  - transaction search
  - transaction sort
  - row selection
  - select all
  - transaction details modal
  - add funds CTA
  - redeem code CTA
  - wallet activity chart
- API CALLS / DATA FETCHING:
  - `apiGet("/user/quota/overview", "user")`
  - `apiGet("/user/quota/transactions", "user")`
- BACKEND ENDPOINTS USED:
  - `GET /api/v1/user/quota/overview`
  - `GET /api/v1/user/quota/transactions`
  - `users.controller#getQuotaOverview`
  - `users.controller#getQuotaTransactions`
  - `users.service#getQuotaOverviewData`
  - `users.service#getQuotaTransactionsData`
- DATABASE COLLECTIONS / MODELS INVOLVED:
  - `User`
  - `QuotaTransaction`
- SHARED COMPONENTS USED:
  - `Card`
  - `GeneralLineChart`
  - `Button`
  - `StatusBadge`
  - `Modal`
- SHARED HOOKS / UTILS / HELPERS USED:
  - `apiGet`
  - `cn`
- STATE MANAGEMENT USED:
  - local fetch state for cards and transactions
  - local chart constants
  - local table selection and sorting state
- VALIDATIONS / GUARDS:
  - frontend: none
  - backend: `requireAuth`
- NOTES / ISSUES:
  - hybrid page
  - overview and transaction list are live
  - chart and action buttons are still mock/UI only
  - page does not include a `PageIntro`, unlike the other user routes

### PAGE NAME: User Redeem
- ROUTE: `/sections/user/redeem`
- FILE PATH: `frontend/app/sections/user/redeem/page.tsx`
- ACCESS LEVEL: User
- PURPOSE: Enter a voucher/redeem code to add quota.
- UI COMPONENTS USED:
  - `PageIntro`
  - `RedeemCardBox`
- PAGE-SPECIFIC FUNCTIONS:
  - redeem code input
  - redeem button
- API CALLS / DATA FETCHING: None
- BACKEND ENDPOINTS USED: None
- DATABASE COLLECTIONS / MODELS INVOLVED:
  - Current: none
  - Intended likely: `QuotaTransaction`, `User`
- SHARED COMPONENTS USED:
  - `PageIntro`
  - `Card`
  - `Button`
  - `Input`
- SHARED HOOKS / UTILS / HELPERS USED: None
- STATE MANAGEMENT USED:
  - local input state
- VALIDATIONS / GUARDS:
  - no submit validation beyond controlled input
- NOTES / ISSUES:
  - no redeem backend flow exists

### PAGE NAME: User Profile
- ROUTE: `/sections/user/profile`
- FILE PATH: `frontend/app/sections/user/profile/page.tsx`
- ACCESS LEVEL: User
- PURPOSE: Display the user profile and printing identity.
- UI COMPONENTS USED:
  - `PageIntro`
  - `Information`
- PAGE-SPECIFIC FUNCTIONS:
  - fetch profile sections
  - sensitive field visibility toggle
  - render grouped profile cards
- API CALLS / DATA FETCHING:
  - `apiGet("/user/profile", "user")`
- BACKEND ENDPOINTS USED:
  - `GET /api/v1/user/profile`
  - `users.controller#getProfile`
  - `users.service#getProfileData`
- DATABASE COLLECTIONS / MODELS INVOLVED:
  - `User`
  - `Queue`
- SHARED COMPONENTS USED:
  - `PageIntro`
- SHARED HOOKS / UTILS / HELPERS USED:
  - `apiGet`
- STATE MANAGEMENT USED:
  - local fetch and per-field visibility state
- VALIDATIONS / GUARDS:
  - frontend: none
  - backend: `requireAuth`
- NOTES / ISSUES:
  - backend uses a fallback queue label if `printing.defaultQueueId` is not set

### PAGE NAME: User Notifications
- ROUTE: `/sections/user/notifications`
- FILE PATH: `frontend/app/sections/user/notifications/page.tsx`
- ACCESS LEVEL: User
- PURPOSE: Show job, balance, and system notifications to the end user.
- UI COMPONENTS USED:
  - `PageIntro`
  - `UserNotificationsTable`
- PAGE-SPECIFIC FUNCTIONS:
  - search
  - type/severity/status/source filters
  - sort
  - row selection
  - select all
  - refresh timer
  - bulk actions
  - details modal
  - action modal
  - delete modal
- API CALLS / DATA FETCHING: None
- BACKEND ENDPOINTS USED: None
- DATABASE COLLECTIONS / MODELS INVOLVED:
  - Current: none
  - Intended likely: `Notification`
- SHARED COMPONENTS USED:
  - `PageIntro`
  - `Button`
  - `ExpandedButton`
  - `Dropdown`
  - `Modal`
  - `Table.tsx` primitives
- SHARED HOOKS / UTILS / HELPERS USED: None
- STATE MANAGEMENT USED:
  - local filter, selection, timer, and modal state
- VALIDATIONS / GUARDS:
  - no frontend guard
- NOTES / ISSUES:
  - fully mock-driven even though `Notification` model exists in backend

### PAGE NAME: User Settings
- ROUTE: `/sections/user/settings`
- FILE PATH: `frontend/app/sections/user/settings/page.tsx`
- ACCESS LEVEL: User
- PURPOSE: Placeholder for personal preferences and print settings.
- UI COMPONENTS USED:
  - `PageIntro`
- PAGE-SPECIFIC FUNCTIONS: None
- API CALLS / DATA FETCHING: None
- BACKEND ENDPOINTS USED: None
- DATABASE COLLECTIONS / MODELS INVOLVED: None
- SHARED COMPONENTS USED:
  - `PageIntro`
- SHARED HOOKS / UTILS / HELPERS USED: None
- STATE MANAGEMENT USED: None
- VALIDATIONS / GUARDS: None
- NOTES / ISSUES:
  - placeholder only

## Section 3: Shared functions/components analysis

### Shared UI Components

#### SHARED ITEM: `PageIntro`
- TYPE: component
- FILE PATH: `frontend/components/shared/page/Text/PageIntro.tsx`
- USED IN PAGES:
  - almost every admin and user route
  - `/sections/about`
- RESPONSIBILITY: standard page title + description header
- SHOULD IT REMAIN SHARED?: Yes
- REFACTOR NOTES:
  - keep shared
  - `wallet` currently skips it; decide whether that is intentional

#### SHARED ITEM: `NavbarShell`
- TYPE: component / layout shell
- FILE PATH: `frontend/components/shared/page/navbar/NavbarShell.tsx`
- USED IN PAGES:
  - all admin pages via `frontend/app/sections/admin/layout.tsx`
  - all user pages via `frontend/app/sections/user/layout.tsx`
- RESPONSIBILITY: wraps role-based navigation and stores preferred navbar mode in `localStorage`
- SHOULD IT REMAIN SHARED?: Yes
- REFACTOR NOTES:
  - add real auth / role checks above this layer

#### SHARED ITEM: `AppNavbar` + sidebar/dock navbar stack
- TYPE: component
- FILE PATH:
  - `frontend/components/shared/page/navbar/AppNavbar.tsx`
  - `frontend/components/shared/page/navbar/SidebarNavbar.tsx`
  - `frontend/components/shared/page/navbar/DockNavbar/*`
- USED IN PAGES:
  - all admin and user routes
- RESPONSIBILITY: navigation chrome, mode switching, preview-video navigation
- SHOULD IT REMAIN SHARED?: Yes
- REFACTOR NOTES:
  - currently depends on mock nav config in `frontend/lib/mock-data/Navbar.ts`

#### SHARED ITEM: `Table.tsx` primitives
- TYPE: component set
- FILE PATH: `frontend/components/shared/table/Table.tsx`
- USED IN PAGES:
  - admin users
  - admin groups
  - admin logs
  - admin print release
  - user recent print jobs
  - user pending jobs
  - user history
  - user wallet transactions
- RESPONSIBILITY: common table shell, headers, search box, checkbox, empty state, layout helpers
- SHOULD IT REMAIN SHARED?: Yes
- REFACTOR NOTES:
  - good shared base
  - table state management is still duplicated page by page

#### SHARED ITEM: `Modal`
- TYPE: component
- FILE PATH: `frontend/components/ui/modal/Modal.tsx`
- USED IN PAGES:
  - public landing
  - admin users, groups, logs, notifications, print release, accounts
  - user recent print jobs, pending jobs, history, notifications, print
- RESPONSIBILITY: modal wrapper and scroll/close behavior
- SHOULD IT REMAIN SHARED?: Yes
- REFACTOR NOTES:
  - keep shared
  - many pages reimplement similar detail modal bodies and action-confirmation modals

#### SHARED ITEM: `Dropdown`
- TYPE: component set
- FILE PATH: `frontend/components/ui/dropdown/Dropdown.tsx`
- USED IN PAGES:
  - admin dashboard, accounts, notifications, print release, queue manager, reports
  - user dashboard, print, recent jobs, notifications, wallet
- RESPONSIBILITY: reusable dropdown trigger/content/item controls
- SHOULD IT REMAIN SHARED?: Yes
- REFACTOR NOTES:
  - keep shared

#### SHARED ITEM: `Button` and `ExpandedButton`
- TYPE: component
- FILE PATH:
  - `frontend/components/ui/button/Button.tsx`
  - `frontend/components/ui/button/ExpandedButton.tsx`
- USED IN PAGES:
  - nearly all pages with actions
- RESPONSIBILITY: shared action styling and icon-button patterns
- SHOULD IT REMAIN SHARED?: Yes
- REFACTOR NOTES:
  - keep shared
  - several pages still wrap these with page-local action buttons that could be standardized further

#### SHARED ITEM: `StatusBadge`
- TYPE: component
- FILE PATH: `frontend/components/ui/badge/StatusBadge.tsx`
- USED IN PAGES:
  - admin users
  - admin accounts
  - admin logs
  - user recent print jobs
  - user history
  - wallet transaction table
- RESPONSIBILITY: standard status pill rendering
- SHOULD IT REMAIN SHARED?: Yes
- REFACTOR NOTES:
  - several pages still build page-local wrappers around the shared badge

#### SHARED ITEM: `SegmentToggle`
- TYPE: component
- FILE PATH: `frontend/components/shared/actions/SegmentToggle.tsx`
- USED IN PAGES:
  - admin accounts
  - admin printers
  - admin queue manager
  - admin groups modals
- RESPONSIBILITY: shared segmented control
- SHOULD IT REMAIN SHARED?: Yes
- REFACTOR NOTES:
  - keep shared

#### SHARED ITEM: `Card`
- TYPE: component
- FILE PATH: `frontend/components/ui/card/Card.tsx`
- USED IN PAGES:
  - admin dashboard
  - admin reports
  - user dashboard
  - user wallet
- RESPONSIBILITY: base content card surface
- SHOULD IT REMAIN SHARED?: Yes
- REFACTOR NOTES:
  - keep shared

#### SHARED ITEM: `GeneralLineChart` and `GeneralDonutChart`
- TYPE: component
- FILE PATH:
  - `frontend/components/shared/charts/GeneralLineChart.tsx`
  - `frontend/components/shared/charts/GeneralDonutChart.tsx`
- USED IN PAGES:
  - admin dashboard
  - user dashboard
  - user wallet
- RESPONSIBILITY: reusable chart display
- SHOULD IT REMAIN SHARED?: Yes
- REFACTOR NOTES:
  - most chart datasets are still mock-only

#### SHARED ITEM: `UsageProgress`
- TYPE: component
- FILE PATH: `frontend/components/shared/features/UsageProgress.tsx`
- USED IN PAGES:
  - admin reports
  - user pending jobs
- RESPONSIBILITY: render quota / readiness style progress indicators
- SHOULD IT REMAIN SHARED?: Yes
- REFACTOR NOTES:
  - good candidate to use in more status-heavy screens

#### SHARED ITEM: `FileUpload`
- TYPE: component
- FILE PATH: `frontend/components/ui/button/file-upload.tsx`
- USED IN PAGES:
  - user print
- RESPONSIBILITY: drag/drop upload widget with draft persistence
- SHOULD IT REMAIN SHARED?: Yes
- REFACTOR NOTES:
  - currently only used in one page, but clearly reusable for future upload flows

### Shared API utilities

#### SHARED ITEM: `apiGet`
- TYPE: utility
- FILE PATH: `frontend/services/api.ts`
- USED IN PAGES:
  - admin users
  - admin printers
  - admin queue manager
  - user dashboard
  - user profile
  - user recent print jobs
  - user pending jobs
  - user wallet
- RESPONSIBILITY: perform authenticated `GET` requests and auto-login by scope
- SHOULD IT REMAIN SHARED?: Yes, but it needs redesign
- REFACTOR NOTES:
  - only supports `GET`
  - uses hardcoded demo credentials
  - hides real auth flow problems
  - should become a typed frontend service layer with explicit login/logout/token refresh

#### SHARED ITEM: `cn`
- TYPE: utility
- FILE PATH: `frontend/lib/cn.ts`
- USED IN PAGES:
  - admin reports
  - admin transactions
  - user recent print jobs
  - user pending jobs
  - wallet transactions
  - shared navbar pieces
- RESPONSIBILITY: class name merging
- SHOULD IT REMAIN SHARED?: Yes
- REFACTOR NOTES:
  - keep one version only
  - avoid duplicate helper definitions in mock-data folders

### Shared auth / role guard logic

#### SHARED ITEM: `requireAuth`
- TYPE: middleware
- FILE PATH: `backend/src/middleware/auth.middleware.js`
- USED IN PAGES:
  - indirectly powers all API-backed user/admin pages
- RESPONSIBILITY: validate JWT and attach `userId`, `userRole`, `userEmail`
- SHOULD IT REMAIN SHARED?: Yes
- REFACTOR NOTES:
  - frontend currently bypasses explicit auth UX by auto-login helper

#### SHARED ITEM: `requireRole`
- TYPE: middleware
- FILE PATH: `backend/src/middleware/role.middleware.js`
- USED IN PAGES:
  - indirectly powers admin users, printers, and queues pages
- RESPONSIBILITY: enforce role-based access for admin routes
- SHOULD IT REMAIN SHARED?: Yes
- REFACTOR NOTES:
  - frontend should mirror this with real route guards

### Shared backend services

#### SHARED ITEM: `users.service.js`
- TYPE: service
- FILE PATH: `backend/src/modules/users/users.service.js`
- USED IN PAGES:
  - user profile
  - user dashboard
  - user wallet
  - admin users
- RESPONSIBILITY: assemble profile data, dashboard data, quota overview, quota transactions, and admin user listing
- SHOULD IT REMAIN SHARED?: Yes
- REFACTOR NOTES:
  - already shared across several endpoints
  - would benefit from smaller sub-functions or domain split

#### SHARED ITEM: `jobs.service.js`
- TYPE: service
- FILE PATH: `backend/src/modules/jobs/jobs.service.js`
- USED IN PAGES:
  - user recent print jobs
  - user pending jobs
- RESPONSIBILITY: map `PrintJob` documents into page-friendly API payloads
- SHOULD IT REMAIN SHARED?: Yes
- REFACTOR NOTES:
  - add release/delete mutations when those pages become interactive

#### SHARED ITEM: `printers.service.js`
- TYPE: service
- FILE PATH: `backend/src/modules/printers/printers.service.js`
- USED IN PAGES:
  - admin printers
- RESPONSIBILITY: map `Printer` documents into grid card payloads
- SHOULD IT REMAIN SHARED?: Yes
- REFACTOR NOTES:
  - read-only today

#### SHARED ITEM: `queues.service.js`
- TYPE: service
- FILE PATH: `backend/src/modules/queues/queues.service.js`
- USED IN PAGES:
  - admin queue manager
- RESPONSIBILITY: populate queue relationships and expose queue settings/access data
- SHOULD IT REMAIN SHARED?: Yes
- REFACTOR NOTES:
  - add create/update/delete operations next

#### SHARED ITEM: `formatters.js`
- TYPE: helper
- FILE PATH: `backend/src/utils/formatters.js`
- USED IN PAGES:
  - admin users
  - user recent print jobs
  - user pending jobs
  - wallet transactions
- RESPONSIBILITY: date/time formatting and “ago” labels in backend payloads
- SHOULD IT REMAIN SHARED?: Yes
- REFACTOR NOTES:
  - keep shared

### Shared MongoDB models / schemas

#### SHARED ITEM: `User`
- TYPE: model
- FILE PATH: `backend/src/models/User.js`
- USED IN PAGES:
  - admin users
  - user dashboard
  - user profile
  - user wallet
  - user pending jobs
- RESPONSIBILITY: account identity, role, quota, printing identity, statistics
- SHOULD IT REMAIN SHARED?: Yes
- REFACTOR NOTES:
  - central schema already

#### SHARED ITEM: `PrintJob`
- TYPE: model
- FILE PATH: `backend/src/models/PrintJob.js`
- USED IN PAGES:
  - admin users
  - user dashboard
  - user recent print jobs
  - user pending jobs
- RESPONSIBILITY: uploaded documents, printer/queue assignment, cost, release and status metadata
- SHOULD IT REMAIN SHARED?: Yes
- REFACTOR NOTES:
  - currently missing create/release/delete API coverage

#### SHARED ITEM: `QuotaTransaction`
- TYPE: model
- FILE PATH: `backend/src/models/QuotaTransaction.js`
- USED IN PAGES:
  - user wallet
  - intended for user history
- RESPONSIBILITY: quota additions, deductions, refunds, approval metadata
- SHOULD IT REMAIN SHARED?: Yes
- REFACTOR NOTES:
  - connect `user/history` to this instead of separate mock data

#### SHARED ITEM: `Printer`
- TYPE: model
- FILE PATH: `backend/src/models/Printer.js`
- USED IN PAGES:
  - admin printers
  - user recent print jobs
  - user pending jobs
  - admin queue manager via population
- RESPONSIBILITY: printer identity, status, capabilities, network info, queue metadata
- SHOULD IT REMAIN SHARED?: Yes
- REFACTOR NOTES:
  - add mutation routes and status polling if desired

#### SHARED ITEM: `Queue`
- TYPE: model
- FILE PATH: `backend/src/models/Queue.js`
- USED IN PAGES:
  - admin queue manager
  - user profile via default queue label
  - print jobs through queue linkage
- RESPONSIBILITY: queue rules, access, security, job management, statistics
- SHOULD IT REMAIN SHARED?: Yes
- REFACTOR NOTES:
  - route typo and missing write APIs are the main problems, not the schema itself

#### SHARED ITEM: `Group`, `Notification`, `AuditLog`
- TYPE: model
- FILE PATH:
  - `backend/src/models/Group.js`
  - `backend/src/models/Notification.js`
  - `backend/src/models/Log.js`
- USED IN PAGES:
  - currently none through live backend routes
- RESPONSIBILITY:
  - group organization
  - notification delivery/state
  - audit/event logging
- SHOULD IT REMAIN SHARED?: Yes
- REFACTOR NOTES:
  - present at the schema layer but not yet connected to active modules or pages

### Shared hooks / validation logic

- No custom shared hooks are implemented yet.
- No central frontend validation layer is implemented yet.
- The repetition around search/sort/filter/selection is a strong sign that custom hooks should be introduced.

## Section 4: Traceability matrix

| Page | Frontend File | API / Action | Express Route | Controller / Service | MongoDB Model / Collection | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Public Landing | `frontend/app/page.tsx` | None | None | None | None | Marketing page only |
| About | `frontend/app/sections/about/page.tsx` | None | None | None | None | Placeholder |
| Admin Dashboard | `frontend/app/sections/admin/dashboard/page.tsx` | None | None | None | None | Mock-only |
| Admin Users | `frontend/app/sections/admin/users/page.tsx` | `apiGet("/admin/users","admin")` | `GET /api/v1/admin/users` | `users.controller#getAdminUsers` -> `users.service#getAdminUsersData` | `User`, `PrintJob` | Read-only backend; UI edits are local |
| Admin Groups | `frontend/app/sections/admin/groups/page.tsx` | None | None | None | None | Mock-only though `Group` model exists |
| Admin Accounts | `frontend/app/sections/admin/accounts/page.tsx` | None | None | None | None | Mock-only |
| Admin Printers | `frontend/app/sections/admin/printers/page.tsx` | `apiGet("/admin/printers","admin")` | `GET /api/v1/admin/printers` | `printers.controller#getAdminPrinters` -> `printers.service#getAdminPrintersData` | `Printer` | List loads live; modal actions are local |
| Admin Queue Manager | `frontend/app/sections/admin/queue-manger/page.tsx` | `apiGet("/admin/queues","admin")` | `GET /api/v1/admin/queues` | `queues.controller#getAdminQueues` -> `queues.service#getAdminQueuesData` | `Queue`, `Printer`, `Group`, `User` | Read path only |
| Admin Print Release | `frontend/app/sections/admin/print-release/page.tsx` | None | None | None | None | Mock-only |
| Admin Reports | `frontend/app/sections/admin/reports/page.tsx` | None | None | None | None | Exports are console-only |
| Admin Logs | `frontend/app/sections/admin/logs/page.tsx` | None | None | None | None | `AuditLog` model not wired |
| Admin Notifications | `frontend/app/sections/admin/notifications/page.tsx` | None | None | None | None | `Notification` model not wired |
| Admin Settings | `frontend/app/sections/admin/settings/page.tsx` | None | None | None | None | Placeholder |
| User Dashboard | `frontend/app/sections/user/dashboard/page.tsx` | `apiGet("/user/dashboard","user")` for cards/info/actions | `GET /api/v1/user/dashboard` | `users.controller#getDashboard` -> `users.service#getDashboardData` | `User`, `PrintJob` | Charts remain mock-only |
| User Print | `frontend/app/sections/user/print/page.tsx` | Local submit only | None | None | None | Print submit only logs |
| User Recent Print Jobs | `frontend/app/sections/user/recent-print-jobs/page.tsx` | `apiGet("/user/jobs/recent","user")` | `GET /api/v1/user/jobs/recent` | `jobs.controller#getRecentJobs` -> `jobs.service#getRecentJobsData` | `PrintJob`, `Printer` | Read path only |
| User Pending Jobs | `frontend/app/sections/user/pending-jobs/page.tsx` | `apiGet("/user/jobs/pending-release","user")` | `GET /api/v1/user/jobs/pending-release` | `jobs.controller#getPendingReleaseJobs` -> `jobs.service#getPendingReleaseJobsData` | `User`, `PrintJob`, `Printer` | Release/delete not implemented |
| User History | `frontend/app/sections/user/history/page.tsx` | None | None | None | None | Should likely use `QuotaTransaction` |
| User Wallet | `frontend/app/sections/user/wallet/page.tsx` | `apiGet("/user/quota/overview","user")`, `apiGet("/user/quota/transactions","user")` | `GET /api/v1/user/quota/overview`, `GET /api/v1/user/quota/transactions` | `users.controller#getQuotaOverview` / `getQuotaTransactions` -> `users.service#getQuotaOverviewData` / `getQuotaTransactionsData` | `User`, `QuotaTransaction` | Chart and action buttons are mock-only |
| User Redeem | `frontend/app/sections/user/redeem/page.tsx` | None | None | None | None | UI-only |
| User Profile | `frontend/app/sections/user/profile/page.tsx` | `apiGet("/user/profile","user")` | `GET /api/v1/user/profile` | `users.controller#getProfile` -> `users.service#getProfileData` | `User`, `Queue` | Read-only |
| User Notifications | `frontend/app/sections/user/notifications/page.tsx` | None | None | None | None | Mock-only |
| User Settings | `frontend/app/sections/user/settings/page.tsx` | None | None | None | None | Placeholder |

## Section 5: Refactor recommendations

### Repeated logic that should be refactored

1. Table state logic is duplicated across many pages.
   - Repeated patterns: `search`, `sortKey`, `sortDir`, `selectedIds`, `toggleSelectAll`, filter modal state, details modal state.
   - Candidate extraction:
     - `useTableSort`
     - `useTableSelection`
     - `useSearchFilter`
     - shared confirmation modal builders

2. Refresh timer logic is duplicated.
   - Appears in admin notifications, admin print release, and user notifications.
   - Candidate extraction:
     - reusable `useRefreshTimer`
     - reusable visual timer component

3. Page-local status-badge wrappers are repeated.
   - Pages wrap `StatusBadge` to express print job states, log states, transaction types, notification states.
   - Candidate extraction:
     - status mapping constants near domain modules
     - a small shared badge adapter per domain

4. Export / action modal workflows are repeated.
   - Admin users, groups, logs, accounts, and print release all build similar export/delete/assign flows.
   - Candidate extraction:
     - shared bulk action modal patterns
     - shared export helper

5. Data-fetch + fallback-to-mock pattern is repeated.
   - Admin users, printers, queues, and several user pages all do the same `apiGet(...).catch(() => keep fallback)` pattern.
   - Candidate extraction:
     - typed frontend domain services
     - route-level data hooks

### High-priority refactor recommendations

1. Replace the implicit demo-login API helper with a real auth flow.
   - `frontend/services/api.ts` silently logs in with hardcoded demo credentials.
   - This makes it hard to reason about real access control and hides missing login UX.

2. Add real frontend route guards.
   - Admin and user sections are only visually separated by `NavbarShell`.
   - Anyone can navigate directly to `/sections/admin/...` from the browser.

3. Finish the backend surface for the screens that look interactive.
   - Highest-value missing modules/routes:
     - groups
     - notifications
     - logs / audit log
     - print release mutations
     - print upload / create job
     - redeem / wallet mutations
     - reports export

4. Unify wallet and history features.
   - `user/history` and `user/wallet` both present transaction-style data.
   - Wallet is partially live while history is fully mock.
   - Both should source from `QuotaTransaction`.

5. Clean the mock-data layer.
   - Several mock-data files contain large blocks of commented legacy versions.
   - Examples:
     - `frontend/lib/mock-data/Admin/accounts.ts`
     - `frontend/lib/mock-data/Admin/queues.ts`
     - `frontend/lib/mock-data/Admin/logs.ts`
     - `frontend/lib/mock-data/Navbar.ts`

6. Standardize route naming and file naming.
   - `queue-manger` should become `queue-manager`
   - `ConversationThread.tsx.tsx` should be renamed

## Section 6: Missing pages / unused code / risks

### Missing or broken integrations

- No dedicated login page exists.
- The public SSO modal button is not connected to `/api/v1/auth/login` or any SSO backend flow.
- `user/print` has no upload or job-creation API.
- `user/redeem` has no redeem API.
- `user/history` is not connected to the existing quota transaction endpoint.
- `admin/notifications` is not connected to the existing `Notification` model.
- `admin/logs` is not connected to the existing `AuditLog` model.
- `admin/groups` is not connected to the existing `Group` model.
- `admin/dashboard`, `admin/reports`, and `admin/print-release` have no supporting backend routes.

### Backend endpoints that exist but are not used by visible pages

- `GET /api/v1/health`
- `POST /api/v1/auth/register`
- `GET /api/v1/auth/me`

`POST /api/v1/auth/login` is used indirectly by `apiGet()`, not by an explicit login page.

### Models that exist but are not connected to visible live features

- `Group`
- `Notification`
- `AuditLog`

They are present in the schema layer and seed layer, but there are no active frontend-backed routes using them.

### Unused / orphan / low-value code to review

- `frontend/app/sections/mainPage/Temp.tsx`
- `frontend/app/sections/mainPage/components/BackgroundLinesDemo.tsx`
- `frontend/components/shared/table/UsersEmptyState.tsx`
- `frontend/components/shared/table/UsersHeader.tsx`
- `frontend/components/shared/table/UsersTable.tsx`
- `frontend/components/shared/table/UsersTableRow.tsx`
- `frontend/components/shared/table/UsersTableSkeleton.tsx`
- `frontend/components/shared/table/UsersToolbar.tsx`
- empty directories:
  - `frontend/hooks`
  - `frontend/lib/api`
  - `frontend/components/lib`
  - `backend/src/controllers`
  - `backend/src/services`

### Specific risks

- Fallback quick-action routes in `frontend/lib/mock-data/User/dashboard.ts` point to non-existent paths:
  - `/sections/user/web-print`
  - `/sections/user/redeem-card`
  - `/sections/user/jobs-pending-release`
- Public landing page links directly to protected areas without frontend checks.
- Many important actions are UI-only and may give the impression that they persist data when they do not.
- The shared API helper only supports `GET`, which blocks a clean expansion into real create/update/delete flows.
- A large amount of commented old code remains in production files, which increases maintenance cost and slows analysis.

