# Roadmap

**5 phases** | **21 requirements mapped** | All v1 requirements covered ✓

| Phase | Goal | Requirements | Success Criteria |
|-------|------|--------------|------------------|
| 1. Foundation & POC | Establish database schema, architecture, and Dashboard UI proof-of-concept. | AUTH-02, ORG-01, ORG-02, DASH-01, DASH-02 | 3 |
| 2. Auth & Directory | Implement secure login and Employee Directory with role promotion. | AUTH-01, ORG-03 | 2 |
| 3. Asset & Allocation Engine | Build the core asset directory and allocation logic with conflict prevention. | AST-01, AST-02, AST-03, ALLOC-01, ALLOC-02, ALLOC-03, ALLOC-04, ALLOC-05 | 3 |
| 4. Booking & Maintenance | Implement calendar booking and Kanban maintenance workflows. | BOOK-01, BOOK-02, BOOK-03, MAINT-01, MAINT-02, MAINT-03 | 3 |
| 5. Audits & Analytics | Add audit cycles, comprehensive reporting, and system-wide notifications. | AUDIT-01, AUDIT-02, AUDIT-03, DASH-03, NOTIF-01, NOTIF-02 | 4 |

---

## Phase 1: Foundation & POC

**Goal:** Establish database schema (Prisma), architecture, and Dashboard UI proof-of-concept.
**Requirements:** AUTH-02, ORG-01, ORG-02, DASH-01, DASH-02

**Success Criteria:**
1. Complete `schema.prisma` mapping all entities (User, Department, AssetCategory, Asset, Allocation, TransferRequest, Booking, MaintenanceRequest, AuditCycle, AuditItem) with enums and timestamps.
2. Outline recommended folder structure for Node.js (Controller-Service-Repository) and Next.js.
3. Deliver a beautifully polished React Dashboard component using Tailwind, Lucide, and mock data featuring KPI cards and an "Overdue Returns" table.

## Phase 2: Auth & Directory

**Goal:** Implement secure login and Employee Directory with role promotion.
**Requirements:** AUTH-01, ORG-03

**Success Criteria:**
1. Users can sign up and are defaulted to 'Employee'.
2. Admins can view the Employee Directory and explicitly promote users to 'Department Head' or 'Asset Manager'.

## Phase 3: Asset & Allocation Engine

**Goal:** Build the core asset directory and allocation logic with conflict prevention.
**Requirements:** AST-01, AST-02, AST-03, ALLOC-01, ALLOC-02, ALLOC-03, ALLOC-04, ALLOC-05

**Success Criteria:**
1. Asset Managers can register assets and users can search the directory.
2. Allocation attempts on already-allocated assets are strictly blocked by the system.
3. Users can initiate Transfer Requests which can be approved and correctly update allocation history.

## Phase 4: Booking & Maintenance

**Goal:** Implement calendar booking and Kanban maintenance workflows.
**Requirements:** BOOK-01, BOOK-02, BOOK-03, MAINT-01, MAINT-02, MAINT-03

**Success Criteria:**
1. Shared resources can be booked by time slot, with overlapping slots automatically rejected.
2. Users can raise maintenance requests that appear in a Kanban board.
3. Approving a maintenance request automatically sets the asset status to 'Under Maintenance'.

## Phase 5: Audits & Analytics

**Goal:** Add audit cycles, comprehensive reporting, and system-wide notifications.
**Requirements:** AUDIT-01, AUDIT-02, AUDIT-03, DASH-03, NOTIF-01, NOTIF-02

**Success Criteria:**
1. Admins can create audit cycles, and auditors can mark items as Verified, Missing, or Damaged.
2. The system auto-generates a discrepancy report upon audit closure.
3. Analytics views display asset utilization and maintenance frequencies.
4. Activity logs capture all critical changes with user ID and timestamp.
