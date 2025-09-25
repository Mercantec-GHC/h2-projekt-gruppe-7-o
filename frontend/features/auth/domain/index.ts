export type Session =
  | { isAuthenticated: false; user: null }
  | {
      isAuthenticated: true;
      user: {
        sub: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        role?: string;
      };
      exp: number;
    };
