# AssetFlow

## What This Is

An Enterprise Asset & Resource Management System. The platform digitizes how organizations track, allocate, and maintain physical assets and shared resources through a centralized ERP platform. It reduces manual tracking inefficiencies by enabling structured asset lifecycles, centralized resource booking, and real-time visibility.

## Core Value

Provide a reliable, self-contained system for centralized tracking of physical assets and shared resources, delivered through an exceptionally beautiful, modern SaaS-level user experience.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

<!-- Current scope. Building toward these. -->

- [ ] Implement robust authentication and role-based workflows (Admin, Asset Manager, Dept Head, Employee).
- [ ] Create Organization Setup module (Departments, Asset Categories, Employee Directory).
- [ ] Build Asset Registration & Directory with full lifecycle status tracking.
- [ ] Implement Asset Allocation & Transfer (handling conflicts, double-allocation prevention, and approval workflows).
- [ ] Develop Resource Booking calendar with overlap prevention.
- [ ] Construct Maintenance Management workflow (Pending -> Approved -> Tech Assigned -> In Progress -> Resolved).
- [ ] Create Asset Audit module (cycles, assignments, automated discrepancy reporting).
- [ ] Develop Reports & Analytics (utilization, maintenance frequency, booking heatmaps).
- [ ] Implement Activity Logs & Notifications for all key events.

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Purchasing, Invoicing, or Accounting modules — The platform focuses strictly on physical asset tracking and allocation, intentionally avoiding financial ERP complexities.
- Backend-as-a-Service (BaaS) platforms — Prohibited. Everything must be custom-built and self-contained using Node.js/PostgreSQL to demonstrate backend architecture capability.

## Context

We are building this for a hackathon.
The frontend demands an exceptionally beautiful, clean, and highly usable interface that feels like a premium SaaS product (e.g., Linear, Vercel, Stripe). It requires clean white/light-gray backgrounds, modern typography (Inter or Geist), and deliberate use of brand colors.
The backend must be a robust, scalable, and type-safe architecture.

## Constraints

- **Tech Stack (Backend)**: Node.js with Express/Fastify, TypeScript (Strict), PostgreSQL, Prisma ORM.
- **Tech Stack (Frontend)**: React (Next.js App Router), Tailwind CSS, Shadcn UI, Radix Primitives, Framer Motion.
- **Prohibited Tech**: No Firebase, Supabase, or other BaaS.
- **Role Security**: Account creation defaults to Employee. Admins must explicitly promote users to higher roles.
- **Responsiveness**: The UI must be fully responsive and mobile-friendly.

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js App Router | Preferred for React structure and modern conventions. | — Pending |
| Prisma ORM | Provides type-safe DB queries and clear schema management. | — Pending |
| No BaaS | Enforces custom backend development for the hackathon constraints. | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-12 after initialization*
