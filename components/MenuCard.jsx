'use client';
import { useState } from 'react';
import { useCart } from '@/lib/CartContext';
import { FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import styles from './MenuCard.module.css';

export default function MenuCard({ item }) {
    const { addItem } = useCart();
    const [variant, setVariant] = useState('hot');

    const handleAdd = () => {
        const cartItem = {
            ...item,
            // If item has variants, append the variant to make it a unique cart entry
            id: item.hasVariants ? `${item.id}_${variant}` : item.id,
            name: item.hasVariants ? `${item.name} (${variant === 'hot' ? 'Hot' : 'Cold'})` : item.name,
            variant: item.hasVariants ? variant : undefined,
        };
        addItem(cartItem);
        toast.success(`${cartItem.name} added to cart!`, {
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
            <div className={styles.content}>
                <div className={styles.topRow}>
                    <div className={styles.nameBlock}>
                        <h3 className={styles.name}>{item.name}</h3>
                        {item.description && (
                            <p className={styles.description}>{item.description}</p>
                        )}
                    </div>
                    <span className={styles.price}>₹{item.price}</span>
                </div>

                {item.hasVariants && (
                    <div className={styles.variantToggle}>
                        <button
                            type="button"
                            className={`${styles.variantBtn} ${variant === 'hot' ? styles.variantActive : ''}`}
                            onClick={() => setVariant('hot')}
                        >
                            🔥 Hot
                        </button>
                        <button
                            type="button"
                            className={`${styles.variantBtn} ${variant === 'cold' ? styles.variantActive : ''}`}
                            onClick={() => setVariant('cold')}
                        >
                            ❄️ Cold
                        </button>
                    </div>
                )}

                <button className={styles.addBtn} onClick={handleAdd} aria-label="Add to cart">
                    <FiPlus />
                </button>
            </div>
        </div>
    );
}
