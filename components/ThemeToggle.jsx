'use client';
import { useTheme } from '@/lib/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            className={styles.toggle}
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            <div className={`${styles.icon} ${theme === 'light' ? styles.active : ''}`}>
                <FiSun />
            </div>
            <div className={`${styles.icon} ${theme === 'dark' ? styles.active : ''}`}>
                <FiMoon />
            </div>
            <div className={`${styles.slider} ${theme === 'dark' ? styles.isDark : ''}`} />
        </button>
    );
}
