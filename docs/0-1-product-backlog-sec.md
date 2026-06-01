# Security Product Backlog

## Context

This platform uses:

- Guest checkout
- No customer accounts
- Payment before order creation
- Customer form with name, phone number, address, and delivery details
- Admin dashboard for orders, products, inventory, and categories

Main security focus:

1. Admin dashboard protection
2. Payment verification
3. Customer data protection
4. Order integrity
5. Inventory integrity
6. Backup and recovery

---

# P0 — Required Before Production

## Admin Authentication

- [ ] Create separate admin-only access area
- [ ] Require login for all admin pages
- [ ] Require MFA for Owner account
- [ ] Require MFA for Admin accounts
- [ ] Support authenticator app MFA
- [ ] Support passkeys for Owner account
- [ ] Use Argon2id for password hashing
- [ ] Secure password reset flow
- [ ] Rate-limit admin login attempts
- [ ] Lock admin account after repeated failed attempts
- [ ] Send alert on new admin login
- [ ] Send alert on login from new device
- [ ] Allow admin to log out from all devices

---

## Admin Sessions

- [ ] Use HttpOnly cookies
- [ ] Use Secure cookies
- [ ] Use SameSite=Lax or Strict
- [ ] Rotate session after login
- [ ] Rotate session after privilege change
- [ ] Expire admin session after inactivity
- [ ] Set maximum admin session lifetime
- [ ] Revoke sessions after password change
- [ ] Revoke sessions after MFA change

---

## Admin Authorization

- [ ] Implement RBAC
- [ ] Use deny-by-default permissions
- [ ] Enforce permissions on backend APIs
- [ ] Never trust frontend role checks
- [ ] Add Owner role
- [ ] Add Admin role
- [ ] Add Manager role
- [ ] Add Pharmacist role
- [ ] Add Staff role

### Permissions

- [ ] products.view
- [ ] products.create
- [ ] products.edit
- [ ] products.delete
- [ ] inventory.view
- [ ] inventory.adjust
- [ ] orders.view
- [ ] orders.update
- [ ] orders.refund
- [ ] customers.view
- [ ] customers.export
- [ ] users.invite
- [ ] users.disable
- [ ] settings.manage

---

## Payment Security

- [ ] Create payment session only on backend
- [ ] Never accept price from frontend
- [ ] Never accept total from frontend
- [ ] Calculate order total on server
- [ ] Fetch product prices from database
- [ ] Validate product availability before payment
- [ ] Verify payment provider webhook signature
- [ ] Create order only after verified successful payment
- [ ] Store payment provider transaction ID
- [ ] Prevent duplicate order creation from repeated webhooks
- [ ] Handle failed payments safely
- [ ] Handle cancelled payments safely
- [ ] Log all payment status changes

---

## Guest Checkout Security

- [ ] Validate name field
- [ ] Validate phone number
- [ ] Validate address
- [ ] Validate delivery instructions
- [ ] Limit text field length
- [ ] Sanitize user input
- [ ] Prevent HTML/script injection
- [ ] Rate-limit checkout attempts
- [ ] Rate-limit payment session creation
- [ ] Add bot protection on checkout if abuse appears

---

## Order Security

- [ ] Use UUIDs for order IDs
- [ ] Never expose sequential database IDs
- [ ] Protect order tracking links with secure random token
- [ ] Expire order tracking token after reasonable time
- [ ] Do not expose unnecessary customer information on tracking page
- [ ] Validate order status transitions
- [ ] Prevent unauthorized order edits
- [ ] Log all order status changes

### Valid Order Flow

- [ ] Pending Payment
- [ ] Paid
- [ ] Processing
- [ ] Out for Delivery
- [ ] Delivered
- [ ] Cancelled
- [ ] Refunded

---

## Inventory Security

- [ ] Validate quantity changes
- [ ] Prevent negative inventory
- [ ] Prevent unrealistic quantity orders
- [ ] Lock inventory during payment flow
- [ ] Release reserved inventory after failed payment
- [ ] Log all inventory adjustments
- [ ] Require admin permission for manual inventory edits

---

## Customer Data Protection

- [ ] Encrypt customer names at rest
- [ ] Encrypt phone numbers at rest
- [ ] Encrypt addresses at rest
- [ ] Encrypt delivery notes at rest
- [ ] Minimize customer data collection
- [ ] Do not store unnecessary personal data
- [ ] Restrict customer data access by role
- [ ] Require step-up authentication before customer data export
- [ ] Log every customer data view
- [ ] Log every customer data export

---

## Database Security

- [ ] Use parameterized queries
- [ ] Use ORM protections
- [ ] Prevent SQL injection
- [ ] Use least-privilege database user
- [ ] Separate production and development databases
- [ ] Disable public database access
- [ ] Encrypt database at rest
- [ ] Encrypt backups
- [ ] Rotate database credentials regularly

---

## API Security

- [ ] Validate every request on backend
- [ ] Validate every response where needed
- [ ] Rate-limit public APIs
- [ ] Rate-limit admin APIs
- [ ] Add CSRF protection for cookie-based admin sessions
- [ ] Add CORS allowlist
- [ ] Reject unexpected HTTP methods
- [ ] Add request size limits
- [ ] Add file upload restrictions if uploads exist

---

## Security Headers

- [ ] Enforce HTTPS
- [ ] Enable HSTS
- [ ] Add Content-Security-Policy
- [ ] Add X-Frame-Options
- [ ] Add X-Content-Type-Options
- [ ] Add Referrer-Policy
- [ ] Add Permissions-Policy

---

## Audit Logs

Log:

- [ ] Admin login
- [ ] Failed admin login
- [ ] New device login
- [ ] Password change
- [ ] MFA change
- [ ] Admin created
- [ ] Admin disabled
- [ ] Product created
- [ ] Product updated
- [ ] Product deleted
- [ ] Inventory adjusted
- [ ] Order status changed
- [ ] Refund created
- [ ] Customer data viewed
- [ ] Customer data exported
- [ ] Settings changed

Audit log fields:

- [ ] Actor
- [ ] Action
- [ ] Target
- [ ] Timestamp
- [ ] IP address
- [ ] Device/browser
- [ ] Result

---

## Backups

- [ ] Daily encrypted backups
- [ ] Weekly encrypted backups
- [ ] Monthly encrypted backups
- [ ] Test backup restore
- [ ] Restrict backup access
- [ ] Monitor backup failures

---

# P1 — Strong Security

## Step-Up Authentication

Require password/passkey/MFA again for:

- [ ] Creating admin users
- [ ] Disabling admin users
- [ ] Changing roles
- [ ] Exporting customer data
- [ ] Refunding payments
- [ ] Deleting products
- [ ] Large inventory adjustments
- [ ] Changing payment settings
- [ ] Changing delivery settings

---

## Admin Device Management

- [ ] Show active admin sessions
- [ ] Show trusted devices
- [ ] Allow device revocation
- [ ] Alert on new device login
- [ ] Alert on new country login
- [ ] Alert on unusual admin login time

---

## Payment Hardening

- [ ] Use idempotency keys for payment/session creation
- [ ] Use idempotency keys for webhook handling
- [ ] Compare paid amount with server-calculated amount
- [ ] Compare paid currency with expected currency
- [ ] Compare payment metadata with order draft
- [ ] Reject mismatched payment confirmations
- [ ] Create refund workflow with audit trail

---

## Public Checkout Abuse Protection

- [ ] Detect repeated failed payment attempts
- [ ] Detect excessive payment session creation
- [ ] Detect repeated orders to same address
- [ ] Detect repeated orders from same phone number
- [ ] Detect high-risk IP addresses
- [ ] Add CAPTCHA only when suspicious
- [ ] Block obvious bots

---

## Data Retention

- [ ] Define customer data retention period
- [ ] Delete unnecessary delivery data after retention period
- [ ] Anonymize old orders when possible
- [ ] Keep financial records as legally required
- [ ] Add admin tool for compliant deletion/anonymization

---

# P2 — Advanced Security

## Risk Engine

Calculate risk score using:

- [ ] IP reputation
- [ ] Device fingerprint
- [ ] Country/location
- [ ] Admin login history
- [ ] Failed login history
- [ ] Unusual behavior
- [ ] Sensitive action type

Risk-based actions:

- [ ] Require step-up authentication
- [ ] Temporarily block action
- [ ] Alert owner
- [ ] Lock admin account
- [ ] Require manual approval

---

## Behavioral Detection

Detect:

- [ ] Mass product deletion
- [ ] Mass inventory edits
- [ ] Large customer data export
- [ ] Many refunds in short time
- [ ] Unusual order cancellation rate
- [ ] Admin accessing many customer records
- [ ] Admin working from unusual location

---

## Order Fraud Detection

Detect:

- [ ] Repeated orders from same phone
- [ ] Repeated orders from same address
- [ ] High-value unusual orders
- [ ] Multiple failed payment attempts
- [ ] Suspicious refund patterns
- [ ] Disposable phone/email usage if email exists

---

## WAF & Edge Protection

- [ ] Deploy WAF
- [ ] Enable SQL injection rules
- [ ] Enable XSS rules
- [ ] Enable bot protection
- [ ] Enable DDoS protection
- [ ] Add country/IP blocking if needed

---

# P3 — Enterprise / High Security

## Hardware Security Keys

- [ ] Support FIDO2 hardware keys
- [ ] Require hardware key for Owner account
- [ ] Allow hardware key for Admin accounts
- [ ] Disable SMS MFA for privileged accounts

---

## Just-In-Time Privileges

- [ ] Temporary elevated access
- [ ] Approval required for sensitive permissions
- [ ] Auto-expire elevated permissions
- [ ] Log privilege activation
- [ ] Log privilege expiration

---

## Two-Person Approval

Require two approvals for:

- [ ] Ownership transfer
- [ ] Payment provider setting changes
- [ ] Large customer data exports
- [ ] Mass inventory deletion
- [ ] Mass product deletion
- [ ] Admin role changes
- [ ] Backup deletion

---

## Honeytokens

- [ ] Add fake customer record
- [ ] Add fake admin account
- [ ] Add fake API key
- [ ] Alert if honeytoken is accessed
- [ ] Alert if fake admin login is attempted

---

## Zero Trust Internal Services

- [ ] Authenticate internal service calls
- [ ] Authorize internal service actions
- [ ] Use separate service credentials
- [ ] Rotate service credentials
- [ ] Log service-to-service requests

---

# P4 — Security Operations

## Secure Development

- [ ] Pull request reviews
- [ ] Security review for sensitive changes
- [ ] No direct production deployments
- [ ] Separate staging environment
- [ ] Separate production secrets
- [ ] Least-privilege developer access

---

## Automated Security Testing

- [ ] Secret scanning
- [ ] Dependency scanning
- [ ] SAST scanning
- [ ] DAST scanning
- [ ] Container scanning
- [ ] Infrastructure scanning
- [ ] Fail deployment on critical findings

---

## Manual Security Testing

- [ ] Pre-launch penetration test
- [ ] Annual external penetration test
- [ ] Quarterly internal security review
- [ ] Payment flow security review
- [ ] Admin dashboard security review

---

## Incident Response

- [ ] Incident response plan
- [ ] Breach notification process
- [ ] Admin account compromise playbook
- [ ] Payment incident playbook
- [ ] Customer data exposure playbook
- [ ] Backup recovery playbook

---

# P5 — Resilience & Recovery

## Disaster Recovery

- [ ] Define RTO
- [ ] Define RPO
- [ ] Document restore process
- [ ] Test full restore quarterly
- [ ] Test database restore monthly

Recommended targets:

- [ ] RTO under 1 hour
- [ ] RPO under 15 minutes

---

## Backup Hardening

- [ ] Immutable backups
- [ ] Offsite backups
- [ ] Multi-region backups
- [ ] Backup integrity checks
- [ ] Backup access logging
- [ ] Backup deletion protection

---

# Release Gate

Do not launch if any of these are missing:

- [ ] Admin MFA
- [ ] Secure admin sessions
- [ ] Backend RBAC
- [ ] Payment webhook verification
- [ ] Server-side price calculation
- [ ] Customer data encryption
- [ ] HTTPS
- [ ] Audit logs
- [ ] Encrypted backups
- [ ] Restore test completed
- [ ] No critical vulnerabilities
- [ ] No secrets in code