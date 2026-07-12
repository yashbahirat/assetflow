---
wave: 1
depends_on: []
files_modified: ["backend/src/controllers/assetController.ts", "backend/src/routes/assetRoutes.ts", "backend/src/index.ts"]
autonomous: true
requirements_addressed: ["AST-01", "AST-02", "AST-03"]
---

# Wave 1: Backend Asset Core API

<objective>
Implement the core asset management API endpoints (create, list, and view history).
</objective>

<tasks>

<task>
  <description>Asset Controller Implementation</description>
  <action>
    Create `backend/src/controllers/assetController.ts`.
    Implement `createAsset` to register new assets (restricted to `ASSET_MANAGER` and `ADMIN` in routes).
    Implement `getAssets` with query parameters for filtering (tag, serial, category, status).
    Implement `getAssetHistory` which queries the `Allocation` table for a specific asset to dynamically construct its timeline.
  </action>
</task>

<task>
  <description>Asset Routes</description>
  <action>
    Create `backend/src/routes/assetRoutes.ts`.
    Mount `GET /`, `POST /`, and `GET /:id/history`.
    Update `backend/src/index.ts` to include `/api/assets`.
  </action>
</task>

</tasks>
