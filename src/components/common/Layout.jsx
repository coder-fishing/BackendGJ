import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom'; // Thêm Outlet vào để render children
import Sidebar from '../SideBar/SideBar';
import Navbar from '../NavBar/NavBar';
import './Layout.scss';

const Layout = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const toggleMobile = () => {
        setMobileOpen(!mobileOpen);
    };

    // Update body class when sidebar state changes
    useEffect(() => {
        const body = document.body;
        
        if (sidebarCollapsed) {
            body.classList.add('sidebar-collapsed');
        } else {
            body.classList.remove('sidebar-collapsed');
        }

        if (mobileOpen) {
            body.classList.add('sidebar-mobile-open');
        } else {
            body.classList.remove('sidebar-mobile-open');
        }

        // Cleanup
        return () => {
            body.classList.remove('sidebar-collapsed');
            body.classList.remove('sidebar-mobile-open');
        };
    }, [sidebarCollapsed, mobileOpen]);

    return (
        <div className="layout">
            <Sidebar 
                collapsed={sidebarCollapsed} 
                toggleSidebar={toggleSidebar}
                mobileOpen={mobileOpen}
                toggleMobile={toggleMobile}
            />
            <div className="main-content">
                <Navbar toggleMobile={toggleMobile} /> {/* Navbar nằm trên cùng */}
                <div className="content">
                    <Outlet /> {/* Outlet sẽ render các trang con như DashboardPage, JobListPage,... */}
                </div> 
            </div>
        </div>
    );
};

export default Layout;
