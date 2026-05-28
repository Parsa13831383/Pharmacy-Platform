# Pharmacy Platform User Flows

This document defines the main user journeys and operational flows for the pharmacy commerce platform.

The purpose is to:
- understand how users interact with the system,
- reduce UX confusion,
- identify required pages/components,
- define backend logic requirements,
- and prevent missing workflows during development.

---

# 1. Customer Product Browsing Flow

## Goal
Allow customers to easily discover and explore products.

## Flow
1. Customer enters homepage
2. Customer sees:
   - featured products
   - categories
   - promotions/discounts
   - search bar
3. Customer browses categories
4. Customer opens product listing page
5. Customer filters or searches products
6. Customer opens product detail page
7. Customer reviews:
   - images
   - price
   - discount
   - stock availability
   - product description
8. Customer adds product to cart

## Important Notes
- Must be mobile-first
- Product cards should feel premium and clean
- RTL experience must feel natural
- Search and category browsing must be simple
- Product loading should feel fast

---

# 2. Customer Cart Flow

## Goal
Allow customers to manage products before checkout.

## Flow
1. Customer opens cart
2. Customer sees:
   - selected products
   - quantity
   - subtotal
   - discounts
   - final total
3. Customer updates quantity or removes products
4. System validates stock availability
5. Customer proceeds to checkout

## Important Notes
- Cart should update smoothly
- Stock validation should happen before checkout completion
- Prevent adding unavailable quantity

---

# 3. Guest Checkout Flow

## Goal
Allow customers to purchase quickly without mandatory authentication.

## Flow
1. Customer enters checkout page
2. Customer enters:
   - full name
   - phone number
   - delivery address
   - optional order notes
3. Customer selects preferred contact method:
   - phone call
   - WhatsApp
   - SMS
4. Customer selects delivery method
5. System calculates final order total
6. Customer selects payment method
7. Customer confirms order
8. Order is created in system
9. Customer receives confirmation

## Important Notes
- Checkout must be extremely simple
- Minimal friction
- Minimal number of fields
- Mobile-friendly forms
- Clear validation messages
- Prevent duplicate submissions

---

# 4. Payment Flow

## Goal
Safely process customer payments.

## Flow
1. Customer confirms checkout
2. System creates pending order
3. Customer redirected to payment gateway
4. Customer completes payment
5. Payment gateway returns verification result
6. System verifies transaction
7. If successful:
   - order becomes confirmed
   - stock decreases
8. If failed:
   - order remains failed/cancelled
   - stock remains unchanged

## Important Notes
- Payment verification must never rely only on frontend
- Backend verification required
- Transaction logging required
- Failed payment handling required

---

# 5. Inventory Protection Flow

## Goal
Prevent overselling products.

## Flow
1. Customer attempts purchase
2. Backend checks current stock
3. System verifies quantity availability
4. During order confirmation:
   - stock is locked/validated
5. If stock available:
   - order proceeds
   - stock decreases
6. If insufficient stock:
   - order blocked
   - customer informed

## Important Notes
- Critical business logic
- Must handle simultaneous purchases
- Database transactions required
- Prevent race conditions
- Inventory updates must be atomic

---

# 6. Order Management Flow

## Goal
Allow pharmacy staff to process orders clearly.

## Flow
1. Staff logs into admin dashboard
2. Staff opens orders page
3. Staff views:
   - new orders
   - customer information
   - ordered products
   - payment status
4. Staff updates order status:
   - Pending
   - Confirmed
   - Preparing
   - Sent
   - Delivered
   - Cancelled
5. Customer status communication happens externally or later through automation

## Important Notes
- Orders page must be simple and operational
- Staff should immediately identify new orders
- Status changes should be fast
- Mobile admin support useful

---

# 7. Product Management Flow

## Goal
Allow owner/staff to manage products easily.

## Flow
1. Admin logs into dashboard
2. Admin opens products page
3. Admin can:
   - create product
   - edit product
   - upload images
   - change stock
   - update price
   - apply discount
   - activate/deactivate product
4. Changes immediately reflect on storefront

## Important Notes
- Product management must feel simple
- Non-technical staff should understand interface
- Image upload must be easy
- RTL forms must remain clean

---

# 8. Discount Flow

## Goal
Allow promotional pricing and campaigns.

## Flow
1. Admin selects product(s)
2. Admin creates discount
3. System calculates:
   - original price
   - discounted price
4. Product displays discount badge
5. Cart calculates final discounted total

## Important Notes
- Discount visibility important for cosmetics sales
- UI should clearly show savings
- Prevent invalid discount calculations

---

# 9. Reporting Flow

## Goal
Allow owner to monitor business performance.

## Flow
1. Owner logs into dashboard
2. Owner opens reports page
3. Owner sees:
   - total orders
   - total revenue
   - low-stock products
   - best-selling products
   - recent orders
4. Owner uses data for operational decisions

## Important Notes
- Keep reporting clean and visual
- Avoid overwhelming complexity in V1
- Focus on actionable insights

---

# 10. Admin Authentication Flow

## Goal
Protect administrative operations.

## Flow
1. Admin enters login page
2. Admin enters credentials
3. Backend validates credentials
4. Secure session/token created
5. Admin accesses dashboard

## Important Notes
- Strong password hashing required
- Protected admin routes
- Role-based permissions possible
- Session expiration/security required

---

# 11. Error Handling Flow

## Goal
Handle failures gracefully.

## Cases
- Payment failure
- Product out of stock
- Network issues
- Invalid form input
- Expired admin session
- Image upload failure

## Requirements
- Clear user-friendly messages
- No technical errors exposed to users
- Retry where appropriate
- Preserve important form data

---

# 12. Future Expansion Flows

Potential future flows:
- Customer accounts
- Wishlist
- Loyalty system
- SMS automation
- WhatsApp automation
- Multi-branch inventory
- Mobile application
- Accounting integration
- AI product recommendations

These are not required for V1 but architecture should remain scalable enough to support them later.