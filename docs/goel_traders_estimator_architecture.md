# Goel Traders Interior Planning, Estimation, and Conversion Architecture

## Production-Grade Architecture Document

This document defines the **final-form target architecture** for the Goel Traders estimator platform.

The system is designed to do three things exceptionally well:

1. Produce **realistic, contractor-grade interior estimates**
2. Convert anonymous visitors into **qualified Goel Traders buyers**
3. Keep the platform **data-driven, maintainable, and extensible** so future changes are configuration-first instead of rewrite-first

This is not a simple calculator architecture.
It is a **commercial estimation and conversion engine**.

Supported categories:

- Bedroom Interiors
- Modular Kitchens
- TV Panels
- Study Tables
- Office Furniture
- Wardrobes

---

# 1. Business Objective

The estimator must not exist only to show a price.

It must function as:

- an estimation engine
- a material planning engine
- a lead qualification engine
- a Goel Traders product recommendation engine
- a conversion funnel that drives product sales and site visits

### Primary business outcomes

- Increase estimate-to-lead conversion
- Increase lead-to-site-visit conversion
- Increase estimate-to-cart conversion
- Increase product attachment rate per estimate
- Ensure customers buy **Goel Traders mapped products** instead of leaving with only a material list

### Product strategy

Every estimate must end in one or more of the following outcomes:

- saved lead
- site visit booking
- WhatsApp/contact handoff
- recommended Goel Traders product bundle
- quote request
- cart or inquiry built using Goel Traders SKUs

---

# 2. Architecture Principles

This architecture should be implemented with the same mindset a senior engineer would use for a core revenue system.

## 2.1 Data Driven, Not Hardcoded

Layouts, modules, materials, pricing books, conversion rules, and product mappings must live in data tables or admin-managed configs wherever possible.

Code should orchestrate.
Data should decide.

## 2.2 Separation of Concerns

The platform must separate:

- UI flow
- estimation logic
- pricing logic
- product mapping logic
- conversion logic
- persistence and analytics

This prevents one feature from breaking the entire system.

## 2.3 Configuration Before Rewrite

Most business changes should be solvable through:

- module template edits
- layout rule edits
- SKU mapping edits
- price book updates
- CTA experiments

not estimator rewrites.

## 2.4 Fast Feedback

The user should get estimate feedback immediately.
Core calculation must remain client-fast or edge-fast, with heavier persistence and recommendation enrichment done asynchronously where needed.

## 2.5 Conversion by Design

Conversion is not an add-on after the estimate.
Conversion logic must be part of the architecture from the beginning.

---

# 3. System Goals

## 3.1 Estimation Goals

- module-based estimation
- category-aware hardware logic
- finish-aware costing
- door-system-aware BOM generation
- practical sheet optimization
- customer-facing price range
- Goel Traders product mapping per BOM item

## 3.2 Commercial Goals

- capture buyer intent early
- personalize recommendations
- attach Goel Traders products to every estimate
- reduce user drop-off after estimate generation
- create strong trust signals
- push users toward consultation, quote, or purchase

## 3.3 Operational Goals

- track every estimate session
- track funnel drop-off at each step
- support admin updates without deployments
- support A/B testing of pricing display, CTAs, and product bundles

---

# 4. End-to-End User Journey

The architecture should support the following journey:

Visitor lands on estimator page  
→ selects category  
→ selects reference design  
→ enters layout, finish, door type, and dimensions  
→ sees instant room preview and price range  
→ receives module plan + BOM + Goel Traders product recommendations  
→ saves estimate  
→ books site visit or requests exact quote  
→ gets follow-up from Goel Traders team  
→ buys mapped Goel Traders materials or bundled products

This means the estimator is part of the **sales pipeline**, not just a utility page.

---

# 5. High-Level System Architecture

The system should be organized into the following layers:

## 5.1 Presentation Layer

Handles:

- estimator flow UI
- room preview
- BOM display
- product recommendation cards
- quote CTA
- save estimate flow
- conversion surfaces

## 5.2 Estimation Domain Layer

Handles:

- layout generation
- module generation
- material aggregation
- hardware rules
- cutting optimization
- cost calculation
- BOM generation

## 5.3 Commerce Mapping Layer

Handles:

- material-to-SKU mapping
- brand recommendation logic
- bundle generation
- alternatives and substitutes
- stock-aware filtering

## 5.4 Conversion Layer

Handles:

- lead scoring
- CTA selection
- personalized next step
- upsell recommendation
- remarketing event generation

## 5.5 Data Layer

Handles:

- estimates
- modules
- materials
- price books
- product catalog
- conversion events
- user sessions
- experiments

## 5.6 Admin and Analytics Layer

Handles:

- module template management
- pricing updates
- SKU mapping updates
- analytics dashboards
- estimate funnel tracking
- experiment management

---

# 6. Core Domain Pipeline

The estimation pipeline must be deterministic and explainable.

## Final Pipeline

User Design Selection  
→ Input Normalization  
→ Layout Generator  
→ Module Builder  
→ Material Aggregator  
→ Hardware Rules Engine  
→ Sheet Optimization  
→ Cost Engine  
→ BOM Generator  
→ Product Mapping Engine  
→ Conversion Decision Engine  
→ Customer Output + Lead Capture

---

# 7. Input Engine

## 7.1 Required Inputs

Every estimate session should support:

- category
- design reference
- width
- height
- depth
- layout type
- material grade
- finish type
- door type

## 7.2 Optional Inputs

These should be supported where relevant:

- room style preference
- budget range
- delivery city
- urgency
- existing site measurements available or not
- modular vs carpenter-finish preference

These optional fields help improve both recommendation quality and lead qualification.

## 7.3 Input Validation

Validation must happen at UI and domain level:

- unrealistic dimensions should be flagged
- invalid combinations should be normalized
- wardrobe sliding + open door mismatch should be blocked
- walk-in wardrobe should auto-switch to open access defaults
- island layout should only be valid for qualifying kitchen sizes

---

# 8. Design Selection Layer

Each design is not just a visual card.
It should behave as a structured planning template.

Every design should store:

- design id
- category
- title
- style tags
- recommended layouts
- allowed finish types
- allowed door types
- preferred module templates
- recommended product bundles
- conversion weight

This allows design selection to affect estimation and sales recommendations.

---

# 9. Layout Generator

The layout generator converts room dimensions into usable module spans.

## Example

Wardrobe width: 12 ft

Generated spans:

- 3 ft
- 3 ft
- 3 ft
- 3 ft

The output should be layout segments, not raw area.

## Responsibilities

- divide usable width into module spans
- detect corner logic
- apply category-specific running length rules
- reserve dead zones where needed
- support island logic for kitchens
- support open and closed storage mixes

## Output shape

```ts
layoutSegments = [
  { span: 3, zone: "LEFT", typeHint: "DRAWER" },
  { span: 3, zone: "CENTER", typeHint: "HANG" },
  { span: 3, zone: "CENTER", typeHint: "SHELF" },
  { span: 3, zone: "RIGHT", typeHint: "HANG" }
]
```

---

# 10. Module Library

The module library is the core abstraction that keeps the system maintainable.

Every module must define:

- module type
- category
- dimensional limits
- panel logic
- shutter logic
- internal shelf logic
- drawer logic
- hardware requirements
- accessory rules
- finish surface multipliers
- edge band rules
- Goel Traders product mapping group

## Example module definition

```ts
DOUBLE_DOOR_WARDROBE = {
  category: "wardrobe",
  widthRange: [2.5, 3.2],
  materials: {
    plywood: 1.6,
    finish: 1.2,
    edgeBand: 20
  },
  hardware: {
    hinges: 4,
    handles: 2,
    magneticCatch: 1
  },
  productMappingGroup: "WARDROBE_STANDARD"
}
```

## Rule

No estimation should directly compute furniture from scratch if a reusable module template can do it.

---

# 11. Material Aggregation Engine

After modules are generated, the system must aggregate materials across the project.

The aggregation engine must:

- combine material quantities by material type
- preserve source module references
- preserve category labels
- apply rounding rules
- apply waste factors
- generate purchase quantities

## Output must support both

- detailed BOM table
- compact BOM list for sales and messaging

---

# 12. Hardware Rules Engine

Hardware must never be inferred only from total area.

It must be generated using:

- category
- module type
- door type
- drawer count
- finish/grade rules

## Example rules

Sliding wardrobe:

- sliding tracks
- roller set
- soft stopper
- profile handle or handleless profile

Hinged wardrobe:

- hinges
- handles
- magnetic catch

Kitchen drawer unit:

- drawer channels
- tandem or telescopic system
- handles if not handleless

The rules engine should be table-driven so new hardware brands or options can be swapped without code rewrites.

---

# 13. Sheet Optimization Engine

The system must use a practical cutting optimization layer.

## Minimum acceptable approach

- split oversized panels
- sort by area
- greedily place into sheet buckets
- return sheet count, utilization, and panel count

## Better future-proof approach

Abstract the cutting engine behind an interface:

```ts
interface CuttingOptimizer {
  optimize(panels: PanelPiece[], sheet: SheetSpec): OptimizationResult
}
```

This allows replacing the simple optimizer later without changing the estimator contract.

---

# 14. Cost Engine

The cost engine must compute:

- material cost
- hardware cost
- labor cost
- installation cost
- transport cost
- fluctuation-adjusted customer range

## Important rule

Customer-facing output should primarily show:

- a clean estimate range
- a believable explanation
- a next step

Internally, the system may still compute deeper cost layers for admin and follow-up use.

---

# 15. BOM Generator

The BOM generator should produce three output levels:

## 15.1 Detailed BOM

For UI tables and internal review:

- material
- quantity
- unit
- waste
- unit cost
- estimated cost
- source modules

## 15.2 Purchase BOM

For operations and sales:

- purchase quantity
- purchase unit
- equivalent sheets
- mapped Goel Traders SKU

## 15.3 Compact Sales BOM

For WhatsApp, PDF, CRM, and quick lead follow-up:

- concise line items

Example:

- BWR Plywood - 7 sheets
- Laminate Finish - 5 sheets
- Soft Close Hinges - 16 nos
- Handles - 8 nos

---

# 16. Goel Traders Product Mapping Engine

This is the most important commercial addition.

The estimator must not stop at materials.
It must map BOM items to **Goel Traders products only**.

## 16.1 Mapping Rules

Each BOM item should map to:

- primary Goel Traders SKU
- acceptable Goel Traders alternatives
- product bundle group
- recommended quantity
- confidence score

## 16.2 Output Example

```ts
productRecommendations = [
  {
    material: "Plywood",
    sku: "GT-BWR-18MM-8X4",
    recommendedQty: 7,
    reason: "Matches wardrobe carcass requirement",
    fallbackSkus: ["GT-BWP-18MM-8X4"]
  }
]
```

## 16.3 Golden Rule

Never output a generic material list without also attaching Goel Traders purchasable products.

If a BOM item has no mapped Goel Traders product:

- flag internally
- do not expose competitor direction
- surface a quote CTA instead

This protects conversion leakage.

---

# 17. Conversion Engine

This layer determines the best next action after estimate generation.

## 17.1 Conversion Objectives

Drive users into:

- site visit booking
- product inquiry
- bundled purchase
- exact quote request
- assisted WhatsApp follow-up

## 17.2 Inputs to Conversion Logic

- category
- estimated price range
- user city
- urgency
- project complexity
- number of BOM line items
- whether save form is completed
- whether recommended products are high confidence

## 17.3 Output

A ranked CTA decision:

```ts
nextBestAction = {
  primary: "BOOK_SITE_VISIT",
  secondary: "REQUEST_QUOTE",
  tertiary: "GET_PRODUCT_BUNDLE"
}
```

## 17.4 Recommended Conversion Rules

High-value estimate:

- primary CTA: Book Free Site Visit

Medium-value estimate with strong SKU mapping:

- primary CTA: Get Recommended Product Bundle

Low-confidence SKU mapping:

- primary CTA: Request Assisted Quote

User saved estimate but did not convert:

- trigger WhatsApp or callback workflow

---

# 18. Conversion-Optimized UX Requirements

To maximize customer conversion, the UI must do more than show results.

## 18.1 Trust Builders

- realistic estimate range
- branded Goel Traders PDF
- category-specific explanation
- visible site visit offer
- clear mention of Goel Traders materials
- “recommended by our team” language where valid

## 18.2 Friction Reduction

- instant results
- no forced login before estimate
- save estimate with minimal fields
- sticky CTA on results page
- one-tap WhatsApp / call / quote follow-up

## 18.3 Product Lock-In

Every results screen must include:

- recommended Goel Traders materials
- bundled purchase suggestion
- CTA to request final supply list from Goel Traders

The user should feel that the fastest path from estimate to execution is through Goel Traders.

## 18.4 Recommended Results Page Structure

1. Price range hero
2. Project summary
3. Goel Traders recommended material bundle
4. BOM
5. Save estimate form
6. Site visit CTA
7. Quote CTA

---

# 19. Persistence Model

The system needs robust storage for estimation, analytics, and follow-up.

## 19.1 Core Tables

### designs

- id
- category_id
- title
- style_tags
- recommended_layouts_json
- allowed_finish_types_json
- allowed_door_types_json
- module_templates_json

### modules

- id
- name
- category
- width_min
- width_max
- height_min
- height_max
- depth_min
- depth_max
- materials_json
- hardware_json
- product_mapping_group
- active

### materials

- id
- name
- category
- unit
- base_price
- waste_factor
- active

### products

- id
- sku
- name
- category
- brand
- unit
- in_stock
- product_mapping_group
- price

### product_mappings

- id
- material_name
- module_type
- primary_sku
- fallback_skus_json
- confidence_score

### estimates

- id
- category_id
- design_id
- layout
- finish_type
- door_type
- width
- height
- depth
- materials_json
- bom_json
- product_recommendations_json
- cost_min
- cost_max
- customer_name
- customer_phone
- customer_city
- status
- created_at

### estimate_sessions

- id
- session_id
- user_id nullable
- step_reached
- category
- design_id nullable
- estimate_id nullable
- abandoned_at nullable
- converted_at nullable

### conversion_events

- id
- session_id
- estimate_id nullable
- event_type
- event_payload_json
- created_at

---

# 20. API and Service Boundaries

## 20.1 Estimation Contract

The estimate response should be a stable contract consumed by UI, PDF generation, CRM, and admin tools.

It should include:

- normalized input
- blueprint
- modules
- materials
- billOfMaterials
- sheetOptimization
- productRecommendations
- summary
- nextBestAction

## 20.2 Service Boundaries

Recommended service-level modules:

- `layout-service`
- `module-service`
- `material-service`
- `hardware-service`
- `cutting-service`
- `pricing-service`
- `product-mapping-service`
- `conversion-service`
- `estimate-persistence-service`

This keeps the domain organized and testable.

---

# 21. Performance Strategy

A senior-grade implementation must plan for speed from the start.

## 21.1 Fast Path

Keep estimate generation synchronous and lightweight:

- layout generation in memory
- module materialization in memory
- sheet optimization in memory
- cost generation in memory

## 21.2 Cached Data

Cache:

- active module templates
- price books
- material definitions
- product mappings

## 21.3 Async Work

Run asynchronously where appropriate:

- CRM sync
- analytics aggregation
- abandoned estimate follow-up
- PDF generation
- recommendation enrichment

---

# 22. Analytics and Experimentation

If conversion matters, analytics cannot be optional.

Track:

- visits to estimator
- category selected
- design selected
- step drop-off
- estimate generated
- save form submitted
- site visit booked
- quote requested
- product bundle clicked
- WhatsApp initiated
- follow-up success

## 22.1 KPIs

- estimate completion rate
- save estimate rate
- site visit booking rate
- quote request rate
- product recommendation click-through rate
- estimate-to-order conversion
- average order value from estimator leads

## 22.2 A/B Testing Targets

- CTA wording
- price range framing
- product bundle card design
- site visit placement
- save-form timing

---

# 23. Admin and Operations Requirements

The system should include internal tooling for:

- updating price books
- activating or deactivating modules
- editing material waste factors
- editing product mappings
- viewing estimate funnel analytics
- reviewing top-converting categories
- reviewing unmapped BOM items

This is how the system stays strong without repeated engineering intervention.

---

# 24. Reliability, Testing, and Governance

## 24.1 Test Types

- unit tests for layout rules
- unit tests for module generation
- unit tests for hardware rules
- unit tests for sheet optimization
- snapshot tests for BOM output
- integration tests for estimate generation
- integration tests for save estimate workflow

## 24.2 Safety Rules

- no estimate should fail silently
- every output should be traceable to modules and source logic
- every BOM item should either map to a Goel Traders product or raise an internal gap
- invalid layout/door combinations must be normalized before generation

## 24.3 Observability

Log:

- estimate generation errors
- module generation mismatches
- unmapped product recommendations
- abnormal cost spikes
- conversion failures

---

# 25. Security and Data Discipline

Because this system captures customer intent and contact data:

- validate and sanitize all lead inputs
- rate-limit save-estimate endpoints
- keep calculation endpoints abuse-resistant
- separate admin and customer roles
- protect price book editing
- avoid exposing internal-only pricing logic to public clients unless intentionally designed

---

# 26. Goel Traders Revenue Flywheel

This architecture should create the following loop:

More users use estimator  
→ more estimates saved  
→ more qualified leads captured  
→ more product recommendations shown  
→ more site visits and quotes  
→ more Goel Traders product sales  
→ more estimate data collected  
→ better recommendations and higher conversion

This is the business advantage of building the estimator as a commercial platform, not just a calculator.

---

# 27. Final Recommendation

The correct long-term direction is:

**Estimator + Product Mapping + Lead Conversion + Admin Control**

not:

**Estimator only**

If built this way, Goel Traders gets:

- accurate and scalable estimation
- better customer trust
- stronger lead qualification
- less leakage to competitors
- more product sales directly tied to estimator usage

---

# 28. Conclusion

No real production architecture is permanently “done forever,” because pricing, customer behavior, catalog shape, and business strategy always evolve.

But this architecture is designed so that future change happens through:

- module configuration
- pricing updates
- product mapping updates
- CTA experiments
- admin workflows

instead of expensive rewrites.

That is the correct senior-engineering outcome.

The estimator should become:

- the most useful planning tool on the site
- the highest-converting lead engine on the site
- and the strongest digital path to buying from Goel Traders specifically
