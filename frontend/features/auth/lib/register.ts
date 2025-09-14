interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterResponse {
  success: boolean;
  error?: string;
}

export async function register({
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
}: RegisterRequest): Promise<RegisterResponse> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    }),
  });

  if (!res.ok) throw new Error("Invalid credentials");

  return { success: true };
}
