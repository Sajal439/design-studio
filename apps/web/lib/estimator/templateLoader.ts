import { prisma } from "@repo/database";
import { cache } from "react";

export type LoadedTemplate = {
  type: string;
  label: string;
  category: string;
  active: boolean;
  widthMin: number;
  widthMax: number;
  heightDefault: number;
  depthDefault: number;
  plywoodMult: number;
  finishMult: number;
  edgeBandMult: number;
  shelves: number;
  doors: number;
  drawers: number;
  shutterMode: string;
  hardware: Record<string, number>;
  accessories: Record<string, number>;
};

// cache() memoises per request — only one DB query per page render
export const loadModuleTemplates = cache(
  async (): Promise<Map<string, LoadedTemplate>> => {
    const rows = await prisma.moduleTemplate.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });

    const map = new Map<string, LoadedTemplate>();
    for (const row of rows) {
      map.set(row.type, {
        ...row,
        hardware: row.hardware as Record<string, number>,
        accessories: row.accessories as Record<string, number>,
      });
    }
    return map;
  },
);
