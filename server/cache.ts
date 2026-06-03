import { getRedisClient } from "./pvp/redis";

/**
 * Reusable helper to encapsulate Redis fetch-through caching with an automated in-memory fallback pattern.
 * Saves high database load for frequently accessed read-only endpoints.
 * 
 * @param key Redis cache key
 * @param fetchFn Resolver backup function to trigger on a cache miss
 * @param ttlSeconds Time-to-Live duration in seconds (Default: 60s)
 */
export async function getCached<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = 60
): Promise<T> {
  const { client } = getRedisClient();
  try {
    const cached = await client.get(key);
    if (cached) {
      try {
        return JSON.parse(cached) as T;
      } catch (parseError) {
        console.warn(`Cache corrupt or unparseable for key: ${key}`, parseError);
      }
    }
  } catch (err) {
    console.warn(`Redis cache get failed for key: ${key}. Bypassing client cache.`, err);
  }

  const freshData = await fetchFn();

  try {
    const serialized = JSON.stringify(freshData);
    await client.set(key, serialized, "EX", ttlSeconds);
  } catch (err) {
    console.warn(`Redis cache write failed for key: ${key}`, err);
  }

  return freshData;
}

/**
 * Explicitly evicts or invalidates a cached resource identifier.
 */
export async function invalidateCache(key: string): Promise<void> {
  const { client } = getRedisClient();
  try {
    await client.del(key);
  } catch (err) {
    console.warn(`Failed to invalidate cache key: ${key}`, err);
  }
}
