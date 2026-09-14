# ParkShare — Initial Data Model

## User

- `id` — UUID
- `name`
- `email`
- `phone`
- `role` — DRIVER | OWNER | BOTH
- `createdAt`
- `updatedAt`

## ParkingSpace

- `id` — UUID
- `ownerId` → User
- `title`
- `description`
- `addressLine`
- `locality`
- `city`
- `latitude`
- `longitude`
- `vehicleTypes`
- `hourlyRate`
- `status` — DRAFT | ACTIVE | PAUSED | BLOCKED
- `createdAt`
- `updatedAt`

## AvailabilityWindow

- `id` — UUID
- `parkingSpaceId` → ParkingSpace
- `startAt`
- `endAt`
- `isAvailable`

## Booking

- `id` — UUID
- `spaceId` → ParkingSpace
- `driverId` → User
- `startAt`
- `endAt`
- `subtotal`
- `platformFee`
- `totalAmount`
- `currency`
- `status`
- `paymentStatus`
- `createdAt`
- `updatedAt`

## Review

- `id` — UUID
- `bookingId` → Booking
- `authorId` → User
- `spaceId` → ParkingSpace
- `rating` — 1..5
- `comment`
- `createdAt`

## Important constraints

1. A booking must have `startAt < endAt`.
2. A driver cannot book their own space.
3. Only ACTIVE spaces can receive bookings.
4. Booking overlap must be prevented at the database/application transaction boundary.
5. Money should be represented using integer minor units (e.g. paise), not floating-point values.
6. Reviews should reference completed bookings.
7. Owner authorization must be checked before modifying a space or its availability.

## Search model

The first implementation can use latitude/longitude plus city/locality filtering. A spatial extension such as PostGIS can be introduced when geographic search scale requires it.
