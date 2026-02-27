import { Pool, PoolConfig } from "pg";

function normalizeConnectionString(url: string, preferExplicitSsl: boolean) {
  if (!preferExplicitSsl) {
    return url;
  }

  try {
    const parsed = new URL(url);
    if (parsed.searchParams.has("sslmode")) {
      parsed.searchParams.delete("sslmode");
      return parsed.toString();
    }
  } catch {
    return url;
  }

  return url;
}

function makePool(url: string | undefined, name: string, extraConfig: Partial<PoolConfig> = {}) {
  if (!url) throw new Error(`${name} is not defined`);
  const connectionString = normalizeConnectionString(url, Boolean(extraConfig.ssl));
  return new Pool({
    connectionString,
    ...extraConfig,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
}

export const certificationPool = makePool(process.env.CERTIFICATION_DB_URL, "CERTIFICATION_DB_URL", {
  ssl: { rejectUnauthorized: false },
});
export const cert2Pool = makePool(process.env.CERT2_DB_URL, "CERT2_DB_URL", {
  ssl: { rejectUnauthorized: false },
});
