export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: "Customer" | "Admin" | "Receptionist";
  createdAt: Date;
  updatedAt: Date;
}
