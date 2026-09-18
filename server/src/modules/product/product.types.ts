export interface ProductInterface {
    id: number,
    name: string,
    description: string,
    price: number,
    image: string,
    categoryID: number,
    createdAt: Date,
    updatedAt: Date,
    isDeleted: boolean, // means it's deleted globally at all branches
    soldAmount: number, // number of peices sold
    isAvailable: boolean, // means it's available in the BRANCH
    isCustomizable: boolean, // means it can be customized by choosing options
}

export interface ProductInterfaceWithoutID {
    name: string,
    description: string,
    price: number,
    image: string,
    categoryID: number,
    isDeleted: boolean, // means it's deleted globally at all branches
    isAvailable: boolean, // means it's available in the BRANCH
    isCustomizable: boolean, // means it can be customized by choosing options
}