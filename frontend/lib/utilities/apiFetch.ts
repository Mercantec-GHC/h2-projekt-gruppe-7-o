const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export function apiFetch(path: string, options?: RequestInit) {
  options = {
    ...options,
    credentials: "include",
  };
  return fetch(`${BASE_URL}${path}`, options);
}
