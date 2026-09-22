import { useFormik } from "formik";
import { signupValidationSchema } from "../schemas";
import type { SignupValues } from "../types";
import PasswordField from "./PasswordField";
import Spinner from "./Spinner";
import {
    ERROR_CLASS_NAME,
    fieldClassName,
    INPUT_GROUP_CLASS_NAME,
    LABEL_CLASS_NAME,
    PRIMARY_BUTTON_CLASS_NAME,
} from "../styles";

interface SignupFormProps {
    onSubmit: (values: SignupValues) => void | Promise<void>;
    submitting: boolean;
    showPassword: boolean;
    onToggleShowPassword: () => void;
    showConfirmPassword: boolean;
    onToggleShowConfirmPassword: () => void;
}

const SignupForm = ({
    onSubmit,
    submitting,
    showPassword,
    onToggleShowPassword,
    showConfirmPassword,
    onToggleShowConfirmPassword,
}: SignupFormProps) => {
    const formik = useFormik<SignupValues>({
        initialValues: {
            name: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
        },
        validationSchema: signupValidationSchema,
        onSubmit,
    });

    const nameErrorId = "name-error";
    const emailErrorId = "email-error";
    const phoneErrorId = "phone-error";
    const nameHasError = Boolean(formik.touched.name && formik.errors.name);
    const emailHasError = Boolean(formik.touched.email && formik.errors.email);
    const phoneHasError = Boolean(formik.touched.phone && formik.errors.phone);

    return (
        <form
            onSubmit={formik.handleSubmit}
            noValidate
            className="flex flex-col gap-5"
        >
            <div className={INPUT_GROUP_CLASS_NAME}>
                <label htmlFor="name" className={LABEL_CLASS_NAME}>
                    Full Name
                </label>
                <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    autoComplete="name"
                    aria-invalid={nameHasError}
                    aria-describedby={nameHasError ? nameErrorId : undefined}
                    className={fieldClassName(nameHasError)}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.name}
                />
                {nameHasError && (
                    <p id={nameErrorId} className={ERROR_CLASS_NAME}>
                        {formik.errors.name}
                    </p>
                )}
            </div>

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

            <div className={INPUT_GROUP_CLASS_NAME}>
                <label htmlFor="phone" className={LABEL_CLASS_NAME}>
                    Phone
                </label>
                <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="01000000000"
                    autoComplete="tel"
                    inputMode="numeric"
                    maxLength={11}
                    dir="ltr"
                    aria-invalid={phoneHasError}
                    aria-describedby={phoneHasError ? phoneErrorId : undefined}
                    className={fieldClassName(phoneHasError)}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.phone}
                />
                {phoneHasError && (
                    <p id={phoneErrorId} className={ERROR_CLASS_NAME}>
                        {formik.errors.phone}
                    </p>
                )}
            </div>

            <PasswordField
                id="password"
                label="Password"
                name="password"
                value={formik.values.password}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                showPassword={showPassword}
                onToggleShowPassword={onToggleShowPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.password}
                touched={formik.touched.password}
            />

            <PasswordField
                id="confirmPassword"
                label="Confirm Password"
                name="confirmPassword"
                value={formik.values.confirmPassword}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                showPassword={showConfirmPassword}
                onToggleShowPassword={onToggleShowConfirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.confirmPassword}
                touched={formik.touched.confirmPassword}
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
                        Creating account…
                    </>
                ) : (
                    "Create account"
                )}
            </button>
        </form>
    );
};

export default SignupForm;