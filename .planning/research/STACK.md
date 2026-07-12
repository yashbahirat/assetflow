# Stack Research: Enterprise Asset Management System

## Recommended Stack (2025 Standard)

Based on the project constraints and domain requirements, this is the prescribed stack for AssetFlow.

### Frontend
- **Framework**: Next.js (App Router)
  - *Rationale*: Server components and layout capabilities are perfect for dashboard-heavy applications. Great routing and SEO (even internal tools benefit from fast load times).
- **UI & Styling**: Tailwind CSS, Shadcn UI, Radix Primitives
  - *Rationale*: Provides the "premium SaaS" feel (like Linear/Vercel) requested. Accessible, unstyled primitives combined with Tailwind allow deep customization.
- **Animations**: Framer Motion
  - *Rationale*: For micro-interactions (e.g., Kanban drag-and-drop, modal transitions).

### Backend
- **Runtime & Framework**: Node.js + Express (or Fastify) with TypeScript (Strict mode)
  - *Rationale*: Robust, mature ecosystem. Strong typing prevents runtime errors in complex allocation logic.
- **Database**: PostgreSQL
  - *Rationale*: Essential for ACID transactions which are critical when handling allocations and preventing double-booking.
- **ORM**: Prisma
  - *Rationale*: Type-safe queries, excellent schema migration, and easy relation management.

### Anti-Recommendations (Do NOT Use)
- **BaaS (Firebase, Supabase)**: Explicitly prohibited by constraints. Must be custom-built to demonstrate architecture skills.
- **NoSQL (MongoDB)**: Not suitable for heavily relational data (Assets -> Allocations -> Users -> Departments).
