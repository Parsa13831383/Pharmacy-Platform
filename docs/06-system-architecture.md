# System Architecture

## Stack
- Frontend: Next.js + Tailwind + shadcn/ui
- Backend: Node.js API
- Database: PostgreSQL
- ORM: Prisma
- Storage: Supabase Storage or Cloudflare R2
- Admin Auth: secure email/password login
- Customer Auth: not required for V1

## Main Applications
- Customer storefront
- Admin dashboard
- Backend API
- PostgreSQL database
- Image storage

## Core Architecture
Customer Website → Backend API → PostgreSQL  
Admin Dashboard → Backend API → PostgreSQL  
Backend API → Image Storage  
Backend API → Payment Gateway

## Key Principles
- Farsi RTL-first
- Mobile-first storefront
- Secure admin dashboard
- Transaction-safe stock handling
- Simple guest checkout
- Clean scalable backend
- Premium minimal UI

## Backend Layers
- Routes
- Controllers
- Services
- Repositories
- Prisma database layer
- Validation layer
- Auth middleware
- Error handling middleware

## Critical Services
- Product service
- Category service
- Inventory service
- Order service
- Payment service
- Discount service
- Admin auth service
- Image upload service

## Inventory Strategy
Inventory must be handled with database transactions.

During order confirmation:
1. Check current stock
2. Lock/update product stock atomically
3. Create order items
4. Update payment/order status
5. Write inventory log

The system must never rely only on frontend stock validation.

## Deployment Plan
- Frontend: Vercel
- Backend: Render/Railway
- Database: Supabase PostgreSQL/Railway PostgreSQL
- Image storage: Supabase Storage or Cloudflare R2

## Future Scalability
The architecture should allow:
- mobile app
- customer accounts
- SMS/WhatsApp automation
- loyalty system
- accounting integration
- multi-branch inventory