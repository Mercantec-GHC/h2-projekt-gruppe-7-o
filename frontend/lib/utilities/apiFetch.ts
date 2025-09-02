const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export function apiFetch(path: string, options?: RequestInit) {
  // TODO: not sure if this is the best way to do this. We need to have protected routes as well somehow
  const JWT_TOKEN = localStorage.getItem("authToken");
  if (JWT_TOKEN) {
    options = {
      ...options,
      headers: {
        ...options?.headers,
        Authorization: `Bearer ${JWT_TOKEN}`,
      },
    };
  }

  return fetch(`${BASE_URL}${path}`, options);
}
