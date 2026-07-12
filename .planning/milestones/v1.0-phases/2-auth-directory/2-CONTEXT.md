# Phase 2: Auth & Directory Context

## Phase Goal
Implement user authentication, organizational structure management (Departments, Asset Categories), and the Employee Directory for assigning roles.

## Decisions

### 1. Authentication Strategy
- **Decision**: Custom JWT stored in HttpOnly cookies.
- **Rationale**: This approach perfectly fits the decoupled architecture (Node.js/Express backend + Next.js frontend) while remaining secure against XSS.

### 2. Initial Admin Provisioning
- **Decision**: Database Seed Script.
- **Rationale**: We will create a `prisma/seed.ts` script that provisions a default Admin account (and potentially some default departments/categories) to ensure secure and predictable initialization.

### 3. Employee Directory Layout
- **Decision**: Rich Data Table.
- **Rationale**: A table layout is better suited for an enterprise tool, providing superior support for filtering, sorting, and bulk actions (like role promotions).

## Deferred Ideas
None captured during this discussion.
