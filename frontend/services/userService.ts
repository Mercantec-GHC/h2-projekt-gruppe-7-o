import { User } from "@/app/lib/types/user";

export async function getCurrentUser(): Promise<User | null> {
  try {
    const res = await fetch("https://localhost:7087/api/users/me", {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}
