export interface CategoryInterface {
    id: number,
    name: string,
    createdAt: Date,
    updatedAt: Date,
    isDeleted: boolean,
    coverImage: string,
    iconImage: string,
}

export interface CategoryInput {
    name: string,
    slug: string,
    coverImage: string,
    iconImage: string,
}