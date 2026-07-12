---
wave: 2
depends_on: ["01-PLAN.md"]
files_modified: ["backend/src/controllers/departmentController.ts", "backend/src/routes/departmentRoutes.ts", "backend/src/controllers/categoryController.ts", "backend/src/routes/categoryRoutes.ts", "backend/src/controllers/userController.ts", "backend/src/routes/userRoutes.ts", "backend/src/index.ts"]
autonomous: true
requirements_addressed: ["ORG-01", "ORG-02", "ORG-03"]
---

# Wave 2: Backend Organization & Directory APIs

<objective>
Implement the REST APIs for managing Departments, Asset Categories, and the Employee Directory with Role-Based Access Control.
</objective>

<tasks>

<task>
  <description>Departments API</description>
  <action>
    Create `backend/src/controllers/departmentController.ts` handling `GET` (list all), `POST` (create), `PUT` (edit/deactivate).
    Create `backend/src/routes/departmentRoutes.ts` and protect the POST/PUT routes with `requireRole(['ADMIN'])`.
  </action>
</task>

<task>
  <description>Asset Categories API</description>
  <action>
    Create `backend/src/controllers/categoryController.ts` handling `GET`, `POST`, `PUT`.
    Create `backend/src/routes/categoryRoutes.ts` and protect mutating routes for Admin only.
  </action>
</task>

<task>
  <description>Users Directory API</description>
  <action>
    Create `backend/src/controllers/userController.ts` handling:
    - `GET /api/users`: Returns all users (excluding passwordHash) for the directory.
    - `PUT /api/users/:id/role`: Allows an Admin to update a user's role.
    Create `backend/src/routes/userRoutes.ts`.
    Mount all these routes in `backend/src/index.ts`.
  </action>
</task>

</tasks>
