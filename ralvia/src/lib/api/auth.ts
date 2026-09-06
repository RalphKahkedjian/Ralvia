import type { LoginData, RegisterData, User } from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type RegisterResponse = {
  message: string;
  user: User;
};

type LoginResponse = {
  message: string;
  user: User;
};

export async function register(
  data: RegisterData
): Promise<RegisterResponse> {
  // 1. Get CSRF cookie first
  await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/sanctum/csrf-cookie`,
    {
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    }
  );

  // 2. Read XSRF-TOKEN cookie
  const xsrfToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("XSRF-TOKEN="))
    ?.split("=")[1];

  if (!xsrfToken) {
    throw new Error("Could not get CSRF token");
  }

  // 3. Register
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-XSRF-TOKEN": decodeURIComponent(xsrfToken),
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Registration failed");
  }

  return result;
}

export async function login(
  data: LoginData
): Promise<LoginResponse> {
  // 1. Ask Laravel to set the XSRF-TOKEN cookie
  await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/sanctum/csrf-cookie`,
    {
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    }
  );

  // 2. Read the XSRF-TOKEN cookie
  const xsrfToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("XSRF-TOKEN="))
    ?.split("=")[1];

  if (!xsrfToken) {
    throw new Error("Could not get CSRF token");
  }

  // 3. Send it back in X-XSRF-TOKEN
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-XSRF-TOKEN": decodeURIComponent(xsrfToken),
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Login failed");
  }

  return result;
}

export async function logout(): Promise<void> {
  await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/sanctum/csrf-cookie`,
    {
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    }
  );

  const xsrfToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("XSRF-TOKEN="))
    ?.split("=")[1];

  if (!xsrfToken) {
    throw new Error("Could not get CSRF token");
  }

  const response = await fetch(`${API_URL}/logout`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "X-XSRF-TOKEN": decodeURIComponent(xsrfToken),
    },
  });

  if (!response.ok) {
    throw new Error("Logout failed");
  }
}