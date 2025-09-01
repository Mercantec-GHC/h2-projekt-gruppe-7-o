const TOKEN_KEY = "authToken";

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function login(email: string, password: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Login fejlede");
  }

  const token = await res.text();
  setToken(token);
  return token;
}

export function logout() {
  removeToken();
  window.location.href = "/login";
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
