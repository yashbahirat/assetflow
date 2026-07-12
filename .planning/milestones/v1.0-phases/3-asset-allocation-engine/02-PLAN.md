---
wave: 2
depends_on: ["01-PLAN.md"]
files_modified: ["backend/src/controllers/allocationController.ts", "backend/src/routes/allocationRoutes.ts", "backend/src/index.ts"]
autonomous: true
requirements_addressed: ["ALLOC-01", "ALLOC-02", "ALLOC-03", "ALLOC-04", "ALLOC-05"]
---

# Wave 2: Backend Allocation Engine API

<objective>
Implement the state machine for allocations, transfer requests, and returns.
</objective>

<tasks>

<task>
  <description>Allocation Controller Implementation</description>
  <action>
    Create `backend/src/controllers/allocationController.ts`.
    Implement `allocateAsset`: Checks if the asset is `AVAILABLE`. If so, creates an `Allocation` record and updates the `Asset` status to `ALLOCATED`.
    Implement `requestTransfer`: Finds the active allocation and updates its state to indicate a transfer is requested (or creates a TransferRequest record/updates Allocation fields based on schema).
    Implement `approveTransfer`: Changes the asset's assigned user/department and updates allocation history.
    Implement `returnAsset`: Sets the asset status back to `AVAILABLE` and marks the allocation record as returned.
  </action>
</task>

<task>
  <description>Allocation Routes</description>
  <action>
    Create `backend/src/routes/allocationRoutes.ts`.
    Mount the endpoints with appropriate RBAC (`allocateAsset`, `approveTransfer`, `returnAsset` require manager roles).
    Update `backend/src/index.ts` to include `/api/allocations`.
  </action>
</task>

</tasks>
