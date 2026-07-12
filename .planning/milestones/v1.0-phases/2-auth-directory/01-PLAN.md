---
wave: 1
depends_on: []
files_modified: ["backend/prisma/seed.ts", "backend/package.json", "backend/src/utils/jwt.ts", "backend/src/middleware/auth.ts", "backend/src/controllers/authController.ts", "backend/src/routes/authRoutes.ts", "backend/src/index.ts"]
autonomous: true
requirements_addressed: ["AUTH-01", "AUTH-02"]
---

# Wave 1: Backend Auth & Database Seeding

<objective>
Implement the foundational backend authentication logic using JWT in HttpOnly cookies, and create a database seed script to provision the initial Admin user and default departments/categories.
</objective>

<tasks>

<task>
  <description>Database Seeding Script</description>
  <action>
    Create `backend/prisma/seed.ts` that:
    1. Uses Prisma Client to insert a default Admin user (email: `admin@assetflow.com`, password hashed using `bcrypt`, role: `ADMIN`).
    2. Inserts default Departments (e.g., "IT", "HR").
    3. Inserts default Asset Categories (e.g., "Laptops", "Monitors").
    Update `backend/package.json` to include `"prisma": { "seed": "ts-node prisma/seed.ts" }`.
  </action>
</task>

<task>
  <description>JWT Utilities & Middleware</description>
  <action>
    Install `jsonwebtoken`, `bcrypt`, `cookie-parser`, and their types.
    Create `backend/src/utils/jwt.ts` to sign and verify tokens using a secret from `.env`.
    Create `backend/src/middleware/auth.ts` to parse the HttpOnly cookie, verify the token, and attach the user payload to `req.user`. Also create a `requireRole` middleware for RBAC.
  </action>
</task>

<task>
  <description>Auth Controller & Routes</description>
  <action>
    Create `backend/src/controllers/authController.ts`:
    - `register`: Validates input, hashes password, creates user with default `EMPLOYEE` role, generates JWT, sets HttpOnly cookie.
    - `login`: Verifies email/password, generates JWT, sets cookie.
    - `logout`: Clears the cookie.
    - `me`: Returns the authenticated user's profile.
    Create `backend/src/routes/authRoutes.ts` to map these endpoints.
    Create `backend/src/index.ts` to initialize Express, setup `cookie-parser`, CORS, and mount the auth routes at `/api/auth`.
  </action>
</task>

</tasks>
