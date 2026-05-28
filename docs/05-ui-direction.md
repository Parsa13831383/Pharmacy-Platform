# Pharmacy Platform UI Direction

This document defines the visual and user experience direction for the pharmacy platform.

The goal is to create a premium, minimal, Farsi RTL commerce experience that feels trustworthy, clean, modern, and easy to use for both customers and pharmacy staff.

---

# 1. Design Positioning

## Chosen Direction
Minimal premium pharmacy-commerce platform with a cosmetic/beauty influence.

## Brand Feeling
The platform should feel:

- Clean
- Premium
- Trustworthy
- Calm
- Modern
- Simple
- Elegant
- Professional
- Easy to use

## What We Are NOT Building
The platform should NOT feel:

- Crowded
- Cheap
- Old pharmacy website
- Overly medical/hospital-like
- Too colourful
- Too complex
- Template-based
- Heavy or slow

---

# 2. Visual Style

## Main Style
A minimal, premium, product-focused design.

The customer-facing side should feel closer to a high-quality cosmetics and skincare store than a traditional medical pharmacy website.

## Recommended Visual Language
- Large white space
- Soft neutral backgrounds
- Elegant product cards
- Clean typography
- Clear hierarchy
- Smooth rounded corners
- Subtle shadows
- High-quality product imagery
- Calm accent colors
- Clear call-to-action buttons

---

# 3. RTL and Farsi Requirements

## Language
- Entire customer interface must be in Farsi
- Admin interface should also be in Farsi
- Text direction must be RTL

## RTL Rules
- Navigation flows right-to-left
- Icons should respect RTL direction
- Forms should align properly to the right
- Tables should support RTL reading
- Buttons and input spacing must feel natural in Farsi
- Persian numbers may be used if preferred later

## Tone of Persian Copy
Copy should be:
- Simple
- Respectful
- Clear
- Short
- Trustworthy
- Friendly but professional

Avoid:
- Overly formal government-style wording
- Technical words for customers
- Long descriptions in checkout

---

# 4. Customer Storefront UI

## Homepage Sections
Recommended homepage structure:

1. Header/navigation
2. Hero section
3. Search bar
4. Featured categories
5. Popular products
6. Discounted products
7. Trust/service section
8. Footer

## Header
Should include:
- Logo
- Search
- Categories
- Cart icon
- Contact/support access

## Hero Section
Should be minimal and premium.

Possible direction:
- soft background
- short Farsi headline
- product/brand image
- main CTA button

Example message:
"محصولات مراقبتی و آرایشی منتخب، با ارسال سریع"

## Product Cards
Each product card should show:
- Product image
- Product name
- Price
- Discounted price if available
- Stock status if important
- Add to cart button

Product card style:
- clean white card
- rounded corners
- soft shadow
- good image spacing
- no visual clutter

## Product Detail Page
Should include:
- image gallery
- product title
- price
- discount
- description
- stock availability
- quantity selector
- add to cart button
- related products

## Cart UI
Cart should be:
- simple
- clean
- editable
- mobile-friendly

Cart should show:
- products
- quantity
- subtotal
- discount
- delivery cost if known
- final total
- checkout button

## Checkout UI
Checkout must be extremely simple.

Required fields:
- full name
- phone number
- delivery address
- preferred contact method
- delivery notes if needed
- payment method

Checkout style:
- one clear page
- minimal fields
- clear progress
- large readable buttons
- no mandatory account creation

---

# 5. Admin Dashboard UI

## Admin Design Goal
The admin dashboard must be simple enough for non-technical pharmacy staff.

It should prioritize daily operations over visual complexity.

## Admin Home Dashboard
Should show:
- today’s orders
- pending orders
- low-stock products
- today’s revenue
- quick actions

## Quick Actions
Examples:
- Add product
- View new orders
- Update stock
- Create discount

## Admin Navigation
Recommended sidebar items:
- داشبورد
- سفارش‌ها
- محصولات
- دسته‌بندی‌ها
- موجودی انبار
- تخفیف‌ها
- گزارش‌ها
- کاربران/کارکنان
- تنظیمات

## Admin Tables
Tables should be:
- readable
- searchable
- filterable
- not visually crowded
- mobile/tablet aware if possible

## Product Management UI
Product form should include:
- product name
- category
- price
- discount
- stock
- low-stock threshold
- image upload
- description
- active/inactive status

## Order Management UI
Order list should show:
- order number
- customer name
- phone
- total amount
- payment status
- order status
- date
- action button

Order detail should show:
- customer info
- address
- contact preference
- ordered products
- payment info
- status update control
- admin notes

---

# 6. Colour Direction

Final brand colors should be based on the pharmacy logo.

Until logo colors are available, use a neutral premium palette:

## Suggested Base
- White
- Off-white
- Soft grey
- Charcoal text
- Muted green or muted teal accent
- Soft beige/rose accent for cosmetics feeling

## Avoid
- Harsh green
- Bright red
- Too many colors
- Neon colors
- Dark heavy backgrounds for main shopping flow

---

# 7. Typography

## Requirements
- Must support Persian/Farsi beautifully
- Must be readable on mobile
- Must feel modern and premium

## Recommended Persian Fonts
- Vazirmatn
- IRANSansX
- Dana
- Estedad

For open-source and easy use, start with:
- Vazirmatn

## Typography Rules
- Large clear headings
- Comfortable line height
- Strong product names
- Clear prices
- Short paragraphs
- Avoid dense text blocks

---

# 8. Interaction Design

## Customer Interactions
Should feel:
- fast
- smooth
- predictable
- simple

Important interactions:
- add to cart
- quantity update
- search
- filter
- checkout form validation
- payment redirection
- order confirmation

## Admin Interactions
Should feel:
- direct
- obvious
- efficient

Important interactions:
- add/edit product
- upload image
- update stock
- change order status
- filter orders
- view low-stock products

---

# 9. Mobile-First Rules

Most customers will likely use mobile.

Therefore:
- mobile design comes first
- product cards must work well in small screens
- checkout fields must be easy to tap
- cart must be simple
- admin should still be usable on tablet/laptop
- customer pages must load quickly

---

# 10. Premium UX Rules

A premium platform is not about decoration.

It is about:
- clarity
- spacing
- confidence
- speed
- trust
- consistency

## Premium Rules
- Every screen should have one main purpose
- Avoid unnecessary text
- Use fewer but better visual elements
- Use consistent spacing
- Use high-quality product images
- Use smooth but subtle motion
- Use readable pricing
- Keep checkout short
- Make errors clear and calm
- Make admin actions obvious

---

# 11. Suggested Pages

## Customer Pages
- Homepage
- Product listing
- Product detail
- Cart
- Checkout
- Order confirmation
- Contact/support
- Search results

## Admin Pages
- Admin login
- Dashboard
- Products
- Add/edit product
- Categories
- Orders
- Order detail
- Inventory
- Discounts
- Reports
- Staff/users
- Settings

---

# 12. Webild Usage Plan

Use Webild for:
- premium customer homepage
- product listing design
- product card variations
- checkout UI
- admin dashboard visual structure
- responsive layout inspiration

Do NOT rely on Webild for:
- business logic
- database design
- inventory safety
- payment verification
- backend architecture

---

# 13. Claude Usage Plan

Use Claude for:
- refactoring large code files
- backend architecture review
- Prisma schema review
- API/service consistency
- inventory transaction logic
- payment flow logic
- debugging complex errors

Do NOT let Claude decide:
- product strategy
- final scope
- client communication
- visual identity
- business priorities

---

# 14. Design Quality Checklist

Before accepting any UI screen, check:

- Is it fully RTL?
- Is the Farsi text natural?
- Is the screen mobile-friendly?
- Is the main action obvious?
- Is spacing premium?
- Is the design too crowded?
- Does it feel trustworthy?
- Can a non-technical user understand it?
- Does it support the business goal of increasing sales?
- Is it fast enough?
- Does it match the logo/brand direction?

---

# 15. Final UI Direction Statement

The platform should feel like a premium, minimal Farsi shopping experience for pharmacy and beauty products, supported by a simple but powerful admin dashboard.

The customer side should increase trust and sales.

The admin side should reduce daily operational friction.