"use client";

import LoginForm from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center content-container-y">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <LoginForm />
        <p className="mt-4 text-center text-gray-500 text-sm">
          Don't have an account?{" "}
          <a
            href="/register"
            className="font-bold hover:underline hover:opacity-80"
          >
            Create account
          </a>
        </p>
      </div>
    </div>
  );
}
