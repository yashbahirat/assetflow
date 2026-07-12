---
wave: 3
depends_on: ["01-PLAN.md", "02-PLAN.md"]
files_modified: ["frontend/src/app/assets/page.tsx"]
autonomous: true
requirements_addressed: ["AST-01", "AST-02"]
---

# Wave 3: Frontend Asset Registration & Directory

<objective>
Build the Asset Directory UI and the Slide-over panel for registering new assets.
</objective>

<tasks>

<task>
  <description>Asset Directory Layout</description>
  <action>
    Create `frontend/src/app/assets/page.tsx`.
    Implement a Data Table similar to the Employee Directory to list assets.
    Include search and filtering controls (by category and status) that hit the `/api/assets` endpoint.
  </action>
</task>

<task>
  <description>Asset Registration Slide-over</description>
  <action>
    Within `assets/page.tsx` (or as a separate component), implement a Slide-over panel for the "New Asset" form.
    The form should collect Tag, Serial, Category, Condition, Location, and Shared flag.
    On submit, it hits `POST /api/assets` and refreshes the directory table.
  </action>
</task>

</tasks>
