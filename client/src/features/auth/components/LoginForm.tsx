import { useEffect, useRef } from "react";
import { useFormik } from "formik";
import { loginValidationSchema } from "../schemas";
import type { LoginValues } from "../types";
import PasswordField from "./PasswordField";
import Spinner from "./Spinner";
import {
    ERROR_CLASS_NAME,
    fieldClassName,
    INPUT_GROUP_CLASS_NAME,
    LABEL_CLASS_NAME,
    PRIMARY_BUTTON_CLASS_NAME,
} from "../styles";

interface LoginFormProps {
    onSubmit: (values: LoginValues) => void | Promise<void>;
    submitting: boolean;
    error: string | null;
    initialEmail?: string;
    showPassword: boolean;
    onToggleShowPassword: () => void;
}

const LoginForm = ({
    onSubmit,
    submitting,
    error,
    initialEmail = "",
    showPassword,
    onToggleShowPassword,
}: LoginFormProps) => {
    const passwordRef = useRef<HTMLInputElement>(null);
    const previousError = useRef<string | null>(null);

    const formik = useFormik<LoginValues>({
        initialValues: { email: initialEmail, password: "" },
        validationSchema: loginValidationSchema,
        onSubmit,
    });

    // On a failed login: keep the email, clear the password and refocus it.
    useEffect(() => {
        const failedSubmit = !previousError.current && Boolean(error);
        previousError.current = error;
        if (!failedSubmit) return;
        formik.setFieldValue("password", "");
        formik.setFieldTouched("password", false);
        passwordRef.current?.focus();
    }, [error, formik]);

    const emailErrorId = "email-error";
    const emailHasError = Boolean(formik.touched.email && formik.errors.email);

    return (
        <form
            onSubmit={formik.handleSubmit}
            noValidate
            className="flex flex-col gap-5"
        >
            <div className={INPUT_GROUP_CLASS_NAME}>
                <label htmlFor="email" className={LABEL_CLASS_NAME}>
                    Email
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    dir="ltr"
                    aria-invalid={emailHasError}
                    aria-describedby={emailHasError ? emailErrorId : undefined}
                    className={fieldClassName(emailHasError)}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                />
                {emailHasError && (
                    <p id={emailErrorId} className={ERROR_CLASS_NAME}>
                        {formik.errors.email}
                    </p>
                )}
            </div>

            <PasswordField
                id="password"
                label="Password"
                name="password"
                value={formik.values.password}
                placeholder="Enter your password"
                autoComplete="current-password"
                showPassword={showPassword}
                onToggleShowPassword={onToggleShowPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.password}
                touched={formik.touched.password}
                inputRef={passwordRef}
            />

            <button
                type="submit"
                disabled={submitting}
                aria-busy={submitting}
                className={PRIMARY_BUTTON_CLASS_NAME}
            >
                {submitting ? (
                    <>
                        <Spinner />
                        Logging in…
                    </>
                ) : (
                    "Log in"
                )}
            </button>
        </form>
    );
};

export default LoginForm;