---
wave: 1
depends_on: []
files_modified: ["backend/src/controllers/bookingController.ts", "backend/src/routes/bookingRoutes.ts", "backend/src/index.ts"]
autonomous: true
requirements_addressed: ["BOOK-01", "BOOK-02", "BOOK-03"]
---

# Wave 1: Backend Booking API

<objective>
Implement the core booking engine for shared resources with DB-level overlap validation.
</objective>

<tasks>

<task>
  <description>Booking Controller Implementation</description>
  <action>
    Create `backend/src/controllers/bookingController.ts`.
    Implement `createBooking` (`POST /api/bookings`):
    - Verify `asset.isShared === true`.
    - Check for overlapping bookings using Prisma: `OR: [{ startTime: { lt: req.end }, endTime: { gt: req.start } }]`.
    - If overlap exists, return 400. Otherwise, create the Booking.
    Implement `getAssetBookings` (`GET /api/assets/:id/bookings`): Fetch upcoming confirmed bookings for an asset.
  </action>
</task>

<task>
  <description>Booking Routes</description>
  <action>
    Create `backend/src/routes/bookingRoutes.ts`.
    Mount the endpoints.
    Update `backend/src/index.ts` to include `/api/bookings`.
  </action>
</task>

</tasks>
