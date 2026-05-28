# Pharmacy Platform Database Plan

This document defines the initial database architecture and entity relationships for the pharmacy commerce platform.

The goal is to:
- support reliable commerce operations,
- protect inventory from overselling,
- keep the system scalable,
- simplify admin workflows,
- and prepare for future growth.

Recommended database:
- PostgreSQL

Recommended ORM:
- Prisma

---

# 1. Database Design Principles

## Core Principles
- Simple but scalable
- Transaction-safe inventory handling
- Clean entity relationships
- Audit-friendly where needed
- Future-ready architecture
- Fast product querying
- Reliable order processing

---

# 2. Core Entities Overview

Main entities:

1. Users (Admin/Staff)
2. Roles
3. Products
4. Product Images
5. Categories
6. Inventory
7. Orders
8. Order Items
9. Payments
10. Discounts
11. Delivery Information
12. Inventory Logs

---

# 3. Users Table

## Purpose
Stores admin/staff accounts.

Customers do NOT require accounts for V1.

## Fields

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| full_name | String | |
| email | String | Unique |
| password_hash | String | Secure hash |
| role_id | UUID | FK to roles |
| is_active | Boolean | |
| created_at | Timestamp | |
| updated_at | Timestamp | |

---

# 4. Roles Table

## Purpose
Defines admin/staff permissions.

## Example Roles
- Owner
- Staff
- Inventory Manager

## Fields

| Field | Type |
|---|---|
| id | UUID |
| name | String |
| created_at | Timestamp |

---

# 5. Categories Table

## Purpose
Organize products.

## Examples
- Skincare
- Makeup
- Supplements
- Hygiene

## Fields

| Field | Type |
|---|---|
| id | UUID |
| name | String |
| slug | String |
| description | Text |
| is_active | Boolean |
| created_at | Timestamp |

---

# 6. Products Table

## Purpose
Main product information.

## Fields

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| category_id | UUID | FK |
| name | String | |
| slug | String | SEO-friendly |
| short_description | Text | |
| description | Text | |
| brand | String | Optional |
| sku | String | Unique product code |
| price | Decimal | |
| discounted_price | Decimal | Nullable |
| stock_quantity | Integer | Critical field |
| low_stock_threshold | Integer | |
| is_active | Boolean | |
| created_at | Timestamp | |
| updated_at | Timestamp | |

---

# 7. Product Images Table

## Purpose
Support multiple product images.

## Fields

| Field | Type |
|---|---|
| id | UUID |
| product_id | UUID |
| image_url | String |
| alt_text | String |
| display_order | Integer |
| created_at | Timestamp |

---

# 8. Orders Table

## Purpose
Main customer order entity.

## Fields

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| order_number | String | Human-readable |
| customer_name | String | |
| customer_phone | String | |
| contact_method | Enum | Phone / WhatsApp / SMS |
| total_amount | Decimal | |
| payment_status | Enum | |
| order_status | Enum | |
| delivery_address | Text | |
| delivery_notes | Text | Nullable |
| created_at | Timestamp | |
| updated_at | Timestamp | |

---

# 9. Order Items Table

## Purpose
Stores products inside orders.

## Fields

| Field | Type |
|---|---|
| id | UUID |
| order_id | UUID |
| product_id | UUID |
| product_name_snapshot | String |
| quantity | Integer |
| unit_price | Decimal |
| total_price | Decimal |
| created_at | Timestamp |

## Important Note
Product snapshots preserve historical order accuracy even if products later change.

---

# 10. Payments Table

## Purpose
Track payment transactions.

## Fields

| Field | Type |
|---|---|
| id | UUID |
| order_id | UUID |
| payment_gateway | String |
| transaction_reference | String |
| amount | Decimal |
| payment_status | Enum |
| gateway_response | JSON |
| paid_at | Timestamp |
| created_at | Timestamp |

---

# 11. Discounts Table

## Purpose
Manage discounts and promotions.

## Fields

| Field | Type |
|---|---|
| id | UUID |
| product_id | UUID |
| discount_type | Enum |
| discount_value | Decimal |
| start_date | Timestamp |
| end_date | Timestamp |
| is_active | Boolean |
| created_at | Timestamp |

---

# 12. Inventory Logs Table

## Purpose
Track inventory changes.

Critical for debugging stock issues.

## Fields

| Field | Type |
|---|---|
| id | UUID |
| product_id | UUID |
| previous_quantity | Integer |
| new_quantity | Integer |
| change_reason | Enum |
| changed_by_user_id | UUID |
| related_order_id | UUID |
| created_at | Timestamp |

## Example Change Reasons
- Order confirmed
- Order cancelled
- Manual admin update
- Restock

---

# 13. Important Enums

## Order Status
- Pending
- Confirmed
- Preparing
- Sent
- Delivered
- Cancelled

## Payment Status
- Pending
- Paid
- Failed
- Refunded

## Contact Method
- Phone
- WhatsApp
- SMS

## Discount Type
- Percentage
- Fixed Amount

---

# 14. Critical Inventory Logic

This is the MOST important engineering area.

## Rules

### Stock Reduction
Stock should only decrease after:
- successful payment verification,
OR
- confirmed order process (depending on business rules)

### Overselling Prevention
System must:
- validate stock during checkout,
- validate stock again during order confirmation,
- use database transactions,
- prevent race conditions.

### Atomic Operations
Inventory updates must be atomic.

Example:
- 12 items exist
- 20 customers attempt checkout
- only first successful valid transactions succeed

---

# 15. Recommended Relationships

## One-to-Many
- Category → Products
- Product → Product Images
- Order → Order Items
- Product → Inventory Logs
- Role → Users

## Many-to-One
- Product → Category
- Order Item → Product
- Payment → Order

---

# 16. Indexing Strategy

Important indexes:

| Table | Fields |
|---|---|
| products | slug |
| products | category_id |
| products | is_active |
| orders | order_status |
| orders | payment_status |
| orders | created_at |
| payments | transaction_reference |

---

# 17. Future Database Expansion

Planned future entities:
- Customer accounts
- Wishlist
- Loyalty system
- SMS logs
- Notification system
- Multi-branch inventory
- Delivery agents
- Analytics tables
- Audit logs
- Product reviews

---

# 18. Suggested Prisma Structure

## Recommended Prisma Models
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

---

# 19. Recommended Backend Structure

Suggested architecture:

- Controllers
- Services
- Repositories
- Prisma ORM layer
- Validation layer
- Auth middleware
- Inventory transaction services

Critical logic:
- inventory service
- payment verification service
- order processing service

---

# 20. Database Priorities for V1

## Must Build First
1. Products
2. Categories
3. Orders
4. Order Items
5. Inventory logic
6. Admin users
7. Payments

## Build After
- Reports
- Analytics
- Inventory logs
- Advanced discounts

---

# 21. Final Notes

The inventory/order/payment relationship is the core of the platform.

If inventory logic fails:
- trust is destroyed,
- operations become chaotic,
- staff lose confidence in the system.

Therefore:
- stock operations must be transaction-safe,
- backend validation must be strict,
- and inventory handling should be treated as critical infrastructure.