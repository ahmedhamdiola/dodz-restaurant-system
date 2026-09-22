export const FIELD_CLASS_NAME =
    "w-full rounded-lg border bg-primary px-4 py-3 text-base text-secondary outline-none transition-colors duration-200 placeholder:text-muted-foreground/70 focus:border-brand focus:ring-2 focus:ring-brand/30 sm:text-sm";

export const fieldClassName = (hasError: boolean) =>
    `${FIELD_CLASS_NAME} ${
        hasError
            ? "border-red-500 focus:border-red-500 focus:ring-red-500/25"
            : "border-border"
    }`;

export const INPUT_GROUP_CLASS_NAME = "flex flex-col gap-1.5";

export const LABEL_CLASS_NAME =
    "text-xs font-semibold uppercase tracking-wide text-secondary";

export const ERROR_CLASS_NAME = "mt-1.5 text-xs font-medium text-red-500";

export const PRIMARY_BUTTON_CLASS_NAME =
    "inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-600 via-red-700 to-red-800 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-opacity duration-200 outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-60";