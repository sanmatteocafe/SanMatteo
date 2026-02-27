'use client';
import styles from './CategoryFilter.module.css';

export default function CategoryFilter({ categories, selected, onSelect }) {
    return (
        <div className={styles.wrapper}>
            <div className={styles.pills}>
                <button
                    className={`${styles.pill} ${selected === 'all' ? styles.active : ''}`}
                    onClick={() => onSelect('all')}
                >
                    <span className={styles.icon}>🍽️</span>
                    All
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat.id || (cat.name || cat)}
                        className={`${styles.pill} ${selected === (cat.name || cat) ? styles.active : ''}`}
                        onClick={() => onSelect(cat.name || cat)}
                    >
                        {cat.icon && <span className={styles.icon}>{cat.icon}</span>}
                        {cat.name || cat}
                    </button>
                ))}
            </div>
        </div>
    );
}
