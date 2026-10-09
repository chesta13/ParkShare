# ParkShare 🚗

> A peer-to-peer marketplace for unused private parking spaces.

ParkShare connects **space owners** who have idle parking capacity with **drivers** who need convenient parking for a specific time window.

The product starts as a software-first marketplace and is designed to evolve into a smart parking platform with real-time occupancy, access control, computer vision, and intelligent matching.

## Product thesis

**Idle parking capacity → discovery → matching → booking → payment → parking → rating**

ParkShare is intentionally **not** a society/RWA management product in the MVP. The marketplace is centered on the owner and driver, with verification and transaction controls built into the platform.

## MVP scope

### Driver
- Discover nearby parking spaces
- Filter by date/time, price, and vehicle type
- View parking details and owner rating
- Reserve a space
- Track active and past bookings
- Rate completed bookings

### Space owner
- Create and verify a parking listing
- Set price and availability
- Manage bookings
- View earnings
- Receive ratings

### Platform
- Authentication
- Parking search
- Availability validation
- Double-booking prevention
- Booking lifecycle
- Payment architecture
- Reviews and reputation

## Planned evolution

1. Marketplace MVP
2. Trust and verification
3. Intelligent parking matching
4. Real-time occupancy using IoT sensors
5. Smart access using QR/BLE/NFC
6. ANPR/computer vision
7. Demand prediction and AI-assisted pricing/recommendation

## Repository status

**Stage:** Marketplace foundation and first functional flows

The repository now includes the initial product and data model, repeatable CI, account registration/login with signed sessions, database-backed listing drafts, owner publishing, and active-space search. Booking creation, payment processing, email verification, moderation workflows, and production deployment remain future milestones. A configured PostgreSQL database and a unique `SESSION_SECRET` are required to exercise the database-backed flows locally.

## Core principle

> Build the smallest system that can prove strangers will successfully transact around unused parking capacity — then add complexity only when the real-world problem demands it.


## Local development

1. Install Node.js 22 or newer and PostgreSQL.
2. Copy `.env.example` to `.env` and set `DATABASE_URL` to your local database connection string.
3. Replace `SESSION_SECRET` with a unique random value of at least 32 characters. Do not commit `.env` or production secrets.
4. Install the locked dependencies with `npm ci`.
5. Apply the initial Prisma schema with `npm run db:push` and generate the client with `npm run db:generate`.
6. Start the web app with `npm run dev`.

The current account/listing flows require a reachable PostgreSQL database. Payments, email verification, password reset, booking creation, moderation and production deployment are not implemented yet; do not use this MVP for real payments or sensitive production data.
