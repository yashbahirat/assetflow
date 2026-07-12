---
wave: 3
depends_on: ["01-PLAN.md", "02-PLAN.md"]
files_modified: ["frontend/src/context/AuthContext.tsx", "frontend/src/app/layout.tsx", "frontend/src/app/login/page.tsx", "frontend/src/app/register/page.tsx", "frontend/src/app/directory/page.tsx", "frontend/src/components/layout/Sidebar.tsx", "frontend/src/components/layout/Topbar.tsx", "frontend/src/lib/api.ts"]
autonomous: true
requirements_addressed: ["AUTH-01", "ORG-03"]
---

# Wave 3: Frontend Auth & Directory UI

<objective>
Connect the Next.js frontend to the authentication API, build the Login/Register flows, and construct the Employee Directory using a rich Data Table layout.
</objective>

<tasks>

<task>
  <description>Frontend API & Auth Context</description>
  <action>
    Create `frontend/src/lib/api.ts` with Axios (install it) configured to send credentials (`withCredentials: true`) to the backend.
    Create `frontend/src/context/AuthContext.tsx` to fetch `/api/auth/me` on mount and provide `user`, `login`, `logout`, `register` functions.
    Wrap the root layout (`frontend/src/app/layout.tsx`) with the AuthProvider.
  </action>
</task>

<task>
  <description>Login & Register Pages</description>
  <action>
    Create `frontend/src/app/login/page.tsx` and `frontend/src/app/register/page.tsx`.
    Design them using Tailwind to match the SaaS aesthetic.
    Implement form state and connect to AuthContext.
  </action>
</task>

<task>
  <description>Dashboard Layout Protection</description>
  <action>
    Update `Sidebar.tsx` and `Topbar.tsx` to use the `AuthContext` to display the actual user's initials/name.
    Add a Logout button in the Topbar.
    Redirect unauthenticated users from the Dashboard (`/`) to `/login`.
  </action>
</task>

<task>
  <description>Employee Directory Page</description>
  <action>
    Create `frontend/src/app/directory/page.tsx`.
    Fetch users from `/api/users`.
    Build a rich data table layout to display Name, Email, Department, and Role.
    For Admin users, render a Role dropdown to update the user's role via `PUT /api/users/:id/role`.
  </action>
</task>

</tasks>
