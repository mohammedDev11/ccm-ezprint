# Alpha Queue Server

## Seed database (Step 4)

1. Copy environment template:

```bash
cp .env.example .env
```

2. Update `MONGO_URI` and `MONGO_DB_NAME` in `.env` as needed.

3. Run seed:

```bash
npm run seed
```

This inserts practical sample data based on the existing frontend `Data` blueprint for:
- users
- quota transactions
- print jobs
- printers
- queues

Quota is the source of truth in user documents via `printing.quota.remaining`.
Compatibility `balance` is derived by API responses, not stored as separate truth.

## Verify seeded data with current APIs

1. Start backend:

```bash
npm run dev
```

2. Login as seeded user:

```bash
curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"202279720","password":"user12345"}'
```

3. Use returned token:

```bash
TOKEN="<paste-token-here>"
```

4. Verify user endpoints:

```bash
curl -s http://localhost:5000/api/v1/user/profile -H "Authorization: Bearer $TOKEN"
curl -s http://localhost:5000/api/v1/user/quota/overview -H "Authorization: Bearer $TOKEN"
curl -s http://localhost:5000/api/v1/user/quota/transactions -H "Authorization: Bearer $TOKEN"
curl -s http://localhost:5000/api/v1/user/jobs/recent -H "Authorization: Bearer $TOKEN"
curl -s http://localhost:5000/api/v1/user/jobs/pending-release -H "Authorization: Bearer $TOKEN"
curl -s http://localhost:5000/api/v1/user/dashboard -H "Authorization: Bearer $TOKEN"
```

5. Login as admin and verify admin endpoints:

```bash
curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"admin","password":"admin123"}'
```

```bash
ADMIN_TOKEN="<paste-admin-token-here>"
curl -s http://localhost:5000/api/v1/admin/users -H "Authorization: Bearer $ADMIN_TOKEN"
curl -s http://localhost:5000/api/v1/admin/printers -H "Authorization: Bearer $ADMIN_TOKEN"
curl -s http://localhost:5000/api/v1/admin/queues -H "Authorization: Bearer $ADMIN_TOKEN"
```
