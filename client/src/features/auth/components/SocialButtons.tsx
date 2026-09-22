const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
        />
        <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z"
        />
        <path
            fill="#FBBC05"
            d="M5.84 14.1a6.6 6.6 0 010-4.2V7.06H2.18a11 11 0 000 9.88l3.66-2.84z"
        />
        <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 002.18 7.06L5.84 9.9c.87-2.6 3.3-4.52 6.16-4.52z"
        />
    </svg>
);

const FacebookIcon = () => (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#1877F2]" aria-hidden="true">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.026 1.792-4.697 4.533-4.697 1.313 0 2.686.236 2.686.236v2.971H15.83c-1.491 0-1.956.93-1.956 1.886v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
);

const SOCIAL_BUTTON_CLASS_NAME =
    "inline-flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-primary px-4 py-2.5 text-sm font-semibold text-secondary transition-colors duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-60";

const SocialButtons = () => {
    return (
        <div className="mt-6 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
                <button
                    type="button"
                    disabled
                    title="Coming soon"
                    aria-disabled="true"
                    tabIndex={-1}
                    className={SOCIAL_BUTTON_CLASS_NAME}
                >
                    <GoogleIcon />
                    Google
                </button>
                <button
                    type="button"
                    disabled
                    title="Coming soon"
                    aria-disabled="true"
                    tabIndex={-1}
                    className={SOCIAL_BUTTON_CLASS_NAME}
                >
                    <FacebookIcon />
                    Facebook
                </button>
            </div>
            <div className="flex items-center gap-3" aria-hidden="true">
                <span className="h-px flex-1 bg-border" />
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    or continue with email
                </span>
                <span className="h-px flex-1 bg-border" />
            </div>
        </div>
    );
};

export default SocialButtons;