'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/lib/AuthContext';
import { getAllUsers, updateUserRole } from '@/services/userService';
import { FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import '@/styles/admin.css';
import styles from './page.module.css';

const ITEMS_PER_PAGE = 10;

export default function AdminUsersPage() {
    const { userProfile } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch (e) {
            console.error('Error loading users:', e);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    }

    const handleRoleChange = async (userId, newRole) => {
        if (userId === userProfile?.uid) {
            toast.error('You cannot change your own role');
            return;
        }
        try {
            await updateUserRole(userId, newRole);
            setUsers(prev => prev.map(u =>
                u.id === userId ? { ...u, role: newRole } : u
            ));
            toast.success(`Role updated to ${newRole}`);
        } catch (e) {
            toast.error('Failed to update role');
        }
    };

    const filtered = users.filter(u => {
        const q = search.toLowerCase();
        return (
            (u.name || '').toLowerCase().includes(q) ||
            (u.email || '').toLowerCase().includes(q) ||
            (u.phone || '').toLowerCase().includes(q)
        );
    });

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    return (
        <AdminLayout>
            <div className={styles.header}>
                <h1 className={styles.title}>User Management</h1>
                <div className={styles.searchBar}>
                    <FiSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className={styles.searchInput}
                    />
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>USER</th>
                            <th>EMAIL</th>
                            <th>PHONE</th>
                            <th>ROLE</th>
                            <th>JOINED</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" className={styles.loadingCell}>Loading users...</td>
                            </tr>
                        ) : paginated.length === 0 ? (
                            <tr>
                                <td colSpan="6" className={styles.loadingCell}>No users found</td>
                            </tr>
                        ) : paginated.map(user => (
                            <tr key={user.id}>
                                <td>
                                    <div className={styles.userCell}>
                                        <div className={styles.avatar}>
                                            {(user.name || user.email || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <span className={styles.userName}>{user.name || '—'}</span>
                                    </div>
                                </td>
                                <td className={styles.emailCell}>{user.email || '—'}</td>
                                <td>{user.phone || '—'}</td>
                                <td>
                                    <span className={`${styles.roleBadge} ${user.role === 'admin' ? styles.roleAdmin : styles.roleUser}`}>
                                        {(user.role || 'user').toUpperCase()}
                                    </span>
                                </td>
                                <td className={styles.dateCell}>
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                                </td>
                                <td>
                                    <select
                                        value={user.role || 'user'}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        className={styles.roleSelect}
                                        disabled={user.id === userProfile?.uid}
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <span className={styles.pageInfo}>
                        Showing {(page - 1) * ITEMS_PER_PAGE + 1} to {Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} members
                    </span>
                    <div className={styles.pageButtons}>
                        <button
                            className={styles.pageBtn}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <FiChevronLeft />
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (page <= 3) {
                                pageNum = i + 1;
                            } else if (page >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = page - 2 + i;
                            }
                            return (
                                <button
                                    key={pageNum}
                                    className={`${styles.pageBtn} ${page === pageNum ? styles.pageBtnActive : ''}`}
                                    onClick={() => setPage(pageNum)}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        <button
                            className={styles.pageBtn}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            <FiChevronRight />
                        </button>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
