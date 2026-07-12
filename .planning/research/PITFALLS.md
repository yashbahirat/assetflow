# Pitfalls Research: Enterprise Asset Management System

## Common Mistakes

### 1. Ignoring Concurrency (Double-Booking)
- *Warning Sign*: Simple `if (!allocated)` checks without DB transactions.
- *Prevention*: Use database-level constraints (unique indexes on time ranges) and serializable transactions when creating bookings or allocations.
- *Phase*: Addressed in Resource Booking & Allocation logic.

### 2. Rigid State Machines
- *Warning Sign*: Hardcoded status strings scattered throughout the codebase.
- *Prevention*: Define a robust Enum in PostgreSQL (`AssetStatus`) and centralize state transition logic in a dedicated service to ensure valid transitions (e.g., cannot transition from `Disposed` to `Available`).
- *Phase*: Foundation / Database Schema.

### 3. Cluttered UI for Data-Heavy Views
- *Warning Sign*: Slow, dense tables that overwhelm users.
- *Prevention*: Implement server-side pagination, sorting, and filtering early. Use clean SaaS design patterns with ample whitespace and clear typography (Shadcn/Tailwind).
- *Phase*: Frontend implementation.

### 4. Vague Audit Trails
- *Warning Sign*: Assets change hands, but nobody knows who authorized it.
- *Prevention*: Implement an ActivityLog table that automatically records `userId`, `action`, `entityType`, `entityId`, and a timestamp for all critical changes.
- *Phase*: Activity Logs & Notifications.
