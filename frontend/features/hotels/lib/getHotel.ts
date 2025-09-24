import { User } from "@/features/users/types/user";
import { apiFetch } from "@/lib/utilities/apiFetch";
import { Hotel } from "../types/Hotel";

// TODO: How do we fetch and handle errors in the best way? Look at others implementations
export async function getHotel(id: string): Promise<Hotel> {
  const res = await apiFetch(`/hotels/${id}`);
  if (!res.ok) throw new Error(`Something went wrong the hotel with id ${id}`);

  console.log(res);
  return await res.json();
}
