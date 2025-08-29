export interface Room {
  id: string;
  type: string;
  floor: number;
  number: string;
  pricePerNight: number;
  description: string;
}

export interface Booking {
  id: string;
  checkIn: string; // ISO date
  checkOut: string; // ISO date
  createdAt: string;
  updatedAt: string;
  rooms: Room[];
}

export interface User {
  id: string;
  email: string;
  createdAt: string;
  lastLogin: string;
  role: "Customer" | "Admin" | "Receptionist";
  bookings: Booking[];
}

export interface RegisterDto {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface RegisterResponseDto {
  message: string;
  email: string;
  id: string;
}

