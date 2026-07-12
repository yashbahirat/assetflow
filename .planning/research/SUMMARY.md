# Research Summary: AssetFlow

## Key Findings

**Stack:**
- **Frontend**: Next.js, Tailwind CSS, Shadcn UI, Framer Motion.
- **Backend**: Node.js, Express/Fastify, TypeScript, PostgreSQL, Prisma ORM.
- **Constraint**: No Backend-as-a-Service (BaaS) like Firebase or Supabase. Everything must be custom-built to demonstrate architecture skills.

**Table Stakes (Must Haves):**
- Strict Role-Based Access Control (Admin, Asset Manager, Dept Head, Employee).
- Full asset lifecycle tracking (Available, Allocated, Reserved, Under Maintenance, Lost, Retired, Disposed).
- Resource Booking with explicit overlap prevention.
- Asset Allocation with explicit conflict prevention.
- Maintenance workflows with approval steps.

**Differentiators:**
- Visual drag-and-drop Kanban board for maintenance management.
- Scheduled audit cycles with auto-generated discrepancy reports.
- Exceptional, premium SaaS UI/UX using subtle micro-interactions and clear typography.
- Smart conflict resolution (e.g., suggesting a Transfer Request when an asset is already allocated).

**Watch Out For:**
- **Concurrency Issues**: Ensure database-level constraints and transactions to prevent double-booking or double-allocation.
- **State Management**: Centralize state transitions to prevent invalid asset states.
- **UI Clutter**: Maintain a clean, minimalist design for data tables using pagination and filtering to avoid overwhelming the user.
- **Auditability**: Implement a robust activity log for all critical changes to maintain accountability.
