-- AlterTable to add expanded user profile fields
ALTER TABLE "User" 
ADD COLUMN "birthDate" TIMESTAMP(3),
ADD COLUMN "phone" TEXT,
ADD COLUMN "englishLevel" TEXT,
ADD COLUMN "spanishLevel" TEXT,
ADD COLUMN "frenchLevel" TEXT,
ADD COLUMN "onboardingDone" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "lastLoginAt" TIMESTAMP(3),
ADD COLUMN "username" TEXT,
ADD COLUMN "beltRank" TEXT,
ADD COLUMN "favoriteTechnique" TEXT,
ADD COLUMN "favoriteAthlete" TEXT,
ADD COLUMN "privacyLevel" TEXT NOT NULL DEFAULT 'public',
ADD COLUMN "followersCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "followingCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "themeColor" TEXT,
ADD COLUMN "avatarFrame" TEXT,
ADD COLUMN "isVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
