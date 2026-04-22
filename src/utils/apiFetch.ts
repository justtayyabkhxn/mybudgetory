export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    ...(options.body && !(options.body instanceof FormData)
      ? { "Content-Type": "application/json" }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: options.signal ?? controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}
