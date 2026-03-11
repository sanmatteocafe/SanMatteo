'use client';
import { useCart } from '@/lib/CartContext';
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import styles from './CartItem.module.css';

export default function CartItem({ item }) {
    const { updateQuantity, removeItem } = useCart();

    return (
        <div className={styles.item}>
            <div className={styles.itemInfo}>
                <h4 className={styles.itemName}>{item.name}</h4>
                {item.description && (
                    <p className={styles.itemDesc}>{item.description}</p>
                )}
            </div>

            <div className={styles.itemRight}>
                <span className={styles.itemPrice}>₹{(item.price * item.quantity).toFixed(2)}</span>
                <div className={styles.itemControls}>
                    <button
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                        <FiMinus />
                    </button>
                    <span className={styles.qtyValue}>{item.quantity}</span>
                    <button
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                        <FiPlus />
                    </button>
                </div>
            </div>

            <button className={styles.removeBtn} onClick={() => removeItem(item.id)}>
                <FiTrash2 />
            </button>
        </div>
    );
}
