export const menuKeys = {
    categories: ["menu", "categories"] as const,
    products: ["menu", "products"] as const,
    product: (id: number) => [...menuKeys.products, "detail", id] as const,
    topDeals: ["menu", "top-deals"] as const,
};