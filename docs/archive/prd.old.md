# Product Requirement Document
## Goel Traders Design Studio Platform

---

# 1. Product Overview

The Goel Traders Design Studio Platform is a web-based platform that enables homeowners to explore interior design inspirations, estimate required materials, and request material quotes from Goel Traders.

The platform bridges the gap between design inspiration and material procurement by converting design selections into structured material lists.

---

# 2. Product Goals

Primary Goals:

1. Increase material sales for Goel Traders
2. Provide design inspiration for homeowners
3. Convert design browsing into material purchase leads
4. Build a digital ecosystem around interior projects

Secondary Goals:

1. Build brand authority for Goel Traders
2. Create a scalable interior platform
3. Prepare for future carpenter marketplace integration

---

# 3. Target Users

## Homeowners

Needs:

- interior design ideas
- project cost estimation
- material recommendations

Pain Points:

- don't know material requirements
- unclear cost estimates
- lack of reliable guidance

---

## Interior Designers

Needs:

- inspiration references
- quick material calculations
- vendor sourcing

---

## Contractors (Future Phase)

Needs:

- quick procurement
- reliable supplier
- project-based ordering

---

# 4. Core Features (Phase 1)

## 4.1 Design Inspiration Gallery

Users can browse curated interior design inspirations.

Categories:

- Modular Kitchens
- Wardrobes
- TV Units
- Bedroom Interiors
- Study Tables
- Office Cabinets

Each design contains:

- multiple images
- description
- material breakdown
- estimated project cost
- save design option

---

## 4.2 Design Detail Page

Each design page includes:

Images  
Design description  
Material breakdown  
Estimated cost  
Room size used  

CTA Buttons:

- Save Design
- Calculate Materials
- Request Quote

---

## 4.3 Material Estimator

Users can input room dimensions to estimate required materials.

Example Inputs:

- width
- height
- depth
- shelves
- doors

Outputs:

- plywood sheets
- laminate sheets
- hinges
- handles
- hardware

System calculates estimated material cost.

---

## 4.4 Project Builder

Users can create project boards.

Example:

My Home Project

Kitchen  
Wardrobe  
TV Unit  

Each project contains:

- selected designs
- material estimates
- cost estimates

---

## 4.5 Product Catalog

Displays materials available at Goel Traders.

Categories:

- plywood
- laminates
- hardware
- hinges
- channels
- handles

Each product includes:

- image
- specifications
- brand
- available sizes

Primary CTA:

Request Price

---

## 4.6 Quote Request System

Users can submit quote requests based on selected designs.

Request includes:

- design
- material list
- user details
- project location

Admin receives request and responds with price.

---

## 4.7 Consultation Booking

Users can request consultation.

Options:

- showroom visit
- video consultation
- site visit

Booking form captures:

- name
- phone
- project type
- location

---

# 5. Admin Panel

Admin capabilities include:

- manage design inspirations
- manage product catalog
- view quote requests
- manage consultations
- manage users

---

# 6. Data Models

## Users

Fields:

- id
- name
- email
- phone
- created_at

---

## Designs

Fields:

- id
- title
- category
- description
- estimated_cost
- images

---

## Design Materials

Fields:

- id
- design_id
- material_name
- quantity
- unit

---

## Projects

Fields:

- id
- user_id
- name
- created_at

---

## Quote Requests

Fields:

- id
- user_id
- design_id
- material_list
- status
- created_at

---

## Consultations

Fields:

- id
- name
- phone
- consultation_type
- project_type
- status

---

# 7. Technology Stack

Frontend:

Next.js  
Tailwind CSS  
ShadCN UI

Backend:

Node.js  
Express or NestJS

Database:

PostgreSQL

Infrastructure:

Vercel (frontend)  
AWS or DigitalOcean (backend)

Image Storage:

Cloudinary

---

# 8. Future Features (Phase 2)

- Carpenter marketplace
- Carpenter booking system
- Ratings and reviews
- Interior project management
- Payment integration
- Delivery tracking

---

# 9. Success Metrics

Key performance indicators:

- monthly active users
- quote requests generated
- consultation bookings
- material sales generated through platform

---

# 10. Risks

1. Lack of design content
2. Poor SEO visibility
3. low user engagement
4. difficulty maintaining product catalog

---

# 11. Launch Strategy

Step 1:

Upload 300+ design inspirations.

Step 2:

Add material breakdown for popular designs.

Step 3:

Launch with quote request functionality.

Step 4:

Promote through builders and carpenters.
