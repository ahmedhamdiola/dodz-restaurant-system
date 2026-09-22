import { Link } from "react-router-dom";
import { useAuthState } from "../hooks/useAuthState";
import type { AuthMode, LoginValues, SignupValues } from "../types";
import ErrorAlert from "./ErrorAlert";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import SocialButtons from "./SocialButtons";

interface AuthCardProps {
    mode: AuthMode;
    notice?: string;
    initialEmail?: string;
    onLogin: (values: LoginValues) => void | Promise<void>;
    onSignup: (values: SignupValues) => void | Promise<void>;
}

const COPY = {
    login: {
        heading: "Welcome back",
        subtitle: "Log in to order your favorites even faster.",
        prompt: "New to DODZ?",
        action: "Create an account",
        to: "/signup",
    },
    signup: {
        heading: "Create your account",
        subtitle: "Join DODZ for faster checkout and exclusive deals.",
        prompt: "Already have an account?",
        action: "Log in",
        to: "/login",
    },
} as const;

const AuthCard = ({ mode, notice, initialEmail = "", onLogin, onSignup }: AuthCardProps) => {
    const {
        submitting,
        error,
        submitLogin,
        submitSignup,
        showLoginPassword,
        toggleLoginPassword,
        showSignupPassword,
        toggleSignupPassword,
        showConfirmPassword,
        toggleConfirmPassword,
    } = useAuthState({ onLogin, onSignup });

    const isLoginMode = mode === "login";
    const copy = COPY[mode];
    const alert = error ?? notice;

    return (
        <section className="w-full rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/5 sm:p-8">
            <div>
                <h1 className="text-xl font-bold tracking-tight text-secondary sm:text-2xl">
                    {copy.heading}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">{copy.subtitle}</p>
            </div>

            {alert && <ErrorAlert message={alert} className="mt-5" />}

            <SocialButtons />

            <div className="mt-6">
                {isLoginMode ? (
                    <LoginForm
                        onSubmit={submitLogin}
                        submitting={submitting}
                        error={error}
                        initialEmail={initialEmail}
                        showPassword={showLoginPassword}
                        onToggleShowPassword={toggleLoginPassword}
                    />
                ) : (
                    <SignupForm
                        onSubmit={submitSignup}
                        submitting={submitting}
                        showPassword={showSignupPassword}
                        onToggleShowPassword={toggleSignupPassword}
                        showConfirmPassword={showConfirmPassword}
                        onToggleShowConfirmPassword={toggleConfirmPassword}
                    />
                )}
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
                {copy.prompt}{" "}
                <Link
                    to={copy.to}
                    className="font-semibold text-brand transition-colors duration-200 outline-none hover:text-red-700 focus-visible:underline"
                >
                    {copy.action}
                </Link>
            </p>
        </section>
    );
};

export default AuthCard;