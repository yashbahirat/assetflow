# Architecture Research: Enterprise Asset Management System

## Component Boundaries

### 1. Presentation Layer (Frontend)
- Next.js Client Components for interactivity (Kanban, Calendars).
- Server Components for fast initial loads of dashboards and tables.
- State Management: React Context or Zustand for local UI state; rely on server cache for data.

### 2. API Layer (Backend)
- RESTful API (Express/Fastify).
- **Controller-Service-Repository Pattern**:
  - *Controllers*: Handle HTTP requests, validation (Zod), and responses.
  - *Services*: Business logic (e.g., checking overlap before booking, conflict rules).
  - *Repositories/Data Access*: Prisma calls to database.

### 3. Data Layer
- PostgreSQL Database.
- Strict foreign key constraints and transaction management for allocations/bookings.

## Data Flow
- Client -> API Route -> Controller -> Service (Validation & Logic) -> Prisma -> Database.
- WebSockets or Server-Sent Events (SSE) could be considered later for real-time Kanban updates, but standard polling/optimistic UI is sufficient for MVP.

## Build Order
1. **Foundation**: Database schema (Prisma) and core CRUD for Auth/Departments.
2. **Core Entity**: Asset Registration & Directory.
3. **Complex Logic**: Allocation and Conflict Prevention Engine.
4. **Workflows**: Resource Booking & Maintenance Kanban.
5. **Analytics**: Dashboards, Audit Cycles, and Notifications.
