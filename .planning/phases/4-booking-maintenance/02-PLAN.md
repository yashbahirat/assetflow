---
wave: 2
depends_on: ["01-PLAN.md"]
files_modified: ["backend/src/controllers/maintenanceController.ts", "backend/src/routes/maintenanceRoutes.ts", "backend/src/index.ts"]
autonomous: true
requirements_addressed: ["MAINT-01", "MAINT-02", "MAINT-03"]
---

# Wave 2: Backend Maintenance API

<objective>
Implement the maintenance request API and state transitions.
</objective>

<tasks>

<task>
  <description>Maintenance Controller Implementation</description>
  <action>
    Create `backend/src/controllers/maintenanceController.ts`.
    Implement `createMaintenanceRequest` (`POST /api/maintenance`).
    Implement `getAllMaintenanceRequests` (`GET /api/maintenance`) for the Kanban board.
    Implement `updateMaintenanceStatus` (`PUT /api/maintenance/:id/status`):
    - Handle transitions (PENDING -> IN_PROGRESS -> RESOLVED).
    - If status becomes `IN_PROGRESS`, update the linked Asset's status to `MAINTENANCE`.
    - If status becomes `RESOLVED`, update the linked Asset's status back to `AVAILABLE`.
  </action>
</task>

<task>
  <description>Maintenance Routes</description>
  <action>
    Create `backend/src/routes/maintenanceRoutes.ts`.
    Mount the endpoints, ensuring status updates are restricted to manager roles.
    Update `backend/src/index.ts` to include `/api/maintenance`.
  </action>
</task>

</tasks>
