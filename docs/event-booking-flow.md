# Event Booking System - Complete Flow

## System Overview

This document outlines the complete event booking and ticketing system flow, from event creation to ticket validation.

---

## 1. Admin/Organizer Setup Flow

### 1.1 Organizer Registration
**Route:** `/organizer/dashboard` or `/organizer`

**Steps:**
1. User signs up/logs in
2. Creates organizer profile:
   - Business name
   - Business type (Event Organizer, Transport Operator, Venue Owner)
   - Contact information
3. Profile goes to "pending" status until admin approves

**Database Tables:**
- `organizers` - Stores organizer profiles

---

### 1.2 Venue Management
**Admin Route:** `/admin/venues`
**Organizer Route:** `/organizer/dashboard` (Venues tab)

**Required Fields:**
- Venue name
- Venue type (stadium, arena, theater, conference_center, outdoor, transport_terminal)
- Address & City
- Capacity
- Description

**Database Tables:**
- `venues` - Stores all venue information
- Optional: `seat_maps` - For venues with reserved seating

---

### 1.3 Event Creation
**Admin Route:** `/admin/events`
**Organizer Route:** `/organizer/dashboard` (Events tab)

**Required Fields:**
- Event title
- Event description
- Venue selection
- Event category (music, sports, arts, food, business, education, festival, other)
- Start date & time
- End date & time (optional)
- Status (Published/Draft)

**Database Tables:**
- `events` - Main event information

---

### 1.4 Ticket Types Configuration
**Route:** `/organizer/dashboard` (within event management)

**Required for each ticket type:**
- Ticket name (e.g., "General Admission", "VIP", "Early Bird")
- Description
- Base price
- Currency (USD, ZWL, ZAR)
- Max quantity available
- Active status

**Advanced Features:**
- Early bird pricing (time-based discounts)
- Dynamic pricing based on demand
- Seat-specific pricing

**Database Tables:**
- `ticket_types` - Different ticket categories per event

---

### 1.5 Add-ons Configuration
**Route:** `/organizer/dashboard` (within event management)

**Optional add-ons:**
- Category: transport, parking, merchandise, food, accommodation, experience, insurance
- Name & description
- Price
- Max quantity

**Database Tables:**
- `event_addons` - Optional purchasable items

---

## 2. Customer Booking Flow

### 2.1 Event Discovery
**Route:** `/events` or `/` (home page)

**Features:**
- Browse all published events
- Filter by category, location, date
- Search functionality
- View event details

---

### 2.2 Checkout Process
**Route:** `/checkout?eventId={id}`

**Steps:**

#### Step 1: Event Selection
- Display event details
- Show venue information
- Display available dates

#### Step 2: Seat Selection (if applicable)
- Interactive seat map
- Different pricing tiers
- Real-time availability

#### Step 3: Ticket Tier Selection
- Choose ticket type
- Select quantity
- View pricing breakdown

#### Step 4: Add-ons Selection
- Optional purchases
- Transport options
- Merchandise
- Food/beverages

#### Step 5: Customer Information
**Required Fields:**
- First name
- Last name
- Email address
- Phone number

**Validation:**
- Email format validation
- Phone number format
- All required fields present

#### Step 6: Payment Selection
**Options:**
- Ecocash
- OneMoney
- Credit/Debit Card (Stripe)
- Bank Transfer

**Note:** Without Stripe configured, you can:
- Test with mock payments
- Use manual payment confirmation
- Add other payment gateway integrations

#### Step 7: Order Summary & Confirmation
- Review all selections
- Total price breakdown:
  - Subtotal
  - Service fee (configurable)
  - Processing fee (payment-method specific)
  - Total amount
- Terms acceptance

---

### 2.3 Order Processing
**Backend:** `supabase/functions/create-order/index.ts`

**Process:**
1. Validate order data
2. Check ticket availability
3. Calculate total amount
4. Create order record
5. Generate tickets with QR codes
6. Process payment (if Stripe configured)
7. Update order status
8. Send confirmation email

**Database Tables:**
- `orders` - Main order information
- `tickets` - Individual tickets generated
- `payment_transactions` - Payment records

---

### 2.4 Order Confirmation
**Route:** `/order-confirmation/{orderNumber}`

**Display:**
- Order details
- Ticket information with QR codes
- Download options
- Sharing options
- Event details
- Contact support information

---

## 3. Ticket Management

### 3.1 Ticket Generation
**Process:** Automatic during order creation

**Each ticket includes:**
- Unique ticket number (format: `TKT-YYYYMMDD-XXXX`)
- Secure QR code with:
  - Ticket ID
  - Order reference
  - Event information
  - Digital signature
  - Expiry timestamp
- Customer information
- Event details
- Seat information (if applicable)

**Security Features:**
- SHA-256 hashing
- Digital signatures
- Tamper detection
- Duplicate scan prevention

---

### 3.2 Ticket Validation
**Backend:** `supabase/functions/validate-ticket/index.ts`

**Validation Process:**
1. Scan QR code
2. Verify digital signature
3. Check ticket status in database
4. Verify not expired
5. Check for duplicate scans (within 5 minutes)
6. Record validation event
7. Return validation result

**Database Tables:**
- `ticket_validations` - Scan history
- `fraud_alerts` - Suspicious activity tracking

---

## 4. Admin Management

### 4.1 Dashboard
**Route:** `/admin`

**Features:**
- Overview statistics
- Recent orders
- Revenue metrics
- Event performance

---

### 4.2 Order Management
**Route:** `/admin/orders`

**Capabilities:**
- View all orders
- Filter by status, date, event
- Process refunds
- Update order status
- View customer information
- Track payment status

---

### 4.3 Fraud Monitoring
**Route:** `/admin` (Fraud Dashboard component)

**Monitors:**
- Duplicate ticket scans
- High-velocity purchases
- Suspicious payment patterns
- Risk score calculations

**Database Tables:**
- `fraud_alerts`
- `purchase_risk_scores`
- `device_fingerprints`

---

## 5. Database Schema Summary

### Core Tables
1. **organizers** - Event organizers/businesses
2. **venues** - Event locations
3. **events** - Event information
4. **ticket_types** - Ticket categories
5. **event_addons** - Optional add-ons
6. **orders** - Customer orders
7. **tickets** - Individual tickets
8. **payment_transactions** - Payment records

### Supporting Tables
9. **profiles** - User profiles
10. **user_roles** - Role-based access control
11. **seat_maps** - Venue seating layouts
12. **seats** - Individual seat records
13. **booking_analytics** - Tracking data
14. **fraud_alerts** - Security monitoring
15. **ticket_validations** - Scan records

---

## 6. Required Integrations

### Currently Implemented
- ✅ Supabase (Database & Auth)
- ✅ Email notifications (Resend)
- ✅ QR code generation
- ✅ Order management system
- ✅ Fraud detection

### Pending Configuration
- ⏳ Stripe payment processing (needs secret key)
- ⏳ Mobile money integrations (Ecocash, OneMoney)

---

## 7. Testing Without Stripe

Until Stripe is configured, you can:

1. **Mock Payments:**
   - Orders are created successfully
   - Payment status set to "pending"
   - Test the full booking flow
   - Tickets are generated

2. **Manual Confirmation:**
   - Admin can manually update payment status
   - Use bank transfer option
   - Process offline payments

3. **Test Data:**
   - Create test events
   - Make test bookings
   - Validate ticket generation
   - Test email notifications

---

## 8. Next Steps for Production

### Admin Tasks:
1. ✅ Create organizer profile
2. ✅ Add venues
3. ✅ Create events
4. ✅ Configure ticket types
5. ✅ Add optional add-ons
6. ⏳ Configure Stripe secret key
7. ⏳ Set up mobile money integrations
8. ⏳ Configure email templates
9. ⏳ Set service fee percentages
10. ⏳ Test complete booking flow

### Technical Tasks:
1. ⏳ Add Stripe secret key to environment
2. ⏳ Test payment processing
3. ⏳ Configure email notifications
4. ⏳ Set up domain and SSL
5. ⏳ Configure analytics tracking
6. ⏳ Test fraud detection rules

---

## 9. Key Routes Reference

| Route | Purpose | Access Level |
|-------|---------|--------------|
| `/` | Home page | Public |
| `/events` | Event listing | Public |
| `/checkout` | Booking process | Public |
| `/order-confirmation/:orderNumber` | Order details | Public (with order number) |
| `/organizer` or `/organizer/dashboard` | Organizer management | Authenticated Organizers |
| `/admin` | Admin dashboard | Admin only |
| `/admin/events` | Event management | Admin only |
| `/admin/venues` | Venue management | Admin only |
| `/admin/orders` | Order management | Admin only |

---

## 10. API Endpoints (Edge Functions)

1. **create-order** - Process new bookings
2. **process-stripe-payment** - Handle Stripe payments
3. **validate-ticket** - QR code validation
4. **send-order-confirmation** - Email notifications
5. **fraud-monitor** - Security checks

---

This system provides a complete event ticketing solution from creation to validation, with built-in security, fraud detection, and flexible payment options.
