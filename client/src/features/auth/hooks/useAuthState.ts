import { useCallback, useState } from "react";
import type { LoginValues, SignupValues } from "../types";

interface UseAuthStateOptions {
    onLogin: (values: LoginValues) => void | Promise<void>;
    onSignup: (values: SignupValues) => void | Promise<void>;
}

export const useAuthState = ({ onLogin, onSignup }: UseAuthStateOptions) => {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showSignupPassword, setShowSignupPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const runWithState = useCallback(async (task: () => Promise<void>) => {
        setError(null);
        setSubmitting(true);
        try {
            await task();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong, please try again."
            );
        } finally {
            setSubmitting(false);
        }
    }, []);

    const submitLogin = useCallback(
        (values: LoginValues) =>
            runWithState(() => Promise.resolve(onLogin(values))),
        [onLogin, runWithState]
    );

    const submitSignup = useCallback(
        (values: SignupValues) =>
            runWithState(() => Promise.resolve(onSignup(values))),
        [onSignup, runWithState]
    );

    return {
        submitting,
        error,
        submitLogin,
        submitSignup,
        showLoginPassword,
        toggleLoginPassword: () => setShowLoginPassword((v) => !v),
        showSignupPassword,
        toggleSignupPassword: () => setShowSignupPassword((v) => !v),
        showConfirmPassword,
        toggleConfirmPassword: () => setShowConfirmPassword((v) => !v),
    };
};