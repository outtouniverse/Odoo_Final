const API_URL = "http://localhost:3000/api";

export function getToken() {
  const t = localStorage.getItem("accessToken");
  if (t) return t;
  try {
    const raw = localStorage.getItem("globetrotter.auth");
    if (!raw) return null as any;
    const parsed = JSON.parse(raw);
    return parsed?.token || null;
  } catch {
    return null as any;
  }
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...options, headers, credentials: "include" });
  let data: any = null;
  try {
    data = await res.json();
  } catch (_) {
    // ignore JSON parse errors
  }
  if (!res.ok) {
    const err: any = new Error((data && data.message) || `API error (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}