-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT;

-- CreateTable
CREATE TABLE "Estimate" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "designId" TEXT NOT NULL,
    "layout" TEXT NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "depth" DOUBLE PRECISION,
    "grade" TEXT NOT NULL,
    "materialsJson" TEXT NOT NULL,
    "costMin" INTEGER NOT NULL,
    "costMax" INTEGER NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerCity" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Estimate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Estimate_categoryId_idx" ON "Estimate"("categoryId");

-- CreateIndex
CREATE INDEX "Estimate_designId_idx" ON "Estimate"("designId");

-- AddForeignKey
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_designId_fkey" FOREIGN KEY ("designId") REFERENCES "Design"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
