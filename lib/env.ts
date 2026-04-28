type Key =
  | "SUPABASE_URL"
  | "SUPABASE_ANON_KEY"
  | "SUPABASE_SERVICE_ROLE_KEY"
  | "APP_PASSWORD"
  | "SESSION_SECRET";

export function readEnv(key: Key): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

export const env = {
  get SUPABASE_URL() {
    return readEnv("SUPABASE_URL");
  },
  get SUPABASE_ANON_KEY() {
    return readEnv("SUPABASE_ANON_KEY");
  },
  get SUPABASE_SERVICE_ROLE_KEY() {
    return readEnv("SUPABASE_SERVICE_ROLE_KEY");
  },
  get APP_PASSWORD() {
    return readEnv("APP_PASSWORD");
  },
  get SESSION_SECRET() {
    return readEnv("SESSION_SECRET");
  },
};
