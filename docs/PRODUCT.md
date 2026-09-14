# ParkShare — Product Definition

## 1. Problem

Drivers waste time and money searching for parking, while private parking spaces often remain unused for long periods.

ParkShare creates a marketplace where those two sides can transact directly.

## 2. Users

### Driver
Needs a reliable parking space near a destination for a defined time window.

Primary jobs:
- Find a suitable space quickly
- Know the price before booking
- Trust that the space exists and is available
- Pay securely
- Know how to access the space

### Space owner
Has a private parking space that is unused for some periods.

Primary jobs:
- List the space easily
- Control when it is available
- Set a price
- Approve/control access where necessary
- Earn from otherwise idle capacity

## 3. Core marketplace loop

1. Owner lists a space.
2. Platform verifies the minimum required information.
3. Driver searches for a location and time window.
4. Platform returns compatible spaces.
5. Driver selects a space.
6. Platform validates availability.
7. Driver pays.
8. Booking becomes confirmed.
9. Driver receives access instructions.
10. Booking ends.
11. Both sides can review the transaction.

## 4. MVP decisions

### Included
- Two-sided user model
- Listings
- Availability windows
- Search
- Booking
- Payments abstraction
- Booking history
- Ratings/reviews
- Basic verification/status fields

### Explicitly excluded from MVP
- Society/RWA dashboards
- Gate-controller integration
- ANPR hardware
- IoT occupancy sensors
- Complex dynamic pricing
- Multi-city operational tooling
- Native mobile apps before the web marketplace is validated

## 5. Trust model

The marketplace must make the following visible:
- Listing photos
- Exact/approximate location policy
- Vehicle compatibility
- Space dimensions where relevant
- Availability
- Price breakdown
- Owner rating
- Booking status
- Clear cancellation rules

Sensitive information such as a precise residential address should not be unnecessarily exposed before a booking is confirmed.

## 6. Initial business model

The platform takes a commission on completed bookings.

Example:
- Owner price: ₹40/hour
- Booking duration: 3 hours
- Gross booking value: ₹120
- Platform fee at 15%: ₹18
- Owner payout: ₹102

The exact fee should remain configurable rather than hard-coded into the business logic.

## 7. Success metrics for validation

Before scaling engineering, validate:
- Number of active spaces
- Search-to-booking conversion
- Booking completion rate
- Cancellation rate
- Average booking value
- Owner earnings
- Repeat driver bookings
- Repeat owner usage
- Time required to find a space

## 8. Product philosophy

Start with a trusted marketplace. Add automation and hardware only where they remove a demonstrated operational bottleneck.
