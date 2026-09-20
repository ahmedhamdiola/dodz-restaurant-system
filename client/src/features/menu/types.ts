export interface MenuCategory {
    id: number;
    slug: string;
    name: string;
    image: string;
}

export interface MenuProduct {
    id: number;
    categorySlug: string;
    name: string;
    description: string;
    price: number;
    image: string;
    isCustomizable?: boolean;
}