export const formatPrice = (value: number): string =>
    `EGP ${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;