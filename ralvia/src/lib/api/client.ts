const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function getCsrfToken(): Promise<string> {
  await fetch(`${BACKEND_URL}/sanctum/csrf-cookie`, {
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("XSRF-TOKEN="))
    ?.split("=")[1];

  if (!token) {
    throw new Error("Could not get CSRF token");
  }

  return decodeURIComponent(token);
}

export async function apiFetch(
  url: string,
  options: RequestInit = {}
) {
  const method = options.method?.toUpperCase() ?? "GET";

  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  if (
    method !== "GET" &&
    method !== "HEAD"
  ) {
    const csrfToken = await getCsrfToken();

    headers.set("X-XSRF-TOKEN", csrfToken);
  }

  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers,
  });

  return response;
}