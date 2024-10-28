import { config } from "dotenv";
import mongoose, { Connection } from "mongoose";

config();

const MONGODB_URI = process.env.MONGODB_URI;

interface CachedConnection {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

let cached: CachedConnection = (global as any).mongoose || {
  conn: null,
  promise: null,
};

export const connect = async (): Promise<Connection> => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is missing in environment variables");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
      })
      .then((mongoose) => {
        return mongoose.connection;
      })
      .catch((error) => {
        console.error("Failed to connect to database:", error);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
};

export const disconnect = async (): Promise<void> => {
  if (cached.conn) {
    await cached.conn.close();
    cached.conn = null;
    cached.promise = null;
  }
};
