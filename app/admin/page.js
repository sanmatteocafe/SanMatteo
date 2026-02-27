'use client';
export default function AdminPage() {
    if (typeof window !== 'undefined') {
        window.location.href = '/admin/dashboard';
    }
    return null;
}
