export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = "Admin" | "Cleaning" | "Receptionist" | "Customer";

export type DashboardRole = Exclude<UserRole, "Customer">;
