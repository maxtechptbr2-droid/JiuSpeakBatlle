-- CreateTable
CREATE TABLE "GlobalTeam" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "countryOrigin" TEXT,
    "website" TEXT,
    "instagram" TEXT,
    "description" TEXT,
    "foundedYear" INTEGER,
    "totalMembers" INTEGER NOT NULL DEFAULT 0,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlobalTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademyBranch" (
    "id" TEXT NOT NULL,
    "globalTeamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "country" TEXT,
    "state" TEXT,
    "city" TEXT,
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "headProfessor" TEXT,
    "logo" TEXT,
    "membersCount" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademyBranch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndependentAcademy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT,
    "state" TEXT,
    "city" TEXT,
    "address" TEXT,
    "headProfessor" TEXT,
    "logo" TEXT,
    "membersCount" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndependentAcademy_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "User" ADD COLUMN "globalTeamId" TEXT;
ALTER TABLE "User" ADD COLUMN "branchId" TEXT;
ALTER TABLE "User" ADD COLUMN "independentAcademyId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "GlobalTeam_slug_key" ON "GlobalTeam"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "AcademyBranch_slug_key" ON "AcademyBranch"("slug");

-- CreateIndex
CREATE INDEX "AcademyBranch_globalTeamId_idx" ON "AcademyBranch"("globalTeamId");

-- CreateIndex
CREATE INDEX "User_globalTeamId_idx" ON "User"("globalTeamId");
CREATE INDEX "User_branchId_idx" ON "User"("branchId");
CREATE INDEX "User_independentAcademyId_idx" ON "User"("independentAcademyId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_globalTeamId_fkey" FOREIGN KEY ("globalTeamId") REFERENCES "GlobalTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "AcademyBranch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_independentAcademyId_fkey" FOREIGN KEY ("independentAcademyId") REFERENCES "IndependentAcademy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademyBranch" ADD CONSTRAINT "AcademyBranch_globalTeamId_fkey" FOREIGN KEY ("globalTeamId") REFERENCES "GlobalTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
