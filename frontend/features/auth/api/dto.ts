// This is the request to our own NEXT API that acts as a proxy to the backend API
export interface LoginRequestDto {
  usernameOrEmail: string;
  password: string;
}

// This is the response from our own NEXT API that acts as a proxy to the backend API

export interface LoginResponseDto {
  success: boolean;
  error?: string;
}

export interface RegisterRequestDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponseDto {
  success: boolean;
  error?: string;
}
