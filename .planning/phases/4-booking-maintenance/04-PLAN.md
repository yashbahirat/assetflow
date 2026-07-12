---
wave: 4
depends_on: ["02-PLAN.md"]
files_modified: ["frontend/src/app/assets/[id]/page.tsx", "frontend/src/app/maintenance/page.tsx", "frontend/package.json"]
autonomous: true
requirements_addressed: ["MAINT-01", "MAINT-02", "MAINT-03"]
---

# Wave 4: Frontend Maintenance Kanban

<objective>
Build the Maintenance Dashboard with a Drag-and-Drop Kanban board and the issue reporting UI.
</objective>

<tasks>

<task>
  <description>Issue Reporting UI</description>
  <action>
    Update `frontend/src/app/assets/[id]/page.tsx`.
    Add a "Report Issue" action button that opens a modal to submit a maintenance request (description).
    On submit, hit `POST /api/maintenance`.
  </action>
</task>

<task>
  <description>Maintenance Dashboard & Kanban</description>
  <action>
    Install `@hello-pangea/dnd` in the frontend directory.
    Create `frontend/src/app/maintenance/page.tsx`.
    Fetch all maintenance requests and group them by status (PENDING, IN_PROGRESS, RESOLVED).
    Build a Drag-and-Drop Kanban board using `@hello-pangea/dnd`.
    Implement `onDragEnd` to call `PUT /api/maintenance/:id/status` and update the local state when a ticket is dropped in a new column.
  </action>
</task>

</tasks>
