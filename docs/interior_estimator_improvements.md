# Interior Estimator Architecture Improvements

## For Goel Traders Design Studio

This document describes the **required improvements to the material
estimator engine** so it can produce **realistic, contractor-grade
estimates** for the following categories:

1.  Bedroom Interiors\
2.  Modular Kitchens\
3.  TV Panels\
4.  Study Tables\
5.  Office Furniture\
6.  Wardrobes

The goal is to move from a **material‑multiplier estimator** to a
**module‑driven estimation engine**, similar to systems used by
professional interior companies.

------------------------------------------------------------------------

# 1. Core Architectural Improvements

## 1.1 Move from Area-Based Estimation to Module-Based Estimation

Current system:

Room Dimensions → Area → Material Multipliers → Cost

Improved system:

User Input\
→ Layout Generator\
→ Cabinet/Module Generator\
→ Material Aggregator\
→ Hardware Rules Engine\
→ Waste & Sheet Optimization\
→ Cost Engine\
→ BOM Output

This increases estimate accuracy significantly.

------------------------------------------------------------------------

# 2. New System Components

## 2.1 Layout Engine

The layout engine converts room dimensions into **furniture modules**.

Example:

Room Width: 12 ft

Generated layout:

\[3 ft\]\[3 ft\]\[3 ft\]\[3 ft\]

Each module is processed independently.

Example output:

    layoutModules = [
     { width: 3, type: "DOUBLE_DOOR" },
     { width: 3, type: "DOUBLE_DOOR" },
     { width: 3, type: "DRAWER_SECTION" },
     { width: 3, type: "HANG_SECTION" }
    ]

------------------------------------------------------------------------

# 3. Module Library

Create a **module database** where each module contains material
requirements.

Example module:

DOUBLE_DOOR_WARDROBE

    Plywood: 1.6 sheets
    Laminate: 1.2 sheets
    Hinges: 4
    Handles: 2
    Edge Band: 20 ft

Example module:

DRAWER_MODULE

    Plywood: 1.2 sheets
    Laminate: 1 sheet
    Drawer Channels: 3
    Handles: 3
    Edge Band: 15 ft

Modules allow reusable estimation logic.

------------------------------------------------------------------------

# 4. Material Aggregator

After module generation, the estimator aggregates all material
requirements.

Example:

4 wardrobe modules

Total materials:

    Plywood: 6.4 sheets
    Laminate: 4.8 sheets
    Hinges: 16
    Handles: 8

Then apply:

• Waste factor\
• Rounding rules

------------------------------------------------------------------------

# 5. Hardware Rules Engine

Hardware depends on furniture type.

Example rules:

Sliding Wardrobe

    Sliding Track
    Rollers
    Soft Stopper
    Door Frames

Hinged Wardrobe

    Hinges
    Handles
    Magnetic Catch

Kitchen Drawer Unit

    Drawer Channels
    Handles
    Soft Close System

------------------------------------------------------------------------

# 6. Sheet Cutting Optimization

Instead of simply dividing total area by sheet size, simulate cutting
patterns.

Example:

Sheet size: 8 × 4

Panels needed:

6 × 2\
6 × 2\
3 × 2\
3 × 2

The system packs panels efficiently to reduce waste.

------------------------------------------------------------------------

# 7. Cost Engine

Cost components:

Material Cost\
Hardware Cost\
Labor Cost\
Transport\
Installation

Typical formula:

    Total Cost =
    Material Cost
    + Hardware Cost
    + Labor
    + Installation

------------------------------------------------------------------------

# 8. Profit Margin Layer

Support different views:

Customer Mode\
Contractor Mode\
Dealer Mode

Example:

Customer Price: ₹80,000\
Dealer Price: ₹65,000\
Margin: ₹15,000

------------------------------------------------------------------------

# 9. BOM Generator

Output should include a **full bill of materials**.

Example:

    BWR Plywood (8x4) – 7 sheets
    Laminate – 5 sheets
    Soft Close Hinges – 16
    Handles – 8
    Drawer Channels – 3
    Sliding Track – 1
    Rollers – 4
    Edge Band – 25 meters

------------------------------------------------------------------------

# 10. Category Specific Improvements

## 10.1 Bedroom Interiors

Modules required:

Bed Frame\
Side Tables\
Wardrobe Units\
Dresser Units\
Loft Cabinets

Estimator should calculate:

• plywood panels\
• laminate finish\
• drawer systems\
• wardrobe shutters

------------------------------------------------------------------------

## 10.2 Modular Kitchens

Kitchen estimation must use **running length instead of area**.

Modules:

Base Cabinet\
Wall Cabinet\
Tall Unit\
Corner Unit\
Sink Cabinet\
Drawer Unit

Hardware:

Drawer Channels\
Hinges\
Tandem Boxes\
Handles

------------------------------------------------------------------------

## 10.3 TV Panels

TV unit estimation must include:

Back Panel\
Floating Cabinets\
Drawer Units\
Open Shelves

Materials:

Plywood\
MDF Panels\
Laminate / Veneer\
LED Channels

------------------------------------------------------------------------

## 10.4 Study Tables

Modules:

Table Top\
Drawer Cabinet\
Keyboard Tray\
Cable Management Panel

Materials:

Plywood\
Laminate\
Drawer Channels\
Handles

------------------------------------------------------------------------

## 10.5 Office Furniture

Modules:

Workstations\
Storage Cabinets\
Meeting Tables\
Reception Desks

Additional requirements:

Cable management systems\
Metal frames\
Partition panels

------------------------------------------------------------------------

## 10.6 Wardrobes

Wardrobes must support:

Sliding Wardrobes\
Hinged Wardrobes\
Walk‑in Wardrobes

Modules:

Double Door Section\
Drawer Section\
Hanging Section\
Shelf Section

Hardware:

Sliding Tracks\
Rollers\
Soft Close Hinges\
Handles

------------------------------------------------------------------------

# 11. Required Database Structure

Materials Table

    materials
    id
    name
    unit
    price
    waste_factor
    category

Modules Table

    modules
    id
    name
    category
    material_requirements

Layout Rules Table

    layout_rules
    layout_type
    module_pattern
    category

------------------------------------------------------------------------

# 12. Final Estimation Pipeline

The improved estimator should follow this pipeline:

User Input\
→ Layout Generator\
→ Module Builder\
→ Material Aggregator\
→ Waste Calculation\
→ Hardware Rules Engine\
→ Sheet Optimization\
→ Cost Engine\
→ Profit Layer\
→ BOM Output

------------------------------------------------------------------------

# 13. Future Improvements

3D Furniture Planner\
AI Layout Suggestions\
Contractor Pricing Dashboard\
Material Purchase Planner\
Automatic Cutting Diagrams

------------------------------------------------------------------------

# Conclusion

By implementing this architecture, the Goel Traders estimator will:

• Produce realistic interior estimates\
• Generate accurate bills of materials\
• Help contractors plan purchases\
• Allow customers to preview costs instantly\
• Differentiate the platform from typical furniture store websites
