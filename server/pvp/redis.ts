import Redis from "ioredis";

// In-Memory Fallback Client when Redis is missing/offline
class MockRedis {
  private store: Map<string, string> = new Map();
  private lists: Map<string, string[]> = new Map();

  async get(key: string): Promise<string | null> {
    return this.store.get(key) || null;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<"OK"> {
    this.store.set(key, value);
    if (mode === "EX" && duration) {
      setTimeout(() => {
        this.store.delete(key);
      }, duration * 1000);
    }
    return "OK";
  }

  async del(key: string): Promise<number> {
    const exists = this.store.has(key) || this.lists.has(key);
    this.store.delete(key);
    this.lists.delete(key);
    return exists ? 1 : 0;
  }

  async rpush(key: string, value: string): Promise<number> {
    if (!this.lists.has(key)) {
      this.lists.set(key, []);
    }
    const list = this.lists.get(key)!;
    list.push(value);
    return list.length;
  }

  async lrange(key: string, start: number, end: number): Promise<string[]> {
    const list = this.lists.get(key) || [];
    const stop = end === -1 ? list.length : end + 1;
    return list.slice(start, stop);
  }

  async lrem(key: string, count: number, value: string): Promise<number> {
    const list = this.lists.get(key);
    if (!list) return 0;
    const initialLen = list.length;
    const updated = list.filter(item => item !== value);
    this.lists.set(key, updated);
    return initialLen - updated.length;
  }

  async hset(key: string, ...args: any[]): Promise<number> {
    // Basic hash support
    const hashKey = `HASH:${key}`;
    const data: Record<string, string> = JSON.parse(this.store.get(hashKey) || "{}");
    let count = 0;
    if (args.length === 1 && typeof args[0] === "object") {
      Object.assign(data, args[0]);
    } else {
      for (let i = 0; i < args.length; i += 2) {
        data[args[i]] = String(args[i + 1]);
        count++;
      }
    }
    this.store.set(hashKey, JSON.stringify(data));
    return count;
  }

  async hget(key: string, field: string): Promise<string | null> {
    const hashKey = `HASH:${key}`;
    const data = JSON.parse(this.store.get(hashKey) || "{}");
    return data[field] !== undefined ? data[field] : null;
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    const hashKey = `HASH:${key}`;
    return JSON.parse(this.store.get(hashKey) || "{}");
  }

  async flushall(): Promise<"OK"> {
    this.store.clear();
    this.lists.clear();
    return "OK";
  }

  on(event: string, handler: Function) {
    // Dummy event emitter
    if (event === "connect") {
      setTimeout(() => handler(), 10);
    }
  }
}

let redisClient: any;
let isRedisUsingMock = false;

export function getRedisClient() {
  if (redisClient) return { client: redisClient, isMock: isRedisUsingMock };

  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    try {
      console.log(`📡 Redis: Tentando conexão com o servidor real em ${redisUrl}...`);
      redisClient = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        connectTimeout: 2000,
      });

      redisClient.on("error", (err: any) => {
        console.error("⚠️ Falha de Conexão com o Redis real. Ativando o cache em memória (Mock)...");
        isRedisUsingMock = true;
        redisClient = new MockRedis();
      });
    } catch (e) {
      console.warn("⚠️ Não foi possível instanciar o cliente Redis. Ativando Mock em memória...");
      redisClient = new MockRedis();
      isRedisUsingMock = true;
    }
  } else {
    console.log("ℹ️ Variável REDIS_URL não está configurada no ambiente. Ativando cache MockRedis em memória.");
    redisClient = new MockRedis();
    isRedisUsingMock = true;
  }

  return { client: redisClient, isMock: isRedisUsingMock };
}
