import { Helmet } from "react-helmet-async";
import {
    Link,
    Navigate,
    useLocation,
    useNavigate,
    useSearchParams,
} from "react-router-dom";
import {
    ArrowLeftIcon,
    CheckCircleIcon,
    ShieldCheckIcon,
    TagIcon,
} from "@heroicons/react/24/outline";
import Logo from "../../assets/logos/Logo.svg";
import AuthCard from "../../features/auth/components/AuthCard";
import Spinner from "../../features/auth/components/Spinner";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useToast } from "../../components/toast/context";
import { isConflictError } from "../../features/auth/services/authService";
import type { AuthMode, LoginValues, SignupValues, UserRole } from "../../features/auth/types";

const BRAND_POINTS = [
    { Icon: CheckCircleIcon, text: "Save your favorites and reorder in a tap" },
    { Icon: TagIcon, text: "Unlock members-only deals and offers" },
    { Icon: ShieldCheckIcon, text: "Fast, secure checkout with order tracking" },
];

interface AuthPageProps {
    mode?: AuthMode;
}

const META = {
    login: {
        title: "Log in | DODZ Fried Chicken",
        description:
            "Log in to your DODZ account for faster checkout, saved favorites, and exclusive deals.",
    },
    signup: {
        title: "Sign up | DODZ Fried Chicken",
        description:
            "Create a DODZ account to order faster, save your favorites, and unlock exclusive member deals.",
    },
};

// Only allow same-origin relative redirects. A URL parser (not a string check)
// is required so backslash tricks like "/\evil.com" can't normalize into an
// external URL after validation.
const parseSafeRedirect = (raw: string | null): string | null => {
    if (!raw) {
        return null;
    }
    try {
        const target = new URL(raw, window.location.origin);
        return target.origin === window.location.origin ? raw : null;
    } catch {
        return null;
    }
};

const AuthPage = ({ mode = "login" }: AuthPageProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const toast = useToast();
    const { user, isAuthenticated, isBootstrapping, login, signup } = useAuth();

    const meta = META[mode];
    const rawRedirect = searchParams.get("redirect");
    const redirect = parseSafeRedirect(rawRedirect);
    const prefillEmail = searchParams.get("email") ?? "";
    const notice =
        (location.state as { notice?: string } | null)?.notice ?? undefined;

    const homeForRole = (role: UserRole): string => {
        if (role === "customer") return "/";
        return role === "branch_admin" ? "/branch" : "/admin";
    };

    const finishAuth = (authedUser: { role: UserRole }, message: string) => {
        toast.success(message);
        navigate(redirect ?? homeForRole(authedUser.role), { replace: true });
    };

    const handleLogin = async (values: LoginValues): Promise<void> => {
        const authedUser = await login(values);
        finishAuth(authedUser, "Welcome back!");
    };

    const handleSignup = async (values: SignupValues): Promise<void> => {
        try {
            const authedUser = await signup(values);
            finishAuth(authedUser, "Account created — welcome to DODZ!");
        } catch (err) {
            // Email/phone already in use → send the user to log in instead,
            // pre-filling the email they just tried to sign up with.
            if (isConflictError(err)) {
                navigate(
                    {
                        pathname: "/login",
                        search: `?email=${encodeURIComponent(values.email.trim())}`,
                    },
                    {
                        state: { notice: "That account already exists. Log in below." },
                        replace: true,
                    }
                );
                return;
            }
            throw err;
        }
    };

    if (isBootstrapping) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-primary">
                <Spinner className="h-8 w-8 text-brand" />
            </div>
        );
    }

    if (isAuthenticated && user) {
        // Already signed in — send home (role-aware) instead of showing the form.
        return <Navigate to={homeForRole(user.role)} replace />;
    }

    return (
        <>
            <Helmet>
                <title>{meta.title}</title>
                <meta name="description" content={meta.description} />
            </Helmet>

            <div className="flex min-h-screen flex-col bg-primary lg:flex-row">
                {/* Brand panel (desktop only) — sticky so the form column scrolls under it */}
                <aside className="relative hidden overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-red-800 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[45%] lg:flex-col lg:justify-between lg:self-start lg:p-12 xl:p-16">
                    <div
                        className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/10"
                        aria-hidden="true"
                    />
                    <div
                        className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-red-950/30"
                        aria-hidden="true"
                    />
                    <div
                        className="pointer-events-none absolute right-14 top-1/3 h-40 w-40 rounded-full bg-white/5"
                        aria-hidden="true"
                    />

                    <div className="relative">
                        <img
                            src={Logo}
                            alt="DODZ Logo"
                            className="w-36 brightness-0 invert"
                        />
                        <p className="mt-8 max-w-sm text-2xl font-bold leading-snug text-white xl:text-3xl">
                            Premium Flavor for Everyone.
                        </p>
                        <p className="mt-3 max-w-sm text-sm leading-relaxed text-red-100/90">
                            Log in to track your orders, save your favorites, and
                            unlock exclusive member deals at your nearest DODZ branch.
                        </p>
                    </div>

                    <ul className="relative flex flex-col gap-4">
                        {BRAND_POINTS.map(({ Icon, text }) => (
                            <li
                                key={text}
                                className="flex items-center gap-3 text-sm font-medium text-white"
                            >
                                <Icon className="h-5 w-5 shrink-0 text-white/90" />
                                {text}
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* Form side */}
                <main className="flex flex-1 flex-col items-center px-4 py-8 sm:px-8 lg:justify-center lg:py-12">
                    <div className="w-full max-w-md">
                        <div className="mb-8 flex items-center justify-between gap-4 lg:justify-start">
                            <img
                                src={Logo}
                                alt="DODZ Logo"
                                className="w-24 brightness-125 lg:hidden"
                            />
                            <Link
                                to="/"
                                className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold uppercase tracking-wide text-secondary shadow-sm transition-colors duration-200 outline-none hover:border-brand hover:text-brand focus-visible:ring-2 focus-visible:ring-brand/40"
                            >
                                <ArrowLeftIcon className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
                                Back to site
                            </Link>
                        </div>

                        <AuthCard
                            mode={mode}
                            notice={notice}
                            initialEmail={prefillEmail}
                            onLogin={handleLogin}
                            onSignup={handleSignup}
                        />

                        <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
                            By continuing, you agree to DODZ's{" "}
                            <Link
                                to="/terms-and-conditions"
                                className="font-medium text-secondary transition-colors duration-200 hover:text-brand"
                            >
                                Terms
                            </Link>{" "}
                            and{" "}
                            <Link
                                to="/privacy-policy"
                                className="font-medium text-secondary transition-colors duration-200 hover:text-brand"
                            >
                                Privacy Policy
                            </Link>
                            .
                        </p>
                    </div>
                </main>
            </div>
        </>
    );
};

export default AuthPage;