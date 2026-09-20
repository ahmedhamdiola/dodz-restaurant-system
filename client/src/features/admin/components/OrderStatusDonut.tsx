import type { OrderStatusSlice } from "../types";

interface OrderStatusDonutProps {
    slices: OrderStatusSlice[];
}

const SLICE_COLORS: Record<string, string> = {
    Completed: "#10b981",
    Preparing: "#f59e0b",
    "On the way": "#38bdf8",
    Cancelled: "#64748b",
};

const RADIUS = 60;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const OrderStatusDonut = ({ slices }: OrderStatusDonutProps) => {
    const total = slices.reduce((sum, slice) => sum + slice.count, 0);

    let accumulated = 0;
    const segments =
        total > 0
            ? slices.map((slice) => {
                  const fraction = slice.count / total;
                  const length = fraction * CIRCUMFERENCE;
                  const offset = accumulated;
                  accumulated += length;
                  return { ...slice, fraction, length, offset };
              })
            : [];

    return (
        <div className="flex items-center gap-6">
            <div className="relative h-40 w-40 shrink-0">
                <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90">
                    <circle
                        cx="90"
                        cy="90"
                        r={RADIUS}
                        fill="none"
                        stroke="var(--color-muted)"
                        strokeWidth="16"
                    />
                    {segments.map(({ offset, length, label }) => (
                        <circle
                            key={label}
                            cx="90"
                            cy="90"
                            r={RADIUS}
                            fill="none"
                            stroke={SLICE_COLORS[label]}
                            strokeWidth="16"
                            strokeLinecap="round"
                            strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                            strokeDashoffset={-offset}
                        />
                    ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold tracking-tight text-secondary">
                        {total.toLocaleString("en-US")}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Orders
                    </span>
                </div>
            </div>

            <ul className="flex flex-1 flex-col gap-3">
                {segments.map((slice) => (
                    <li key={slice.label} className="flex items-center gap-2.5">
                        <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: SLICE_COLORS[slice.label] }}
                        />
                        <span className="flex-1 text-sm text-secondary">{slice.label}</span>
                        <span className="text-xs text-muted-foreground">
                            {Math.round(slice.fraction * 100)}%
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default OrderStatusDonut;