import { useState } from "react";
import { ClockIcon, MapPinIcon, PencilIcon, PhoneIcon, PlusIcon } from "@heroicons/react/24/outline";
import { ADMIN_BRANCHES } from "../data";
import type { AdminBranch } from "../types";
import BranchFormModal, { type BranchFormValues } from "../components/BranchFormModal";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";

const BranchesPage = () => {
    const [branches, setBranches] = useState<AdminBranch[]>(ADMIN_BRANCHES);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<AdminBranch | null>(null);

    const openAdd = () => {
        setEditing(null);
        setModalOpen(true);
    };

    const openEdit = (branch: AdminBranch) => {
        setEditing(branch);
        setModalOpen(true);
    };

    const handleSave = (values: BranchFormValues, id?: number) => {
        if (id) {
            setBranches((prev) => prev.map((branch) => (branch.id === id ? { ...branch, ...values } : branch)));
        } else {
            const nextId = Math.max(...branches.map((branch) => branch.id)) + 1;
            setBranches((prev) => [...prev, { ...values, id: nextId }]);
        }
        setModalOpen(false);
    };

    return (
        <div>
            <PageHeader
                title="Branches"
                subtitle={`${branches.length} branches across Greater Cairo.`}
                action={
                    <button
                        type="button"
                        onClick={openAdd}
                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 via-red-500 to-red-700 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
                    >
                        <PlusIcon className="h-4 w-4" />
                        Add Branch
                    </button>
                }
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {branches.map((branch) => (
                    <article
                        key={branch.id}
                        className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex flex-col">
                                <h2 className="text-sm font-bold uppercase tracking-wide text-secondary">
                                    {branch.name}
                                </h2>
                                <span className="mt-1 w-fit rounded-full bg-brand/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand">
                                    {branch.area}
                                </span>
                            </div>
                            <StatusBadge status={branch.status} />
                        </div>

                        <div className="flex flex-col gap-2.5 pt-1 text-sm text-muted-foreground">
                            <p className="flex items-start gap-2.5">
                                <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                                <span className="text-secondary/80">{branch.address}</span>
                            </p>
                            <p className="flex items-center gap-2.5">
                                <ClockIcon className="h-4 w-4 shrink-0 text-brand" />
                                <span>{branch.hours}</span>
                            </p>
                            <p className="flex items-center gap-2.5">
                                <PhoneIcon className="h-4 w-4 shrink-0 text-brand" />
                                <span dir="ltr">{branch.phone}</span>
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => openEdit(branch)}
                            className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-secondary transition-colors hover:border-brand hover:bg-brand/5 hover:text-brand"
                        >
                            <PencilIcon className="h-3.5 w-3.5" />
                            Edit branch
                        </button>
                    </article>
                ))}

                <button
                    type="button"
                    onClick={openAdd}
                    className="flex min-h-44 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-brand/50 hover:bg-brand/5 hover:text-brand"
                >
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
                        <PlusIcon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-semibold uppercase tracking-wide">
                        Add another branch
                    </span>
                </button>
            </div>

            {modalOpen && (
                <BranchFormModal
                    initialValues={editing}
                    onClose={() => setModalOpen(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default BranchesPage;