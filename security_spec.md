# Security Specification - MunchMate

## 1. Data Invariants
- An **Order** must have a valid `userId` matching the authenticated student.
- A **UserProfile** is strictly tied to the `uid` of the authenticated user.
- **MenuItem**s are read-only for students and only manageable by designated admins.
- **Booking**s must include a `sectionId` and `time` and be owned by the student.
- User **walletBalance** and **points** are immutable by the user and can only be updated by the system (simulated via admin actions or server functions if applicable, or restricted updates).

## 2. The Dirty Dozen Payloads

### P1: Identity Spoofing (Order)
Payload: `{ "userId": "attacker_id", "items": [...], "total": 100 }`
Target: `/orders/new_order`
Expected: `PERMISSION_DENIED` - `incoming().userId` must match `request.auth.uid`.

### P2: State Shortcutting (Order)
Payload: `{ "status": "delivered" }`
Target: `/orders/active_order`
Expected: `PERMISSION_DENIED` - Only admins can update status to "delivered".

### P3: Resource Poisoning (Order ID)
Target: `/orders/junk-character-string-1.5kb...`
Expected: `PERMISSION_DENIED` - `isValidId()` check on `orderId`.

### P4: Value Poisoning (Menu Price)
Payload: `{ "price": -100 }`
Target: `/menu/item_1`
Expected: `PERMISSION_DENIED` - `isValidMenuItem()` should check for `price > 0`.

### P5: Ghost Field Injection (User Profile)
Payload: `{ "isAdmin": true, "uid": "user_id", ... }`
Target: `/users/user_id`
Expected: `PERMISSION_DENIED` - Users cannot set their own `isAdmin` flag.

### P6: Orphaned Record (Order without User)
Payload: `{ "items": [...], "total": 100 }` (missing `userId`)
Target: `/orders/new_order`
Expected: `PERMISSION_DENIED` - `required` fields missing.

### P7: Temporal Spoofing (Order)
Payload: `{ "createdAt": "2000-01-01T00:00:00Z" }`
Target: `/orders/new_order`
Expected: `PERMISSION_DENIED` - `createdAt` must be `request.time`.

### P8: PII Blanket Read (Users)
OperationSource: `getDocs(collection(db, "users"))`
Expected: `PERMISSION_DENIED` - Blanket reads on users collection must be blocked.

### P9: Shadow Update (Booking)
Payload: `{ "guests": 1000, "extraField": "malicious" }`
Target: `/bookings/booking_1`
Expected: `PERMISSION_DENIED` - `affectedKeys().hasOnly()` check.

### P10: Terminal State Bypass (Order)
Operation: Update an order where `status == "delivered"`.
Expected: `PERMISSION_DENIED` - Delivered orders are immutable.

### P11: Self-Assigned Points (User)
Payload: `{ "points": 999999 }`
Target: `/users/user_id`
Expected: `PERMISSION_DENIED` - User profile updates for points/wallet must be restricted or blocked for users.

### P12: Large Payload Exhaustion
Payload: `{ "name": "A" * 1_000_000 }`
Target: `/menu/item_new`
Expected: `PERMISSION_DENIED` - String size limits on all fields.

## 3. Test Runner (Draft)
A `firestore.rules.test.ts` would be used to automate these checks using the Firebase Emulators.
