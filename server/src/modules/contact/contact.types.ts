export interface ContactInterface {
    id: number,
    name: string,
    email: string,
    phone: string,
    subject: string,
    message: string,
    createdAt: Date,
}

export interface ContactInterfaceWithoutID {
    name: string,
    email: string,
    phone: string,
    subject: string,
    message: string,
}