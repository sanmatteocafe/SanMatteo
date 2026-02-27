'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Sidebar from './Sidebar';
import { AdminProvider } from '@/lib/AdminContext';
import '@/styles/admin.css';

export default function AdminLayout({ children }) {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        if (loading) return;

        // Allow access to admin login page without role check
        if (pathname === '/admin/login') {
            setAuthorized(true);
            return;
        }

        // Not logged in → redirect to admin login
        if (!user) {
            router.push('/admin/login');
            return;
        }

        // Logged in but not admin → redirect to home
        if (userProfile && userProfile.role !== 'admin') {
            router.push('/');
            return;
        }

        // Admin role confirmed
        if (userProfile?.role === 'admin') {
            setAuthorized(true);
        }
    }, [user, userProfile, loading, pathname, router]);

    // Show nothing while checking auth
    if (loading || (!authorized && pathname !== '/admin/login')) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100vh', fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)'
            }}>
                Verifying access...
            </div>
        );
    }

    // Admin login page doesn't need sidebar
    if (pathname === '/admin/login') {
        return children;
    }

    return (
        <AdminProvider>
            <div className="admin-layout">
                <Sidebar />
                <main className="admin-main">
                    {children}
                </main>
            </div>
        </AdminProvider>
    );
}
