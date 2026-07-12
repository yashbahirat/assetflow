---
wave: 4
depends_on: ["01-PLAN.md", "02-PLAN.md", "03-PLAN.md"]
files_modified: ["frontend/src/app/assets/[id]/page.tsx"]
autonomous: true
requirements_addressed: ["AST-03", "ALLOC-01", "ALLOC-03", "ALLOC-04", "ALLOC-05"]
---

# Wave 4: Frontend Allocation & Transfer Workflows

<objective>
Build the Asset Detail page with history tracking and allocation action workflows.
</objective>

<tasks>

<task>
  <description>Asset Detail Layout & Timeline</description>
  <action>
    Create `frontend/src/app/assets/[id]/page.tsx`.
    Fetch asset details and its history (`/api/assets/:id/history`).
    Render the asset history as a vertical timeline.
  </action>
</task>

<task>
  <description>Allocation & Transfer Actions</description>
  <action>
    Implement action buttons based on the user's role and asset status:
    - **Allocate**: (Manager) Opens a modal to assign the asset to a user/department if `AVAILABLE`.
    - **Request Transfer**: (User) If currently allocated to them, allows requesting a transfer.
    - **Approve Transfer**: (Manager) Allows executing a pending transfer.
    - **Return**: (Manager) Marks the asset as returned.
    Connect these actions to the `/api/allocations` endpoints.
  </action>
</task>

</tasks>
