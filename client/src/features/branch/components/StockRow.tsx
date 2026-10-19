import { useState } from "react";
import { useUpdateStock } from "../hooks/useBranchStock";

export interface StockItem {
    id: number;
    name: string;
    description: string;
    price: number;
    isAvailable: boolean;
    quantity: number;
    lowStockThreshold: number;
}

interface StockRowProps {
    branchId: number;
    item: StockItem;
}

const LEVEL_STYLES = {
    out: "bg-red-500/10 text-red-600 dark:text-red-400",
    low: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    ok: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
} as const;

const LEVEL_TEXT = { out: "Out", low: "Low", ok: "OK" } as const;

const StockRow = ({ branchId, item }: StockRowProps) => {
    // Seeded from the server value. The parent remounts the row (via `key`) whenever
    // the saved quantity/threshold changes, so no syncing effect is needed here.
    const [quantity, setQuantity] = useState(String(item.quantity ?? ""));
    const [threshold, setThreshold] = useState(String(item.lowStockThreshold ?? ""));
    const { mutate: saveStock, isPending } = useUpdateStock();

    const parsedQuantity = Number(quantity);
    const parsedThreshold = Number(threshold);
    const quantityInvalid =
        quantity === "" || !Number.isInteger(parsedQuantity) || parsedQuantity < 0;
    // An empty/partial threshold simply means "leave it as-is": the server keeps
    // the stored value when the field is omitted, so it never blocks a quantity save.
    const thresholdValid =
        threshold !== "" && Number.isInteger(parsedThreshold) && parsedThreshold >= 0;

    const level = quantityInvalid
        ? "ok"
        : parsedQuantity <= 0
          ? "out"
          : parsedQuantity <= (thresholdValid ? parsedThreshold : item.lowStockThreshold)
            ? "low"
            : "ok";

    const dirty =
        !quantityInvalid &&
        (parsedQuantity !== item.quantity || (thresholdValid && parsedThreshold !== item.lowStockThreshold));

    const handleSave = () => {
        if (quantityInvalid || !dirty) return;
        saveStock({
            branchId,
            productId: item.id,
            update: thresholdValid
                ? { quantity: parsedQuantity, lowStockThreshold: parsedThreshold }
                : { quantity: parsedQuantity },
        });
    };

    return (
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40">
            <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium text-secondary">{item.name}</span>
                <span className="text-xs text-muted-foreground">
                    EGP {item.price.toLocaleString("en-US")}
                    {!item.isAvailable && " · hidden from the storefront"}
                </span>
            </div>

            <span
                className={`hidden rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide sm:inline ${LEVEL_STYLES[level]}`}
            >
                {LEVEL_TEXT[level]}
            </span>

            <label className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Qty</span>
                <input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    className="w-20 rounded-lg border border-border bg-primary px-3 py-2 text-sm text-secondary outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                />
            </label>

            <label className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Alert at</span>
                <input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={threshold}
                    onChange={(event) => setThreshold(event.target.value)}
                    className="w-20 rounded-lg border border-border bg-primary px-3 py-2 text-sm text-secondary outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                />
            </label>

            <button
                type="button"
                disabled={!dirty || isPending}
                onClick={handleSave}
                className="rounded-lg bg-gradient-to-r from-red-600 via-red-500 to-red-700 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
                {isPending ? "Saving…" : "Save"}
            </button>
        </div>
    );
};

export default StockRow;
