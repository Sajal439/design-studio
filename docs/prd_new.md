# Goel Traders Design Studio Platform

## Product Requirements Document (PRD)

---

# 1. Introduction

## 1.1 Purpose

This document defines the complete product requirements for the **Goel Traders Design Studio Platform**.

The platform aims to bridge the gap between **interior design inspiration and material procurement** by allowing users to:

* Discover interior design inspirations
* Estimate required materials
* Request quotes from Goel Traders
* Plan home interior projects digitally

The platform will eventually evolve into a **regional interior ecosystem** connecting homeowners, designers, and carpenters with Goel Traders as the primary materials supplier.

---

# 2. Product Vision

The long-term vision is to build a **digital interior design and material sourcing platform** that:

* Helps homeowners plan interior projects
* Converts design inspiration into material purchases
* Positions Goel Traders as the **primary supplier for interior materials**
* Builds a scalable ecosystem for future services

Examples of future ecosystem expansion:

* Carpenter marketplace
* Contractor procurement tools
* AI interior design assistance
* Delivery and logistics integration

---

# 3. Product Goals

## 3.1 Primary Goals

1. Increase material sales for Goel Traders.
2. Convert interior design inspiration into purchase leads.
3. Provide users with reliable material estimates.
4. Digitize the interior planning process.

## 3.2 Secondary Goals

1. Build brand authority for Goel Traders.
2. Improve customer engagement with the store.
3. Create a scalable platform that can expand to other services.

---

# 4. Target Users

## 4.1 Homeowners

### Needs

* Interior design inspiration
* Estimated project cost
* Material requirements
* Reliable suppliers

### Pain Points

* Lack of clarity on required materials
* Difficulty estimating project cost
* Lack of trusted local guidance

---

## 4.2 Interior Designers

### Needs

* Inspiration references
* Material sourcing
* Quick estimates

### Pain Points

* Time-consuming material estimation
* Vendor discovery

---

## 4.3 Contractors (Future Phase)

### Needs

* Bulk material procurement
* Fast ordering
* Project tracking

---

# 5. Product Scope

## Phase 1 (MVP)

Core functionality includes:

* Design inspiration gallery
* Design detail pages
* Material estimator
* Product catalog
* Quote request system
* Consultation booking
* Admin dashboard

---

## Phase 2

Additional features:

* User accounts
* Project builder
* Saved designs
* Advanced material calculators

---

## Phase 3

Platform expansion:

* Carpenter marketplace
* Booking system
* Ratings and reviews

---

# 6. Core Features

---

# 6.1 Design Inspiration Gallery

### Description

Users can browse curated interior designs for different rooms.

### Categories

* Modular Kitchens
* Wardrobes
* TV Units
* Bedroom Interiors
* Study Tables
* Office Furniture

### Functional Requirements

* Display image grid
* Category filtering
* Pagination
* SEO optimized design pages

### User Actions

Users can:

* View design
* Save design
* Estimate materials
* Request quote

---

# 6.2 Design Detail Page

Each design page contains detailed information about the design.

### Page Content

* Design title
* Multiple images
* Description
* Style type
* Estimated cost
* Material list

### Call To Actions

* Save Design
* Estimate Materials
* Request Quote

---

# 6.3 Material Estimator

### Purpose

Convert room dimensions into estimated material requirements.

### Input Fields

Example wardrobe estimator:

* width
* height
* depth
* number_of_doors
* number_of_shelves

### Output

Material estimation including:

* plywood sheets
* laminate sheets
* hinges
* handles
* drawer channels

### Example Logic

```
plywood_area = width × height
sheet_area = 32 sq ft

required_sheets = plywood_area / sheet_area
```

Hardware estimation:

```
hinges = doors × 3
handles = doors
```

---

# 6.4 Product Catalog

Displays products available at Goel Traders.

### Categories

* Plywood
* Laminates
* Hinges
* Handles
* Drawer Channels
* Kitchen Accessories

### Product Page Content

* Product name
* Brand
* Specifications
* Available sizes
* Product images

### CTA

Request Price

---

# 6.5 Quote Request System

Users can request quotes for materials.

### Flow

User selects design → estimator generates material list → user requests quote.

### Quote Request Includes

* design id
* material list
* user contact details
* project location

### Admin Workflow

Admin receives request → calculates price → sends response.

---

# 6.6 Consultation Booking

Users can schedule consultation sessions.

### Consultation Types

* Store Visit
* Video Consultation
* Site Visit

### Form Fields

* name
* phone
* project type
* location
* consultation preference

---

# 6.7 Project Builder (Phase 2)

Allows users to plan multiple interior projects.

Example:

```
My Home Renovation

Kitchen
Wardrobe
TV Unit
```

Each project stores:

* selected designs
* estimated materials
* cost estimation

---

# 7. System Architecture

---

## 7.1 High-Level Architecture

```
Client Layer
↓
Frontend Application
↓
API Layer
↓
Backend Services
↓
Database
```

---

## 7.2 Frontend Architecture

Framework:

Next.js

Advantages:

* Server-side rendering
* SEO optimization
* Fast performance

### Frontend Modules

```
Home
Design Gallery
Design Detail
Material Estimator
Product Catalog
Project Dashboard
Quote Request
Consultation Booking
Admin Panel
```

---

## 7.3 Backend Architecture

Architecture type:

Modular Monolith

Framework:

Node.js with Express or NestJS.

### Backend Services

```
Auth Service
Design Service
Product Service
Project Service
Quote Service
Consultation Service
Admin Service
```

---

# 8. Database Design

Database: PostgreSQL

---

## Users Table

```
users
-----
id
name
email
phone
password_hash
role
created_at
```

---

## Designs Table

```
designs
-------
id
title
category
description
estimated_cost
created_at
```

---

## Design Images

```
design_images
-------------
id
design_id
image_url
```

---

## Design Materials

```
design_materials
----------------
id
design_id
material_name
quantity
unit
```

---

## Products

```
products
--------
id
name
category
brand
description
image_url
```

---

## Projects

```
projects
--------
id
user_id
name
created_at
```

---

## Project Designs

```
project_designs
---------------
id
project_id
design_id
room_width
room_height
room_depth
```

---

## Quotes

```
quotes
------
id
user_id
project_id
material_list
status
created_at
```

---

## Consultations

```
consultations
-------------
id
name
phone
consultation_type
project_type
status
created_at
```

---

# 9. API Design

### Design APIs

```
GET /designs
GET /designs/:id
POST /designs
PUT /designs/:id
DELETE /designs/:id
```

### Product APIs

```
GET /products
GET /products/:id
POST /products
PUT /products/:id
```

### Project APIs

```
POST /projects
GET /projects/:userId
POST /projects/:id/design
DELETE /projects/:id/design
```

### Quote APIs

```
POST /quotes
GET /quotes
GET /quotes/:id
PATCH /quotes/:id/status
```

### Consultation APIs

```
POST /consultations
GET /consultations
PATCH /consultations/:id/status
```

---

# 10. Image Storage

Images will be stored using **Cloudinary**.

Benefits:

* CDN delivery
* Automatic optimization
* Image resizing
* Fast loading

---

# 11. Notification System

Admin notifications when:

* Quote request submitted
* Consultation requested

Technologies:

* Nodemailer
* WhatsApp Business API

---

# 12. Security Requirements

### Authentication

JWT authentication.

### Password Encryption

bcrypt hashing.

### API Protection

* rate limiting
* input validation

### Validation Libraries

* Zod
* Joi

---

# 13. Deployment Architecture

### Frontend

Vercel

### Backend

AWS EC2 or DigitalOcean

### Database

Managed PostgreSQL

### Storage

Cloudinary

---

# 14. SEO Strategy

Traffic will primarily come from search engines.

Example keywords:

* wardrobe design ideas
* modular kitchen designs
* modern tv unit designs

Each design page must include:

* SEO meta tags
* optimized images
* structured headings

---

# 15. Future Expansion

Future modules may include:

### Carpenter Marketplace

* carpenter profiles
* booking system
* reviews and ratings

### AI Interior Designer

Users upload room photo → AI suggests design.

### Logistics Module

Track delivery of materials.

---

# 16. Success Metrics

Key product metrics:

* monthly active users
* design page visits
* quote requests generated
* consultation bookings
* material sales generated through platform

---

# 17. Risks

Major risks include:

1. Lack of design content.
2. Low initial traffic.
3. Inaccurate material estimation.
4. Difficulty maintaining product data.

---

# 18. Launch Strategy

Step 1
Upload **300+ design inspirations**.

Step 2
Attach material breakdown to popular designs.

Step 3
Launch quote request feature.

Step 4
Promote through builders and carpenters.

Step 5
Optimize SEO for design pages.

---

# 19. Development Timeline

Phase 1 (6 weeks)

```
Design gallery
Product catalog
Quote system
Consultation booking
Admin dashboard
```

Phase 2 (8 weeks)

```
User accounts
Project builder
Material estimator
Saved designs
```

Phase 3

```
Carpenter marketplace
Booking system
Ratings and reviews
```

---

# 20. Conclusion

The Goel Traders Design Studio Platform will transform the traditional hardware retail model into a **design-driven digital ecosystem**.

By combining inspiration, planning tools, and material sourcing, the platform will:

* attract homeowners planning interior projects
* convert design discovery into material purchases
* establish Goel Traders as a central supplier in the regional interior market

The platform should prioritize **content quality, SEO visibility, and accurate material estimation** to ensure long-term success.
