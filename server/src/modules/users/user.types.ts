export interface UserInterface {
    id: number,
    name: string,
    email: string,
    phone: string | null,
    provider: string,
    providerID: string | null,
    role: string,
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
    avatar: string | null,
    gender: string | null,
    birthdate: Date | null,
    isEmailVerified: boolean,
    isPhoneVerified: boolean,
    isActive: boolean,
}

// Internal shape returned only by repository.getUserByEmailWithPassword; never exposed through controllers
export interface UserAuthInterface extends UserInterface {
    passwordHash: string | null,
}