# Project Structure

## Frontend

- `frontend/app`: Next.js routes, layouts, and page-level composition
- `frontend/components`: reusable UI and shared view components
- `frontend/services`: browser-side API helpers
- `frontend/hooks`: React hooks
- `frontend/lib`: frontend utility helpers

## Backend

- `backend/src/config`: environment and database configuration
- `backend/src/middleware`: auth and role guards
- `backend/src/models`: Mongoose schemas
- `backend/src/modules`: domain modules grouped by responsibility
- `backend/src/routes/index.js`: API route aggregator
- `backend/src/seeds`: seed data and seed runner
- `backend/src/utils`: generic backend formatting helpers

## Shared

- `shared/`: reserved for constants, schemas, and types that need to be shared across the frontend and backend
- `frontend/lib/mock-data`: frontend-only mock datasets used while backend integration is being completed
