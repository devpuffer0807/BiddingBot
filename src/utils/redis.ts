import { config } from "dotenv";
import Redis from "ioredis";

config();

const REDIS_URI = process.env.REDIS_URI as string;

const getRedisUrl = () => {
  if (!REDIS_URI) {
    throw new Error("REDIS_URL is not defined in the environment variables");
  }
  return REDIS_URI;
};

// Create two different Redis client configurations
const defaultConfig = {
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => {
    return Math.min(times * 50, 2000);
  },
};

class RedisClient {
  private static instance: RedisClient;
  private client: Redis | null = null;

  private constructor() {
    this.connect();
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  private connect() {
    if (!this.client) {
      this.client = new Redis(getRedisUrl(), defaultConfig);

      // Set up error handlers for the client
      this.client.on("error", (err) => {
        console.error("Redis Client Error:", err);
      });

      this.client.on("connect", () => {
        console.log("Successfully connected to Redis");
      });
    }
  }

  public getClient(): Redis {
    if (!this.client) {
      this.connect();
    }
    return this.client!;
  }
}

const redisClient = RedisClient.getInstance();

export default redisClient;
