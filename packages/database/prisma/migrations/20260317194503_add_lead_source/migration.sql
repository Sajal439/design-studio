-- AlterTable
ALTER TABLE "Consultation" ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "Estimate" ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "QuoteRequest" ADD COLUMN     "source" TEXT,
ALTER COLUMN "email" DROP NOT NULL;
