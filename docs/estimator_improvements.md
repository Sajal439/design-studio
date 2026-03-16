# Goel Traders Design Studio

## Material Estimator — Improvement Specification

This document lists the **required improvements** for the Material Estimator feature used on the Goel Traders Design Studio website. The goal is to ensure the estimator is **accurate, realistic for carpentry work, and effective for generating customer leads**.

---

# 1. Estimation Accuracy Improvements

## 1.1 Material Scaling Rules

The current approach assumes all materials scale with **room area**, which is incorrect for furniture estimation.

Different materials scale differently.

### Required Scaling Types

| Scaling Type | Used For                   |
| ------------ | -------------------------- |
| AREA         | plywood panels, laminates  |
| WIDTH        | long cabinets, countertops |
| HEIGHT       | tall wardrobes             |
| LINEAR       | edge banding               |
| COUNT        | hinges, handles, channels  |

### Implementation

Each material must include a scaling rule.

```ts
type MaterialScaling = "AREA" | "WIDTH" | "HEIGHT" | "LINEAR" | "COUNT";
```

Example material definition:

```ts
{
 name: "BWR Plywood",
 baseQty: 32,
 unit: "sqft",
 scaling: "AREA"
}
```

Estimator logic should adjust quantity based on the scaling rule.

---

# 1.2 Waste Factor

Interior estimation always includes wastage.

### Standard Waste Percentages

| Material  | Waste  |
| --------- | ------ |
| Plywood   | 10–15% |
| Laminate  | 8–10%  |
| Edge band | 15%    |
| Hardware  | 0%     |

### Example

Base calculation:

```
Plywood = 40 sqft
```

After waste factor:

```
Plywood = 44 sqft
```

Formula:

```
finalQty = baseQty × (1 + wastePercentage)
```

---

# 1.3 Labor Cost

Material cost alone does not represent actual project cost.

Interior pricing normally includes:

```
Total Cost =
Material Cost
+ Labor
+ Installation
```

### Typical Cost Distribution (India)

| Component    | Percentage |
| ------------ | ---------- |
| Material     | 55–65%     |
| Labor        | 25–30%     |
| Installation | 5–10%      |

### Example

```
Material Cost = ₹40,000

Labor = ₹12,000
Installation = ₹3,200

Total Estimate = ₹55,200
```

---

# 1.4 Price Range Instead of Fixed Price

Material prices fluctuate frequently.

Instead of returning a single price:

```
₹52,430
```

Return a range:

```
₹48,000 – ₹56,000
```

Example calculation:

```
minCost = baseCost × 0.9
maxCost = baseCost × 1.15
```

---

# 1.5 Material Quality Options

Customers should be able to choose material grade.

### Example Options

| Option   | Materials           |
| -------- | ------------------- |
| Budget   | Commercial plywood  |
| Standard | BWR plywood         |
| Premium  | BWP plywood / HDHMR |

Estimator must adjust material price based on selected quality.

---

# 2. Estimator Input Improvements

## 2.1 Layout Selection

Material requirements vary based on furniture layout.

### Kitchen Layouts

- Straight
- L-Shape
- Parallel
- U-Shape

### Wardrobe Layouts

- Hinged
- Sliding
- Walk-in

Estimator must ask for **layout type** before performing calculations.

### Recommended Flow

```
Step 1 — Category
Step 2 — Layout
Step 3 — Dimensions
Step 4 — Estimate
```

---

## 2.2 Depth Input

Current system only asks for:

```
Width
Height
```

Furniture calculations also require **depth**.

### Example Defaults

| Furniture    | Typical Depth |
| ------------ | ------------- |
| Kitchen Base | 24 inches     |
| Kitchen Wall | 12 inches     |
| Wardrobe     | 22–24 inches  |

Depth input should be optional with default values.

---

# 3. Material Calculation Improvements

## 3.1 Sheet Conversion

Carpenters buy plywood in **sheets**, not square feet.

Standard sheet size:

```
8 ft × 4 ft = 32 sqft
```

Estimator should show both values.

### Example Output

```
Plywood: 48 sqft
Equivalent: 2 sheets
```

---

## 3.2 Hardware Breakdown

Hardware should be listed separately.

Example output:

```
Hinges: 12
Handles: 6
Channels: 4
Magnet catches: 4
```

This makes the estimator useful for **contractors and carpenters**.

---

# 4. Business & Sales Improvements

The estimator should function as a **lead generation tool**, not just a calculator.

---

## 4.1 Save Estimate Lead Form

After showing results, users should be prompted to save the estimate.

### Required Fields

```
Name
Phone Number
City
Project Type
```

This allows the business to follow up with potential customers.

---

## 4.2 Estimate PDF Generation

Users should be able to download a formatted estimate.

Example PDF content:

```
Goel Traders
Interior Estimate

Project Type: Kitchen
Room Size: 12 ft × 8 ft

Materials
---------
BWR Plywood: 48 sqft
Laminate: 52 sqft
Edge Band: 38 ft

Estimated Cost
₹48,000 – ₹55,000
```

This increases credibility and allows customers to share estimates.

---

## 4.3 Site Visit CTA

After estimate results:

```
Need an accurate quote?

[ Book Free Site Visit ]
[ Upload Room Layout ]
```

This converts estimator users into **real customers**.

---

# 5. Contractor Mode

Since Goel Traders works with contractors, the estimator should support a **Contractor Mode**.

### Mode Selection

```
Mode:
○ Homeowner
○ Contractor
```

Contractor mode should display:

```
Sheet counts
Material pieces
Hardware quantities
```

Example:

```
18mm Plywood Sheets: 7
Laminate Sheets: 9
Edge Band Roll: 1
Hinges: 12
Channels: 4
```

---

# 6. Database Improvements

Estimates should be stored for analytics and lead management.

### Example Table

```
estimates
---------
id
category
layout
width
height
depth
materials_json
cost_min
cost_max
user_phone
created_at
```

Benefits:

- Track popular designs
- Track demand trends
- Follow up leads

---

# 7. UI Improvements

## 7.1 Room Preview

When the user enters dimensions, show a simple preview.

Example:

```
┌─────────────┐
│             │
│   Kitchen   │
│             │
└─────────────┘

12 ft × 8 ft
```

This improves user engagement.

---

## 7.2 Result Table Improvements

Current table fields are insufficient.

### Required Columns

| Material | Quantity | Unit | Waste | Estimated Cost |

Example:

```
Plywood | 48 | sqft | 10% | ₹4,560
```

---

# 8. Architecture Improvements

## 8.1 Separate Pricing Module

Material prices should not be hardcoded in estimator logic.

Recommended structure:

```
lib/
  estimator/
     estimator.ts
     scaling.ts
     waste.ts
     pricing.ts
```

Example pricing module:

```ts
export const MATERIAL_PRICES = {
  BWR_PLYWOOD: 95,
  HDHMR: 140,
  LAMINATE: 65,
  EDGE_BAND: 8,
};
```

This allows future admin price updates.

---

## 8.2 Client-Side Calculation

Estimator calculations should run **entirely on the client** for instant feedback.

Flow:

```
Server → design templates
Client → scaling calculation
```

Avoid API calls for calculations.

---

# 9. Future Enhancements

These features can be added in later phases.

### AI Room Detection

User uploads room photo → AI suggests design → estimator calculates cost.

---

### 3D Room Planner

Users drag cabinets into a virtual room and see cost updates in real time.

---

### Saved Estimate Dashboard

Logged-in users can view and manage all their estimates.

---

# Final Summary

### Essential Improvements

- Material scaling rules
- Waste factor
- Labor cost calculation
- Price ranges
- Layout selection
- Depth input

### High Business Value Features

- Estimate PDF
- Lead capture form
- Site visit booking
- Contractor mode
- Sheet conversion

### Future Upgrades

- AI design suggestion
- 3D furniture planner
- Estimate history dashboard

---

Implementing these improvements will transform the estimator from a **simple calculator into a professional interior planning tool and a lead generation engine for Goel Traders.**
