'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { FiShoppingCart, FiMenu, FiX, FiHome, FiBook, FiShoppingBag, FiUser, FiLogOut, FiClock, FiSettings } from 'react-icons/fi';
import ThemeToggle from '@/components/ThemeToggle';
import styles from './Navbar.module.css';

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { totalItems } = useCart();
    const { user, userProfile, logout } = useAuth();

    const isAdmin = userProfile?.role === 'admin';

    const links = [
        { href: '/', label: 'Home', icon: <FiHome /> },
        { href: '/menu', label: 'Menu', icon: <FiBook /> },
        { href: '/cart', label: 'Cart', icon: <FiShoppingBag /> },
    ];

    const handleLogout = async () => {
        try {
            await logout();
            setUserMenuOpen(false);
            router.push('/');
        } catch (e) {
            console.error('Logout error:', e);
        }
    };

    const getUserInitial = () => {
        if (userProfile?.name) return userProfile.name.charAt(0).toUpperCase();
        if (user?.displayName) return user.displayName.charAt(0).toUpperCase();
        if (user?.email) return user.email.charAt(0).toUpperCase();
        return 'U';
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    <Image src="/SanMatteo-logo.jpeg" alt="San Matteo Cafe" width={40} height={40} className={styles.logoImg} />
                    <span className={styles.logoText}>SAN MATTEO</span>
                </Link>

                <div className={`${styles.navLinks} ${menuOpen ? styles.open : ''}`}>
                    {links.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
                            onClick={() => setMenuOpen(false)}
                        >
                            {link.icon}
                            {link.label}
                        </Link>
                    ))}

                    {/* Mobile-only auth links */}
                    {user && (
                        <Link
                            href="/profile/orders"
                            className={`${styles.navLink} ${styles.mobileAuthLink} ${pathname === '/profile/orders' ? styles.active : ''}`}
                            onClick={() => setMenuOpen(false)}
                        >
                            <FiClock />
                            Order History
                        </Link>
                    )}
                    {isAdmin && (
                        <Link
                            href="/admin/dashboard"
                            className={`${styles.navLink} ${styles.mobileAuthLink}`}
                            onClick={() => setMenuOpen(false)}
                        >
                            <FiSettings />
                            Admin Panel
                        </Link>
                    )}
                    {!user && (
                        <Link
                            href="/login"
                            className={`${styles.navLink} ${styles.mobileAuthLink} ${pathname === '/login' ? styles.active : ''}`}
                            onClick={() => setMenuOpen(false)}
                        >
                            <FiUser />
                            Sign In
                        </Link>
                    )}
                    {user && (
                        <button
                            className={`${styles.navLink} ${styles.mobileAuthLink}`}
                            onClick={() => { handleLogout(); setMenuOpen(false); }}
                        >
                            <FiLogOut />
                            Sign Out
                        </button>
                    )}
                </div>

                <div className={styles.navRight}>
                    <div className={styles.desktopOnly}>
                        <ThemeToggle />
                    </div>

                    {/* Admin Panel Button - Desktop (only for admins) */}
                    {isAdmin && (
                        <Link href="/admin/dashboard" className={styles.adminBtn}>
                            <FiSettings />
                            Admin
                        </Link>
                    )}

                    {/* Auth Button - Desktop */}
                    {!user ? (
                        <Link href="/login" className={styles.authBtn}>
                            Sign In
                        </Link>
                    ) : (
                        <div className={styles.userMenuContainer}>
                            <button
                                className={styles.userAvatar}
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                            >
                                {getUserInitial()}
                            </button>
                            {userMenuOpen && (
                                <>
                                    <div className={styles.userDropdown}>
                                        <div className={styles.userInfo}>
                                            <span className={styles.userName}>
                                                {userProfile?.name || user?.displayName || 'User'}
                                            </span>
                                            <span className={styles.userEmail}>{user?.email}</span>
                                        </div>
                                        <div className={styles.dropdownDivider} />
                                        <Link
                                            href="/profile/orders"
                                            className={styles.dropdownItem}
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            <FiClock />
                                            Order History
                                        </Link>
                                        <div className={styles.dropdownDivider} />
                                        <button className={styles.dropdownItem} onClick={handleLogout}>
                                            <FiLogOut />
                                            Sign Out
                                        </button>
                                    </div>
                                    <div
                                        className={styles.userDropdownOverlay}
                                        onClick={() => setUserMenuOpen(false)}
                                    />
                                </>
                            )}
                        </div>
                    )}

                    <Link href="/cart" className={styles.cartBtn}>
                        <FiShoppingCart />
                        {totalItems > 0 && (
                            <span className={styles.cartBadge}>{totalItems}</span>
                        )}
                    </Link>
                    <button
                        className={styles.menuToggle}
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? <FiX /> : <FiMenu />}
                    </button>
                </div>
            </div>

            {menuOpen && (
                <div className={styles.overlay} onClick={() => setMenuOpen(false)} />
            )}
        </nav>
    );
}
