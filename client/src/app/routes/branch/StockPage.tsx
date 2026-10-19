import { useMemo, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import StockRow from "../../../features/branch/components/StockRow";
import { useBranchStock } from "../../../features/branch/hooks/useBranchStock";
import { stockLevel } from "../../../features/branch/types";
import { useAuth } from "../../../features/auth/hooks/useAuth";

type LevelFilter = "all" | "low" | "out";

const FILTERS: Array<{ value: LevelFilter; label: string }> = [
    { value: "all", label: "All items" },
    { value: "low", label: "Running low" },
    { value: "out", label: "Out of stock" },
];

const StockPage = () => {
    const { user } = useAuth();
    const branchId = user?.branchId ?? null;
    const { data: items = [], isLoading, isError, refetch } = useBranchStock(branchId);

    const [query, setQuery] = useState("");
    const [level, setLevel] = useState<LevelFilter>("all");

    const counts = useMemo(
        () => ({
            low: items.filter((item) => stockLevel(item) === "low").length,
            out: items.filter((item) => stockLevel(item) === "out").length,
        }),
        [items],
    );

    const grouped = useMemo(() => {
        const term = query.trim().toLowerCase();
        const filtered = items.filter((item) => {
            if (level !== "all" && stockLevel(item) !== level) return false;
            if (term && !item.name.toLowerCase().includes(term)) return false;
            return true;
        });

        const groups = new Map<string, typeof filtered>();
        filtered.forEach((item) => {
            const bucket = groups.get(item.categoryName) ?? [];
            bucket.push(item);
            groups.set(item.categoryName, bucket);
        });
        return Array.from(groups.entries());
    }, [items, query, level]);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Menu items</p>
                    <p className="mt-1 text-2xl font-bold text-secondary">{items.length}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Running low</p>
                    <p className="mt-1 text-2xl font-bold text-amber-500">{counts.low}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Out of stock</p>
                    <p className="mt-1 text-2xl font-bold text-red-500">{counts.out}</p>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
                    <div className="relative min-w-56 flex-1">
                        <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search the menu…"
                            className="w-full rounded-lg border border-border bg-primary py-2 pr-3 pl-9 text-sm text-secondary outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                        />
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {FILTERS.map((filter) => (
                            <button
                                key={filter.value}
                                type="button"
                                onClick={() => setLevel(filter.value)}
                                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                                    level === filter.value
                                        ? "bg-brand text-white"
                                        : "bg-muted text-muted-foreground hover:bg-muted/70"
                                }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div className="space-y-2 p-4">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="h-14 animate-pulse rounded-lg bg-muted" />
                        ))}
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center gap-3 p-10">
                        <p className="text-sm text-muted-foreground">Could not load your stock.</p>
                        <button
                            type="button"
                            onClick={() => refetch()}
                            className="rounded-lg bg-gradient-to-r from-red-600 via-red-500 to-red-700 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white"
                        >
                            Try again
                        </button>
                    </div>
                ) : grouped.length === 0 ? (
                    <p className="p-10 text-center text-sm text-muted-foreground">Nothing matches that search.</p>
                ) : (
                    grouped.map(([categoryName, categoryItems]) => (
                        <section key={categoryName}>
                            <h2 className="border-b border-border bg-muted/40 px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                {categoryName}
                            </h2>
                            <div className="divide-y divide-border">
                                {categoryItems.map((item) => (
                                    <StockRow
                                        key={`${item.id}:${item.quantity}:${item.lowStockThreshold}`}
                                        branchId={branchId!}
                                        item={item}
                                    />
                                ))}
                            </div>
                        </section>
                    ))
                )}
            </div>
        </div>
    );
};

export default StockPage;
