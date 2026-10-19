import { useMemo, useState } from "react";
import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline";
import type { AdminUserRole, CreateAdminUserInput } from "../../../features/admin/types";
import PageHeader from "../../../features/admin/components/PageHeader";
import StatusBadge from "../../../features/admin/components/StatusBadge";
import UserFormModal from "../../../features/admin/components/UserFormModal";
import { useAdminUsers, useCreateAdminUser } from "../../../features/admin/hooks/useAdminUsers";
import { useBranches } from "../../../features/admin/hooks/useDashboardData";

const ROLE_LABELS: Record<AdminUserRole, string> = {
    customer: "Customer",
    staff: "Staff",
    admin: "Admin",
    branch_admin: "Branch admin",
};

const ROLE_COLORS: Record<AdminUserRole, string> = {
    customer: "bg-muted text-muted-foreground",
    staff: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    admin: "bg-brand/10 text-brand",
    branch_admin: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

const initials = (name: string) =>
    name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const UsersPage = () => {
    const [query, setQuery] = useState("");
    const [modalOpen, setModalOpen] = useState(false);

    const { data: users = [], isLoading, isError, refetch } = useAdminUsers();
    const { data: branches = [] } = useBranches();
    const createUser = useCreateAdminUser();

    const branchName = (branchId: number | null) =>
        branchId === null ? "—" : (branches.find((branch) => branch.id === branchId)?.name ?? `Branch #${branchId}`);

    const visibleUsers = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return users;
        return users.filter(
            (user) =>
                user.name.toLowerCase().includes(normalized) ||
                user.email.toLowerCase().includes(normalized) ||
                user.role.toLowerCase().includes(normalized) ||
                branchName(user.branchId).toLowerCase().includes(normalized)
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [users, query, branches]);

    const handleSave = (values: CreateAdminUserInput) => {
        createUser.mutate(values, { onSuccess: () => setModalOpen(false) });
    };

    return (
        <div>
            <PageHeader
                title="Users"
                subtitle="Manage staff and customer accounts."
                action={
                    <button
                        type="button"
                        onClick={() => setModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 via-red-500 to-red-700 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
                    >
                        <PlusIcon className="h-4 w-4" />
                        Add user
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
                    {!isLoading && !isError && (
                        <span className="hidden text-xs text-muted-foreground sm:block">
                            {visibleUsers.length} result{visibleUsers.length !== 1 && "s"}
                        </span>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex flex-col gap-3 p-6">
                        {[0, 1, 2, 3, 4].map((index) => (
                            <div key={index} className="h-10 animate-pulse rounded bg-muted" />
                        ))}
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                        <p className="text-sm text-muted-foreground">Couldn't load users.</p>
                        <button
                            type="button"
                            onClick={() => refetch()}
                            className="rounded-lg bg-gradient-to-r from-red-600 to-red-500 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] text-sm">
                            <thead>
                                <tr className="text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                                    <th className="px-4 py-3 font-semibold">User</th>
                                    <th className="px-4 py-3 font-semibold">Role</th>
                                    <th className="px-4 py-3 font-semibold">Branch</th>
                                    <th className="px-4 py-3 font-semibold">Joined</th>
                                    <th className="px-4 py-3 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {visibleUsers.map((user) => (
                                    <tr key={user.id} className="text-secondary transition-colors hover:bg-muted/50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                                                    {initials(user.name)}
                                                </span>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{user.name}</span>
                                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ROLE_COLORS[user.role]}`}
                                            >
                                                {ROLE_LABELS[user.role]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {user.branchId === null ? "—" : branchName(user.branchId)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={user.isActive ? "Active" : "Suspended"} />
                                        </td>
                                    </tr>
                                ))}
                                {visibleUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                                            {query ? `No users match “${query}”.` : "No users yet."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {modalOpen && (
                <UserFormModal
                    branches={branches}
                    isSaving={createUser.isPending}
                    onClose={() => setModalOpen(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default UsersPage;
