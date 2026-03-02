const DEFAULT_PORT = 3001;
const DEFAULT_DEV_JWT_SECRET = "dev-secret-change-me";

const fail = (message: string): never => {
  throw new Error(message);
};

const normalizeBaseUrl = (value: string | undefined): string | undefined =>
  value?.trim().replace(/\/+$/, "") || undefined;

const parsePort = (value: string | undefined): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_PORT;
};

const parseOrigins = (value: string | undefined): string[] =>
  (value ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const parseBoolean = (
  value: string | undefined,
  defaultValue: boolean
): boolean => {
  if (value === undefined) {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "true") {
    return true;
  }
  if (normalized === "false") {
    return false;
  }

  return defaultValue;
};

const NODE_ENV = process.env.NODE_ENV ?? "development";
const isProduction = NODE_ENV === "production";
const PORT = parsePort(process.env.PORT);
const JWT_SECRET =
  process.env.JWT_SECRET?.trim() ||
  (isProduction
    ? fail("JWT_SECRET is required when NODE_ENV=production")
    : DEFAULT_DEV_JWT_SECRET);
const PUBLIC_BASE_URL =
  normalizeBaseUrl(process.env.PUBLIC_BASE_URL) ||
  (isProduction
    ? fail("PUBLIC_BASE_URL is required when NODE_ENV=production")
    : `http://localhost:${PORT}`);
const CORS_ORIGINS = parseOrigins(
  process.env.CORS_ORIGINS ??
    process.env.FRONTEND_ORIGINS ??
    process.env.FRONTEND_ORIGIN
);
const SEED_DEMO_USERS = parseBoolean(process.env.SEED_DEMO_USERS, !isProduction);

export const env = {
  NODE_ENV,
  isProduction,
  PORT,
  JWT_SECRET,
  PUBLIC_BASE_URL,
  CORS_ORIGINS,
  SEED_DEMO_USERS,
} as const;
