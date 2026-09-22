import { createContext } from "react";
import type { AuthUser, LoginValues, SignupValues } from "./types";

export interface AuthContextValue {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isBootstrapping: boolean;
    login: (values: LoginValues) => Promise<AuthUser>;
    signup: (values: SignupValues) => Promise<AuthUser>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);