import { apiClient } from "@/api/client";
import { UserDto } from "./dto";
import { dtoToUser } from "./transform";
import { User } from "../domain";

// TODO: How do we fetch and handle errors in the best way? Look at others implementations
async function getMe(): Promise<User> {
  const res = await apiClient.get<UserDto>(`/users/me`);

  const userDto = res.data;
  return dtoToUser(userDto);
}

async function getUser(id: string): Promise<User> {
  const res = await apiClient.get<UserDto>(`/users/${id}`);
  const userDto = res.data;
  return dtoToUser(userDto);
}

async function getUsers(): Promise<User[]> {
  const res = await apiClient.get<UserDto[]>(`/users`);
  const users = res.data.map(dtoToUser);
  return users;
}

export default { getMe, getUser, getUsers };
