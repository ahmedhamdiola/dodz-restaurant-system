export interface ProfileUser {
    name: string;
    email: string;
    phone: string | null;
    createdAt: string;
}

export interface PastOrder {
    id: number | string;
    date: string;
    branchName: string;
    items: string;
    total: number;
    status: string;
}