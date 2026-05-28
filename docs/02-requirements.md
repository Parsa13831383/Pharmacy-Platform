# Pharmacy Platform Requirements

## 1. Project Overview
A premium Farsi RTL pharmacy commerce and operations platform for selling cosmetics, skincare, hygiene, supplements, and non-prescription products online with delivery.

The platform must support simple customer purchasing, reliable stock control, product management, order management, discounts, and an easy admin dashboard for the pharmacy owner and staff.

---

## 2. Confirmed Requirements

### Customer Platform
- Fully Farsi interface
- RTL layout
- Mobile-first design
- Product browsing
- Product search
- Category browsing
- Product detail pages
- Add to cart
- Simple checkout without mandatory customer authentication
- Customer can choose preferred contact method
- Customer can enter delivery details
- Customer can place online orders
- Customer can receive order confirmation

### Admin Platform
- Secure admin/staff login
- Owner and staff can access dashboard
- Add, edit, delete, activate/deactivate products
- Upload product photos
- Manage product prices
- Manage product stock
- Manage product discounts
- View orders
- Update order status
- Track low-stock products
- View sales/reporting summary

### Inventory Requirements
- Stock must be tracked accurately
- System must prevent overselling
- Stock should reduce only when an order is confirmed/paid
- Stock should be restored if an order is cancelled
- Admin should see low-stock products
- Stock changes should be logged where possible

### Order Requirements
- Customer can create an order from cart
- Order must include customer name, phone number, address, contact preference, products, quantity, total price, and delivery method
- Admin can view new orders
- Admin can update order status
- Order statuses:
  - Pending
  - Confirmed
  - Preparing
  - Sent
  - Delivered
  - Cancelled

### Payment Requirements
- Online payment support required
- Payment verification required
- Failed payment handling required
- Payment integration details to be confirmed later

### Delivery Requirements
- Delivery is required
- Delivery area and pricing rules to be confirmed
- Admin can update delivery/order status

### Design Requirements
- Minimal and premium visual style
- Fully Farsi and RTL
- Clean customer shopping experience
- Simple admin dashboard
- Easy product and order management
- Suitable for cosmetics/pharmacy brand positioning

---

## 3. Important Open Questions

These are waiting for client confirmation:

1. Main customer acquisition channel:
   - Instagram
   - Google
   - WhatsApp
   - Existing pharmacy customers
   - Other

2. Delivery scope:
   - Same city only
   - Province-wide
   - Iran-wide

3. Delivery pricing:
   - Fixed price
   - Based on area
   - Free above certain order value
   - Manual admin confirmation

4. Payment methods:
   - Online only
   - Online + payment on delivery
   - Card-to-card/manual confirmation

5. Expiry or batch tracking:
   - Required
   - Not required for V1
   - Later feature

6. Existing software integration:
   - Accounting system
   - Pharmacy inventory system
   - None

7. Price update frequency:
   - Rare
   - Weekly
   - Daily
   - Very frequent

8. Reporting depth:
   - Basic sales summary
   - Product performance
   - Staff/order activity
   - Profit estimation

9. Admin permissions:
   - Owner full access
   - Staff limited access
   - Different roles required

10. Visual direction:
   - Minimal luxury
   - Pharmacy clean/professional
   - Beauty/cosmetic premium
   - Persian e-commerce style

11. Initial product count

12. Future mobile app requirement

---

## 4. V1 Scope

### Must Have
- Farsi RTL customer storefront
- Product catalogue
- Product detail page
- Cart
- Guest checkout
- Customer contact preference
- Delivery information form
- Online order creation
- Admin login
- Product management
- Image upload
- Stock management
- Overselling prevention
- Discount support
- Order management
- Basic dashboard
- Basic sales reports
- Responsive mobile design

### Should Have
- Low-stock alerts
- Product search
- Category filtering
- Order status tracking
- Staff role permissions
- Payment verification logs
- Stock movement history

### Could Have
- Customer accounts
- Wishlist
- Loyalty system
- Advanced analytics
- SMS automation
- WhatsApp automation
- Mobile app
- Accounting integration

### Not V1
- Prescription medicine ordering
- Complex insurance workflows
- Multi-branch inventory
- AI recommendation system
- Marketplace/vendor system

---

## 5. User Roles

### Customer
- Browse products
- Add products to cart
- Checkout without account
- Choose contact method
- Submit delivery details
- Place order

### Staff
- View orders
- Update order status
- Check stock
- Manage basic product details if permitted

### Owner/Admin
- Full dashboard access
- Manage products
- Manage prices
- Manage discounts
- Manage stock
- Manage orders
- View reports
- Manage staff permissions

---

## 6. Core Business Rules

1. Customer checkout must be simple and fast.
2. Customer authentication must not be mandatory.
3. Product stock must be checked before order confirmation.
4. The platform must never sell more than available stock.
5. Admin product editing must be simple enough for non-technical users.
6. Product images must be easy to upload and replace.
7. The system must support discounts.
8. The admin dashboard must prioritize daily pharmacy operations.
9. The design must feel premium, minimal, and trustworthy.
10. The system should be built in a way that future mobile app support is possible.

---

## 7. Non-Functional Requirements

### Performance
- Fast product browsing
- Optimized product images
- Fast checkout
- Mobile-first speed

### Security
- Secure admin authentication
- Protected admin routes
- Input validation
- Payment verification
- Secure environment variables
- Role-based permissions where needed

### Reliability
- Transaction-safe stock updates
- Error handling for failed payments
- Backup-ready database structure
- Clear order state management

### Usability
- Simple Farsi interface
- RTL layout consistency
- Easy admin workflows
- Clear forms
- Minimal customer friction

### Maintainability
- Clean project structure
- Documented setup
- Modular backend services
- Reusable frontend components
- Clear database schema

---

## 8. Success Criteria

The project is successful if:

- Customers can easily buy products without creating an account.
- The owner can manage products, prices, images, stock, and orders without technical help.
- Stock is protected from overselling.
- The platform looks premium and trustworthy.
- Orders can be processed clearly by staff.
- The system supports future growth such as mobile app, SMS, reporting, and integrations.