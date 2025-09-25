import { User } from "../domain";
import { UserDto } from "./dto";

export function dtoToUser(dto: UserDto): User {
  return {
    id: dto.id,
    email: dto.email,
    phone: dto.phone,
    firstName: dto.firstName,
    lastName: dto.lastName,
    //TODO: how do we type this properly / ensure we get the correct role? do we run some validation before returning?
    role: dto.roleName as "Customer" | "Admin" | "Receptionist",
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}
