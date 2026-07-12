# QA & Testing Plan: HomeCraft AI
**Testing Strategy, Automation Frameworks, and AI Evaluation Criteria**

---

## 1. Multi-Tier Testing Strategy

```
  ┌────────────────────────────────────────────────────────┐
  │                 End-to-End Tests                       │
  │            Playwright (Auth & Project Flow)            │
  ├────────────────────────────────────────────────────────┤
  │                 Integration Tests                      │
  │           Supertest (REST APIs & Route Guards)         │
  ├────────────────────────────────────────────────────────┤
  │                  Unit Tests                            │
  │            Jest (Estimator Engine calculations)        │
  └────────────────────────────────────────────────────────┘
```

---

## 2. Testing Framework Configuration

### 2.1 Unit Testing: Estimator Engine (`jest`)
Unit tests reside inside `apps/web/lib/estimator/__tests__/estimator.test.ts`. They validate price calculation functions under varying inputs:

```typescript
import { calculateKitchenEstimate } from "../kitchen-estimator";

describe("Modular Kitchen Estimator Calculations", () => {
  it("should calculate correct total cost for budget grade with soft-close hinges", () => {
    const dimensions = { runningFeetLower: 10, runningFeetUpper: 8 };
    const tier = "BUDGET";
    const result = calculateKitchenEstimate(dimensions, tier);
    
    // Expected = (10 * 3000) [lower rate] + (8 * 2500) [upper rate] + base hardware + markup
    expect(result.estimatedCost).toBeCloseTo(98400.0, 2);
    expect(result.materials.length).toBeGreaterThan(0);
  });
});
```

### 2.2 End-to-End Testing: Flow Automation (`Playwright`)
Automated UI interactions verify the complete renovation pipeline flow:

```typescript
import { test, expect } from "@playwright/test";

test("User can log in, create a project, and add a kitchen room", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[type="email"]', "rohan@example.com");
  await page.fill('input[type="password"]', "Password123!");
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL("/dashboard");
  await page.click("text=Create New Project");
  await page.fill('input[name="name"]', "Karnal Townhouse");
  await page.click("button:has-text('Save')");

  await page.click("text=Karnal Townhouse");
  await page.click("text=Add Room");
  await page.selectOption("select", "Kitchen");
  await page.click("button:has-text('Add')");

  await expect(page.locator("text=Semi-Modular Ground Kitchen")).toBeVisible();
});
```

---

## 3. AI Model Evaluation Strategy

Subjective image evaluation is prone to errors. We use automated mathematical metrics to audit generator outputs:

1.  **Structural Stability (Edge IoU):**
    *   **Method:** Run Canny edge extraction on both the original upload photo and the generated output render.
    *   **Metric:** Calculate the Intersection over Union (IoU) of the two edge masks.
    *   **Threshold:** If IoU falls below **0.65**, the structural boundaries have warped, and the render is flagged as a failure.
2.  **Prompt Alignment (CLIP Score):**
    *   **Method:** Compute cosine similarity between the text prompt embedding and the generated image embedding using `CLIP-ViT-B-32`.
    *   **Threshold:** A score below **0.28** triggers an automatic system warning to refine the LLM's system generation prompt template.
