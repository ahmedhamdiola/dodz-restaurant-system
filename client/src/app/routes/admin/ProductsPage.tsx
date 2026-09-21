import { useMemo, useState } from "react";
import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline";
import { ADMIN_PRODUCTS } from "../../../features/admin/data";
import PageHeader from "../../../features/admin/components/PageHeader";
import StatusBadge from "../../../features/admin/components/StatusBadge";

const formatMoney = (price: number) =>
    `EGP ${price.toLocaleString("en-US", { maximumFractionDigits: 1 })}`;

const ProductsPage = () => {
    const [query, setQuery] = useState("");

    const products = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return ADMIN_PRODUCTS;
        return ADMIN_PRODUCTS.filter(
            (product) =>
                product.name.toLowerCase().includes(normalized) ||
                product.category.toLowerCase().includes(normalized)
        );
    }, [query]);

    return (
        <div>
            <PageHeader
                title="Products"
                subtitle={`${products.length} menu items managed across all branches.`}
                action={
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 via-red-500 to-red-700 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
                    >
                        <PlusIcon className="h-4 w-4" />
                        Add Product
                    </button>
                }
            />

            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="flex items-center gap-3 border-b border-border p-4">
                    <label className="relative flex-1 sm:max-w-xs">
                        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search products…"
                            className="w-full rounded-lg border border-border bg-primary py-2 pl-9 pr-3 text-sm text-secondary outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/30"
                        />
                    </label>
                    <span className="hidden text-xs text-muted-foreground sm:block">
                        {products.length} result{products.length !== 1 && "s"}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px] text-sm">
                        <thead>
                            <tr className="text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                                <th className="px-4 py-3 font-semibold">Product</th>
                                <th className="px-4 py-3 font-semibold">Category</th>
                                <th className="px-4 py-3 font-semibold">Price</th>
                                <th className="px-4 py-3 font-semibold">In Stock</th>
                                <th className="px-4 py-3 font-semibold">Sold</th>
                                <th className="px-4 py-3 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {products.map((product) => (
                                <tr key={product.id} className="text-secondary transition-colors hover:bg-muted/50">
                                    <td className="px-4 py-3 font-medium">{product.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {product.category}
                                    </td>
                                    <td className="px-4 py-3 font-semibold whitespace-nowrap">
                                        {formatMoney(product.price)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={
                                                product.stock > 20
                                                    ? "text-emerald-600 dark:text-emerald-400"
                                                    : product.stock === 0
                                                      ? "text-red-600 dark:text-red-400"
                                                      : "text-amber-600 dark:text-amber-400"
                                            }
                                        >
                                            {product.stock}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {product.sold.toLocaleString("en-US")}
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={product.status} />
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                                        No products match “{query}”.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;