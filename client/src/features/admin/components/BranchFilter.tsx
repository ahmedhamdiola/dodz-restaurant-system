import { Squares2X2Icon } from "@heroicons/react/24/outline";
import type { Branch, BranchOrderCount } from "../types";

interface BranchFilterProps {
    branches: Branch[];
    counts: BranchOrderCount[];
    selectedId?: number;
    onSelect: (branchId?: number) => void;
    compact?: boolean;
}

const BranchFilter = ({ branches, counts, selectedId, onSelect, compact = false }: BranchFilterProps) => {
    const countOf = (branchId: number) => counts.find((count) => count.branchId === branchId)?.totalOrders ?? 0;
    const allCount = counts.reduce((sum, count) => sum + count.totalOrders, 0);

    const pillClass = (isActive: boolean) =>
        `rounded-full border font-semibold uppercase tracking-wide transition-colors duration-200 ${
            isActive
                ? "border-brand bg-brand text-white"
                : "border-border bg-card text-muted-foreground hover:border-brand/40 hover:text-secondary"
        } ${compact ? "px-3 py-1 text-[11px]" : "px-4 py-2 text-xs"}`;

    return (
        <div className={`flex flex-wrap items-center gap-2 ${compact ? "" : "mb-6"}`}>
            {!compact && (
                <span className="mr-1 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    <Squares2X2Icon className="h-4 w-4" />
                    Branch
                </span>
            )}

            <button
                type="button"
                onClick={() => onSelect(undefined)}
                className={pillClass(selectedId === undefined)}
            >
                All branches
                <span className="ml-1 opacity-70">{allCount}</span>
            </button>

            {branches.map((branch) => {
                const isActive = selectedId === branch.id;
                return (
                    <button
                        key={branch.id}
                        type="button"
                        onClick={() => onSelect(isActive ? undefined : branch.id)}
                        className={pillClass(isActive)}
                    >
                        {branch.name.replace(/^DODZ\s*/i, "")}
                        <span className="ml-1 opacity-70">{countOf(branch.id)}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default BranchFilter;