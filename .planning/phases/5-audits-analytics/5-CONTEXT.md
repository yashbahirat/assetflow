# Phase 5: Audits & Analytics Context

## Phase Goal
Finalize the MVP by delivering actionable dashboard analytics, a simplified asset audit engine, and notification features.

## Decisions

### 1. Audit Workflow
- **Decision**: A simplified "Snapshot" model.
- **Rationale**: An Admin can generate a new Audit Cycle, which takes a snapshot of the current assets. Auditors can then simply go down the list on a single page, checking them off as Verified, Missing, or Damaged. This meets the requirements without getting bogged down in complex lifecycle states.

### 2. Notifications Architecture
- **Decision**: Fetch-on-load / polling.
- **Rationale**: Real-time WebSockets are overkill for a hackathon MVP. The frontend will fetch recent notifications on initial load, or poll an endpoint on an interval. 

### 3. Analytics (DASH-03)
- **Decision**: Integrate `recharts`.
- **Rationale**: Adding lightweight SVG charts for Utilization and Maintenance frequency heavily elevates the SaaS feel and fulfills the "premium" aesthetic requirement. 

## Deferred Ideas
- Push notifications or email integrations.
- Complex audit re-assignments.
