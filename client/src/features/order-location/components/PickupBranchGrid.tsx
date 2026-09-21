import { ClockIcon } from "@heroicons/react/24/outline"
import { STORE_LOCATIONS } from "../../store-locations/data"
import type { StoreLocation } from "../../store-locations/types"

interface PickupBranchGridProps {
    selectedBranch: StoreLocation | null
    onSelect: (branch: StoreLocation) => void
}

const PickupBranchGrid = ({ selectedBranch, onSelect }: PickupBranchGridProps) => {
    return (
        <div className="grid shrink-0 gap-2 sm:grid-cols-2">
            {STORE_LOCATIONS.map((branch) => {
                const isActive = selectedBranch?.id === branch.id

                return (
                    <button
                        key={branch.id}
                        type="button"
                        onClick={() => onSelect(branch)}
                        className={`
                            flex flex-col gap-1 rounded-lg border px-4 py-3 text-left transition-all duration-200
                            ${isActive
                                ? "border-brand bg-brand/5 ring-2 ring-brand/40"
                                : "border-border bg-primary/50 hover:bg-muted/60"
                            }
                        `}
                    >
                        <span className="text-sm font-bold uppercase tracking-tight text-secondary">
                            {branch.name}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>{branch.area}</span>
                            <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground/50" />
                            <ClockIcon className="w-3" />
                            {branch.hours}
                        </span>
                    </button>
                )
            })}
        </div>
    )
}

export default PickupBranchGrid