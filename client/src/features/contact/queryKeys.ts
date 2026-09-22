export const contactKeys = {
    all: ["contacts"] as const,
    list: () => [...contactKeys.all, "list"] as const,
    detail: (id: number) => [...contactKeys.all, "detail", id] as const,
};