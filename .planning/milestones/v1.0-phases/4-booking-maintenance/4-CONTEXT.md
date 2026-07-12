# Phase 4: Booking & Maintenance Context

## Phase Goal
Implement the shared resource booking engine with strict overlap validation and a Kanban-style maintenance ticketing system.

## Decisions

### 1. Maintenance Workflow UX
- **Decision**: A Kanban board layout.
- **Rationale**: Managers can drag-and-drop maintenance tickets between 'Pending', 'In Progress', and 'Resolved' columns. This provides an intuitive, highly-visual SaaS-grade experience for managing active repairs.

### 2. Booking Overlap Logic
- **Decision**: Perform overlap validation at the Database level using Prisma.
- **Rationale**: Ensures atomic, efficient validation. Prisma's conditional `where` clauses (`OR: [{ startTime: { lt: req.end }, endTime: { gt: req.start } }]`) prevent race conditions better than memory-based checks.

### 3. Booking Calendar View
- **Decision**: Simple scrollable Timeline/List view on the Asset Detail page.
- **Rationale**: We avoid the overhead of full calendar libraries. A list of upcoming bookings provides sufficient visibility into an asset's availability without cluttering the UI.

## Deferred Ideas
None captured during this discussion.
