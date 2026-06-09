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

// SSL is required for hosted DBs (Aiven etc.) but not for the local Postgres container.
// Set DB_SSL=false to disable it (used in docker-compose for the VM deployment).
const SSL_CONFIG: Partial<PoolConfig> =
  process.env.DB_SSL === "false" ? {} : { ssl: { rejectUnauthorized: false } };

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

let certificationPool: Pool | null = null;
let cert2Pool: Pool | null = null;

export function getCertificationPool() {
  if (!certificationPool) {
    certificationPool = makePool(process.env.CERTIFICATION_DB_URL, "CERTIFICATION_DB_URL", SSL_CONFIG);
  }
  return certificationPool;
}

export function getCert2Pool() {
  if (!cert2Pool) {
    cert2Pool = makePool(process.env.CERT2_DB_URL, "CERT2_DB_URL", SSL_CONFIG);
  }
  return cert2Pool;
}
