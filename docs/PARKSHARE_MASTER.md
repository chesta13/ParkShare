# ParkShare — Master Product & Technical Specification

**Status:** Living source of truth  
**Version:** 1.0  
**Product:** ParkShare  
**Repository:** chesta13/ParkShare  
**Current development branch:** feat/mvp-foundation

---

## 1. Problem Statement

Urban drivers frequently waste time searching for parking, face limited availability, and encounter high or inconsistent parking costs.

At the same time, a large amount of privately controlled parking capacity — home driveways, garages, apartment spaces, office spaces and other eligible spaces — remains unused for significant periods.

**Core problem:**

> Drivers need convenient parking, while nearby private parking capacity sits idle.

---

## 2. Solution

ParkShare is a peer-to-peer parking marketplace that converts idle private parking capacity into on-demand parking.

The platform connects:

- **Drivers** looking for convenient, affordable parking.
- **Space owners** who want to monetize eligible unused parking capacity.

Core loop:

**Idle capacity → listing → discovery → matching → booking → payment → parking → review**

MVP deliberately avoids society/RWA management, gate controllers, ANPR, IoT and other operational complexity.

---

## 3. Target Users

### Driver
A person who needs parking near a destination for a defined period.

Needs:
- Nearby parking discovery
- Transparent pricing
- Availability
- Distance information
- Advance booking
- Secure payment
- Reliable access instructions

### Space Owner
A person or authorized entity controlling an eligible private parking space.

Needs:
- Simple listing
- Pricing control
- Availability control
- Booking management
- Earnings visibility
- Trust and verification

### Admin
ParkShare operations team.

Needs:
- User management
- Listing moderation
- Verification
- Booking/payment visibility
- Dispute handling
- Analytics
- Abuse prevention

---

## 4. User Journeys

### Driver Journey

1. Open ParkShare.
2. Enter destination/location.
3. Select date and time.
4. View available spaces.
5. Filter by price, distance, vehicle type and other supported criteria.
6. Open a listing.
7. Review price, photos, availability, access information and rating.
8. Book.
9. Pay.
10. Receive confirmation.
11. Navigate to the parking location.
12. Park.
13. Complete booking.
14. Leave a review.

### Owner Journey

1. Register/login.
2. Start listing.
3. Enter parking location and access information.
4. Add listing title, description and photos.
5. Define supported vehicle types.
6. Set hourly price.
7. Define availability.
8. Submit/publish listing.
9. Receive booking.
10. Manage booking.
11. Driver uses the space.
12. Owner receives eligible payout.
13. View earnings/reviews.

---

## 5. MVP Scope

### Must Have

- Driver registration/login
- Owner registration/login
- Parking-space listing
- Listing photos
- Location/search
- Map view
- Availability
- Price display
- Filters
- Booking
- Payment
- Booking history
- Owner dashboard
- Reviews/ratings
- Basic verification
- Admin moderation
- Responsive web experience

### Explicitly Out of MVP

- ANPR
- IoT occupancy sensors
- Smart gates
- BLE access control
- EV charging integration
- AI dynamic pricing
- Advanced computer vision
- Society/RWA management
- Fleet management
- Complex access-control hardware

---

## 6. Business Model

ParkShare is a marketplace.

Example:

- Owner listing price: ₹40/hour
- Booking duration: 3 hours
- Gross parking amount: ₹120
- Example platform commission: 15%
- Example platform fee: ₹18
- Example owner amount before applicable payment/tax adjustments: ₹102

The exact commission, taxes, payment-gateway fees, payout timing and cancellation charges must be finalized before production payments launch.

### Revenue Sources — MVP

- Booking commission

### Potential Future Sources

- Premium listings
- Corporate parking partnerships
- Subscription plans
- Smart parking services
- EV charging integrations
- Enterprise/fleet solutions

---

## 7. Booking Rules

A parking space cannot have overlapping confirmed/active bookings.

Example:

- 10:00–12:00 existing booking
- 11:00–13:00 requested booking → **reject**
- 12:00–14:00 requested booking → **allowed**, subject to other rules

Server-side booking logic must prevent race conditions and duplicate reservations.

Required rules:

- Owner cannot book their own space.
- Only eligible/active spaces can be booked.
- Start time must precede end time.
- Booking must satisfy availability.
- Price must be calculated server-side.
- Client-supplied totals must never be trusted.
- Booking state transitions must be controlled.
- Payment confirmation must be verified server-side.

Future rules:

- Cancellation window
- Refund policy
- Owner cancellation
- Driver cancellation
- No-show
- Late arrival
- Early departure
- Booking extension

---

## 8. Verification & Trust

Trust is a core marketplace requirement.

### MVP Verification

- Email verification
- Mobile verification where implemented
- Basic identity/account checks
- Listing review/moderation
- Parking-space photos
- Owner declaration that they control/are authorized to offer the space

### Future Verification

- Government ID verification
- Address/ownership/authorization evidence
- Location verification
- Smart access verification
- Automated fraud/risk checks

---

## 9. Product Requirements

### Search

Drivers can search by:
- Destination/location
- Date
- Start time
- End time

### Filters

Initial candidates:
- Price
- Distance
- Vehicle type
- Availability
- Rating

### Listing

Each listing can contain:
- Title
- Description
- Approximate/public location
- Exact address internally
- Photos
- Vehicle types
- Hourly rate
- Availability
- Rating/reviews
- Access instructions where appropriate

### Booking

Booking must show:
- Space
- Date
- Start/end time
- Duration
- Subtotal
- Platform fee
- Total
- Payment status
- Booking status

---

## 10. UI/UX

Primary experiences:

### Driver
Home → Search → Results/Map → Listing → Booking → Payment → Confirmation → Booking History

### Owner
Dashboard → List Space → Availability/Pricing → Listings → Bookings → Earnings

### Design Principles

- Mobile-first
- Simple search
- Clear pricing
- Minimal booking steps
- Strong trust indicators
- Accessible forms
- Clear booking states
- No unnecessary complexity

---

## 11. System Architecture

### MVP

```
Driver / Owner
      |
      v
Next.js + React
      |
      v
Next.js API
      |
      +---- Zod validation
      |
      +---- Business logic
      |
      v
Prisma ORM
      |
      v
PostgreSQL

External services:
Maps | Payments | Auth | Image storage | Notifications
```

### Architectural principle

Start as a modular monolith.

Do not split into microservices until scale or team requirements justify it.

---

## 12. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js + React |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Forms | React Hook Form |
| Validation | Zod |
| Backend/API | Next.js API |
| ORM | Prisma |
| Database | PostgreSQL |
| Authentication | Auth.js |
| Maps | Google Maps Platform / Mapbox |
| Payments | Razorpay |
| Image storage | Cloudinary / S3 |
| Cache | Redis |
| SMS/OTP | MSG91 / Twilio |
| Email | Resend |
| Analytics | PostHog |
| Monitoring | Sentry |
| Unit testing | Vitest |
| E2E testing | Playwright |
| CI | GitHub Actions |
| Deployment | Vercel |
| Future AI | Python + FastAPI + ML |
| Future IoT | ESP32/MCU + MQTT |

Only services needed for the current MVP should be integrated initially.

---

## 13. Database Schema

Current core entities:

```
User
  |
  +---- ParkingSpace
  |        |
  |        +---- AvailabilityWindow
  |        +---- Booking
  |        +---- Review
  |
  +---- Booking
```

### Current Prisma entities

- User
- ParkingSpace
- AvailabilityWindow
- Booking
- Review

### Important future entities

- Payment
- Payout
- Vehicle
- Notification
- Verification
- Favorite
- Dispute
- Coupon
- AuditLog

### Data principles

- Store monetary values as integer minor units (e.g. paise).
- Store timestamps consistently.
- Use database constraints/indexes for integrity and performance.
- Avoid exposing unnecessary private address data.

---

## 14. API Specification

Initial API direction:

```
GET    /api/spaces
POST   /api/spaces
GET    /api/spaces/:id
PATCH  /api/spaces/:id
DELETE /api/spaces/:id

GET    /api/availability
POST   /api/availability

POST   /api/bookings
GET    /api/bookings
GET    /api/bookings/:id
PATCH  /api/bookings/:id

POST   /api/payments
POST   /api/payments/webhook

POST   /api/reviews
GET    /api/reviews
```

All write endpoints must validate input server-side.

Authorization must be checked independently from UI visibility.

---

## 15. Security Architecture

Security requirements:

- Authentication for protected operations
- Role/ownership authorization
- Server-side validation
- Rate limiting
- Secure payment webhook verification
- Protection against duplicate bookings
- Protection against price manipulation
- Protection against unauthorized listing modification
- Safe handling of private location data
- Secure secrets management
- Audit logging for sensitive actions

Never trust:
- Client-calculated prices
- Client-provided ownership
- Client-provided payment success
- Client-provided authorization claims

---

## 16. Payment Architecture

Initial provider target: Razorpay.

Flow:

```
Driver
  |
  v
Booking request
  |
  v
Server calculates amount
  |
  v
Payment order
  |
  v
Razorpay
  |
  v
Verified webhook
  |
  v
Booking confirmed
```

Payment state must be separate from booking state.

Potential states:

**Payment:** PENDING → PAID → REFUNDED / FAILED

**Booking:** PENDING_PAYMENT → CONFIRMED → ACTIVE → COMPLETED

Cancellation/refund logic will be defined before production launch.

---

## 17. Testing Strategy

### Unit Tests — Vitest

Test:
- Price calculation
- Platform fee
- Duration calculation
- Availability validation
- Booking overlap
- Input validation
- State transitions

### E2E — Playwright

Critical flow:

```
Open app
  ↓
Search
  ↓
View listing
  ↓
Select time
  ↓
Start booking
  ↓
Payment flow
  ↓
Confirmation
```

Owner flow:

```
Login
  ↓
Create listing
  ↓
Set availability
  ↓
Publish
  ↓
Manage booking
```

---

## 18. CI/CD

GitHub Actions should validate every relevant change.

Pipeline:

```
Developer
   |
   v
GitHub
   |
   v
GitHub Actions
   |
   +-- npm install
   +-- lint
   +-- typecheck
   +-- unit tests
   +-- build
   +-- E2E tests
   |
   v
PASS / FAIL
   |
   v
Vercel deployment
```

No claim of test success should be made without an actual successful run.

---

## 19. Deployment Architecture

Target MVP deployment:

```
GitHub
   |
   v
Vercel
   |
   +---- Next.js application
   +---- API routes
   |
   v
Managed PostgreSQL
```

Initial database target can be a managed PostgreSQL provider such as Neon.

Required production configuration:
- DATABASE_URL
- Authentication secrets
- Maps credentials
- Razorpay credentials
- Image-storage credentials
- Notification credentials

Secrets must be stored in deployment/environment secret management, never committed to Git.

---

## 20. Admin Architecture

Admin capabilities:

### Users
- View
- Suspend
- Review verification

### Listings
- Review
- Approve
- Reject
- Pause/block

### Bookings
- View
- Investigate
- Handle operational issues

### Payments
- View payment status
- Refund workflow
- Payout visibility

### Trust & Safety
- Reports
- Disputes
- Suspicious activity

### Analytics
- Supply
- Demand
- Bookings
- Revenue
- Conversion

---

## 21. Analytics / KPIs

Core funnel:

```
Landing
  ↓
Search
  ↓
Listing view
  ↓
Booking attempt
  ↓
Successful booking
  ↓
Repeat booking
```

Primary KPIs:

- Active parking spaces
- Searches
- Listing views
- Booking conversion rate
- Successful bookings
- Gross booking value
- Platform revenue
- Average booking value
- Space utilization
- Cancellation rate
- Repeat booking rate
- Search-to-book time
- Supply/demand by location

---

## 22. Legal / Operational Considerations

Before public production launch, validate:

- Owner authorization to list parking
- Terms & Conditions
- Privacy Policy
- Cancellation/refund policy
- Vehicle damage liability
- Theft/liability boundaries
- Dispute resolution
- Applicable taxes/GST
- Payment settlement obligations
- Local/property/society/RWA restrictions
- Rules applicable to commercial use of private parking

Legal review should happen before production-scale marketplace launch.

---

## 23. MVP Roadmap

### Phase 0 — Validation

- Identify potential owners
- Identify potential drivers
- Collect sample parking spaces
- Manually match users
- Test real booking/payment willingness

### Phase 1 — Foundation

- Next.js application
- Product UI
- Prisma
- PostgreSQL schema
- Owner listing flow
- Driver search flow
- CI/testing

### Phase 2 — Marketplace

- Authentication
- Search
- Maps
- Availability
- Booking
- Payment
- Owner dashboard
- Driver booking history
- Reviews

### Phase 3 — Trust & Operations

- Verification
- Admin dashboard
- Disputes
- Notifications
- Analytics
- Monitoring

### Phase 4 — Scale

- Redis
- Performance optimization
- Better search
- Advanced analytics
- Multi-city operations

---

## 24. AI / IoT Future Roadmap

### AI

Potential capabilities:

- Demand prediction
- Dynamic pricing
- Smart parking recommendations
- Personalized ranking
- Fraud/anomaly detection
- Location-based demand forecasting

Potential architecture:

```
ParkShare Backend
      |
      v
Python / FastAPI
      |
      +-- ML models
      +-- Demand prediction
      +-- Recommendation
      +-- Pricing
```

### IoT

Potential parking sensor:

```
Parking Sensor
      |
      v
ESP32 / MCU
      |
      v
Wi-Fi / Cellular
      |
      v
MQTT / Cloud
      |
      v
ParkShare
      |
      v
Real-time occupancy
```

### Smart Access

Future options:
- QR
- BLE
- ANPR
- Gate integration
- Automated entry/exit

### EV

Future:
- EV charger discovery
- Charging + parking booking
- Charging availability
- Integrated payments

---

## 25. Real-World Validation Plan

Do not assume product-market fit from software usage alone.

### Initial experiment

Target:
- ~10 parking owners
- ~20 potential drivers
- Manual listing collection
- Manual matching
- Real booking attempts
- Real payment willingness

Tools can initially include:
- WhatsApp
- Forms
- Sheets
- Maps
- UPI/manual payment

### Key validation questions

**Supply**
- Will owners list?
- What price do they expect?
- When is the space available?
- What concerns do they have?

**Demand**
- Will drivers use private parking?
- How far will they walk?
- What price will they accept?
- Will they book in advance?

**Transaction**
- Will both sides trust the platform?
- Will users pay?
- What causes cancellation?
- Do users return?

### Initial success signal

A small number of genuine transactions is more meaningful than a large number of sign-ups.

---

# Product Principles

1. **Marketplace first.**
2. **Solve parking discovery and transaction before adding hardware.**
3. **Keep MVP operationally simple.**
4. **Never compromise booking/payment correctness.**
5. **Protect private location information.**
6. **Validate with real users before expanding scope.**
7. **Use modular architecture so AI/IoT can be added later.**
8. **Automate testing and deployment early.**
9. **Measure transactions, not vanity metrics.**
10. **Build only what the current stage requires.**

---

# Current Build Status

### Completed / Started

- [x] GitHub repository
- [x] Next.js foundation
- [x] Responsive landing page
- [x] Owner dashboard
- [x] Owner listing form
- [x] Vitest setup
- [x] Playwright setup
- [x] GitHub Actions workflow
- [x] Prisma dependency
- [x] PostgreSQL schema
- [x] Prisma client
- [x] Environment template

### Immediate Next Build

**Owner listing form → validated API → PostgreSQL persistence → real listing retrieval → driver search**

### Current principle

> **Do not fake functionality that is supposed to be real.**

If a database, payment, booking or authentication feature is not actually connected, the UI must not represent it as completed.

---

# North Star

> **ParkShare turns unused private parking capacity into accessible, bookable urban infrastructure.**

The long-term platform evolves from a simple marketplace into a data-driven smart-parking network — while the MVP remains focused on one thing:

> **Help drivers find parking and help owners monetize unused space.**
