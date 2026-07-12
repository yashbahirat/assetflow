---
wave: 3
depends_on: ["01-PLAN.md"]
files_modified: ["frontend/src/app/assets/[id]/page.tsx"]
autonomous: true
requirements_addressed: ["BOOK-01", "BOOK-02"]
---

# Wave 3: Frontend Shared Resource Booking

<objective>
Update the Asset Details page to support viewing and creating bookings for shared resources.
</objective>

<tasks>

<task>
  <description>Booking Timeline View</description>
  <action>
    Update `frontend/src/app/assets/[id]/page.tsx`.
    If `asset.isShared === true`, fetch and display the "Upcoming Bookings" list next to or below the History timeline.
  </action>
</task>

<task>
  <description>Booking Action Modal</description>
  <action>
    Add a "Book Resource" button for shared assets.
    Build a modal containing a form with `startTime` and `endTime` datetime-local inputs.
    On submit, hit `POST /api/bookings` and handle 400 overlap errors gracefully in the UI.
  </action>
</task>

</tasks>
