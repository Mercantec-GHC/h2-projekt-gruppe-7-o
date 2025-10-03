import { UserRole } from "@/features/user/domain";

export type Session =
  | { isAuthenticated: false; user: null }
  | {
      isAuthenticated: true;
      user: {
        // TODO: id and sub is the same thing, we should remove one of them (probalby sub)
        sub: string;
        id: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        role?: UserRole;
      };
      exp: number;
    };
