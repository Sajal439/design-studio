# Product Roadmap: HomeCraft AI
**12-Week Implementation & Delivery Schedule**

---

## 1. Timeline Overview

```
Week: 01 02 | 03 04 | 05 06 | 07 08 | 09 10 | 11 12
      Auth    Rooms   AI-Gen   Est.    CRM    Testing & Launch
```

---

## 2. Weekly Milestone Breakdown

### Weeks 1-2: Auth & Project Scaffolding (Phase 1)
- **Objective:** Establish customer registration and the multi-tenant project model.
- **Tasks:**
  - Create the `User` and `Project` tables in PostgreSQL.
  - Implement Customer login, token signing, and route guards.
  - Build the `/dashboard` UI listing existing project cards and project creation forms.
- **Milestone:** Users can register, log in, and create empty home projects.

### Weeks 3-4: Workspace & Asset Management (Phase 2)
- **Objective:** Enable room addition and original image uploads.
- **Tasks:**
  - Create the `Room` model in Prisma.
  - Integrate Next.js forms with Cloudinary file uploads.
  - Design the `/projects/[projectId]` layout showing rooms and photo feeds.
- **Milestone:** Customers can add individual room workspaces and upload physical photos.

### Weeks 5-6: AI Generation Pipeline (Phase 3)
- **Objective:** Deploy ControlNet and FLUX image models.
- **Tasks:**
  - Build the Python FastAPI service orchestrating image generation.
  - Integrate Depth-Anything-V2 preprocessor for structural preservation.
  - Configure Redis queue jobs for asynchronous execution.
  - Build the loading progress bar component in React.
- **Milestone:** Users can submit photos and view styled, photorealistic room designs.

### Weeks 7-8: Material Estimator Integration (Phase 4)
- **Objective:** Map visual designs to the Price Book inventory database.
- **Tasks:**
  - Create the `DesignVersion` model linking renders to material lists.
  - Extend the existing estimator to run calculations on generated designs.
  - Create visual RAG pipeline (Florence-2 tagging -> Qdrant search).
- **Milestone:** The system automatically calculates material cost estimates for generated designs.

### Weeks 9-10: Admin CRM & Quote Flow (Phase 5)
- **Objective:** Implement the sales team lead tracking board.
- **Tasks:**
  - Create the Kanban board UI at `/admin/crm`.
  - Implement project status updates on drag-and-drop actions.
  - Scaffold customer WhatsApp quote requests linked to preferred design versions.
- **Milestone:** Admins can view project statuses and assign staff.

### Weeks 11-12: Testing, Security & Vercel Launch (Phase 6)
- **Objective:** Verify load limits, audit code, and go live.
- **Tasks:**
  - Write Jest unit tests for the estimator and Playwright E2E tests for the auth flow.
  - Secure Cloudinary upload signatures and establish rate limiting.
  - Deploy Next.js to Vercel and PostgreSQL to Supabase.
- **Milestone:** Production-grade launch of HomeCraft AI for Goel Traders.
