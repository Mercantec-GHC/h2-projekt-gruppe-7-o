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
