/**
 * Panel-based material calculations for Indian furniture carpentry.
 *
 * All dimensions in feet. All areas in sqft. All lengths in rft.
 *
 * Replaces the previous multiplier approach (width × height × plywoodMult)
 * with actual panel enumeration — every physical piece of ply is named,
 * dimensioned, and summed. Results match what a carpenter would quote from.
 *
 * Material categories:
 *   carcassSqft   — 18mm BWR plywood: sides, top, bottom, shelves
 *   shutterSqft   — 18mm BWR plywood: door and shutter panels
 *   backPanelSqft — 9mm plywood or 6mm HDF: structural back (cheaper rate)
 *   drawerBoxSqft — 12mm plywood: drawer box sides, front, back, bottom
 *   laminateSqft  — laminate sheet: BOTH faces of every laminated panel
 *   edgeBandRft   — PVC edge band: all exposed panel edges
 *
 * Laminate face rules (Indian carpentry standard):
 *   Shutters      → both faces (front decorative + back balance laminate)
 *   Shelves       → both faces (top + bottom visible when cabinet open)
 *   Side panels   → inner face always + outer face if end is exposed
 *   Top/bottom    → inner face (visible inside cabinet)
 *   Drawer front  → both faces (outer face decorative, inner face plain)
 *   Back panels   → NOT laminated (9mm HDF/ply, left plain)
 *   Drawer boxes  → NOT laminated (hidden inside)
 */

import type { LoadedTemplate } from "./templateLoader";

// ─── Result shape ─────────────────────────────────────────────────────────────

export interface PanelResult {
  carcassSqft: number;
  shutterSqft: number;
  backPanelSqft: number;
  drawerBoxSqft: number;
  laminateSqft: number;
  edgeBandRft: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

// Standard drawer height: 5.5 inches
const DRAWER_H = 5.5 / 12;

// Toe kick height for base cabinets: 4 inches
const TOE_KICK_H = 4 / 12;

// Clearance subtracted from drawer box width and depth (1 inch each side)
const DRAWER_CLEARANCE = 2 / 12;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function r(n: number): number {
  return Math.round(n * 100) / 100;
}

export function addPanels(a: PanelResult, b: PanelResult): PanelResult {
  return {
    carcassSqft: r(a.carcassSqft + b.carcassSqft),
    shutterSqft: r(a.shutterSqft + b.shutterSqft),
    backPanelSqft: r(a.backPanelSqft + b.backPanelSqft),
    drawerBoxSqft: r(a.drawerBoxSqft + b.drawerBoxSqft),
    laminateSqft: r(a.laminateSqft + b.laminateSqft),
    edgeBandRft: r(a.edgeBandRft + b.edgeBandRft),
  };
}

function zero(): PanelResult {
  return {
    carcassSqft: 0,
    shutterSqft: 0,
    backPanelSqft: 0,
    drawerBoxSqft: 0,
    laminateSqft: 0,
    edgeBandRft: 0,
  };
}

// ─── Core cabinet formula ─────────────────────────────────────────────────────
//
// Applies to any box furniture: kitchen cabinets, wardrobes, storage units.
// The caller provides actual dimensions and structure counts from the
// DB module template.

interface CabinetSpec {
  w: number; // width in feet
  h: number; // height in feet
  d: number; // depth in feet
  shelves: number; // number of fixed shelves
  doors: number; // number of shutter/door panels
  drawers: number; // number of drawer boxes
  hasToeKick: boolean; // base cabinets: shutter height = h - TOE_KICK_H
  hasBack: boolean; // most cabinets have a back panel
  // How many of the end panels are visibly exposed (default 0.5 = corner estimate)
  visibleEnds?: number;
}

function cabinetPanels(spec: CabinetSpec): PanelResult {
  const { w, h, d, shelves, doors, drawers, hasToeKick, hasBack } = spec;
  const visibleEnds = spec.visibleEnds ?? 0.5;

  // ── Carcass (18mm BWR ply) ─────────────────────────────────────────────────
  const sides = 2 * (h * d);
  const topBottom = 2 * (w * d);
  const shelfPanels = shelves * (w * d);
  const carcassSqft = r(sides + topBottom + shelfPanels);

  // ── Back panel (9mm ply / HDF) ─────────────────────────────────────────────
  const backPanelSqft = hasBack ? r(w * h) : 0;

  // ── Shutters (18mm BWR ply) ────────────────────────────────────────────────
  const shutterH = hasToeKick ? h - TOE_KICK_H : h;
  const shutterW = doors > 0 ? w / doors : 0;
  const shutterSqft = doors > 0 ? r(doors * shutterW * shutterH) : 0;

  // ── Drawer boxes (12mm ply) ────────────────────────────────────────────────
  // Each box: 2 sides (DRAWER_H × depth) + front + back (DRAWER_H × width) + bottom
  let drawerBoxSqft = 0;
  if (drawers > 0) {
    const bw = w - DRAWER_CLEARANCE;
    const bd = d - DRAWER_CLEARANCE;
    const box = 2 * (DRAWER_H * bd) + 2 * (DRAWER_H * bw) + bw * bd;
    drawerBoxSqft = r(drawers * box);
  }

  // ── Laminate — both faces of every laminated panel ───────────────────────
  //
  // Shutters: front decorative face + back balance laminate = × 2
  const shutterLaminate = shutterSqft * 2;

  // Shelves: top face visible when open, bottom face also visible from below
  const shelfLaminate = shelfPanels * 2;

  // Side panels:
  //   Inner face — always laminated (visible inside the cabinet)
  //   Outer face — only if the end is exposed (not against a wall)
  const sideInner = 2 * (h * d);
  const sideOuter = visibleEnds * (h * d);

  // Top and bottom carcass panels: inner face only (outer face hidden)
  const topBottomInner = 2 * (w * d);

  // Drawer fronts: both faces (outer decorative + inner balance laminate)
  // Drawer box sides/back/bottom are hidden — not laminated
  const drawerFaceLaminate = drawers > 0 ? drawers * 2 * (w * DRAWER_H) : 0;

  const laminateSqft = r(
    shutterLaminate +
      shelfLaminate +
      sideInner +
      sideOuter +
      topBottomInner +
      drawerFaceLaminate,
  );

  // ── Edge banding ───────────────────────────────────────────────────────────
  // Shutter edges: all 4 edges of each door panel
  const shutterEdge = doors > 0 ? doors * 2 * (shutterW + shutterH) : 0;
  // Shelf front edges (one exposed edge per shelf)
  const shelfEdge = shelves * w;
  // Top and bottom front edges
  const topBotEdge = 2 * w;
  // Drawer front faces (face frame, 4 edges each)
  const drawerEdge = drawers > 0 ? drawers * 2 * (w + DRAWER_H) : 0;
  // 8% waste for joining and corners
  const edgeBandRft = r(
    (shutterEdge + shelfEdge + topBotEdge + drawerEdge) * 1.08,
  );

  return {
    carcassSqft,
    shutterSqft,
    backPanelSqft,
    drawerBoxSqft,
    laminateSqft,
    edgeBandRft,
  };
}

// ─── Module-specific calculations ────────────────────────────────────────────
//
// Each function receives the module's actual dimensions and reads structure
// counts from the DB template. Dimensions come from the module builder
// (which sizes modules based on the room dimensions the user entered).

export function calculateModulePanels(
  moduleType: string,
  w: number,
  h: number,
  d: number,
  template: LoadedTemplate,
): PanelResult {
  const { shelves, doors, drawers } = template;

  switch (moduleType) {
    // ── Kitchen ──────────────────────────────────────────────────────────────

    case "BASE_CABINET":
      return cabinetPanels({
        w,
        h,
        d,
        shelves,
        doors,
        drawers,
        hasToeKick: true,
        hasBack: true,
      });

    case "WALL_CABINET":
      // Wall cabinets have no toe kick; depth typically 1–1.25 ft
      return cabinetPanels({
        w,
        h,
        d,
        shelves,
        doors,
        drawers,
        hasToeKick: false,
        hasBack: true,
      });

    case "TALL_UNIT": {
      // Tall units: lower section has doors, upper section has more doors
      // Split roughly 40% lower (with drawers), 60% upper (doors only)
      const lower = cabinetPanels({
        w,
        h: h * 0.4,
        d,
        shelves: 1,
        doors,
        drawers,
        hasToeKick: true,
        hasBack: false,
      });
      const upper = cabinetPanels({
        w,
        h: h * 0.6,
        d,
        shelves: shelves - 1,
        doors,
        drawers: 0,
        hasToeKick: false,
        hasBack: false,
      });
      // One shared back for the full height
      const back: PanelResult = { ...zero(), backPanelSqft: r(w * h) };
      return addPanels(addPanels(lower, upper), back);
    }

    case "CORNER_UNIT": {
      // Corner unit: L-shaped footprint — roughly 1.5× the material of a standard base
      const base = cabinetPanels({
        w,
        h,
        d,
        shelves,
        doors,
        drawers,
        hasToeKick: true,
        hasBack: true,
      });
      // Add the return section (half width, same height and depth)
      const returnSection = cabinetPanels({
        w: w * 0.5,
        h,
        d,
        shelves,
        doors: 0,
        drawers: 0,
        hasToeKick: true,
        hasBack: true,
      });
      return addPanels(base, returnSection);
    }

    case "SINK_CABINET":
      // No shelves (plumbing below), doors only; back panel is partial (plumbing cutout)
      return cabinetPanels({
        w,
        h,
        d,
        shelves: 0,
        doors,
        drawers: 0,
        hasToeKick: true,
        hasBack: true,
        visibleEnds: 0,
      });

    case "DRAWER_UNIT":
      // All drawers, one small door at bottom
      return cabinetPanels({
        w,
        h,
        d,
        shelves: 0,
        doors,
        drawers,
        hasToeKick: true,
        hasBack: true,
      });

    case "ISLAND_UNIT":
      // Four-sided visible unit — all faces finished, no toe kick, all 4 ends visible
      return cabinetPanels({
        w,
        h,
        d,
        shelves,
        doors,
        drawers,
        hasToeKick: false,
        hasBack: true,
        visibleEnds: 2,
      });

    case "ACCESSORY_UNIT":
      // Pull-out basket unit — mostly frame, one door
      return cabinetPanels({
        w,
        h,
        d,
        shelves: 0,
        doors,
        drawers: 0,
        hasToeKick: true,
        hasBack: true,
      });

    // ── Wardrobe ─────────────────────────────────────────────────────────────

    case "DOUBLE_DOOR_SECTION":
    case "HANG_SECTION":
      // Full height, 2 doors, internal hanging space
      return cabinetPanels({
        w,
        h,
        d,
        shelves,
        doors,
        drawers,
        hasToeKick: false,
        hasBack: true,
      });

    case "DRAWER_SECTION":
      return cabinetPanels({
        w,
        h,
        d,
        shelves,
        doors,
        drawers,
        hasToeKick: false,
        hasBack: true,
      });

    case "SHELF_SECTION":
      // Open shelving — no doors, more shelves, back panel still needed
      return cabinetPanels({
        w,
        h,
        d,
        shelves,
        doors: 0,
        drawers: 0,
        hasToeKick: false,
        hasBack: true,
      });

    case "SLIDING_SECTION": {
      // Carcass same as double-door but shutter area is larger (overlap)
      // Sliding shutters overlap by ~3 inches each
      const carcass = cabinetPanels({
        w,
        h,
        d,
        shelves,
        doors: 0,
        drawers,
        hasToeKick: false,
        hasBack: true,
      });
      // Each sliding shutter: full height, width = (w + overlap) / doors
      const overlapW = (w + doors * 0.25) / doors;
      const shutterSqft = r(doors * overlapW * h);
      // Both faces: front decorative + back balance laminate
      const laminateSqft = r(shutterSqft * 2);
      const edgeSlidingExtra = r(doors * 2 * (overlapW + h) * 1.08);
      return {
        ...carcass,
        shutterSqft,
        laminateSqft: r(carcass.laminateSqft + laminateSqft),
        edgeBandRft: r(carcass.edgeBandRft + edgeSlidingExtra),
      };
    }

    // ── TV Unit ───────────────────────────────────────────────────────────────

    case "BACK_PANEL": {
      // MDF/HDF back wall panel — no carcass, just face area
      // Depth is very thin (2 inches = 0.17 ft)
      const panelSqft = r(w * h);
      return {
        ...zero(),
        backPanelSqft: panelSqft,
        // Front face: decorative finish. Back face: balance/backing laminate.
        laminateSqft: r(panelSqft * 2),
        edgeBandRft: r(2 * (w + h) * 1.08),
      };
    }

    case "FLOATING_CABINET":
      // Wall-mounted — similar to base cabinet but no toe kick, often shallower
      return cabinetPanels({
        w,
        h,
        d,
        shelves,
        doors,
        drawers,
        hasToeKick: false,
        hasBack: true,
      });

    case "OPEN_SHELF": {
      // Simple floating shelf — top + bottom board + optional dividers
      const shelfArea = r(w * d * 2); // top and bottom boards
      return {
        ...zero(),
        carcassSqft: shelfArea,
        // Both faces of each board: top face + bottom face
        laminateSqft: r(w * d * 2 * 2),
        edgeBandRft: r(w * 2 * 1.08),
      };
    }

    case "DRAWER_CABINET":
      return cabinetPanels({
        w,
        h,
        d,
        shelves,
        doors,
        drawers,
        hasToeKick: false,
        hasBack: true,
      });

    case "LED_PANEL": {
      // Thin MDF strip — just the face panel
      const area = r(w * h);
      return { ...zero(), backPanelSqft: area };
    }

    // ── Study ─────────────────────────────────────────────────────────────────

    case "TABLE_TOP": {
      // Tabletop: one thick panel (double-ply or 25mm block board)
      // Height here is actually the thickness (~2 inches = 0.17 ft)
      const topArea = r(w * d);
      const edgeArea = r(2 * (w + d) * 1.08);
      return {
        ...zero(),
        carcassSqft: r(topArea * 1.5), // double ply for rigidity
        // Top working surface + underside both laminated
        laminateSqft: r(topArea * 2),
        edgeBandRft: edgeArea,
      };
    }

    case "BOOKSHELF":
      // Open shelving unit — same as SHELF_SECTION but study context
      return cabinetPanels({
        w,
        h,
        d,
        shelves,
        doors: 0,
        drawers: 0,
        hasToeKick: false,
        hasBack: true,
      });

    case "CABLE_PANEL": {
      // Thin partition/cable management strip
      const area = r(w * h);
      return { ...zero(), backPanelSqft: area, edgeBandRft: r(w * 2) };
    }

    // ── Office ────────────────────────────────────────────────────────────────

    case "WORKSTATION": {
      // L-shaped or straight desktop: thick top panel + modesty panel + cable spine
      const topArea = r(w * d);
      const modestyArea = r(w * h * 0.5);
      return {
        ...zero(),
        carcassSqft: r(topArea * 1.5 + modestyArea),
        // Top: both faces. Modesty panel: both faces (visible both sides).
        laminateSqft: r(topArea * 2 + modestyArea * 2),
        edgeBandRft: r((2 * (w + d) + w) * 1.08),
      };
    }

    case "STORAGE_CABINET":
      return cabinetPanels({
        w,
        h,
        d,
        shelves,
        doors,
        drawers,
        hasToeKick: false,
        hasBack: true,
      });

    case "MEETING_TABLE": {
      // Large flat top — triple-ply construction or thick board
      const topArea = r(w * d);
      return {
        ...zero(),
        carcassSqft: r(topArea * 1.6),
        // Top surface + underside both laminated
        laminateSqft: r(topArea * 2),
        edgeBandRft: r(2 * (w + d) * 1.08),
      };
    }

    // ── Bedroom ───────────────────────────────────────────────────────────────

    case "BED_FRAME": {
      // Platform bed: 2 long side rails + 2 short rails + slatted base
      // w = bed width (5–6.5 ft), d = bed length (~6.5 ft), h = bed height (~1.5 ft)
      const bedLength = d;
      const sidePanels = r(2 * (bedLength * h));
      const headFootEnd = r(2 * (w * h));
      const slatArea = r(w * bedLength * 0.6);
      // Head and foot panels: both faces (fully visible)
      // Side rails: outer face + inner face (both visible at bed height)
      const laminateSqft = r(headFootEnd * 2 + sidePanels);
      return {
        ...zero(),
        carcassSqft: r(sidePanels + headFootEnd + slatArea),
        backPanelSqft: r(w * bedLength),
        laminateSqft,
        edgeBandRft: r(2 * (w + bedLength) * 1.08),
      };
    }

    case "SIDE_TABLE":
      return cabinetPanels({
        w,
        h,
        d,
        shelves,
        doors,
        drawers,
        hasToeKick: false,
        hasBack: true,
        visibleEnds: 1,
      });

    case "DRESSER_UNIT":
      return cabinetPanels({
        w,
        h,
        d,
        shelves,
        doors,
        drawers,
        hasToeKick: false,
        hasBack: true,
        visibleEnds: 0.5,
      });

    case "LOFT_CABINET":
      // Overhead storage — similar to wall cabinet
      return cabinetPanels({
        w,
        h,
        d,
        shelves,
        doors,
        drawers,
        hasToeKick: false,
        hasBack: true,
      });

    case "UPHOLSTERED_PANEL": {
      // Headboard: one structural panel + fabric + foam
      // Height here is actual headboard height, depth is thin (0.17 ft)
      const panelArea = r(w * h);
      return {
        ...zero(),
        carcassSqft: panelArea, // base ply panel
        laminateSqft: 0, // no laminate — fabric instead
        edgeBandRft: r(2 * (w + h)), // perimeter
      };
    }

    // ── Fallback ──────────────────────────────────────────────────────────────

    default:
      // Generic box — use the cabinet formula with template values
      return cabinetPanels({
        w,
        h,
        d,
        shelves,
        doors,
        drawers,
        hasToeKick: false,
        hasBack: true,
      });
  }
}
