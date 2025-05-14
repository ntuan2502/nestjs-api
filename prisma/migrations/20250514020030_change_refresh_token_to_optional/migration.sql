-- DropIndex
DROP INDEX "Session_refreshToken_key";

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "refreshToken" DROP NOT NULL,
ALTER COLUMN "refreshTokenExpiresAt" DROP NOT NULL;
