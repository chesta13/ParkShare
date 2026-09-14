# ParkShare — Initial Architecture

## Architecture goal

Keep the first release simple enough to develop and deploy quickly, while keeping boundaries clean enough to evolve into a production marketplace.

## Proposed stack

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- Responsive web UI

### Backend
- Next.js server/API layer initially
- TypeScript
- Zod for request validation

### Data
- PostgreSQL
- Prisma ORM

### Authentication
- Email/OTP or OAuth provider abstraction
- User roles: DRIVER and OWNER

### Payments
- Payment-provider abstraction in the domain layer
- Indian payment provider can be integrated after booking flow is stable

### Maps/location
- Map provider abstraction
- Geocoded coordinates stored separately from human-readable location fields

### Deployment
- Web application: Vercel-compatible
- PostgreSQL: managed PostgreSQL-compatible provider

## Logical components

```text
                 ┌─────────────────────────┐
                 │       Web Client         │
                 │   Driver + Owner UI     │
                 └────────────┬────────────┘
                              │ HTTPS
                 ┌────────────▼────────────┐
                 │     Application/API     │
                 │ Auth · Search · Booking │
                 │ Listing · Review · Pay  │
                 └───────┬────────┬────────┘
                         │        │
                ┌────────▼───┐ ┌──▼────────────┐
                │ PostgreSQL │ │ External APIs │
                │ + Prisma   │ │ Maps / Payment│
                └────────────┘ └───────────────┘
```

## Core domain entities

```text
User
 ├── owns → ParkingSpace
 ├── creates → Booking
 └── writes → Review

ParkingSpace
 ├── has → AvailabilityWindow
 ├── has → Booking
 └── receives → Review

Booking
 ├── belongs to → User (driver)
 ├── reserves → ParkingSpace
 └── may create → Review
```

## Booking state machine

```text
PENDING_PAYMENT
      │
      ├── payment success ──► CONFIRMED
      │
      └── payment failure ──► PAYMENT_FAILED

CONFIRMED ──► ACTIVE ──► COMPLETED
     │                       │
     └── cancellation ─────► CANCELLED
```

The exact state machine will be implemented so that availability is validated transactionally and two drivers cannot successfully reserve the same space for overlapping times.

## Security principles

- Validate every API input server-side.
- Never trust client-calculated prices.
- Never expose payment secrets to the browser.
- Authorize every owner/driver resource access.
- Avoid exposing precise private addresses before booking unless required.
- Keep audit-friendly booking/payment records.

## Evolution path

### V1 — Marketplace
Software-only listings, search, booking, payment and reviews.

### V2 — Trust
Identity/listing verification, stronger cancellation/refund policies and reputation signals.

### V3 — Smart parking
Occupancy sensors and real-time availability.

### V4 — Smart access
QR/BLE/NFC/ANPR-assisted entry and exit.

### V5 — Intelligence
Demand forecasting, recommendation ranking and dynamic pricing assistance.
