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

export type UserRole = "Customer" | "Admin" | "Receptionist" | "HousekeepingManager" | "Cleaner";

export type DashboardRole = Exclude<UserRole, "Customer">;
