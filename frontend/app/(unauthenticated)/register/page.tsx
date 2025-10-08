import RegisterForm from "@/features/auth/components/RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center content-container-y">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Opret konto</h1>
        <RegisterForm />
        <p className="mt-4 text-center text-gray-500 text-sm">
          Har du allerede en konto? {""}
          <Link
            href="/login"
            className="font-bold hover:underline hover:opacity-80"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
