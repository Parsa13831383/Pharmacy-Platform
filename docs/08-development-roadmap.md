
**`docs/08-development-roadmap.md`**

```md
# Development Roadmap

## Phase 1 — Planning Foundation
Status: In Progress

Tasks:
- Product backlog
- Requirements
- User flows
- Database plan
- UI direction
- System architecture
- API structure
- Development roadmap

Goal:
Create a clear blueprint before coding.

---

## Phase 2 — Project Setup

Tasks:
- Create Git repository
- Set up backend project
- Set up frontend project
- Configure TypeScript
- Configure ESLint/Prettier
- Configure environment variables
- Set up PostgreSQL
- Set up Prisma
- Create first database migration

Output:
Clean working development environment.

---

## Phase 3 — Database Foundation

Tasks:
- Create Prisma schema
- Add models:
  - User
  - Role
  - Category
  - Product
  - ProductImage
  - Order
  - OrderItem
  - Payment
  - Discount
  - InventoryLog
- Seed owner admin account
- Seed basic categories/products

Output:
Database ready for backend development.

---

## Phase 4 — Admin Auth

Tasks:
- Admin login
- Password hashing
- JWT/session handling
- Protected admin routes
- Current user endpoint
- Role support foundation

Output:
Secure admin access.

---

## Phase 5 — Products & Categories

Tasks:
- Public category API
- Public product listing
- Product detail API
- Admin create product
- Admin edit product
- Admin deactivate product
- Product image upload
- Product search/filter

Output:
Product catalogue working.

---

## Phase 6 — Inventory System

Tasks:
- Stock quantity management
- Manual stock update
- Low-stock threshold
- Low-stock list
- Inventory logs
- Backend stock validation
- Transaction-safe stock update logic

Output:
Reliable stock control.

---

## Phase 7 — Orders & Checkout

Tasks:
- Guest checkout API
- Cart validation
- Order creation
- Order item snapshots
- Admin order list
- Order detail
- Order status update
- Cancel order flow
- Stock restoration on cancellation

Output:
End-to-end ordering flow.

---

## Phase 8 — Payments

Tasks:
- Payment gateway research
- Payment start endpoint
- Payment verification endpoint
- Failed payment handling
- Payment logs
- Order/payment status sync

Output:
Online payment-ready order system.

---

## Phase 9 — Customer Frontend

Tasks:
- RTL layout setup
- Homepage
- Product listing
- Product detail
- Cart
- Checkout
- Order confirmation
- Mobile responsiveness
- Premium UI polish

Output:
Customer storefront ready.

---

## Phase 10 — Admin Dashboard

Tasks:
- Admin login page
- Dashboard overview
- Product management UI
- Inventory management UI
- Order management UI
- Discount management UI
- Reports UI

Output:
Owner/staff dashboard ready.

---

## Phase 11 — Testing & Hardening

Tasks:
- API testing
- Checkout edge cases
- Inventory race-condition testing
- Payment failure testing
- Admin permission testing
- Mobile UI testing
- RTL review
- Performance review

Output:
Stable production candidate.

---

## Phase 12 — Deployment & Handover

Tasks:
- Production environment setup
- Deploy frontend
- Deploy backend
- Configure database
- Configure storage
- Configure domain
- Admin training
- Handover documentation
- Backup/maintenance plan

Output:
Live client-ready platform.

---

# Build Priority

The correct coding order:

1. Backend setup
2. Database setup
3. Admin auth
4. Products/categories
5. Inventory
6. Orders
7. Payments
8. Customer UI
9. Admin UI
10. Polish/deploy

Do not start with the homepage first.