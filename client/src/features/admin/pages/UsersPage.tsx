import { useMemo, useState } from "react";
import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline";
import { ADMIN_USERS } from "../data";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";

const UsersPage = () => {
    const [query, setQuery] = useState("");

    const users = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return ADMIN_USERS;
        return ADMIN_USERS.filter(
            (user) =>
                user.name.toLowerCase().includes(normalized) ||
                user.email.toLowerCase().includes(normalized) ||
                user.role.toLowerCase().includes(normalized)
        );
    }, [query]);

    const initials = (name: string) =>
        name
            .split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

    return (
        <div>
            <PageHeader
                title="Users"
                subtitle={`${users.length} staff and customer accounts on this panel.`}
                action={
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 via-red-500 to-red-700 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
                    >
                        <PlusIcon className="h-4 w-4" />
                        Invite User
                    </button>
                }
            />

            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="flex items-center gap-3 border-b border-border p-4">
                    <label className="relative flex-1 sm:max-w-xs">
                        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search users…"
                            className="w-full rounded-lg border border-border bg-primary py-2 pl-9 pr-3 text-sm text-secondary outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/30"
                        />
                    </label>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px] text-sm">
                        <thead>
                            <tr className="text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                                <th className="px-4 py-3 font-semibold">User</th>
                                <th className="px-4 py-3 font-semibold">Role</th>
                                <th className="px-4 py-3 font-semibold">Orders</th>
                                <th className="px-4 py-3 font-semibold">Joined</th>
                                <th className="px-4 py-3 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {users.map((user) => (
                                <tr key={user.id} className="text-secondary transition-colors hover:bg-muted/50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                                                {initials(user.name)}
                                            </span>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{user.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {user.email}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {user.orders.toLocaleString("en-US")}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                                        {user.joined}
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={user.status} />
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                                        No users match “{query}”.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UsersPage;