"use client";

import { useEffect, useState } from "react";
import { User } from "@/app/lib/types/user";
import { withAuth } from "@/app/lib/withAuth";
import LogoutButton from "@/app/components/LogoutButton";

function UsersPageComponent() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch("https://localhost:7087/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Fejl ved hentning af bruger");
        const data: User = await res.json();
        setUser(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 text-lg animate-pulse">Indlæser...</p>
      </div>
    );
  if (error)
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 text-lg font-semibold">Fejl: {error}</p>
      </div>
    );
  if (!user)
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 text-lg">Ingen bruger fundet.</p>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Min profil</h1>
        <LogoutButton />
      </div>

      {/* Bruger info kort */}
      <div className="bg-white rounded-lg shadow p-6 mb-8 border border-gray-200">
        <p className="mb-2"><span className="font-semibold">Email:</span> {user.email}</p>
        <p className="mb-2"><span className="font-semibold">Rolle:</span> {user.role}</p>
        <p className="mb-2"><span className="font-semibold">Oprettet:</span> {new Date(user.createdAt).toLocaleString()}</p>
        <p><span className="font-semibold">Sidst login:</span> {new Date(user.lastLogin).toLocaleString()}</p>
      </div>

      {/* Bookinger */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Bookinger</h2>
      {user.bookings.length === 0 ? (
        <p className="text-gray-500">Ingen bookinger.</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {user.bookings.map((b) => (
            <li
              key={b.id}
              className="p-4 bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition"
            >
              <p><span className="font-semibold">Check-in:</span> {new Date(b.checkIn).toLocaleDateString()}</p>
              <p><span className="font-semibold">Check-out:</span> {new Date(b.checkOut).toLocaleDateString()}</p>
              <p><span className="font-semibold">Værelser:</span> {b.rooms.map((r) => r.type).join(", ")}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default withAuth(UsersPageComponent);
