-- CreateTable
CREATE TABLE "ModuleTemplate" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "widthMin" DOUBLE PRECISION NOT NULL DEFAULT 2.0,
    "widthMax" DOUBLE PRECISION NOT NULL DEFAULT 3.5,
    "heightDefault" DOUBLE PRECISION NOT NULL DEFAULT 2.8,
    "depthDefault" DOUBLE PRECISION NOT NULL DEFAULT 2.0,
    "plywoodMult" DOUBLE PRECISION NOT NULL DEFAULT 1.6,
    "finishMult" DOUBLE PRECISION NOT NULL DEFAULT 1.2,
    "edgeBandMult" DOUBLE PRECISION NOT NULL DEFAULT 20.0,
    "shelves" INTEGER NOT NULL DEFAULT 1,
    "doors" INTEGER NOT NULL DEFAULT 2,
    "drawers" INTEGER NOT NULL DEFAULT 0,
    "shutterMode" TEXT NOT NULL DEFAULT 'HINGED',
    "hardware" JSONB NOT NULL DEFAULT '{}',
    "accessories" JSONB NOT NULL DEFAULT '{}',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModuleTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ModuleTemplate_type_key" ON "ModuleTemplate"("type");
