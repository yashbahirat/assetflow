<!-- GSD:project-start source:PROJECT.md -->
## Project

**AssetFlow**

An Enterprise Asset & Resource Management System. The platform digitizes how organizations track, allocate, and maintain physical assets and shared resources through a centralized ERP platform. It reduces manual tracking inefficiencies by enabling structured asset lifecycles, centralized resource booking, and real-time visibility.

**Core Value:** Provide a reliable, self-contained system for centralized tracking of physical assets and shared resources, delivered through an exceptionally beautiful, modern SaaS-level user experience.

### Constraints

- **Tech Stack (Backend)**: Node.js with Express/Fastify, TypeScript (Strict), PostgreSQL, Prisma ORM.
- **Tech Stack (Frontend)**: React (Next.js App Router), Tailwind CSS, Shadcn UI, Radix Primitives, Framer Motion.
- **Prohibited Tech**: No Firebase, Supabase, or other BaaS.
- **Role Security**: Account creation defaults to Employee. Admins must explicitly promote users to higher roles.
- **Responsiveness**: The UI must be fully responsive and mobile-friendly.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack (2025 Standard)
### Frontend
- **Framework**: Next.js (App Router)
- **UI & Styling**: Tailwind CSS, Shadcn UI, Radix Primitives
- **Animations**: Framer Motion
### Backend
- **Runtime & Framework**: Node.js + Express (or Fastify) with TypeScript (Strict mode)
- **Database**: PostgreSQL
- **ORM**: Prisma
### Anti-Recommendations (Do NOT Use)
- **BaaS (Firebase, Supabase)**: Explicitly prohibited by constraints. Must be custom-built to demonstrate architecture skills.
- **NoSQL (MongoDB)**: Not suitable for heavily relational data (Assets -> Allocations -> Users -> Departments).
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.agent/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
