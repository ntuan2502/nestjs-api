/*
  Warnings:

  - You are about to drop the column `batchId` on the `AssetTransaction` table. All the data in the column will be lost.
  - You are about to drop the `TransactionBatch` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AssetTransaction" DROP CONSTRAINT "AssetTransaction_batchId_fkey";

-- DropForeignKey
ALTER TABLE "TransactionBatch" DROP CONSTRAINT "TransactionBatch_createdById_fkey";

-- DropForeignKey
ALTER TABLE "TransactionBatch" DROP CONSTRAINT "TransactionBatch_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "TransactionBatch" DROP CONSTRAINT "TransactionBatch_handoverId_fkey";

-- DropForeignKey
ALTER TABLE "TransactionBatch" DROP CONSTRAINT "TransactionBatch_updatedById_fkey";

-- AlterTable
ALTER TABLE "AssetTransaction" DROP COLUMN "batchId",
ADD COLUMN     "assetTransferBatchId" TEXT;

-- DropTable
DROP TABLE "TransactionBatch";

-- CreateTable
CREATE TABLE "AssetTransferBatch" (
    "id" TEXT NOT NULL,
    "note" TEXT,
    "handoverId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedById" TEXT,

    CONSTRAINT "AssetTransferBatch_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AssetTransferBatch" ADD CONSTRAINT "AssetTransferBatch_handoverId_fkey" FOREIGN KEY ("handoverId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetTransferBatch" ADD CONSTRAINT "AssetTransferBatch_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetTransferBatch" ADD CONSTRAINT "AssetTransferBatch_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetTransferBatch" ADD CONSTRAINT "AssetTransferBatch_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetTransaction" ADD CONSTRAINT "AssetTransaction_assetTransferBatchId_fkey" FOREIGN KEY ("assetTransferBatchId") REFERENCES "AssetTransferBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
