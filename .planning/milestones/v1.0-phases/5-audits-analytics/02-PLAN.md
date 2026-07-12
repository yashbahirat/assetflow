---
wave: 2
depends_on: ["01-PLAN.md"]
files_modified: ["frontend/src/app/page.tsx", "frontend/src/components/layout/Topbar.tsx", "frontend/package.json"]
autonomous: true
requirements_addressed: ["DASH-01", "DASH-02", "DASH-03", "NOTIF-02"]
---

# Wave 2: Frontend Analytics Dashboard

<objective>
Build the primary dashboard with KPI cards, overdue warnings, and recharts integration.
</objective>

<tasks>

<task>
  <description>Recharts Installation</description>
  <action>
    Run `npm install recharts` in the frontend directory.
  </action>
</task>

<task>
  <description>Dashboard UI</description>
  <action>
    Update `frontend/src/app/page.tsx`.
    Fetch `/api/analytics/dashboard` and `/api/analytics/reports`.
    Build KPI cards for Available, Allocated, and Maintenance asset counts.
    Build a table of Overdue Returns displaying a warning indicator if `expectedReturnDate` has passed.
    Build simple Asset Utilization charts using `recharts` (PieChart or BarChart).
  </action>
</task>

<task>
  <description>Notifications Dropdown</description>
  <action>
    Update `frontend/src/components/layout/Topbar.tsx`.
    Add a Bell icon button.
    On click (or on load), fetch `/api/analytics/activity` and display a dropdown list of recent events (e.g. "Asset Assigned").
  </action>
</task>

</tasks>
