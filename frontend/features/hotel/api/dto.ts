export interface HotelResponseDto {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  streetName: string;
  streetNumber: string;
  floor?: string;
  city: string;
  zipCode: string;
  country: string;
  email: string;
  phoneNumber: string;
}
