import { CalendarIcon, EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline";
import type { ProfileUser } from "../types";

interface UserInfoCardProps {
    user: ProfileUser;
}

const getInitial = (name: string): string => name.trim().charAt(0).toUpperCase() || "D";

const getMemberLine = (createdAt: string): string => {
    const year = new Date(createdAt).getFullYear();
    return Number.isNaN(year) ? "DODZ member" : `Member since ${year}`;
};

const UserInfoCard = ({ user }: UserInfoCardProps) => {
    const initial = getInitial(user.name);
    const memberLine = getMemberLine(user.createdAt);

    return (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/5 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
                <div
                    aria-hidden="true"
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-red-800 text-2xl font-bold text-white shadow-md shadow-red-900/20 sm:h-20 sm:w-20 sm:text-3xl"
                >
                    {initial}
                </div>

                <div className="min-w-0 flex-1">
                    <h1 className="text-xl font-bold tracking-tight text-secondary sm:text-2xl">
                        {user.name}
                    </h1>
                    <ul className="mt-2 flex flex-col gap-1.5 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-5">
                        <li className="flex min-w-0 items-center gap-2">
                            <EnvelopeIcon className="h-4 w-4 shrink-0" />
                            <span className="truncate">{user.email}</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <PhoneIcon className="h-4 w-4 shrink-0" />
                            <span>{user.phone ?? "No phone on file"}</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 shrink-0" />
                            <span>{memberLine}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </section>
    );
};

export default UserInfoCard;