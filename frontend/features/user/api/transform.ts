import { User, UserRole } from "../domain";
import { UserDto } from "./dto";

export function dtoToUser(dto: UserDto): User {
  return {
    id: dto.id,
    email: dto.email,
    phone: dto.phone,
    firstName: dto.firstName,
    lastName: dto.lastName,
    role: dto.roleName as UserRole,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}
