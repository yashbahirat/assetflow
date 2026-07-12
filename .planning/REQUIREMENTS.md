# Requirements

## v1 Requirements

### Authentication
- [ ] **AUTH-01**: User can log in with email and password.
- [ ] **AUTH-02**: System automatically defaults new accounts to the 'Employee' role (no self-elevation).

### Organization
- [ ] **ORG-01**: Admin can create, edit, and deactivate departments.
- [ ] **ORG-02**: Admin can create and edit asset categories.
- [ ] **ORG-03**: Admin can view the Employee Directory and promote users to 'Department Head' or 'Asset Manager'.

### Asset Management
- [ ] **AST-01**: Asset Manager can register a new asset with details (tag, serial, category, condition, location, shared flag).
- [ ] **AST-02**: User can search and filter the asset directory (by tag, serial, category, status).
- [ ] **AST-03**: System tracks and displays asset history (allocations and maintenance).

### Allocation & Transfer
- [ ] **ALLOC-01**: Asset Manager can allocate an available asset to an employee or department with an expected return date.
- [ ] **ALLOC-02**: System strictly prevents double-allocation of an already allocated asset.
- [ ] **ALLOC-03**: User can initiate a Transfer Request for a currently allocated asset.
- [ ] **ALLOC-04**: Asset Manager or Dept Head can approve Transfer Requests, updating the asset's allocation history.
- [ ] **ALLOC-05**: Asset Manager can mark an asset as returned, reverting its status to 'Available'.

### Resource Booking
- [ ] **BOOK-01**: User can view a calendar/timeline of a shared resource's existing bookings.
- [ ] **BOOK-02**: User can book a shared resource for a specific time slot.
- [ ] **BOOK-03**: System strictly rejects booking requests that overlap with existing bookings.

### Maintenance
- [ ] **MAINT-01**: User can raise a maintenance request for an asset, attaching details and photos.
- [ ] **MAINT-02**: Asset Manager can approve or reject maintenance requests.
- [ ] **MAINT-03**: System updates asset status to 'Under Maintenance' upon approval and 'Available' upon resolution via a Kanban board workflow.

### Audits
- [ ] **AUDIT-01**: Admin can create an Audit Cycle and assign auditors.
- [ ] **AUDIT-02**: Auditor can mark each asset in the cycle as Verified, Missing, or Damaged.
- [ ] **AUDIT-03**: System auto-generates a discrepancy report based on audit findings.

### Dashboard & Reporting
- [ ] **DASH-01**: User can view KPI cards (Available, Allocated, Maintenance Today).
- [ ] **DASH-02**: User can view a list of overdue returns with distinct warning indicators.
- [ ] **DASH-03**: Manager can view reports on asset utilization, maintenance frequency, and booking heatmaps.

### Activity & Notifications
- [ ] **NOTIF-01**: System logs all critical entity changes with user ID, action, and timestamp.
- [ ] **NOTIF-02**: System generates notifications for events (e.g., Asset Assigned, Maintenance Approved, Overdue Alert).

## v2 Requirements (Deferred)
- (None specified currently)

## Out of Scope
- **Purchasing & Invoicing**: Keep out of financial and procurement ERP domains. Focus strictly on tracking existing assets.

## Traceability
<!-- Filled by roadmap -->
