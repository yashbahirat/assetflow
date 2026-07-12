---
wave: 1
depends_on: []
files_modified: ["backend/prisma/schema.prisma", "backend/src/controllers/analyticsController.ts", "backend/src/routes/analyticsRoutes.ts", "backend/src/index.ts"]
autonomous: true
requirements_addressed: ["DASH-01", "DASH-02", "DASH-03", "NOTIF-01", "NOTIF-02"]
---

# Wave 1: Analytics APIs & Schema Updates (Backend)

<objective>
Prepare the database schema for Audit and Activity logging, and build the Analytics API.
</objective>

<tasks>

<task>
  <description>Schema Updates</description>
  <action>
    Update `backend/prisma/schema.prisma`:
    - Add `ActivityLog` model (id, userId, action, entityType, entityId, createdAt).
    - Add `AuditCycle` model (id, createdById, status: 'IN_PROGRESS' | 'COMPLETED', createdAt).
    - Add `AuditItem` model (id, auditCycleId, assetId, status: 'UNVERIFIED' | 'VERIFIED' | 'MISSING' | 'DAMAGED').
    Run `npx prisma db push` and `npx prisma generate` in the backend directory.
  </action>
</task>

<task>
  <description>Analytics Controller</description>
  <action>
    Create `backend/src/controllers/analyticsController.ts`.
    Implement `getDashboardStats` (`GET /api/analytics/dashboard`):
    - Return counts for Available, Allocated, and Maintenance assets.
    - Return a list of `overdueAllocations` (Allocations where `expectedReturnDate` < now and status === 'ACTIVE').
    Implement `getReports` (`GET /api/analytics/reports`):
    - Return data formatted for recharts (e.g. utilization percentage by category).
    Implement `getActivityLogs` (`GET /api/analytics/activity`):
    - Fetch latest 20 ActivityLog entries for the notifications dropdown.
  </action>
</task>

<task>
  <description>Analytics Routes</description>
  <action>
    Create `backend/src/routes/analyticsRoutes.ts`.
    Mount the endpoints.
    Update `backend/src/index.ts` to include `/api/analytics`.
  </action>
</task>

</tasks>
