import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid PostgreSQL connection string (pooled)"),
  DATABASE_URL_UNPOOLED: z
    .string()
    .url("DATABASE_URL_UNPOOLED must be a direct (unpooled) PostgreSQL connection string"),
  CLERK_SECRET_KEY: z.string().min(1, "CLERK_SECRET_KEY is required"),
  IMAGEKIT_PRIVATE_KEY: z.string().min(1, "IMAGEKIT_PRIVATE_KEY is required"),
  IMAGEKIT_PUBLIC_KEY: z.string().min(1, "IMAGEKIT_PUBLIC_KEY is required"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required"),
  NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: z.string().url("NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT must be a valid URL"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
});

type Env = z.infer<typeof serverSchema> & z.infer<typeof clientSchema>;

let cachedEnv: Env | null = null;

function getRawEnv(): Record<string, string | undefined> {
  return {
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
    IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  };
}

/**
 * Validates all env vars with zod on first access and caches the result.
 * Fails fast with a clear error listing every invalid variable.
 * Call getEnv() only in server code; getClientEnv() is safe for client components.
 * Never log or return secret values.
 */
export function getEnv(): Env {
  if (!cachedEnv) {
    const server = serverSchema.safeParse(getRawEnv());
    if (!server.success) {
      throw new Error(
        "Invalid server environment variables:\n - " +
          server.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n - "),
      );
    }
    const client = clientSchema.safeParse(getRawEnv());
    if (!client.success) {
      throw new Error(
        "Invalid client environment variables:\n - " +
          client.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n - "),
      );
    }
    cachedEnv = { ...server.data, ...client.data };
  }
  return cachedEnv;
}

/** Public subset safe to read from client components (Next inlines NEXT_PUBLIC_* at build). */
export function getClientEnv() {
  const raw = getRawEnv();
  return clientSchema.parse({
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: raw.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: raw.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
    NEXT_PUBLIC_SITE_URL: raw.NEXT_PUBLIC_SITE_URL,
  });
}

export type { Env };