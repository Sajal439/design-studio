# UI/UX Specifications: HomeCraft AI
**Client Workspace Flow and Admin CRM Interface**

---

## 1. Application Navigation Map

```
Public Site
 ├── / (Landing Page)
 ├── /designs (Inspiration Gallery - Existing)
 ├── /estimator (Simple Cost Calculator - Existing)
 └── /login & /register (User Auth)

Customer Portal (Protected)
 └── /dashboard (Projects list)
      └── /projects/[id] (Project Overview & Room Selection)
           └── /rooms/[id] (AI Workspace, Estimator, and Chat)

Admin CRM (Protected)
 └── /admin
      ├── /admin/dashboard (Metrics & Revenue pipeline)
      └── /admin/crm (Kanban Board & Lead Assignee manager)
```

---

## 2. Page Layout Mockups & Mock Schemas

### 2.1 Room Workspace Interface Layout (`/dashboard/projects/[id]/rooms/[id]`)
A three-column layout optimized for screen sizes larger than 1024px:

```
┌───────────────────────────┬───────────────────────────────────┬──────────────────┐
│ Left Panel: Rooms         │ Center Panel: AI Studio Workspace │ Right Panel: AI  │
├───────────────────────────┼───────────────────────────────────┤ Chat Helper      │
│ [Project Name]            │ [Tabs: Design AI | Material BOQ]  │                  │
│                           ├───────────────────────────────────┤                  │
│ • Kitchen [Active]        │ Image Drag-&-Drop Area            │ Chat log:        │
│ • Living Room [Complete]  │                                   │ User: Suggest a  │
│ • Bed Room [Empty]        │ Dropdowns: Style, Budget Tier,    │ gray laminate.   │
│                           │ Color Scheme                      │ AI: Suggested    │
│ [Add New Room button]     │                                   │ Advance Gray S-8 │
│                           │ [Generate Design button]          │                  │
│                           ├───────────────────────────────────┤                  │
│                           │ Render Result & Version Switcher  │ [Message input]  │
│                           │ [V1] [V2] [V3] [Mark Favorite]    │                  │
└───────────────────────────┴───────────────────────────────────┴──────────────────┘
```

---

## 3. Screen States

### A. AI Generation Loading State (FR-UI-STATE-LOADING)
- Disable the **Generate Design** button.
- Display a progress bar or text stating the pipeline phase:
  1. `[15%] Uploading original layout...`
  2. `[40%] Mapping room structural grid (Depth)...`
  3. `[75%] Generating photorealistic style layers...`
  4. `[95%] Running material mapping...`
- Highlight the room container with a pulsing shimmer effect.

### B. Compare Designs View (FR-UI-STATE-COMPARE)
- Multi-column view allowing side-by-side rendering of two chosen `DesignVersion` records.
- Overlay cost estimations for each design option directly on the image:
  - **Design V1 (Modern Matte):** Est. Cost ₹2,45,000 (Budget Tier)
  - **Design V2 (Luxury Acrylic):** Est. Cost ₹4,15,000 (Premium Tier)

---

## 4. Admin CRM Pipeline Kanban Interface (`/admin/crm`)
- Displays column boards grouped by: `New Leads`, `Contacted`, `Consultation Scheduled`, `Quotation Sent`, `Negotiation`, `Confirmed`, `Completed`.
- Project Cards display: Project Name, Customer Name, Phone, Budget, Rooms count, Assigned designer.
- Drag-and-drop cards between columns triggers an immediate API request (`PUT /api/admin/projects/{id}/status`) updating the pipeline state database.
- Column header shows the aggregate pipeline value of all projects in that stage.
