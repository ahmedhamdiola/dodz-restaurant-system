import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import type { ChangeEvent, FocusEvent, Ref } from "react";
import {
    ERROR_CLASS_NAME,
    fieldClassName,
    INPUT_GROUP_CLASS_NAME,
    LABEL_CLASS_NAME,
} from "../styles";

interface PasswordFieldProps {
    id: string;
    label: string;
    name: string;
    value: string;
    placeholder?: string;
    autoComplete?: string;
    showPassword: boolean;
    onToggleShowPassword: () => void;
    error?: string;
    touched?: boolean;
    inputRef?: Ref<HTMLInputElement>;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onBlur: (e: FocusEvent<HTMLInputElement>) => void;
}

const PasswordField = ({
    id,
    label,
    name,
    value,
    placeholder,
    autoComplete,
    showPassword,
    onToggleShowPassword,
    error,
    touched,
    inputRef,
    onChange,
    onBlur,
}: PasswordFieldProps) => {
    const hasError = Boolean(touched && error);
    const errorId = `${id}-error`;

    return (
        <div className={INPUT_GROUP_CLASS_NAME}>
            <label htmlFor={id} className={LABEL_CLASS_NAME}>
                {label}
            </label>
            <div className="relative">
                <input
                    ref={inputRef}
                    id={id}
                    name={name}
                    type={showPassword ? "text" : "password"}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    aria-invalid={hasError}
                    aria-describedby={hasError ? errorId : undefined}
                    className={`${fieldClassName(hasError)} pr-12`}
                />
                <button
                    type="button"
                    onClick={onToggleShowPassword}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors duration-200 outline-none hover:text-secondary focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                    {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                        <EyeIcon className="h-5 w-5" />
                    )}
                </button>
            </div>
            {hasError && (
                <p id={errorId} className={ERROR_CLASS_NAME}>
                    {error}
                </p>
            )}
        </div>
    );
};

export default PasswordField;