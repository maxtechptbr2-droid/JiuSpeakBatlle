-- AlterTable to add social media and student profile fields to User
ALTER TABLE "User" 
ADD COLUMN "bio" TEXT DEFAULT '',
ADD COLUMN "city" TEXT DEFAULT '',
ADD COLUMN "country" TEXT DEFAULT '',
ADD COLUMN "nativeLanguage" TEXT DEFAULT '',
ADD COLUMN "learningGoal" TEXT DEFAULT '',
ADD COLUMN "profilePhoto" TEXT DEFAULT '',
ADD COLUMN "coverPhoto" TEXT DEFAULT '',
ADD COLUMN "instagram" TEXT DEFAULT '',
ADD COLUMN "youtube" TEXT DEFAULT '',
ADD COLUMN "facebook" TEXT DEFAULT '',
ADD COLUMN "website" TEXT DEFAULT '';
