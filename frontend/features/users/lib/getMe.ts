import { User } from "@/lib/types/user";
import { apiFetch } from "@/lib/utilities/apiFetch";

// TODO: How do we fetch and handle errors in the best way? Look at others implementations
export async function getMe(): Promise<User> {
  const res = await apiFetch(`/users/me`);
  if (!res.ok) throw new Error("Fejl ved hentning af brugere");
  return await res.json();
}
