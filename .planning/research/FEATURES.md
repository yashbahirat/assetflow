# Features Research: Enterprise Asset Management System

## Categories & Features

### Table Stakes (Must Have)
- **Authentication & Roles**: Secure login, Employee vs. Admin vs. Asset Manager roles.
- **Asset Directory**: Register, view, and search assets by tag/serial/category.
- **Allocation Engine**: Assign assets to users/departments. Conflict prevention (no double allocations).
- **Resource Booking**: Calendar-based booking for shared resources. Overlap prevention.
- **Maintenance Workflow**: Ticketing system for repairs (Pending -> In Progress -> Resolved).

### Differentiators (Competitive Advantage)
- **Kanban Maintenance Board**: Visual drag-and-drop board for tracking repair statuses.
- **Automated Audit Cycles**: Scheduled verification cycles with auto-generated discrepancy reports.
- **Premium UI/UX**: SaaS-level polish (Linear-like), fast transitions, micro-animations, and extremely clear data visualization on the dashboard.
- **Conflict Resolution Workflow**: If an asset is taken, system suggests a "Transfer Request" instead of hard-blocking without recourse.

### Anti-Features (Do NOT Build)
- **Purchasing & Invoicing**: Keep out of financial and procurement ERP domains. Focus strictly on tracking existing assets.
- **Self-Service Role Elevation**: Users cannot sign up as Admins. Role assignment must be strict and top-down.
