import { useState } from "react";
import { CheckIcon, EnvelopeIcon, ExclamationTriangleIcon, PhoneIcon } from "@heroicons/react/24/outline";
import DashboardCard from "../../../features/admin/components/DashboardCard";
import PageHeader from "../../../features/admin/components/PageHeader";

const inputClass =
    "w-full rounded-lg border border-border bg-primary px-3.5 py-2.5 text-sm text-secondary outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/30";

const SettingsPage = () => {
    const [store, setStore] = useState({
        name: "DODZ Fried Chicken",
        hotline: "16974",
        email: "care@dodzfriedchicken.com",
    });

    const [notifications, setNotifications] = useState({
        newOrders: true,
        lowStock: true,
        weeklyReport: true,
        marketingTips: false,
    });

    const handleStoreChange = (key: keyof typeof store) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => setStore((prev) => ({ ...prev, [key]: event.target.value }));

    const toggle = (key: keyof typeof notifications) =>
        setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));

    return (
        <div>
            <PageHeader
                title="Settings"
                subtitle="Store details, notifications, and account-wide configuration."
            />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="flex flex-col gap-6 xl:col-span-2">
                    <DashboardCard title="Store Information" subtitle="Shown publicly across the site and app.">
                        <form
                            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                            onSubmit={(event) => event.preventDefault()}
                        >
                            <label className="flex flex-col gap-1.5">
                                <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
                                    Restaurant Name
                                </span>
                                <input
                                    value={store.name}
                                    onChange={handleStoreChange("name")}
                                    className={inputClass}
                                />
                            </label>
                            <label className="flex flex-col gap-1.5">
                                <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
                                    Hotline
                                </span>
                                <input
                                    value={store.hotline}
                                    onChange={handleStoreChange("hotline")}
                                    className={inputClass}
                                />
                            </label>
                            <div className="sm:col-span-2">
                                <label className="flex flex-col gap-1.5">
                                    <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
                                        Support Email
                                    </span>
                                    <input
                                        value={store.email}
                                        onChange={handleStoreChange("email")}
                                        className={inputClass}
                                    />
                                </label>
                            </div>
                            <div className="flex items-center gap-4 sm:col-span-2">
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 via-red-500 to-red-700 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
                                >
                                    <CheckIcon className="h-4 w-4" />
                                    Save Changes
                                </button>
                                <span className="text-xs text-muted-foreground">
                                    Mock form – nothing is persisted yet.
                                </span>
                            </div>
                        </form>
                    </DashboardCard>

                    <DashboardCard
                        title="Notifications"
                        subtitle="Choose what reaches your phone and inbox."
                    >
                        <ul className="flex flex-col divide-y divide-border">
                            {(Object.keys(notifications) as Array<keyof typeof notifications>).map(
                                (key) => (
                                    <li key={key} className="flex items-center justify-between gap-4 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <span className="h-2 w-2 rounded-full bg-brand" />
                                            <span className="text-sm text-secondary">
                                                {key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase())}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={notifications[key]}
                                            onClick={() => toggle(key)}
                                            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
                                                notifications[key] ? "bg-brand" : "bg-muted"
                                            }`}
                                        >
                                            <span
                                                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${
                                                    notifications[key] ? "left-[22px]" : "left-0.5"
                                                }`}
                                            />
                                        </button>
                                    </li>
                                )
                            )}
                        </ul>
                    </DashboardCard>
                </div>

                <div className="flex flex-col gap-6">
                    <DashboardCard title="Account">
                        <div className="flex items-center gap-3">
                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 text-sm font-bold uppercase text-white">
                                ME
                            </span>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-secondary">
                                    Mostafa El Din
                                </span>
                                <span className="text-xs text-muted-foreground">Owner · Cairo</span>
                            </div>
                        </div>
                        <ul className="mt-4 flex flex-col gap-2.5 text-sm text-muted-foreground">
                            <li className="flex items-center gap-2.5">
                                <PhoneIcon className="h-4 w-4 text-brand" />
                                <span dir="ltr">0100 000 0000</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <EnvelopeIcon className="h-4 w-4 text-brand" />
                                <span dir="ltr">mostafa.eldin@gmail.com</span>
                            </li>
                        </ul>
                    </DashboardCard>

                    <DashboardCard title="Danger Zone">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Actions here have a real impact and can't be undone.
                        </p>
                        <button
                            type="button"
                            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-red-600 transition-colors hover:bg-red-500/20 dark:text-red-400"
                        >
                            <ExclamationTriangleIcon className="h-4 w-4" />
                            Reset mock data
                        </button>
                    </DashboardCard>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;