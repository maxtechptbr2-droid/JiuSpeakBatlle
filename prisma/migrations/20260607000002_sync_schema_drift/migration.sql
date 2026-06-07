-- AlterTable to synchronize schema with physical PostgreSQL database
-- Done automatically by DBA and Senior Prisma ORM Engineer audit correction

-- AlterTable "User"
ALTER TABLE "User" ADD COLUMN "isAdminApproved" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "isSuspended" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "isBanned" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable "StoreProduct"
ALTER TABLE "StoreProduct" ADD COLUMN "isPromo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "promoPriceKC" INTEGER,
ADD COLUMN "isBundle" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "isSeasonal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "isExclusive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "releaseDate" TIMESTAMP(3),
ADD COLUMN "promoEndDate" TIMESTAMP(3);
