'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import styles from './page.module.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [resetMode, setResetMode] = useState(false);

    const { user, login, loginWithGoogle, resetPassword } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user) router.push('/');
    }, [user, router]);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }
        setIsLoading(true);
        try {
            await login(email, password);
            toast.success('Welcome back!');
            router.push('/');
        } catch (err) {
            const msg = err.code === 'auth/invalid-credential'
                ? 'Invalid email or password'
                : err.code === 'auth/too-many-requests'
                    ? 'Too many attempts. Try again later.'
                    : 'Login failed. Please try again.';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
            toast.success('Welcome!');
            router.push('/');
        } catch (err) {
            if (err.code !== 'auth/popup-closed-by-user') {
                toast.error('Google sign-in failed');
            }
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Enter your email address');
            return;
        }
        setIsLoading(true);
        try {
            await resetPassword(email);
            toast.success('Password reset email sent!');
            setResetMode(false);
        } catch (err) {
            toast.error('Could not send reset email. Check your address.');
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
                        <h1 className={styles.title}>
                            {resetMode ? 'Reset Password' : 'Welcome Back'}
                        </h1>
                        <p className={styles.subtitle}>
                            {resetMode
                                ? 'Enter your email to receive a reset link'
                                : 'Enter your details to access your account'}
                        </p>
                    </div>

                    <form onSubmit={resetMode ? handleResetPassword : handleLogin} className={styles.form}>
                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Email Address</label>
                            <div className={styles.inputWrapper}>
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={styles.input}
                                    autoComplete="email"
                                />
                                <FiMail className={styles.inputIcon} />
                            </div>
                        </div>

                        {!resetMode && (
                            <div className={styles.fieldGroup}>
                                <div className={styles.labelRow}>
                                    <label className={styles.label}>Password</label>
                                    <button
                                        type="button"
                                        className={styles.forgotLink}
                                        onClick={() => setResetMode(true)}
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                                <div className={styles.inputWrapper}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={styles.input}
                                        autoComplete="current-password"
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
                        )}

                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={isLoading}
                        >
                            {isLoading
                                ? (resetMode ? 'Sending...' : 'Signing In...')
                                : (resetMode ? 'Send Reset Link' : 'Sign In')}
                        </button>

                        {resetMode && (
                            <button
                                type="button"
                                className={styles.backLink}
                                onClick={() => setResetMode(false)}
                            >
                                ← Back to Sign In
                            </button>
                        )}
                    </form>

                    {!resetMode && (
                        <>
                            <div className={styles.divider}>
                                <span>OR CONTINUE WITH</span>
                            </div>

                            <div className={styles.socialButtons}>
                                <button
                                    className={styles.socialBtn}
                                    onClick={handleGoogleLogin}
                                    type="button"
                                >
                                    <svg className={styles.socialIcon} viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Continue with Google
                                </button>
                            </div>

                            <p className={styles.footerText}>
                                Don&apos;t have an account?{' '}
                                <Link href="/signup" className={styles.footerLink}>Sign Up</Link>
                            </p>
                        </>
                    )}
                </div>

                <footer className={styles.pageFooter}>
                    © 2024 SAN MATTEEO. All rights reserved.
                </footer>
            </main>
        </>
    );
}
