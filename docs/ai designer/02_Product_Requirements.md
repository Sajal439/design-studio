# Product Requirements: HomeCraft AI
**Functional & Non-Functional Specifications**

---

## 1. Functional Modules

### 1.1 Authentication & User Management (FR-AUTH)
- **FR-AUTH-1:** The platform must support two separate user directories: **Customers** (new directory) and **Admin/Staff** (existing `AdminUser` directory).
- **FR-AUTH-2:** Customers must be able to register and authenticate using:
  - Email and Password.
  - Google Social Auth (OAuth 2.0).
- **FR-AUTH-3:** Admin & Staff must use the existing session-based JWT authentication middleware.
- **FR-AUTH-4:** User profiles must store: Name, Email, Phone Number, Location (City/State), and Preferred language.

### 1.2 Customer Project Dashboard (FR-DASH)
- **FR-DASH-1:** Customers can create multiple home projects (e.g., "Rohan's New House", "Office Renovation").
- **FR-DASH-2:** Each project must capture:
  - Project Name (string, required)
  - House Type (Apartment, Builder Floor, Villa, Office, Shop, Custom)
  - Area in sqft (positive integer, required)
  - Total Budget (in INR, optional)
  - Customer contact details (Phone, Email, Location - default to profile)
- **FR-DASH-3:** Projects can be renamed, duplicated, archived, or deleted. Deletion must prompt for confirmation and cascade-delete all rooms/designs.

### 1.3 Room Workspace (FR-ROOM)
- **FR-ROOM-1:** Within a project, users can add multiple rooms. Room categories include:
  - Living Room, Kitchen, Master Bedroom, Kids Room, Wardrobe, TV Unit, Bathroom, Dining, Study, Balcony, Custom.
- **FR-ROOM-2:** For each room, the user can upload up to 5 original images (JPEG/PNG, max 10MB per file).
- **FR-ROOM-3:** A workspace must support:
  - Image uploader (integrated with Cloudinary/S3).
  - Version history panel (lists generated AI designs).
  - Notes/Comments section for customer-designer collaboration.
  - "Request Quote" CTA toggle.

### 1.4 AI Design Generation (FR-GEN)
- **FR-GEN-1:** The user selects an uploaded photo, selects a Room Category, Design Style (Modern, Minimalist, Traditional, Scandinavian, Industrial), Color Palette, and Budget Level.
- **FR-GEN-2:** The system triggers an asynchronous task to generate a photorealistic styled room while preserving the architectural boundaries (using ControlNet ML models).
- **FR-GEN-3:** The generation progress must be streamed in real-time via WebSockets or polled using a task status API.
- **FR-GEN-4:** Generated designs must be saved as new `DesignVersion` records linked to the room.

### 1.5 Material & Estimation Engine (FR-EST)
- **FR-EST-1:** For any generated or selected design, the user can input dimensions (running feet for kitchens, sqft for other furniture).
- **FR-EST-2:** The system calculates a detailed material bill of quantities (BOQ) using the current `PriceBookEntry` table:
  - Board materials: Plywood, HDHMR, MDF (sheets needed).
  - Laminates: Selected finish (sheets needed).
  - Hardware: Soft-close hinges, drawer runners, handles, profile channels.
  - Labor, freight, and tax estimates.
- **FR-EST-3:** Users can toggle between Budget, Medium, and Premium pricing options to see the live cost differences.

### 1.6 Admin CRM & Pipeline (FR-CRM)
- **FR-CRM-1:** Admin dashboard must show a Kanban board displaying all active customer projects.
- **FR-CRM-2:** Pipeline stages: `New Lead` -> `Contacted` -> `Consultation Scheduled` -> `Quotation Sent` -> `Negotiation` -> `Confirmed` -> `Installation` -> `Completed`.
- **FR-CRM-3:** Admins can assign interior designers, sales reps, and installers to specific projects.
- **FR-CRM-4:** Admins can view customer favorites, uploaded photos, AI designs, and downloaded quotes.

---

## 2. Non-Functional Requirements

### 2.1 Performance & Latency (NFR-PERF)
- **NFR-PERF-1:** AI Image Generation must complete in under **15 seconds** using GPU workers.
- **NFR-PERF-2:** Material estimation calculations must return in under **200ms**.
- **NFR-PERF-3:** Dashboard page loads must have a Largest Contentful Paint (LCP) under **1.8s** on a 4G connection.

### 2.2 Security & Compliance (NFR-SEC)
- **NFR-SEC-1:** All customer passwords must be hashed using bcrypt or Argon2id.
- **NFR-SEC-2:** JWT sessions must expire in 7 days, stored in HTTP-only, secure, same-site cookies.
- **NFR-SEC-3:** All uploaded images must be scanned for file-type signatures and sanitized to prevent RCE.

### 2.3 Scalability & Availability (NFR-SCALE)
- **NFR-SCALE-1:** The platform must support up to 5,000 concurrent user sessions and 100,000 monthly active users.
- **NFR-SCALE-2:** Database queries must be indexed on frequently queried keys (`userId`, `projectId`, `roomId`).
