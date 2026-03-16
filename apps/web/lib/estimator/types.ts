export type MaterialScaling = "AREA" | "WIDTH" | "HEIGHT" | "LINEAR" | "COUNT";
export type MaterialGrade = "BUDGET" | "STANDARD" | "PREMIUM";
export type LayoutType =
  | "STRAIGHT"
  | "L_SHAPE"
  | "PARALLEL"
  | "U_SHAPE"
  | "ISLAND"
  | "HINGED"
  | "SLIDING"
  | "WALK_IN";
export type FinishType = "LAMINATE" | "VENEER" | "ACRYLIC";
export type DoorType = "HINGED" | "SLIDING" | "OPEN" | "HANDLELESS";

export type CategorySlug =
  | "kitchen"
  | "wardrobe"
  | "tv-unit"
  | "bedroom"
  | "study"
  | "office";

export type MaterialCategory =
  | "SHEET"
  | "SURFACE"
  | "EDGE"
  | "HARDWARE"
  | "ACCESSORY"
  | "CONSUMABLE";
export type NextBestActionType =
  | "BOOK_SITE_VISIT"
  | "REQUEST_QUOTE"
  | "VIEW_PRODUCT_BUNDLE"
  | "SAVE_ESTIMATE"
  | "CONTACT_ON_WHATSAPP";

export interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

export interface MaterialRequirement {
  name: string;
  baseQty: number;
  unit: string;
  scaling: MaterialScaling;
}

export interface GeneratedModule {
  id: string;
  type: string;
  label: string;
  quantity: number;
  width: number;
  height: number;
  depth: number;
  notes?: string;
}

export interface DetailedMaterialResult {
  name: string;
  category: MaterialCategory;
  quantity: number;
  unit: string;
  wastePercentage: number;
  finalQuantity: number;
  purchaseQuantity: number;
  purchaseUnit: string;
  equivalentSheets: number | null;
  unitCost: number;
  estimatedCost: number;
  sourceModules: string[];
  notes?: string;
}

export interface SheetOptimizationResult {
  materialName: string;
  sheetCount: number;
  panelCount: number;
  totalArea: number;
  utilization: number;
}

export interface DesignBlueprint {
  layoutRule: string;
  finishType: FinishType;
  doorType: DoorType;
  moduleTemplates: string[];
}

export interface ProductRecommendation {
  materialName: string;
  productSlug: string;
  productName: string;
  category: string;
  brand: string;
  unit: string;
  priceRange: string;
  recommendedQty: number;
  reason: string;
  confidence: number;
  fallbackProductSlugs: string[];
}

export interface NextBestAction {
  primary: NextBestActionType;
  secondary: NextBestActionType;
  tertiary: NextBestActionType;
  reason: string;
}

export interface EstimationResult {
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
  blueprint: DesignBlueprint;
  modules: GeneratedModule[];
  materials: DetailedMaterialResult[];
  billOfMaterials: string[];
  productRecommendations: ProductRecommendation[];
  nextBestAction: NextBestAction;
  sheetOptimization: SheetOptimizationResult[];
  summary: {
    materialCost: number;
    hardwareCost: number;
    laborCost: number;
    installationCost: number;
    transportCost: number;
    dealerTotal: number;
    contractorTotal: number;
    customerTotal: number;
    totalCostMin: number;
    totalCostMax: number;
  };
}
