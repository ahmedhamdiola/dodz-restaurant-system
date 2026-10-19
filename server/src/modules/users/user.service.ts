import bcrypt from "bcryptjs";
import { UserRepository } from "./user.repository.js";
import { UserInterfaceWithoutID } from "./user.types.js";

const BCRYPT_ROUNDS = 10;

export const UserService = () => {
    const repository = UserRepository();

    const getUserByID = async (id: number) => {
        if (!id || id <= 0) {
            return null;
        }

        return repository.getUserByID(id);
    }

    const getUserByEmail = async (email: string) => {
        if (!email) {
            return null;
        }

        return repository.getUserByEmail(email);
    }

    const getUsers = async (limit: number, offset: number) => {
        return repository.getUsers(limit, offset);
    }

    const createUser = async (user: UserInterfaceWithoutID) => {
        const existingByEmail = await repository.getUserByEmail(user.email);
        if (existingByEmail) {
            return null; // 409 conflict
        }

        if (user.phone) {
            const existingByPhone = await repository.getUserByPhone(user.phone);
            if (existingByPhone) {
                return null;
            }
        }

        // Admin-created accounts may carry a password (branch-admin logins made
        // from the dashboard); signup never reaches this path.
        const passwordHash = user.password ? await bcrypt.hash(user.password, BCRYPT_ROUNDS) : null;
        return repository.createUser(user, passwordHash);
    }

    const updateUser = async (id: number, user: UserInterfaceWithoutID) => {
        const existingUser = await repository.getUserByID(id);
        if (!existingUser) {
            return null;
        }

        if (user.email && user.email !== existingUser.email) {
            const emailUser = await repository.getUserByEmail(user.email);
            if (emailUser && emailUser.id !== id) {
                return false; // duplicate email → 409 conflict
            }
        }

        if (user.phone && user.phone !== existingUser.phone) {
            const phoneUser = await repository.getUserByPhone(user.phone);
            if (phoneUser && phoneUser.id !== id) {
                return false;
            }
        }

        return repository.updateUser(id, user);
    }

    const deleteUser = async (id: number) => {
        const existingUser = await repository.getUserByID(id);
        if (!existingUser) {
            return null;
        }

        return repository.deleteUser(id);
    }

    return {
        getUserByID,
        getUserByEmail,
        getUsers,
        createUser,
        updateUser,
        deleteUser,
    };
};