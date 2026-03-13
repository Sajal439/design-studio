import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { z } from "zod";

const schema = z.object({
  role: z.enum(["customer", "admin"]).optional(),
  isActive: z.enum(["true", "false"]).optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success || (!result.data.role && !result.data.isActive)) {
      return NextResponse.json({ error: "Invalid user update" }, { status: 400 });
    }

    const { id } = await params;
    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(result.data.role ? { role: result.data.role } : {}),
        ...(result.data.isActive ? { isActive: result.data.isActive === "true" } : {}),
      },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return NextResponse.json(updated);
  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json({ error: "Unable to update user" }, { status: 500 });
  }
}
