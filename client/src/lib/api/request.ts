// Browsers must use the public API URL (reachable from the host). Server-side
// code (SSR) can use the internal API_URL, e.g. http://tampit-server:4000 in Docker.
const API =
  typeof window === 'undefined'
    ? (process.env.API_URL ?? 'http://localhost:4000')
    : (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000');

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const isFormData = init?.body instanceof FormData;
  const res = await fetch(`${API}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(typeof init?.headers === 'object' ? init.headers : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const json = await res.json();
  if (!res.ok && res.status !== 204) throw new Error(JSON.stringify(json));
  if (res.status === 204) return undefined as T;
  return json;
}

export const json = (body: unknown): RequestInit => ({
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});
