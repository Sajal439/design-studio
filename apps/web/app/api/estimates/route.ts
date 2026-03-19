import prisma from "@repo/database";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (
      !data.categoryId ||
      !data.designId ||
      !data.customerName ||
      !data.customerPhone ||
      !data.customerCity
    ) {
      return NextResponse.json(
        { message: "Missing required contact or design fields" },
        { status: 400 },
      );
    }

    const estimate = await prisma.estimate.create({
      data: {
        categoryId: data.categoryId,
        designId: data.designId,
        layout: data.layout,
        width: data.dimensions?.width ?? data.width,
        height: data.dimensions?.height ?? data.height,
        depth: data.dimensions?.depth ?? data.depth ?? null,
        grade: data.grade,
        materialsJson: JSON.stringify({
          blueprint: data.blueprint,
          materials: data.materials,
          billOfMaterials: data.billOfMaterials,
          productRecommendations: data.productRecommendations,
          nextBestAction: data.nextBestAction,
          finishType: data.finishType,
          doorType: data.doorType,
        }),
        costMin: data.summary.totalCostMin,
        costMax: data.summary.totalCostMax,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerCity: data.customerCity,
      },
    });

    return NextResponse.json(
      { message: "Estimate saved successfully", estimateId: estimate.id },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to save estimate:", error);
    return NextResponse.json(
      { message: "Something went wrong saving the estimate" },
      { status: 500 },
    );
  }
}
