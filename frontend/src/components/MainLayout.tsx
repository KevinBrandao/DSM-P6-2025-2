import React, { useState } from "react";
import SideBar from "./SideBar";
import "./MainLayout.css";

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const handleToggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    return (
        <div className="main-layout">
            <SideBar
                isCollapsed={isSidebarCollapsed}
                onToggle={handleToggleSidebar}
            />
            <main className={`main-content ${isSidebarCollapsed ? "main-content--expanded" : ""}`}>
                {children}
            </main>
        </div>
    );
};

export default MainLayout;