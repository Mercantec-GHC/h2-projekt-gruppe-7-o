import { RegisterDto, RegisterResponseDto } from "@/app/lib/types/user";

export async function registerUser(data: RegisterDto): Promise<RegisterResponseDto> {
  const res = await fetch("https://localhost:7087/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.message || "Registration failed");
  }

  return res.json();
}
