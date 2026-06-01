# Pharmacy Platform Product Backlog v2

## Current Progress

### Backend

✅ EPIC 8 — Admin Authentication

✅ EPIC 4 — Product Management

✅ EPIC 5 — Inventory & Stock Protection

✅ EPIC 3 — Guest Checkout & Order Flow

### Frontend

✅ F1 — Admin Authentication UI

✅ F2 — Admin Products & Categories UI

---

# Phase 1 — Core Operations (Current Phase)

Goal:

Deliver a fully usable pharmacy system for owner testing.

---

## F3 — Admin Inventory UI ✅

Status: Next

### Features

* Inventory dashboard
* Inventory table
* Current stock display
* Low stock display
* Stock status badges
* Inventory adjustment form
* Adjustment history viewer
* Inventory search
* Inventory filtering

### Backend Already Exists

Uses:

* GET /api/admin/inventory
* GET /api/admin/inventory/low-stock
* POST /api/admin/inventory/adjust
* GET /api/admin/inventory/:productId/history

---

## F4 — Admin Orders Dashboard ✅

Status: Planned

### Features

* Orders table
* Order details page
* Status update workflow
* Customer information panel
* Order search
* Order filtering
* Status badges
* Order timeline

### Backend Already Exists

Uses:

* GET /api/admin/orders
* GET /api/admin/orders/:id
* PATCH /api/admin/orders/:id/status

---

## F5 — Customer Product Catalog ✅

Status: Planned

### Features

* Homepage
* Product listing
* Product detail page
* Search
* Category filtering
* Product cards
* Responsive mobile UI

### Backend Already Exists

Uses:

* GET /api/products
* GET /api/products/:slug
---

## F6 — Cart & Checkout UI ✅

Status: Planned

### Features

* Cart page
* Quantity updates
* Checkout page
* OTP verification flow
* Delivery form
* Contact method selection
* Order placement

### Backend Already Exists

Uses:

* POST /api/checkout/send-otp
* POST /api/checkout/verify-otp
* POST /api/checkout/order

---

## F7 — Order Tracking UI ✅

Status: Planned

### Features

* Order lookup page
* Order status tracking
* Public order progress display

### Backend Already Exists

Uses:

* GET /api/orders/:orderNumber

---

# Phase 2 — Business Enhancements

## EPIC 6 — Discounts & Promotions ✅

### Features

* Product discounts
* Featured products
* Campaigns
* Promotional banners
* Seasonal offers

---

## EPIC 9 — Reporting & Insights ✅

### Features

* Revenue dashboard
* Best-selling products
* Sales trends
* Low-stock reports
* Order analytics

---

# Phase 3 — Production Readiness

## EPIC 13 — Security Hardening

### Remaining Tasks

* Rate limiting
* Audit logging
* Login throttling
* Monitoring
* Backup strategy
* Production security review

---

## EPIC 11 — Deployment & Infrastructure

### Features

* Production hosting
* Domain configuration
* SSL
* Database hosting
* Backups
* Monitoring

---

# Phase 4 — Future Expansion

## EPIC 12

* Loyalty program
* Wishlist
* Customer accounts
* WhatsApp automation
* SMS automation
* Multi-branch inventory
* Mobile application

Not part of V1.

---

# Immediate Development Order

1. F3 — Admin Inventory UI
2. F4 — Admin Orders Dashboard
3. F5 — Customer Product Catalog
4. F6 — Cart & Checkout UI
5. F7 — Order Tracking UI

After F7, deploy a demo version for the pharmacy owner.
