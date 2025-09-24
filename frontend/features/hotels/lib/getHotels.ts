import { apiFetch } from "@/lib/utilities/apiFetch";
import { Hotel } from "../types/Hotel";

// TODO: How do we fetch and handle errors in the best way? Look at others implementations
export async function getHotels(): Promise<Hotel[]> {
  const res = await apiFetch(`/hotels`);
  if (!res.ok) throw new Error("Something went wrong fetching hotels");
  return await res.json();
}
