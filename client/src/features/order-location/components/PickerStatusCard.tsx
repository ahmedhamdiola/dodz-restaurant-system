import type { ReactNode } from "react"
import {
    CheckCircleIcon,
    InformationCircleIcon,
    XCircleIcon,
} from "@heroicons/react/24/outline"
import type { PickerStatus, PickerStatusTone } from "../types"

interface PickerStatusCardProps {
    status: PickerStatus
    error: string | null
}

const STATUS_TONE_CLASS_NAME: Record<PickerStatusTone, string> = {
    neutral: "border-border bg-muted/50",
    success: "border-green-500/40 bg-green-500/10",
    error: "border-red-500/40 bg-red-500/10",
}

const STATUS_TONE_TEXT_CLASS_NAME: Record<PickerStatusTone, string> = {
    neutral: "text-muted-foreground",
    success: "text-green-700 dark:text-green-400",
    error: "text-red-600 dark:text-red-400",
}

const STATUS_TONE_ICON: Record<PickerStatusTone, ReactNode> = {
    neutral: <InformationCircleIcon className="mt-0.5 w-5 shrink-0" />,
    success: <CheckCircleIcon className="mt-0.5 w-5 shrink-0" />,
    error: <XCircleIcon className="mt-0.5 w-5 shrink-0" />,
}

const PickerStatusCard = ({ status, error }: PickerStatusCardProps) => {
    return (
        <>
            <div
                className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${STATUS_TONE_CLASS_NAME[status.tone]}`}
            >
                {STATUS_TONE_ICON[status.tone]}
                <div className="flex flex-col font-medium">
                    <span className={STATUS_TONE_TEXT_CLASS_NAME[status.tone]}>
                        {status.title}
                    </span>
                    <span className="text-muted-foreground">{status.body}</span>
                </div>
            </div>

            {error && (
                <p className="flex items-center gap-2 text-xs font-medium text-red-500">
                    <XCircleIcon className="w-4 shrink-0" />
                    {error}
                </p>
            )}
        </>
    )
}

export default PickerStatusCard