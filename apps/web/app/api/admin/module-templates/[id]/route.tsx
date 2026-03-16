import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { z } from "zod";

const schema = z.object({
    label: z.string().min(1),
    active: z.boolean(),
    widthMin: z.number().positive(),
    widthMax: z.number().positive(),
    heightDefault: z.number().positive(),
    depthDefault: z.number().positive(),
    plywoodMult: z.number().min(0),
    finishMult: z.number().min(0),
    edgeBandMult: z.number().min(0),
    shelves: z.number().int().min(0),
    doors: z.number().int().min(0),
    drawers: z.number().int().min(0),
    shutterMode: z.enum(["HINGED", "SLIDING", "OPEN"]),
    hardware: z.record(z.number()),
    accessories: z.record(z.number()),
    notes: z.string().nullable().optional(),
});

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
        return NextResponse.json(
            { error: "Invalid payload", details: result.error.flatten() },
            { status: 400 }
        );
    }

    const updated = await prisma.moduleTemplate.update({
        where: { id },
        data: result.data,
    });

    // Bust the estimator page cache so next visitor sees new values
    revalidatePath("/estimator");
    revalidatePath("/admin/module-templates");

    return NextResponse.json(updated);
}