import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
    Home, 
    Heart, 
    FileText, 
    LogOut, 
    Activity, 
    ChevronLeft,
    ChevronRight 
} from "lucide-react";
import "./Sidebar.css";

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        navigate("/", { replace: true });
    };

    const menuItems = [
        { path: "/home", icon: Home, label: "Início" },
        { path: "/questionario", icon: Heart, label: "Checagem Cardíaca" },
        { path: "/historico", icon: FileText, label: "Histórico Cardíaco" },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className={`sidebar ${isCollapsed ? "sidebar--collapsed" : ""}`}>           
            <div className="sidebar-header">
                <div className="app-title">
                    <Activity size={24} />
                    {!isCollapsed && (
                        <>
                            <span>HealthCheck</span>                            
                        </>
                    )}
                </div>
                <button 
                    onClick={onToggle}
                    className="sidebar-toggle"
                    aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
                >
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`nav-item ${isActive(item.path) ? "nav-item--active" : ""}`}
                            title={isCollapsed ? item.label : ""}
                        >
                            <Icon size={20} />
                            {!isCollapsed && <span>{item.label}</span>}
                        </button>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <button 
                    onClick={handleLogout} 
                    className="logout-btn"
                    title={isCollapsed ? "Sair" : ""}
                >
                    <LogOut size={18} />
                    {!isCollapsed && <span>Sair</span>}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;