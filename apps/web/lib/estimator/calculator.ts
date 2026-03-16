import {
  CONTRACTOR_MARGIN_PERCENTAGE,
  CUSTOMER_MARGIN_PERCENTAGE,
  DEALER_MARGIN_PERCENTAGE,
  INSTALLATION_RATE_PERCENTAGE,
  LABOR_RATE_PERCENTAGE,
  SQFT_PER_SHEET,
  TRANSPORT_RATE_PERCENTAGE,
  WASTE_FACTORS,
  getHardwareUnitCost,
  getSheetUnitCost,
} from "./pricing";
import {
  buildProductRecommendations,
  decideNextBestAction,
} from "./recommendations";
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

import type { LoadedTemplate } from "./templateLoader";

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

interface GenerateEstimateInput {
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
}

const FT_2_INCHES = 2 / 12;
const FT_18_INCHES = 18 / 12;
const FT_24_INCHES = 24 / 12;

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
    complexityMultiplier: clamp(1 + baseMaterialsList.length * 0.015, 1, 1.18),
    hasDrawers: names.some((name) => name.includes("CHANNEL")),
    hasMirror: names.some((name) => name.includes("MIRROR")),
    hasLed: names.some((name) => name.includes("LED")),
    hasFabric: names.some((name) => name.includes("FABRIC")),
    hasBaskets: names.some((name) => name.includes("BASKET")),
    hasCableManagement: names.some(
      (name) => name.includes("GROMMET") || name.includes("CABLE"),
    ),
  };
}

function getFinishName(finishType: FinishType): string {
  if (finishType === "VENEER") {
    return "Veneer Finish";
  }

  if (finishType === "ACRYLIC") {
    return "Acrylic Finish";
  }

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
    moduleTemplates: [...new Set(modules.map((module) => module.type))],
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

  for (let index = 0; index < baseCabinetCount; index += 1) {
    if (index === 0) {
      modules.push(
        createModule(
          `base-${index + 1}`,
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
      index === drawerIndex ||
      (signals.hasDrawers && index === baseCabinetCount - 1)
    ) {
      modules.push(
        createModule(
          `base-${index + 1}`,
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
        `base-${index + 1}`,
        "BASE_CABINET",
        "Base cabinet",
        cabinetWidth,
        baseHeight,
        FT_24_INCHES,
      ),
    );
  }

  const wallCabinetCount = Math.max(1, Math.ceil(baseCabinetCount * 0.7));
  for (let index = 0; index < wallCabinetCount; index += 1) {
    modules.push(
      createModule(
        `wall-${index + 1}`,
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

  for (let index = 0; index < sectionCount; index += 1) {
    if (layout === "SLIDING") {
      modules.push(
        createModule(
          `wardrobe-${index + 1}`,
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
      modules.push(
        createModule(
          `wardrobe-${index + 1}`,
          index % 2 === 0 ? "HANG_SECTION" : "SHELF_SECTION",
          index % 2 === 0 ? "Hanging section" : "Shelf section",
          sectionWidth,
          height,
          depth,
        ),
      );
      continue;
    }

    if (index === 1 || (signals.hasDrawers && index === sectionCount - 1)) {
      modules.push(
        createModule(
          `wardrobe-${index + 1}`,
          "DRAWER_SECTION",
          "Drawer section",
          sectionWidth,
          height,
          depth,
        ),
      );
      continue;
    }

    modules.push(
      createModule(
        `wardrobe-${index + 1}`,
        index % 2 === 0 ? "DOUBLE_DOOR_SECTION" : "HANG_SECTION",
        index % 2 === 0 ? "Double door section" : "Hanging section",
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

  for (let index = 0; index < baseCount; index += 1) {
    modules.push(
      createModule(
        `tv-base-${index + 1}`,
        index % 2 === 0 ? "FLOATING_CABINET" : "DRAWER_CABINET",
        index % 2 === 0 ? "Floating cabinet" : "Drawer cabinet",
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

  for (let index = 0; index < workstationCount; index += 1) {
    modules.push(
      createModule(
        `ws-${index + 1}`,
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
  if (categorySlug === "kitchen") {
    return buildKitchenModules(dimensions, layout, signals);
  }

  if (categorySlug === "wardrobe") {
    return buildWardrobeModules(dimensions, layout, signals);
  }

  if (categorySlug === "tv-unit") {
    return buildTvUnitModules(dimensions, signals);
  }

  if (categorySlug === "study") {
    return buildStudyModules(dimensions, signals);
  }

  if (categorySlug === "office") {
    return buildOfficeModules(dimensions, signals);
  }

  return buildBedroomModules(dimensions, signals);
}

function splitPanel(width: number, height: number): PanelPiece[] {
  const longer = Math.max(width, height);
  const shorter = Math.min(width, height);

  if (longer <= 8 && shorter <= 4) {
    return [{ material: "PLYWOOD", width, height }];
  }

  if (longer > 8) {
    if (width >= height) {
      return [...splitPanel(8, height), ...splitPanel(width - 8, height)];
    }

    return [...splitPanel(width, 8), ...splitPanel(width, height - 8)];
  }

  if (shorter > 4) {
    if (width <= height) {
      return [...splitPanel(4, height), ...splitPanel(width - 4, height)];
    }

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

  for (let index = 0; index < count; index += 1) {
    const pieces = splitPanel(width, height);
    for (const piece of pieces) {
      totalArea += piece.width * piece.height;
      panels.push({
        material,
        width: piece.width,
        height: piece.height,
      });
    }
  }

  return totalArea;
}

function addMaterial(
  acc: Map<string, MaterialAccumulator>,
  name: string,
  category: MaterialCategory,
  quantity: number,
  unit: string,
  sourceModule: string,
  notes?: string,
): void {
  if (quantity <= 0) {
    return;
  }

  const existing = acc.get(name);
  if (existing) {
    existing.quantity += quantity;
    existing.sourceModules.add(sourceModule);
    if (!existing.notes && notes) {
      existing.notes = notes;
    }
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

function materializeModule(
  module: GeneratedModule,
  signals: DesignSignals,
  finishType: FinishType,
  doorType: DoorType,
  materials: Map<string, MaterialAccumulator>,
  panels: PanelPiece[],
  template: LoadedTemplate, // ← new parameter
): void {
  const finishName = getFinishName(finishType);
  const complexity = signals.complexityMultiplier;

  // ── Structural panels ──────────────────────────────────────────
  const plywoodArea =
    module.width * module.height * template.plywoodMult * complexity;
  const finishArea =
    module.width * module.height * template.finishMult * complexity;
  const edgeBand = template.edgeBandMult * complexity;

  if (plywoodArea > 0) {
    // Keep panel-splitting optimisation intact
    addPanelPieces(panels, "PLYWOOD", module.width, module.height, 1);
    addMaterial(
      materials,
      "Plywood",
      "SHEET",
      plywoodArea,
      "sqft",
      module.label,
    );
  }
  if (finishArea > 0) {
    addMaterial(
      materials,
      finishName,
      "SURFACE",
      finishArea,
      "sqft",
      module.label,
    );
  }
  if (edgeBand > 0) {
    addMaterial(materials, "Edge Band", "EDGE", edgeBand, "rft", module.label);
  }

  // ── Hardware from template JSON ────────────────────────────────
  // Override door hardware based on shutterMode + global doorType setting
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
      module.label,
    );
    if (doorType !== "HANDLELESS") {
      addMaterial(
        materials,
        "Handles",
        "HARDWARE",
        template.doors,
        "nos",
        module.label,
      );
    }
    addMaterial(
      materials,
      "Magnetic Catch",
      "HARDWARE",
      Math.max(1, template.doors),
      "nos",
      module.label,
    );
  } else if (effectiveShutterMode === "SLIDING" && template.doors > 0) {
    addMaterial(
      materials,
      "Sliding Track Set",
      "HARDWARE",
      Math.ceil(template.doors / 2),
      "set",
      module.label,
    );
    addMaterial(
      materials,
      "Sliding Roller Set",
      "HARDWARE",
      template.doors,
      "set",
      module.label,
    );
    addMaterial(
      materials,
      "Soft Stopper",
      "HARDWARE",
      Math.ceil(template.doors / 2),
      "set",
      module.label,
    );
  }

  if (template.drawers > 0) {
    addMaterial(
      materials,
      "Drawer Channels",
      "HARDWARE",
      template.drawers,
      "set",
      module.label,
    );
    if (doorType !== "HANDLELESS") {
      addMaterial(
        materials,
        "Handles",
        "HARDWARE",
        template.drawers,
        "nos",
        module.label,
      );
    }
  }

  // ── Extra hardware and accessories from template JSON ──────────
  for (const [name, qty] of Object.entries(template.hardware)) {
    // Skip door/drawer hardware — handled above to respect global door type
    if (
      [
        "Soft Close Hinges",
        "Handles",
        "Drawer Channels",
        "Magnetic Catch",
        "Sliding Track Set",
        "Sliding Roller Set",
        "Soft Stopper",
      ].includes(name)
    )
      continue;
    addMaterial(
      materials,
      name,
      "HARDWARE",
      qty * complexity,
      "nos",
      module.label,
    );
  }

  for (const [name, qty] of Object.entries(template.accessories)) {
    addMaterial(materials, name, "ACCESSORY", qty, "nos", module.label);
  }
}

function resolveShutterMode(
  templateMode: string,
  globalDoorType: DoorType,
): "HINGED" | "SLIDING" | "OPEN" {
  if (templateMode === "SLIDING") return "SLIDING";
  if (templateMode === "OPEN") return "OPEN";
  if (globalDoorType === "OPEN") return "OPEN";
  return "HINGED";
}

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

    const quantity = item.baseQty * scale * 0.2;
    const resolved = resolveReferenceMaterial(item.name);
    addMaterial(
      materials,
      resolved.name,
      resolved.category,
      quantity,
      resolved.unit,
      "Design accents",
      "Reference design uplift",
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
  ) {
    return "COUNT";
  }
  if (upper.includes("EDGE")) {
    return "LINEAR";
  }
  if (upper.includes("WARDROBE") || upper.includes("TALL")) {
    return "HEIGHT";
  }
  if (upper.includes("COUNTER") || upper.includes("CABINET")) {
    return "WIDTH";
  }
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
    return {
      name: upper.includes("VENEER")
        ? "Veneer Finish"
        : upper.includes("ACRYLIC")
          ? "Acrylic Finish"
          : "Laminate Finish",
      category: "SURFACE",
      unit: "sqft",
    };
  }
  if (upper.includes("EDGE")) {
    return { name: "Edge Band", category: "EDGE", unit: "rft" };
  }
  if (upper.includes("HINGE")) {
    return { name: "Soft Close Hinges", category: "HARDWARE", unit: "nos" };
  }
  if (upper.includes("HANDLE")) {
    return { name: "Handles", category: "HARDWARE", unit: "nos" };
  }
  if (upper.includes("CHANNEL")) {
    return { name: "Drawer Channels", category: "HARDWARE", unit: "set" };
  }
  if (upper.includes("LED")) {
    return { name: "LED Channel", category: "ACCESSORY", unit: "nos" };
  }
  if (upper.includes("MIRROR")) {
    return { name: "Mirror", category: "ACCESSORY", unit: "nos" };
  }
  if (upper.includes("FABRIC")) {
    return { name: "Fabric Upholstery", category: "ACCESSORY", unit: "sqft" };
  }
  return { name, category: "ACCESSORY", unit: "nos" };
}

function optimizeSheets(
  materialName: string,
  panels: PanelPiece[],
  sheetWaste: number,
): SheetOptimizationResult | null {
  if (panels.length === 0) {
    return null;
  }

  const sortedPanels = [...panels].sort(
    (a, b) => b.width * b.height - a.width * a.height,
  );
  const effectiveSheetArea = SQFT_PER_SHEET * (1 - sheetWaste);
  const sheets: number[] = [];
  let totalArea = 0;

  for (const panel of sortedPanels) {
    const area = panel.width * panel.height;
    totalArea += area;

    const sheetIndex = sheets.findIndex((remaining) => remaining >= area);
    if (sheetIndex >= 0) {
      const remainingArea = sheets[sheetIndex] ?? 0;
      sheets[sheetIndex] = remainingArea - area;
      continue;
    }

    sheets.push(Math.max(0, effectiveSheetArea - area));
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

function buildDetailedMaterials(
  materials: Map<string, MaterialAccumulator>,
  grade: MaterialGrade,
  sheetOptimization: SheetOptimizationResult[],
): DetailedMaterialResult[] {
  const sheetMap = new Map(
    sheetOptimization.map((item) => [item.materialName, item]),
  );

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

      let unitCost = 0;
      if (item.category === "SHEET") {
        unitCost = getSheetUnitCost(grade, "PLYWOOD");
      } else if (item.category === "SURFACE") {
        unitCost = getSheetUnitCost(grade, "SURFACE");
      } else {
        unitCost = getHardwareUnitCost(item.name, grade);
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
    .sort((left, right) => {
      const categoryOrder: MaterialCategory[] = [
        "SHEET",
        "SURFACE",
        "EDGE",
        "HARDWARE",
        "ACCESSORY",
        "CONSUMABLE",
      ];
      return (
        categoryOrder.indexOf(left.category) -
        categoryOrder.indexOf(right.category)
      );
    });
}

export function generateEstimate(
  input: GenerateEstimateInput,
  templateMap: Map<string, LoadedTemplate>,
): EstimationResult {
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
  const materials = new Map<string, MaterialAccumulator>();
  const plywoodPanels: PanelPiece[] = [];
  const surfacePanels: PanelPiece[] = [];

  for (const module of modules) {
    const template = templateMap.get(module.type);
    if (!template) {
      console.warn(`No template found for module type: ${module.type}`);
      continue;
    }
    const beforePanels = plywoodPanels.length;
    materializeModule(
      module,
      signals,
      input.finishType,
      input.doorType,
      materials,
      plywoodPanels,
      template,
    );

    // Use the same cut list as a conservative guide for finishing sheets.
    if (plywoodPanels.length > beforePanels) {
      const newPanels = plywoodPanels.slice(beforePanels);
      for (const panel of newPanels) {
        surfacePanels.push({ ...panel, material: "SURFACE" });
      }
    }
  }

  addReferenceMaterialExtras(input.baseMaterialsList, dimensions, materials);
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
      plywoodPanels.filter((panel) => panel.material === "PLYWOOD"),
      WASTE_FACTORS.SHEET,
    ),
    optimizeSheets(
      getFinishName(input.finishType),
      surfacePanels.filter((panel) => panel.material === "SURFACE"),
      WASTE_FACTORS.SURFACE,
    ),
  ].filter((item): item is SheetOptimizationResult => item !== null);

  const detailedMaterials = buildDetailedMaterials(
    materials,
    input.grade,
    sheetOptimization,
  );
  const billOfMaterials = detailedMaterials.map((item) => {
    const quantity = item.equivalentSheets ?? item.purchaseQuantity;
    const unit = item.equivalentSheets !== null ? "sheets" : item.purchaseUnit;
    return `${item.name} - ${quantity} ${unit}`;
  });

  const materialCost = detailedMaterials
    .filter(
      (item) =>
        item.category === "SHEET" ||
        item.category === "SURFACE" ||
        item.category === "EDGE",
    )
    .reduce((sum, item) => sum + item.estimatedCost, 0);
  const hardwareCost = detailedMaterials
    .filter(
      (item) =>
        item.category === "HARDWARE" ||
        item.category === "ACCESSORY" ||
        item.category === "CONSUMABLE",
    )
    .reduce((sum, item) => sum + item.estimatedCost, 0);

  const baseProjectCost = materialCost + hardwareCost;
  const laborCost = Math.round(baseProjectCost * LABOR_RATE_PERCENTAGE);
  const installationCost = Math.round(
    baseProjectCost * INSTALLATION_RATE_PERCENTAGE,
  );
  const transportCost = Math.round(baseProjectCost * TRANSPORT_RATE_PERCENTAGE);
  const dealerTotal = Math.round(
    (baseProjectCost + laborCost + installationCost + transportCost) *
      (1 + DEALER_MARGIN_PERCENTAGE),
  );
  const contractorTotal = Math.round(
    dealerTotal * (1 + CONTRACTOR_MARGIN_PERCENTAGE),
  );
  const customerTotal = Math.round(
    dealerTotal * (1 + CUSTOMER_MARGIN_PERCENTAGE),
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
  const productRecommendations = buildProductRecommendations({
    materials: detailedMaterials,
    summary,
    categoryLabel: input.categoryLabel,
  });
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
