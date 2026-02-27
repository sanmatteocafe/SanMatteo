'use client';
import { useCart } from '@/lib/CartContext';
import { FiPlus, FiShoppingCart } from 'react-icons/fi';
import toast from 'react-hot-toast';
import styles from './MenuCard.module.css';

export default function MenuCard({ item }) {
    const { addItem } = useCart();

    const handleAdd = () => {
        addItem(item);
        toast.success(`${item.name} added to cart!`, {
            style: {
                borderRadius: '12px',
                background: '#2C1810',
                color: '#F5EDE4',
            },
            iconTheme: { primary: '#D4A373', secondary: '#fff' },
        });
    };

    return (
        <div className={styles.card}>
            {item.badge && (
                <span className={`${styles.badge} ${styles[item.badge.toLowerCase()]}`}>
                    {item.badge}
                </span>
            )}
            <div className={styles.imageWrapper}>
                <img
                    src={item.image || 'https://placehold.co/400x300/F5F0EB/8A7A6E?text=No+Image'}
                    alt={item.name}
                    className={styles.image}
                    loading="lazy"
                    onError={(e) => { e.target.src = 'https://placehold.co/400x300/F5F0EB/8A7A6E?text=No+Image'; }}
                />
            </div>
            <div className={styles.content}>
                <div className={styles.topRow}>
                    <h3 className={styles.name}>{item.name}</h3>
                    <span className={styles.price}>₹{item.price}</span>
                </div>
                {item.description && (
                    <p className={styles.description}>{item.description}</p>
                )}
                <button className={styles.addBtn} onClick={handleAdd} aria-label="Add to cart">
                    <FiPlus />
                </button>
            </div>
        </div>
    );
}
