/**
 * Read a required environment variable. Throws at startup if it is missing or
 * empty, so secrets never fall back to hardcoded values.
 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is not set`);
  }
  return value;
}
