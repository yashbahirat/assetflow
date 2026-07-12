# Phase 1: Foundation & POC - Context

**Gathered:** 2026-07-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish the core database schema (Prisma), define the project architecture (Node.js backend, Next.js frontend), and build a proof-of-concept Dashboard UI to demonstrate the visual polish.
</domain>

<decisions>
## Implementation Decisions

### Database Schema (Prisma)
- **D-01:** Models to include: User, Department, AssetCategory, Asset, Allocation, TransferRequest, Booking, MaintenanceRequest, AuditCycle, AuditItem.
- **D-02:** Use proper Enums for statuses (e.g., AssetStatus, Role) and include standard `@updatedAt` / `@default(now())` timestamps on all models.

### Project Architecture
- **D-03:** Backend: Node.js (Express/Fastify) using the Controller-Service-Repository pattern.
- **D-04:** Frontend: React with Next.js App Router.

### Dashboard UI (Proof of Concept)
- **D-05:** Layout: Sidebar navigation and a Topbar.
- **D-06:** Components: KPI cards (Available, Allocated, Maintenance Today) and a list/table for "Overdue Returns" (highlighted with soft reds).
- **D-07:** Styling: Clean white/light-gray backgrounds, modern typography (Inter or Geist), primary indigo or emerald actions. Tailwind CSS + Shadcn UI + Lucide-React.
- **D-08:** Data: Use hardcoded mock data for this phase to prove the UI polish.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Foundation
- `.planning/PROJECT.md` — Core constraints and tech stack requirements.
- `.planning/research/STACK.md` — Recommended architecture stack.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None yet (Greenfield project).

</code_context>

<specifics>
## Specific Ideas

- UI must feel like a premium SaaS product (e.g., Linear, Vercel, or Stripe).
- Overdue items must be clearly separated and highlighted with warning colors.
- The UI must be fully responsive and mobile-friendly.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 1-foundation-and-poc*
*Context gathered: 2026-07-12*
