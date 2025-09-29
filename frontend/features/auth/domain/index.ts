import { UserRole } from "@/features/user/domain";

export type Session =
  | { isAuthenticated: false; user: null }
  | {
      isAuthenticated: true;
      user: {
        sub: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        role?: UserRole;
      };
      exp: number;
    };
