---
wave: 1
depends_on: []
files_modified: ["docker-compose.yml", "backend/package.json", "backend/prisma/schema.prisma", "backend/tsconfig.json", "frontend/package.json", "frontend/src/app/page.tsx", "frontend/src/components/layout/Sidebar.tsx", "frontend/src/components/layout/Topbar.tsx", "frontend/src/components/dashboard/KpiCard.tsx", "frontend/src/components/dashboard/OverdueList.tsx", "frontend/tailwind.config.ts"]
autonomous: true
requirements_addressed: ["AUTH-02", "ORG-01", "ORG-02", "DASH-01", "DASH-02"]
---

# Phase 1: Foundation & POC

<objective>
Establish the core database schema (Prisma) mapping all required entities, define the project architecture (Node.js backend, Next.js frontend), and build a proof-of-concept Dashboard UI to demonstrate the visual polish with mock data.
</objective>

<schema_push_requirement>
**[BLOCKING] Schema Push Required**
This phase modifies schema-relevant files (backend/prisma/schema.prisma). The planner MUST include a `[BLOCKING]` task that runs the database schema push command AFTER all schema file modifications are complete but BEFORE verification.
- ORM detected: Prisma
- Push command: npx prisma db push --accept-data-loss
- Non-TTY workaround: npx prisma db push --accept-data-loss
</schema_push_requirement>

<tasks>

<task>
  <description>Setup Backend & Prisma Schema</description>
  <read_first>
    - .planning/phases/1-foundation-and-poc/1-CONTEXT.md
    - .planning/REQUIREMENTS.md
  </read_first>
  <action>
    Initialize a Node.js project in the `backend` folder. Install `prisma`, `@prisma/client`, `typescript`, `ts-node`, `@types/node`.
    Create `docker-compose.yml` in the root directory to spin up a PostgreSQL 15 database.
    Create `backend/.env` setting `DATABASE_URL` to point to the local Postgres container.
    Create `backend/prisma/schema.prisma` with `provider = "postgresql"`. 
    Define the following models with `@updatedAt` and `@default(now())` timestamps:
    - User (includes Role enum with 'Employee', 'Department Head', 'Asset Manager', 'Admin' - defaulting to 'Employee' per AUTH-02)
    - Department (id, name, isActive per ORG-01)
    - AssetCategory (id, name per ORG-02)
    - Asset (AssetStatus enum: Available, Allocated, UnderMaintenance, Retired)
    - Allocation
    - TransferRequest
    - Booking
    - MaintenanceRequest
    - AuditCycle
    - AuditItem
  </action>
  <acceptance_criteria>
    - `backend/prisma/schema.prisma` exists and contains models for User, Department, AssetCategory, Asset, Allocation, TransferRequest, Booking, MaintenanceRequest, AuditCycle, AuditItem.
    - Role enum includes 'Employee' as the default.
  </acceptance_criteria>
</task>

<task>
  <description>[BLOCKING] Schema Push & Client Generation</description>
  <read_first>
    - backend/prisma/schema.prisma
  </read_first>
  <action>
    From the root directory, start the database with `docker compose up -d`.
    Wait 5 seconds for Postgres to be ready.
    In the `backend` directory, run `npx prisma db push --accept-data-loss` to sync the schema to the database.
    Run `npx prisma generate` to create the TypeScript client.
  </action>
  <acceptance_criteria>
    - `docker-compose.yml` exists and defines a `postgres` service.
    - `backend/prisma/schema.prisma` uses provider = "postgresql".
  </acceptance_criteria>
</task>

<task>
  <description>Setup Frontend & Dashboard UI</description>
  <read_first>
    - .planning/phases/1-foundation-and-poc/1-CONTEXT.md
  </read_first>
  <action>
    Create a Next.js app in the `frontend` directory using `npx create-next-app@latest frontend --typescript --tailwind --eslint --app --use-npm --src-dir --import-alias "@/*" --yes`.
    Install `lucide-react`, `framer-motion`, `clsx`, and `tailwind-merge` in `frontend`.
    Configure `tailwind.config.ts` with brand colors (indigo/emerald) and Inter/Geist fonts.
    Create layout components: `frontend/src/components/layout/Sidebar.tsx` and `frontend/src/components/layout/Topbar.tsx`.
    Create Dashboard UI components: `frontend/src/components/dashboard/KpiCard.tsx` (for Available, Allocated, Maintenance Today per DASH-01) and `frontend/src/components/dashboard/OverdueList.tsx` (per DASH-02).
    Update `frontend/src/app/page.tsx` to compose the Sidebar, Topbar, KPI Cards, and Overdue List using visually rich mock data.
    Ensure Overdue items are highlighted with soft red warning indicators.
  </action>
  <acceptance_criteria>
    - `frontend/package.json` exists.
    - `frontend/src/app/page.tsx` imports and uses Sidebar, Topbar, KpiCard, and OverdueList.
    - OverdueList component contains mock data and visual warning indicators.
  </acceptance_criteria>
</task>

</tasks>

<verification>
- Run `npm run build` in the `frontend` to verify no compilation errors.
- Ensure the Prisma schema is valid by running `npx prisma validate` in the `backend`.
</verification>

<must_haves>
- Prisma schema mapped perfectly to Postgres with all enums and relationships.
- Frontend has the foundational structure for a polished SaaS dashboard with Tailwind and Lucide React.
</must_haves>
