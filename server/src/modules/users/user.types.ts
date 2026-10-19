export interface UserInterface {
    id: number,
    name: string,
    email: string,
    phone: string | null,
    provider: string,
    providerID: string | null,
    role: string,
    branchId: number | null,
    avatar: string | null,
    gender: string | null,
    birthdate: Date | null,
    isEmailVerified: boolean,
    isPhoneVerified: boolean,
    isActive: boolean,
    lastLoginAt: Date | null,
    isDeleted: boolean,
    createdAt: Date,
    updatedAt: Date,
}

export interface UserInterfaceWithoutID {
    name: string,
    email: string,
    phone: string | null,
    provider: string,
    providerID: string | null,
    role: string,
    // undefined = "leave as-is" (partial update); null = "clear". Required by
    // the users_branch_admin_requires_branch_check constraint when role is
    // 'branch_admin'.
    branchId?: number | null,
    avatar: string | null,
    gender: string | null,
    birthdate: Date | null,
    isEmailVerified: boolean,
    isPhoneVerified: boolean,
    isActive: boolean,
    // Admin-created accounts only (never set by signup): lets the dashboard
    // mint a branch-admin that can log in with a password immediately.
    password?: string | null,
}

// Internal shape returned only by repository.getUserByEmailWithPassword; never exposed through controllers
export interface UserAuthInterface extends UserInterface {
    passwordHash: string | null,
}