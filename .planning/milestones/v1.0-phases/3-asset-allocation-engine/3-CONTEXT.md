# Phase 3: Asset & Allocation Engine Context

## Phase Goal
Implement the core asset management features: registering assets, filtering the directory, tracking allocations and transfers, and maintaining history.

## Decisions

### 1. Asset History Tracking
- **Decision**: Query history dynamically by aggregating the Allocation and Maintenance tables.
- **Rationale**: This provides a simpler schema and maintains a single source of truth without the overhead of dual writes to a unified event log.

### 2. Transfer Request Workflow
- **Decision**: The asset stays `ALLOCATED` to the original user until the transfer is approved.
- **Rationale**: This accurately reflects physical possession. If the transfer is rejected, it seamlessly remains with the original owner without needing a complex state rollback.

### 3. Asset Registration UX
- **Decision**: Slide-over panel (Side Drawer).
- **Rationale**: Keeps the user engaged with the underlying data table list context while providing enough space for data entry, adhering to modern SaaS UX patterns.

## Deferred Ideas
None captured during this discussion.
