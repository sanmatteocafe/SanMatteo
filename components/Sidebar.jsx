'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useAdmin } from '@/lib/AdminContext';
import {
    FiGrid, FiShoppingBag, FiBook, FiTag, FiFileText, FiBarChart2, FiLogOut, FiMenu, FiX, FiSmartphone, FiUsers, FiArrowLeft
} from 'react-icons/fi';
import { useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';

const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: <FiGrid /> },
    { href: '/admin/orders', label: 'Orders', icon: <FiShoppingBag /> },
    { href: '/admin/menu', label: 'Menu', icon: <FiBook /> },
    { href: '/admin/categories', label: 'Categories', icon: <FiTag /> },
    { href: '/admin/users', label: 'Users', icon: <FiUsers /> },
    { href: '/admin/qrcodes', label: 'QR Codes', icon: <FiSmartphone /> },
    { href: '/admin/billing', label: 'Billing', icon: <FiFileText /> },
    { href: '/admin/analytics', label: 'Analytics', icon: <FiBarChart2 /> },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { logout } = useAuth();
    const { unreadCount } = useAdmin(); // Get unread count from context
    const [open, setOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        router.push('/admin/login');
    };

    return (
        <>
            <button
                className="sidebar-toggle"
                onClick={() => setOpen(!open)}
                style={{ position: 'fixed', top: 16, left: 16, zIndex: 101 }}
            >
                {open ? <FiX /> : <FiMenu />}
            </button>

            {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}

            <aside className={`admin-sidebar ${open ? 'open' : ''}`}>
                <div className="sidebar-logo">
                    <h2>☕ SAN MATTEEO</h2>
                    <span>Admin Panel</span>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`sidebar-nav-item ${pathname === item.href ? 'active' : ''}`}
                            onClick={() => setOpen(false)}
                        >
                            {item.icon}
                            {item.label}
                            {item.label === 'Orders' && unreadCount > 0 && (
                                <span className="nav-badge">{unreadCount}</span>
                            )}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <Link
                        href="/"
                        className="sidebar-nav-item"
                        style={{ marginBottom: '8px' }}
                    >
                        <FiArrowLeft />
                        Back to Site
                    </Link>
                    <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                        <ThemeToggle />
                    </div>
                    <button
                        className="sidebar-nav-item"
                        onClick={handleLogout}
                        style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                        <FiLogOut />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
}
