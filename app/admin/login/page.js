'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Button from '@/components/Button';
import toast from 'react-hot-toast';
import { FiMail, FiLock } from 'react-icons/fi';
import '@/styles/admin.css';
import styles from './page.module.css';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { user, userProfile, login } = useAuth();
    const router = useRouter();

    // If already logged in as admin, go to dashboard
    useEffect(() => {
        if (user && userProfile?.role === 'admin') {
            router.push('/admin/dashboard');
        }
    }, [user, userProfile, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            // Role check happens in AdminLayout guard
            // Brief delay to let userProfile load
            toast.success('Checking access...');
        } catch (err) {
            toast.error('Invalid credentials');
        }
        setLoading(false);
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <h1>☕ SAN MATTEO</h1>
                <p>Sign in to Admin Panel</p>

                <form onSubmit={handleSubmit}>
                    <div className="admin-form-group">
                        <label>Email</label>
                        <div className={styles.inputWrapper}>
                            <FiMail className={styles.inputIcon} />
                            <input
                                type="email"
                                placeholder="admin@cafe.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="admin-form-group">
                        <label>Password</label>
                        <div className={styles.inputWrapper}>
                            <FiLock className={styles.inputIcon} />
                            <input
                                type="password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </form>

                <p className={styles.note}>
                    Only users with admin role can access this panel.
                </p>
            </div>
        </div>
    );
}
