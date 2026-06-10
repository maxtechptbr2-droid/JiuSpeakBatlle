-- CreateTable
CREATE TABLE "PaymentLog" (
    "id" TEXT NOT NULL,
    "provider" TEXT,
    "transactionId" TEXT,
    "status" TEXT,
    "amount" DECIMAL(65,30),
    "payerEmail" TEXT,
    "payerName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookLog" (
    "id" TEXT NOT NULL,
    "provider" TEXT,
    "transactionId" TEXT,
    "status" TEXT,
    "amount" DECIMAL(65,30),
    "payerEmail" TEXT,
    "payerName" TEXT,
    "payload" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademyModule" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "beltLevel" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AcademyModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademyLesson" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "youtubeUrl" TEXT NOT NULL,
    "xpReward" INTEGER NOT NULL DEFAULT 100,
    "orderIndex" INTEGER NOT NULL,

    CONSTRAINT "AcademyLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademyProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "AcademyProgress_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AcademyLesson" ADD CONSTRAINT "AcademyLesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "AcademyModule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademyProgress" ADD CONSTRAINT "AcademyProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
