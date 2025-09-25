import { apiClient } from "@/api/client";
import {
  LoginRequestDto,
  LoginResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
} from "./dto";

// This calls our own NextJS API that works as a proxy to our .NET API
export async function login({
  emailOrUsername,
  password,
}: LoginRequestDto): Promise<LoginResponseDto> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      emailOrUsername,
      password,
    }),
  });

  if (!res.ok) throw new Error("Invalid credentials");

  return { success: true };
}

// This calls our own NextJS API that works as a proxy to our .NET API

export async function logout() {
  const res = await fetch("/api/auth/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  // TODO: what error to throw here?
  if (!res.ok) throw new Error("Something went wrong");

  return { success: true };
}

// This calls our own NextJS API that works as a proxy to our .NET API
export async function register({
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
}: RegisterRequestDto): Promise<RegisterResponseDto> {
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

// This is the NextJS API function that sends the registration request to the .NET API
export async function registerUserNext(
  data: RegisterRequestDto,
): Promise<RegisterResponseDto> {
  // TODO: add type with response from .NET API
  const res = await apiClient.post("/auth/register", data);
  // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(data),
  // });

  if (res.data.error) {
    const err = res.data.error;
    throw new Error(err?.message || "Registration failed");
  }

  return res.data;
}

export default { login, logout, register, registerUserNext };
