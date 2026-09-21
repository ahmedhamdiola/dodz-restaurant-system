import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useScrollLock } from "../../components/navbar/hooks/useScrollLock";
import Sidebar from "../../features/admin/components/Sidebar";
import Topbar from "../../features/admin/components/Topbar";

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    useScrollLock(sidebarOpen);

    return (
        <div className="min-h-screen bg-primary">
            <aside className="fixed inset-y-0 left-0 z-30 hidden lg:block">
                <Sidebar />
            </aside>

            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <div className="absolute inset-y-0 left-0 shadow-2xl">
                        <Sidebar onClose={() => setSidebarOpen(false)} />
                    </div>
                </div>
            )}

            <div className="flex min-h-screen flex-col lg:pl-72">
                <Topbar onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;