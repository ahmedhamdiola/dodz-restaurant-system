import { api, unwrap } from "../../../lib/api";
import type { AdminUser, AdminUserRole, CreateAdminUserInput } from "../types";

interface UserDTO {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: AdminUserRole;
    branch_id: number | null;
    is_active: boolean;
    created_at: string;
}

interface ErrorLike {
    response?: { data?: { message?: string } };
    message?: string;
}

const toError = (err: unknown): never => {
    if (err instanceof Error) {
        throw err;
    }
    const like = err as ErrorLike;
    if (like.response?.data?.message) {
        const error = new Error(like.response.data.message) as Error & ErrorLike;
        error.response = like.response;
        throw error;
    }
    throw err;
};

const mapUser = (user: UserDTO): AdminUser => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    branchId: user.branch_id,
    isActive: user.is_active,
    createdAt: user.created_at,
});

export const usersApi = {
    getUsers(): Promise<AdminUser[]> {
        return unwrap<UserDTO[]>(api.get("/users", { params: { limit: 200 } }))
            .then((users) => users.map(mapUser))
            .catch(toError);
    },

    createUser(input: CreateAdminUserInput): Promise<AdminUser> {
        return unwrap<UserDTO>(api.post("/users", input)).then(mapUser).catch(toError);
    },
};
