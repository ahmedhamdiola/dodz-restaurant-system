import { STATUS_COLORS } from "../constants";

const StatusBadge = ({ status }: { status: string }) => (
    <span
        className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
            STATUS_COLORS[status] ?? "bg-muted text-muted-foreground"
        }`}
    >
        {status}
    </span>
);

export default StatusBadge;