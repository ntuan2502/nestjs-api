/*
  Warnings:

  - You are about to drop the column `token` on the `Session` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[accessToken]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accessToken` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Session_token_key";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "token",
ADD COLUMN     "accessToken" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dob" TIMESTAMP(3),
ADD COLUMN     "gender" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Session_accessToken_key" ON "Session"("accessToken");
