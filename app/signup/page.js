'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import styles from './page.module.css';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { user, signup } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user) router.push('/');
    }, [user, router]);

    const handleSignup = async (e) => {
        e.preventDefault();
        if (!name || !email || !password) {
            toast.error('Please fill in all required fields');
            return;
        }
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setIsLoading(true);
        try {
            await signup(email, password, { name, phone });
            toast.success('Account created successfully!');
            router.push('/');
        } catch (err) {
            const msg = err.code === 'auth/email-already-in-use'
                ? 'An account with this email already exists'
                : err.code === 'auth/weak-password'
                    ? 'Password is too weak'
                    : 'Signup failed. Please try again.';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    if (user) return null;

    return (
        <>
            <Navbar />
            <main className={styles.page}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Create Your Account</h1>
                        <p className={styles.subtitle}>Join the SAN MATTEEO legacy.</p>
                    </div>

                    <form onSubmit={handleSignup} className={styles.form}>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Full Name</label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={styles.input}
                                autoComplete="name"
                            />
                        </div>

                        <div className={styles.row}>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Email</label>
                                <input
                                    type="email"
                                    placeholder="john@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={styles.input}
                                    autoComplete="email"
                                />
                            </div>
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>Phone Number</label>
                                <input
                                    type="tel"
                                    placeholder="+1 (555) 000-0000"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className={styles.input}
                                    autoComplete="tel"
                                />
                            </div>
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Password</label>
                            <div className={styles.inputWrapper}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Create a strong password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={styles.input}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className={styles.togglePassword}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <p className={styles.footerText}>
                        Already have an account?{' '}
                        <Link href="/login" className={styles.footerLink}>Login</Link>
                    </p>
                </div>

                <footer className={styles.pageFooter}>
                    <span>Privacy Policy</span>
                    <span>Terms of Service</span>
                    <span>Contact Support</span>
                </footer>
            </main>
        </>
    );
}
