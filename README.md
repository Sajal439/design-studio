# Goel Traders Design Studio

A modern, high-performance web application for **Goel Traders**, a leading interior materials dealer. This platform allows homeowners to browse curated designs, get instant material cost estimates, and request professional quotes via WhatsApp.

## 🏗️ Project Architecture

This is a **monorepo** powered by [Turborepo](https://turbo.build/).

### Applications
- **`apps/web`**: The main Next.js 15 application (App Router). Handles the public gallery, material estimator, and the admin content management system.

### Packages
- **`@repo/database`**: Shared Prisma schema and client for PostgreSQL. Includes seeding scripts and design import utilities.
- **`@repo/eslint-config`**: Shared ESLint configurations.
- **`@repo/typescript-config`**: Shared TypeScript `tsconfig.json` files.

## 🚀 Tech Stack

- **Framework**: Next.js 15+ (React 19)
- **Styling**: Tailwind CSS 4.0
- **Database**: PostgreSQL with Prisma ORM
- **UI Components**: Shadcn UI (Radix UI)
- **Auth**: JWT-based session management (via `jose`)
- **Media**: Cloudinary for design image hosting
- **Validation**: Zod for API and form safety

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- Docker (for local PostgreSQL)

### Local Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup Environment Variables:**
   Copy `.env.example` to `.env` in the root and `apps/web/.env.local`. Ensure `DATABASE_URL` and `JWT_SECRET_KEY` are set.

3. **Start the database (Docker):**
   ```bash
   docker-compose up -d
   ```

4. **Initialize the database:**
   ```bash
   # Generate Prisma client
   npm run generate
   
   # Run migrations and seed data
   npm run db:migrate --workspace=@repo/database
   npm run db:seed --workspace=@repo/database
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

## 💎 Key Features

### 1. Material Estimator
A proprietary flat-rate engine (`apps/web/lib/estimator`) that calculates material, hardware, and labor costs based on:
- **Kitchens**: Separate running-feet inputs for lower and upper cabinets.
- **Furniture**: Sqft-based calculation for wardrobes, TV units, etc.
- **Tiers**: Budget, Standard, and Premium pricing based on material grades (Plywood, Laminate, Hardware).

### 2. Design Gallery
A searchable, filtered gallery of interior inspirations.
- Supports **Real Projects** (verified Goel Traders deliveries) and design concepts.
- Dynamic WhatsApp CTA generation for instant price inquiries.

### 3. Admin Dashboard (`/admin`)
Internal tool for managing the platform:
- **Design Manager**: Create/Edit/Delete designs with Cloudinary image uploads.
- **Price Book**: Manage the raw material rates used by the estimator.

## 📦 Deployment

The project is optimized for deployment on **Vercel**.
- Database: Managed PostgreSQL (Supabase/Neon/Vercel Postgres).
- Media: Cloudinary.
- CI/CD: Automated via GitHub Actions.

## 📜 License
Private - All Rights Reserved by Goel Traders.
