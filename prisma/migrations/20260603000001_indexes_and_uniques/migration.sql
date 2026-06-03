-- Migration to optimize database queries and secure database operations with indexes and unique constraints

-- Drop redundant indexes
DROP INDEX IF EXISTS "User_email_idx";
DROP INDEX IF EXISTS "Wallet_userId_idx";
DROP INDEX IF EXISTS "PixPayment_transactionId_idx";
DROP INDEX IF EXISTS "PixPayment_txid_idx";
DROP INDEX IF EXISTS "Subscription_status_idx";
DROP INDEX IF EXISTS "SubscriptionPayment_txid_idx";
DROP INDEX IF EXISTS "UserAchievement_userId_idx";
DROP INDEX IF EXISTS "Inventory_userId_idx";
DROP INDEX IF EXISTS "StoreProduct_active_idx";
DROP INDEX IF EXISTS "MarketplaceSale_marketplaceItemId_idx";
DROP INDEX IF EXISTS "PvpRound_matchId_idx";
DROP INDEX IF EXISTS "PvpQuestion_isActive_idx";
DROP INDEX IF EXISTS "PvpAnswer_roundId_idx";
DROP INDEX IF EXISTS "Like_postId_idx";
DROP INDEX IF EXISTS "Follower_followerId_idx";
DROP INDEX IF EXISTS "RefreshToken_token_idx";

-- Create new indexes
CREATE INDEX IF NOT EXISTS "PixPayment_status_expiresAt_idx" ON "PixPayment"("status", "expiresAt");
CREATE INDEX IF NOT EXISTS "Withdrawal_createdAt_idx" ON "Withdrawal"("createdAt");
CREATE INDEX IF NOT EXISTS "Withdrawal_status_createdAt_idx" ON "Withdrawal"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "Subscription_userId_status_idx" ON "Subscription"("userId", "status");
CREATE INDEX IF NOT EXISTS "Subscription_status_endDate_idx" ON "Subscription"("status", "endDate");
CREATE INDEX IF NOT EXISTS "SubscriptionPayment_subscriptionId_status_idx" ON "SubscriptionPayment"("subscriptionId", "status");
CREATE INDEX IF NOT EXISTS "InventoryItem_inventoryId_isEquipped_idx" ON "InventoryItem"("inventoryId", "isEquipped");
CREATE INDEX IF NOT EXISTS "StoreProduct_active_category_idx" ON "StoreProduct"("active", "category");
CREATE INDEX IF NOT EXISTS "MarketplaceItem_active_priceKC_idx" ON "MarketplaceItem"("active", "priceKC");
CREATE INDEX IF NOT EXISTS "MarketplaceItem_active_createdAt_idx" ON "MarketplaceItem"("active", "createdAt");
CREATE INDEX IF NOT EXISTS "PvpQuestion_category_isActive_idx" ON "PvpQuestion"("category", "isActive");
CREATE INDEX IF NOT EXISTS "SocialPost_createdAt_idx" ON "SocialPost"("createdAt");
CREATE INDEX IF NOT EXISTS "SocialPost_category_createdAt_idx" ON "SocialPost"("category", "createdAt");
CREATE INDEX IF NOT EXISTS "LoginAttempt_email_success_timestamp_idx" ON "LoginAttempt"("email", "success", "timestamp");

-- Create new unique constraints (Strict prevent duplication)
CREATE UNIQUE INDEX IF NOT EXISTS "PvpRound_matchId_roundNumber_key" ON "PvpRound"("matchId", "roundNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "PvpAnswer_roundId_userId_key" ON "PvpAnswer"("roundId", "userId");
