---
wave: 3
depends_on: ["01-PLAN.md"]
files_modified: ["backend/src/controllers/auditController.ts", "backend/src/routes/auditRoutes.ts", "backend/src/index.ts", "frontend/src/app/audits/page.tsx", "frontend/src/components/layout/Sidebar.tsx"]
autonomous: true
requirements_addressed: ["AUDIT-01", "AUDIT-02", "AUDIT-03"]
---

# Wave 3: Audit Engine API & UI

<objective>
Implement the simplified snapshot-based Audit module.
</objective>

<tasks>

<task>
  <description>Audit Backend API</description>
  <action>
    Create `backend/src/controllers/auditController.ts`.
    Implement `createAuditCycle` (`POST /api/audits`):
    - Create an `AuditCycle`.
    - Fetch all assets in the DB and create an `AuditItem` (`UNVERIFIED`) for each, linked to the cycle.
    Implement `getAuditCycles` (`GET /api/audits`).
    Implement `getAuditCycleDetails` (`GET /api/audits/:id`).
    Implement `updateAuditItem` (`PUT /api/audits/items/:itemId`): Update status to `VERIFIED`, `MISSING`, or `DAMAGED`.
    Create `backend/src/routes/auditRoutes.ts` and mount in `index.ts`.
  </action>
</task>

<task>
  <description>Audit Frontend UI</description>
  <action>
    Create `frontend/src/app/audits/page.tsx`.
    Add a button to "Start New Audit Cycle" (Calls `POST /api/audits`).
    List active/completed Audit Cycles.
    On selecting a cycle, show a list of all `AuditItems`.
    Provide buttons (or a dropdown) next to each item to mark it as Verified, Missing, or Damaged (Calls `PUT /api/audits/items/:itemId`).
    Add a summary section showing the count of each status (Discrepancy Report).
    Update `Sidebar.tsx` to include a link to the Audits page.
  </action>
</task>

</tasks>
