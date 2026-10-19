import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useScrollLock } from "../../components/navbar/hooks/useScrollLock";
import BranchSidebar from "../../features/branch/components/BranchSidebar";
import BranchTopbar from "../../features/branch/components/BranchTopbar";

const BranchLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    useScrollLock(sidebarOpen);

    return (
        <div className="min-h-screen bg-primary">
            <aside className="fixed inset-y-0 left-0 z-30 hidden lg:block">
                <BranchSidebar />
            </aside>

            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                        aria-hidden="true"
                    />
                    <div className="absolute inset-y-0 left-0">
                        <BranchSidebar />
                    </div>
                </div>
            )}

            <div className="lg:pl-72">
                <BranchTopbar onMenuClick={() => setSidebarOpen(true)} />
                <main className="px-4 py-6 sm:px-6 lg:px-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default BranchLayout;
