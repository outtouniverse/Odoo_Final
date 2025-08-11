const API_URL = "http://localhost:3000/api";

export function getToken() {
  return localStorage.getItem("accessToken");
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...options, headers, credentials: "include" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "API error");
  return data;
}