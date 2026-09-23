import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthRepository } from "./auth.repository.js";
import { UserRepository } from "../users/user.repository.js";
import { AuthUser, LoginResult, PublicUser, sanitizeUser, SignupResult } from "./auth.types.js";

const BCRYPT_ROUNDS = 12;

// Signs a JWT with payload { sub: user.id, role: user.role }
export const signToken = (user: AuthUser): string => {
    return jwt.sign(
        { sub: String(user.id), role: user.role },
        process.env.JWT_SECRET as string,
        {
            algorithm: "HS256",
            expiresIn: (process.env.JWT_EXPIRES_IN ?? "7d") as jwt.SignOptions["expiresIn"],
        },
    );
};

export const AuthService = () => {
    const repository = AuthRepository();
    const usersRepository = UserRepository();

    const signup = async (params: { name: string; email: string; phone: string | null; password: string; }): Promise<SignupResult> => {
        const passwordHash = await bcrypt.hash(params.password, BCRYPT_ROUNDS);

        const row = await repository.createUserWithPassword({
            name: params.name,
            email: params.email,
            phone: params.phone,
            passwordHash,
        });

        if (!row) {
            return { status: "conflict" }; // duplicate email/phone → 409
        }

        const user: PublicUser = sanitizeUser(row);
        return { status: "success", token: signToken({ id: user.id, role: user.role }), user };
    };

    const login = async (params: { email: string; password: string; }): Promise<LoginResult> => {
        const row = await usersRepository.getUserByEmailWithPassword(params.email);

        // Same response for unknown email and wrong password so we never leak which was wrong
        if (!row || !row.password_hash) {
            return { status: "invalid_credentials" };
        }

        const passwordMatches = await bcrypt.compare(params.password, row.password_hash);
        if (!passwordMatches) {
            return { status: "invalid_credentials" };
        }

        if (!row.is_active) {
            return { status: "inactive" };
        }

        await repository.updateLastLoginAt(row.id);

        const user: PublicUser = sanitizeUser(row);
        return { status: "success", token: signToken({ id: user.id, role: user.role }), user };
    };

    const me = async (id: number) => {
        const row = await repository.getPublicUserByID(id);
        if (!row) {
            return null;
        }
        return sanitizeUser(row);
    };

    return { signup, login, me };
};