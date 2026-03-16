import {
  SQFT_PER_SHEET,
  WASTE_FACTORS,
  getHardwareUnitCost,
  getSheetUnitCost,
} from "./pricing";
import {
  buildProductRecommendations,
  decideNextBestAction,
} from "./recommendations";
import type { PriceBook } from "./priceBook";
import type { LoadedTemplate } from "./templateLoader";
import type {
  CategorySlug,
  DesignBlueprint,
  DetailedMaterialResult,
  Dimensions,
  DoorType,
  EstimationResult,
  FinishType,
  GeneratedModule,
  LayoutType,
  MaterialCategory,
  MaterialGrade,
  MaterialRequirement,
  MaterialScaling,
  SheetOptimizationResult,
} from "./types";
import { ProductCatalog } from "./productCatalogLoader";
import { calculateModulePanels } from "./panelCalculations";

// ─── Internal types ────────────────────────────────────────────────────────────

type PanelMaterial = "PLYWOOD" | "SURFACE";

interface PanelPiece {
  material: PanelMaterial;
  width: number;
  height: number;
}

interface MaterialAccumulator {
  name: string;
  category: MaterialCategory;
  unit: string;
  quantity: number;
  sourceModules: Set<string>;
  notes?: string;
}

interface DesignSignals {
  complexityMultiplier: number;
  hasDrawers: boolean;
  hasMirror: boolean;
  hasLed: boolean;
  hasFabric: boolean;
  hasBaskets: boolean;
  hasCableManagement: boolean;
}

export interface GenerateEstimateInput {
  categoryId: string;
  categorySlug: CategorySlug;
  categoryLabel: string;
  designId: string;
  designTitle: string;
  layout: LayoutType;
  grade: MaterialGrade;
  finishType: FinishType;
  doorType: DoorType;
  dimensions: Dimensions;
  baseMaterialsList: MaterialRequirement[];
  // Injected from server — loaded once per request via React cache()
  priceBook: PriceBook;
  templateMap: Map<string, LoadedTemplate>;
  productCatalog: ProductCatalog;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FT_2_INCHES = 2 / 12;
const FT_18_INCHES = 18 / 12;
const FT_24_INCHES = 24 / 12;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function roundToTenths(value: number): number {
  return Number(value.toFixed(1));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function normalizeDimensions(dimensions: Dimensions): Dimensions {
  return {
    width: Math.max(1, dimensions.width),
    height: Math.max(1, dimensions.height),
    depth: Math.max(FT_18_INCHES, dimensions.depth || FT_18_INCHES),
  };
}

function analyzeDesignSignals(
  baseMaterialsList: MaterialRequirement[],
): DesignSignals {
  const names = baseMaterialsList.map((item) => item.name.toUpperCase());
  return {
    // Complexity multiplier is intentionally capped at 1.0 here.
    // It is NOT cascaded through individual module calculations any more —
    // it is applied once as a top-level summary adjustment in generateEstimate().
    complexityMultiplier: 1.0,
    hasDrawers: names.some((n) => n.includes("CHANNEL")),
    hasMirror: names.some((n) => n.includes("MIRROR")),
    hasLed: names.some((n) => n.includes("LED")),
    hasFabric: names.some((n) => n.includes("FABRIC")),
    hasBaskets: names.some((n) => n.includes("BASKET")),
    hasCableManagement: names.some(
      (n) => n.includes("GROMMET") || n.includes("CABLE"),
    ),
  };
}

function getFinishName(finishType: FinishType): string {
  if (finishType === "VENEER") return "Veneer Finish";
  if (finishType === "ACRYLIC") return "Acrylic Finish";
  return "Laminate Finish";
}

function createBlueprint(
  layout: LayoutType,
  finishType: FinishType,
  doorType: DoorType,
  modules: GeneratedModule[],
): DesignBlueprint {
  return {
    layoutRule: layout.replace(/_/g, " ").toLowerCase(),
    finishType,
    doorType,
    moduleTemplates: [...new Set(modules.map((m) => m.type))],
  };
}

function createModule(
  id: string,
  type: string,
  label: string,
  width: number,
  height: number,
  depth: number,
  notes?: string,
): GeneratedModule {
  return {
    id,
    type,
    label,
    quantity: 1,
    width: roundToTenths(width),
    height: roundToTenths(height),
    depth: roundToTenths(depth),
    notes,
  };
}

// ─── Module builders ──────────────────────────────────────────────────────────
// These functions generate *which* modules exist and their dimensions.
// They do NOT compute material quantities — that happens in materializeModule().

function buildKitchenModules(
  dimensions: Dimensions,
  layout: LayoutType,
  signals: DesignSignals,
): GeneratedModule[] {
  const modules: GeneratedModule[] = [];
  const baseHeight = 2.8;
  const wallHeight = 2.4;
  const tallHeight = Math.min(dimensions.height, 7.5);

  const runningLength =
    layout === "L_SHAPE"
      ? dimensions.width + dimensions.depth
      : layout === "U_SHAPE"
        ? dimensions.width + dimensions.depth * 2
        : layout === "PARALLEL"
          ? dimensions.width * 2
          : layout === "ISLAND"
            ? dimensions.width + 3
            : dimensions.width;

  const cabinetWidth = 2.5;
  const baseCabinetCount = Math.max(
    2,
    Math.floor(runningLength / cabinetWidth),
  );
  const drawerIndex = baseCabinetCount > 2 ? 1 : 0;

  for (let i = 0; i < baseCabinetCount; i++) {
    if (i === 0) {
      modules.push(
        createModule(
          `base-${i + 1}`,
          "SINK_CABINET",
          "Sink cabinet",
          cabinetWidth,
          baseHeight,
          FT_24_INCHES,
        ),
      );
      continue;
    }
    if (
      i === drawerIndex ||
      (signals.hasDrawers && i === baseCabinetCount - 1)
    ) {
      modules.push(
        createModule(
          `base-${i + 1}`,
          "DRAWER_UNIT",
          "Drawer unit",
          cabinetWidth,
          baseHeight,
          FT_24_INCHES,
        ),
      );
      continue;
    }
    modules.push(
      createModule(
        `base-${i + 1}`,
        "BASE_CABINET",
        "Base cabinet",
        cabinetWidth,
        baseHeight,
        FT_24_INCHES,
      ),
    );
  }

  const wallCabinetCount = Math.max(1, Math.ceil(baseCabinetCount * 0.7));
  for (let i = 0; i < wallCabinetCount; i++) {
    modules.push(
      createModule(
        `wall-${i + 1}`,
        "WALL_CABINET",
        "Wall cabinet",
        cabinetWidth,
        wallHeight,
        FT_18_INCHES,
      ),
    );
  }

  if (layout === "L_SHAPE" || layout === "U_SHAPE") {
    modules.push(
      createModule(
        "corner-1",
        "CORNER_UNIT",
        "Corner unit",
        3,
        baseHeight,
        FT_24_INCHES,
      ),
    );
  }
  if (runningLength >= 10) {
    modules.push(
      createModule(
        "tall-1",
        "TALL_UNIT",
        "Tall unit",
        2.5,
        tallHeight,
        FT_24_INCHES,
      ),
    );
  }
  if (layout === "ISLAND") {
    modules.push(
      createModule(
        "island-1",
        "ISLAND_UNIT",
        "Island prep unit",
        4.5,
        baseHeight,
        FT_24_INCHES,
      ),
    );
  }
  if (signals.hasBaskets) {
    modules.push(
      createModule(
        "basket-1",
        "ACCESSORY_UNIT",
        "Basket stack",
        2,
        baseHeight,
        FT_24_INCHES,
      ),
    );
  }

  return modules;
}

function buildWardrobeModules(
  dimensions: Dimensions,
  layout: LayoutType,
  signals: DesignSignals,
): GeneratedModule[] {
  const modules: GeneratedModule[] = [];
  const sectionCount = Math.max(2, Math.round(dimensions.width / 3));
  const sectionWidth = clamp(dimensions.width / sectionCount, 2.4, 3.2);
  const height = dimensions.height;
  const depth = FT_24_INCHES;

  for (let i = 0; i < sectionCount; i++) {
    if (layout === "SLIDING") {
      modules.push(
        createModule(
          `wardrobe-${i + 1}`,
          "SLIDING_SECTION",
          "Sliding wardrobe section",
          sectionWidth,
          height,
          depth,
        ),
      );
      continue;
    }
    if (layout === "WALK_IN") {
      const type = i % 2 === 0 ? "HANG_SECTION" : "SHELF_SECTION";
      const label = i % 2 === 0 ? "Hanging section" : "Shelf section";
      modules.push(
        createModule(
          `wardrobe-${i + 1}`,
          type,
          label,
          sectionWidth,
          height,
          depth,
        ),
      );
      continue;
    }
    if (i === 1 || (signals.hasDrawers && i === sectionCount - 1)) {
      modules.push(
        createModule(
          `wardrobe-${i + 1}`,
          "DRAWER_SECTION",
          "Drawer section",
          sectionWidth,
          height,
          depth,
        ),
      );
      continue;
    }
    const type = i % 2 === 0 ? "DOUBLE_DOOR_SECTION" : "HANG_SECTION";
    const label = i % 2 === 0 ? "Double door section" : "Hanging section";
    modules.push(
      createModule(
        `wardrobe-${i + 1}`,
        type,
        label,
        sectionWidth,
        height,
        depth,
      ),
    );
  }

  return modules;
}

function buildTvUnitModules(
  dimensions: Dimensions,
  signals: DesignSignals,
): GeneratedModule[] {
  const modules: GeneratedModule[] = [];
  const backPanelHeight = clamp(dimensions.height * 0.6, 4.5, 7);
  const baseWidth = clamp(
    dimensions.width / Math.max(2, Math.ceil(dimensions.width / 3.5)),
    2.5,
    3.5,
  );
  const baseCount = Math.max(2, Math.ceil(dimensions.width / baseWidth));

  modules.push(
    createModule(
      "tv-back-panel",
      "BACK_PANEL",
      "TV back panel",
      dimensions.width,
      backPanelHeight,
      FT_2_INCHES,
    ),
  );

  for (let i = 0; i < baseCount; i++) {
    const type = i % 2 === 0 ? "FLOATING_CABINET" : "DRAWER_CABINET";
    const label = i % 2 === 0 ? "Floating cabinet" : "Drawer cabinet";
    modules.push(
      createModule(
        `tv-base-${i + 1}`,
        type,
        label,
        baseWidth,
        1.8,
        FT_18_INCHES,
      ),
    );
  }

  modules.push(
    createModule(
      "tv-shelf-1",
      "OPEN_SHELF",
      "Display shelf",
      Math.min(4, dimensions.width),
      1,
      1,
    ),
  );

  if (signals.hasLed) {
    modules.push(
      createModule(
        "tv-led-1",
        "LED_PANEL",
        "LED feature panel",
        Math.min(6, dimensions.width),
        0.5,
        FT_2_INCHES,
      ),
    );
  }

  return modules;
}

function buildStudyModules(
  dimensions: Dimensions,
  signals: DesignSignals,
): GeneratedModule[] {
  const modules: GeneratedModule[] = [];

  modules.push(
    createModule(
      "study-top",
      "TABLE_TOP",
      "Table top",
      dimensions.width,
      FT_2_INCHES,
      dimensions.depth,
    ),
  );

  if (dimensions.width >= 4) {
    modules.push(
      createModule(
        "study-drawer",
        "DRAWER_CABINET",
        "Drawer cabinet",
        1.8,
        2.3,
        dimensions.depth,
      ),
    );
  }
  if (dimensions.height >= 5) {
    modules.push(
      createModule(
        "study-shelf",
        "BOOKSHELF",
        "Bookshelf",
        Math.min(3, dimensions.width),
        dimensions.height - 2.2,
        1,
      ),
    );
  }
  if (signals.hasCableManagement) {
    modules.push(
      createModule(
        "study-cable",
        "CABLE_PANEL",
        "Cable management panel",
        1.5,
        0.8,
        FT_2_INCHES,
      ),
    );
  }

  return modules;
}

function buildOfficeModules(
  dimensions: Dimensions,
  signals: DesignSignals,
): GeneratedModule[] {
  const modules: GeneratedModule[] = [];
  const workstationCount = Math.max(2, Math.ceil(dimensions.width / 4));

  for (let i = 0; i < workstationCount; i++) {
    modules.push(
      createModule(
        `ws-${i + 1}`,
        "WORKSTATION",
        "Workstation",
        4,
        2.5,
        FT_24_INCHES,
      ),
    );
  }

  modules.push(
    createModule(
      "office-storage",
      "STORAGE_CABINET",
      "Storage cabinet",
      3,
      Math.min(dimensions.height, 7),
      FT_18_INCHES,
    ),
  );

  if (dimensions.width >= 10) {
    modules.push(
      createModule(
        "meeting-table",
        "MEETING_TABLE",
        "Meeting table",
        6,
        FT_2_INCHES,
        3,
      ),
    );
  }
  if (signals.hasCableManagement) {
    modules.push(
      createModule(
        "office-cable",
        "CABLE_PANEL",
        "Cable trench",
        4,
        0.8,
        FT_2_INCHES,
      ),
    );
  }

  return modules;
}

function buildBedroomModules(
  dimensions: Dimensions,
  signals: DesignSignals,
): GeneratedModule[] {
  const modules: GeneratedModule[] = [];
  const bedWidth = clamp(dimensions.width * 0.45, 5, 6.5);

  modules.push(
    createModule("bed-frame", "BED_FRAME", "Bed frame", bedWidth, 1.5, 6.5),
  );
  modules.push(
    createModule("side-table-left", "SIDE_TABLE", "Side table", 1.5, 1.8, 1.5),
  );
  modules.push(
    createModule("side-table-right", "SIDE_TABLE", "Side table", 1.5, 1.8, 1.5),
  );
  modules.push(
    createModule("dresser", "DRESSER_UNIT", "Dresser unit", 3, 2.5, 1.5),
  );

  if (dimensions.height >= 9) {
    modules.push(
      createModule(
        "loft",
        "LOFT_CABINET",
        "Loft cabinet",
        Math.min(dimensions.width, 6),
        2,
        FT_24_INCHES,
      ),
    );
  }

  const wardrobeWidth = clamp(dimensions.width * 0.35, 5, 8);
  modules.push(
    ...buildWardrobeModules(
      { width: wardrobeWidth, height: dimensions.height, depth: FT_24_INCHES },
      "HINGED",
      signals,
    ),
  );

  if (signals.hasFabric) {
    modules.push(
      createModule(
        "headboard",
        "UPHOLSTERED_PANEL",
        "Upholstered headboard",
        bedWidth,
        3.5,
        FT_2_INCHES,
      ),
    );
  }

  return modules;
}

function generateModules(
  categorySlug: CategorySlug,
  layout: LayoutType,
  dimensions: Dimensions,
  signals: DesignSignals,
): GeneratedModule[] {
  if (categorySlug === "kitchen")
    return buildKitchenModules(dimensions, layout, signals);
  if (categorySlug === "wardrobe")
    return buildWardrobeModules(dimensions, layout, signals);
  if (categorySlug === "tv-unit")
    return buildTvUnitModules(dimensions, signals);
  if (categorySlug === "study") return buildStudyModules(dimensions, signals);
  if (categorySlug === "office") return buildOfficeModules(dimensions, signals);
  return buildBedroomModules(dimensions, signals);
}

// ─── Panel splitting ───────────────────────────────────────────────────────────

function splitPanel(width: number, height: number): PanelPiece[] {
  const longer = Math.max(width, height);
  const shorter = Math.min(width, height);

  if (longer <= 8 && shorter <= 4) {
    return [{ material: "PLYWOOD", width, height }];
  }
  if (longer > 8) {
    if (width >= height)
      return [...splitPanel(8, height), ...splitPanel(width - 8, height)];
    return [...splitPanel(width, 8), ...splitPanel(width, height - 8)];
  }
  if (shorter > 4) {
    if (width <= height)
      return [...splitPanel(4, height), ...splitPanel(width - 4, height)];
    return [...splitPanel(width, 4), ...splitPanel(width, height - 4)];
  }
  return [{ material: "PLYWOOD", width, height }];
}

function addPanelPieces(
  panels: PanelPiece[],
  material: PanelMaterial,
  width: number,
  height: number,
  count = 1,
): number {
  let totalArea = 0;
  for (let i = 0; i < count; i++) {
    const pieces = splitPanel(width, height);
    for (const piece of pieces) {
      totalArea += piece.width * piece.height;
      panels.push({ material, width: piece.width, height: piece.height });
    }
  }
  return totalArea;
}

// ─── Material accumulation ────────────────────────────────────────────────────

function addMaterial(
  acc: Map<string, MaterialAccumulator>,
  name: string,
  category: MaterialCategory,
  quantity: number,
  unit: string,
  sourceModule: string,
  notes?: string,
): void {
  if (quantity <= 0) return;

  const existing = acc.get(name);
  if (existing) {
    existing.quantity += quantity;
    existing.sourceModules.add(sourceModule);
    if (!existing.notes && notes) existing.notes = notes;
    return;
  }

  acc.set(name, {
    name,
    category,
    unit,
    quantity,
    sourceModules: new Set([sourceModule]),
    notes,
  });
}

// ─── materializeModule — DB-template driven ───────────────────────────────────
// Reads structural numbers (shelves, doors, drawers, multipliers) from the
// LoadedTemplate row. Panel-splitting math and hardware logic stay in code.

function resolveShutterMode(
  templateMode: string,
  globalDoorType: DoorType,
): "HINGED" | "SLIDING" | "OPEN" {
  if (templateMode === "SLIDING") return "SLIDING";
  if (templateMode === "OPEN") return "OPEN";
  if (globalDoorType === "OPEN") return "OPEN";
  return "HINGED";
}

function materializeModule(
  module: GeneratedModule,
  finishType: FinishType,
  doorType: DoorType,
  materials: Map<string, MaterialAccumulator>,
  panels: PanelPiece[],
  template: LoadedTemplate,
): void {
  const finishName = getFinishName(finishType);
  const label = module.label;

  // ── 1. Panel-based material quantities ─────────────────────────────────────

  const p = calculateModulePanels(
    module.type,
    module.width,
    module.height,
    module.depth,
    template,
  );

  // Carcass + shutters both use 18mm BWR — merge into one material line
  const totalMainPly = p.carcassSqft + p.shutterSqft;

  if (totalMainPly > 0) {
    // Keep panel-splitting optimisation for sheet count calculation —
    // the split is approximate (whole-module bounding box) but preserves
    // the optimisation logic intact.
    addPanelPieces(panels, "PLYWOOD", module.width, module.height, 1);
    addMaterial(
      materials,
      "Plywood 18mm BWR",
      "SHEET",
      totalMainPly,
      "sqft",
      label,
    );
  }

  if (p.backPanelSqft > 0) {
    // Back panels are a separate material — cheaper rate (9mm/HDF)
    // Tracked as SURFACE category so pricing.ts uses the surface rate
    addMaterial(
      materials,
      "Plywood 9mm / HDF back",
      "SURFACE",
      p.backPanelSqft,
      "sqft",
      label,
      "Back panel — 9mm ply or 6mm HDF",
    );
  }

  if (p.drawerBoxSqft > 0) {
    addMaterial(
      materials,
      "Plywood 12mm (drawer boxes)",
      "SHEET",
      p.drawerBoxSqft,
      "sqft",
      label,
    );
  }

  if (p.laminateSqft > 0) {
    addMaterial(
      materials,
      finishName,
      "SURFACE",
      p.laminateSqft,
      "sqft",
      label,
    );
  }

  if (p.edgeBandRft > 0) {
    addMaterial(materials, "Edge Band", "EDGE", p.edgeBandRft, "rft", label);
  }

  // ── 2. Door and drawer hardware ─────────────────────────────────────────────
  // Unchanged from the previous version — reads counts from the DB template.

  const effectiveShutterMode = resolveShutterMode(
    template.shutterMode,
    doorType,
  );

  if (effectiveShutterMode === "HINGED" && template.doors > 0) {
    addMaterial(
      materials,
      "Soft Close Hinges",
      "HARDWARE",
      template.doors * 3,
      "nos",
      label,
    );
    addMaterial(
      materials,
      "Magnetic Catch",
      "HARDWARE",
      Math.max(1, template.doors),
      "nos",
      label,
    );
    if (doorType !== "HANDLELESS") {
      addMaterial(
        materials,
        "Handles",
        "HARDWARE",
        template.doors,
        "nos",
        label,
      );
    }
  }

  if (effectiveShutterMode === "SLIDING" && template.doors > 0) {
    addMaterial(
      materials,
      "Sliding Track Set",
      "HARDWARE",
      Math.ceil(template.doors / 2),
      "set",
      label,
    );
    addMaterial(
      materials,
      "Sliding Roller Set",
      "HARDWARE",
      template.doors,
      "set",
      label,
    );
    addMaterial(
      materials,
      "Soft Stopper",
      "HARDWARE",
      Math.ceil(template.doors / 2),
      "set",
      label,
    );
    if (doorType !== "HANDLELESS") {
      addMaterial(
        materials,
        "Handles",
        "HARDWARE",
        template.doors,
        "nos",
        label,
        "Profile handles for sliding shutters",
      );
    }
  }

  if (template.drawers > 0) {
    addMaterial(
      materials,
      "Drawer Channels",
      "HARDWARE",
      template.drawers,
      "set",
      label,
    );
    if (doorType !== "HANDLELESS") {
      addMaterial(
        materials,
        "Handles",
        "HARDWARE",
        template.drawers,
        "nos",
        label,
      );
    }
  }

  // ── 3. Extra hardware and accessories from DB template JSON ─────────────────
  // Anything not in the door/drawer sets above

  const DOOR_HARDWARE_KEYS = new Set([
    "Soft Close Hinges",
    "Handles",
    "Drawer Channels",
    "Magnetic Catch",
    "Sliding Track Set",
    "Sliding Roller Set",
    "Soft Stopper",
  ]);

  for (const [name, qty] of Object.entries(
    template.hardware as Record<string, number>,
  )) {
    if (DOOR_HARDWARE_KEYS.has(name)) continue;
    addMaterial(materials, name, "HARDWARE", qty, "nos", label);
  }

  for (const [name, qty] of Object.entries(
    template.accessories as Record<string, number>,
  )) {
    addMaterial(materials, name, "ACCESSORY", qty, "nos", label);
  }
}

// ─── Reference material extras ────────────────────────────────────────────────
// A small uplift sourced from the reference design's material list.
// Kept as a named line item so it's visible in the BOM — no silent inflation.

function addReferenceMaterialExtras(
  baseMaterialsList: MaterialRequirement[],
  dimensions: Dimensions,
  materials: Map<string, MaterialAccumulator>,
): void {
  const referenceArea = Math.max(
    40,
    dimensions.width * Math.max(dimensions.depth, FT_18_INCHES),
  );

  for (const item of baseMaterialsList) {
    const normalizedScaling = inferScaling(item.name, item.scaling);
    const scale =
      normalizedScaling === "AREA"
        ? referenceArea / 100
        : normalizedScaling === "WIDTH"
          ? dimensions.width / 10
          : normalizedScaling === "HEIGHT"
            ? dimensions.height / 8
            : normalizedScaling === "LINEAR"
              ? (dimensions.width + dimensions.depth) / 12
              : Math.max(1, dimensions.width / 4);

    // 10% uplift (was previously 20% — reduced to a visible, named adjustment)
    const quantity = item.baseQty * scale * 0.1;
    const resolved = resolveReferenceMaterial(item.name);
    addMaterial(
      materials,
      resolved.name,
      resolved.category,
      quantity,
      resolved.unit,
      "Design reference uplift",
      "Adjustment from reference design",
    );
  }
}

function inferScaling(
  name: string,
  fallback: MaterialScaling,
): MaterialScaling {
  const upper = name.toUpperCase();
  if (
    upper.includes("HINGE") ||
    upper.includes("HANDLE") ||
    upper.includes("CHANNEL")
  )
    return "COUNT";
  if (upper.includes("EDGE")) return "LINEAR";
  if (upper.includes("WARDROBE") || upper.includes("TALL")) return "HEIGHT";
  if (upper.includes("COUNTER") || upper.includes("CABINET")) return "WIDTH";
  return fallback;
}

function resolveReferenceMaterial(name: string): {
  name: string;
  category: MaterialCategory;
  unit: string;
} {
  const upper = name.toUpperCase();
  if (
    upper.includes("PLYWOOD") ||
    upper.includes("MDF") ||
    upper.includes("HDHMR")
  ) {
    return {
      name: upper.includes("MDF") ? "MDF Panel" : "Plywood",
      category: "SHEET",
      unit: "sqft",
    };
  }
  if (
    upper.includes("LAMINATE") ||
    upper.includes("VENEER") ||
    upper.includes("ACRYLIC")
  ) {
    const n = upper.includes("VENEER")
      ? "Veneer Finish"
      : upper.includes("ACRYLIC")
        ? "Acrylic Finish"
        : "Laminate Finish";
    return { name: n, category: "SURFACE", unit: "sqft" };
  }
  if (upper.includes("EDGE"))
    return { name: "Edge Band", category: "EDGE", unit: "rft" };
  if (upper.includes("HINGE"))
    return { name: "Soft Close Hinges", category: "HARDWARE", unit: "nos" };
  if (upper.includes("HANDLE"))
    return { name: "Handles", category: "HARDWARE", unit: "nos" };
  if (upper.includes("CHANNEL"))
    return { name: "Drawer Channels", category: "HARDWARE", unit: "set" };
  if (upper.includes("LED"))
    return { name: "LED Channel", category: "ACCESSORY", unit: "nos" };
  if (upper.includes("MIRROR"))
    return { name: "Mirror", category: "ACCESSORY", unit: "nos" };
  if (upper.includes("FABRIC"))
    return { name: "Fabric Upholstery", category: "ACCESSORY", unit: "sqft" };
  return { name, category: "ACCESSORY", unit: "nos" };
}

// ─── Sheet optimisation ───────────────────────────────────────────────────────

function optimizeSheets(
  materialName: string,
  panels: PanelPiece[],
  sheetWaste: number,
): SheetOptimizationResult | null {
  if (panels.length === 0) return null;

  const sorted = [...panels].sort(
    (a, b) => b.width * b.height - a.width * a.height,
  );
  const effectiveSheetArea = SQFT_PER_SHEET * (1 - sheetWaste);
  const sheets: number[] = [];
  let totalArea = 0;

  for (const panel of sorted) {
    const area = panel.width * panel.height;
    totalArea += area;

    const idx = sheets.findIndex((rem) => rem >= area);
    if (idx >= 0) {
      sheets[idx] = (sheets[idx] ?? 0) - area;
    } else {
      sheets.push(Math.max(0, effectiveSheetArea - area));
    }
  }

  const sheetCount = Math.max(1, sheets.length);
  return {
    materialName,
    sheetCount,
    panelCount: panels.length,
    totalArea: roundToTenths(totalArea),
    utilization: Number(
      ((totalArea / (sheetCount * SQFT_PER_SHEET)) * 100).toFixed(1),
    ),
  };
}

// ─── Detailed material builder ────────────────────────────────────────────────

function buildDetailedMaterials(
  materials: Map<string, MaterialAccumulator>,
  grade: MaterialGrade,
  sheetOptimization: SheetOptimizationResult[],
  priceBook: PriceBook,
): DetailedMaterialResult[] {
  const sheetMap = new Map(sheetOptimization.map((s) => [s.materialName, s]));

  return [...materials.values()]
    .map((item) => {
      const waste = WASTE_FACTORS[item.category];
      const finalQuantity = item.quantity * (1 + waste);
      const optimization = sheetMap.get(item.name);

      const areaDrivenSheetCount =
        item.category === "SHEET" || item.category === "SURFACE"
          ? Math.ceil(finalQuantity / SQFT_PER_SHEET)
          : null;

      const equivalentSheets =
        areaDrivenSheetCount === null
          ? null
          : Math.max(optimization?.sheetCount ?? 0, areaDrivenSheetCount);

      const purchaseQuantity =
        equivalentSheets ??
        (item.unit === "lot"
          ? Math.max(1, Math.round(finalQuantity))
          : Math.ceil(finalQuantity));

      // Prices now come from the PriceBook — not hardcoded constants
      let unitCost = 0;
      if (item.category === "SHEET") {
        unitCost = getSheetUnitCost(grade, "PLYWOOD", priceBook);
      } else if (item.category === "SURFACE") {
        unitCost = getSheetUnitCost(grade, "SURFACE", priceBook);
      } else {
        unitCost = getHardwareUnitCost(item.name, grade, priceBook);
      }

      const estimatedCost =
        equivalentSheets !== null
          ? equivalentSheets * SQFT_PER_SHEET * unitCost
          : finalQuantity * unitCost;

      return {
        name: item.name,
        category: item.category,
        quantity: roundToTenths(item.quantity),
        unit: item.unit,
        wastePercentage: Math.round(waste * 100),
        finalQuantity: roundToTenths(finalQuantity),
        purchaseQuantity,
        purchaseUnit: equivalentSheets !== null ? "sheets" : item.unit,
        equivalentSheets,
        unitCost,
        estimatedCost: Math.round(estimatedCost),
        sourceModules: [...item.sourceModules],
        notes: item.notes,
      };
    })
    .sort((a, b) => {
      const order: MaterialCategory[] = [
        "SHEET",
        "SURFACE",
        "EDGE",
        "HARDWARE",
        "ACCESSORY",
        "CONSUMABLE",
      ];
      return order.indexOf(a.category) - order.indexOf(b.category);
    });
}

// ─── Main entry point ─────────────────────────────────────────────────────────

export function generateEstimate(
  input: GenerateEstimateInput,
): EstimationResult {
  const { priceBook, templateMap } = input;

  const dimensions = normalizeDimensions(input.dimensions);
  const signals = analyzeDesignSignals(input.baseMaterialsList);
  const modules = generateModules(
    input.categorySlug,
    input.layout,
    dimensions,
    signals,
  );
  const blueprint = createBlueprint(
    input.layout,
    input.finishType,
    input.doorType,
    modules,
  );

  const materials: Map<string, MaterialAccumulator> = new Map();
  const plywoodPanels: PanelPiece[] = [];
  const surfacePanels: PanelPiece[] = [];

  for (const module of modules) {
    const template = templateMap.get(module.type);

    if (!template) {
      // Template missing — log and skip rather than silently producing wrong numbers
      console.warn(
        `[estimator] No template found for module type "${module.type}" ` +
          `(category: ${input.categorySlug}). ` +
          `Run the module template seed to populate the database.`,
      );
      continue;
    }

    const beforeCount = plywoodPanels.length;
    materializeModule(
      module,
      input.finishType,
      input.doorType,
      materials,
      plywoodPanels,
      template,
    );

    // Mirror the plywood cut list as a surface cut list for finish optimisation
    if (plywoodPanels.length > beforeCount) {
      for (const panel of plywoodPanels.slice(beforeCount)) {
        surfacePanels.push({ ...panel, material: "SURFACE" });
      }
    }
  }

  addReferenceMaterialExtras(input.baseMaterialsList, dimensions, materials);

  // Project consumables — always added as a flat lot regardless of size
  addMaterial(
    materials,
    "Screws & Nails",
    "CONSUMABLE",
    1,
    "lot",
    "Project consumables",
  );
  addMaterial(
    materials,
    "Adhesive",
    "CONSUMABLE",
    1,
    "lot",
    "Project consumables",
  );

  const sheetOptimization = [
    optimizeSheets(
      "Plywood",
      plywoodPanels.filter((p) => p.material === "PLYWOOD"),
      WASTE_FACTORS.SHEET,
    ),
    optimizeSheets(
      getFinishName(input.finishType),
      surfacePanels.filter((p) => p.material === "SURFACE"),
      WASTE_FACTORS.SURFACE,
    ),
  ].filter((s): s is SheetOptimizationResult => s !== null);

  const detailedMaterials = buildDetailedMaterials(
    materials,
    input.grade,
    sheetOptimization,
    priceBook,
  );

  const billOfMaterials = detailedMaterials.map((item) => {
    const qty = item.equivalentSheets ?? item.purchaseQuantity;
    const unit = item.equivalentSheets !== null ? "sheets" : item.purchaseUnit;
    return `${item.name} - ${qty} ${unit}`;
  });

  // ── Cost summary — rates from PriceBook, not hardcoded constants ──────────
  const materialCost = detailedMaterials
    .filter(
      (i) =>
        i.category === "SHEET" ||
        i.category === "SURFACE" ||
        i.category === "EDGE",
    )
    .reduce((sum, i) => sum + i.estimatedCost, 0);

  const hardwareCost = detailedMaterials
    .filter(
      (i) =>
        i.category === "HARDWARE" ||
        i.category === "ACCESSORY" ||
        i.category === "CONSUMABLE",
    )
    .reduce((sum, i) => sum + i.estimatedCost, 0);

  const baseProjectCost = materialCost + hardwareCost;

  // Apply a single top-level complexity adjustment based on design signal count.
  // Capped at 12% to avoid silently inflating simple estimates.
  const signalCount = input.baseMaterialsList.length;
  const topLevelComplexity = Math.min(1.12, 1 + signalCount * 0.008);
  const adjustedBase = baseProjectCost * topLevelComplexity;

  const laborCost = Math.round(adjustedBase * priceBook.rates.labor);
  const installationCost = Math.round(
    adjustedBase * priceBook.rates.installation,
  );
  const transportCost = Math.round(adjustedBase * priceBook.rates.transport);

  const dealerTotal = Math.round(
    (adjustedBase + laborCost + installationCost + transportCost) *
      (1 + priceBook.rates.dealer),
  );
  const contractorTotal = Math.round(
    dealerTotal * (1 + priceBook.rates.contractor),
  );
  const customerTotal = Math.round(
    dealerTotal * (1 + priceBook.rates.customer),
  );

  const summary = {
    materialCost,
    hardwareCost,
    laborCost,
    installationCost,
    transportCost,
    dealerTotal,
    contractorTotal,
    customerTotal,
    totalCostMin: Math.round(customerTotal * 0.95),
    totalCostMax: Math.round(customerTotal * 1.1),
  };

  const productRecommendations = buildProductRecommendations(
    {
      materials: detailedMaterials,
      summary,
      categoryLabel: input.categoryLabel,
    },
    input.productCatalog, // ← pass catalog instead of reading static array
  );

  const nextBestAction = decideNextBestAction({
    estimate: {
      summary,
      productRecommendations,
      materials: detailedMaterials,
      categoryLabel: input.categoryLabel,
    },
  });

  return {
    categoryId: input.categoryId,
    categorySlug: input.categorySlug,
    categoryLabel: input.categoryLabel,
    designId: input.designId,
    designTitle: input.designTitle,
    layout: input.layout,
    grade: input.grade,
    finishType: input.finishType,
    doorType: input.doorType,
    dimensions,
    blueprint,
    modules,
    materials: detailedMaterials,
    billOfMaterials,
    productRecommendations,
    nextBestAction,
    sheetOptimization,
    summary,
  };
}
