export interface Hotel {
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
  phoneNumber: string;
}
