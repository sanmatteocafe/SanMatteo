'use client';
import { useCart } from '@/lib/CartContext';
import { FiMinus, FiPlus, FiTrash2, FiEdit3 } from 'react-icons/fi';
import styles from './CartItem.module.css';

export default function CartItem({ item }) {
    const { updateQuantity, removeItem } = useCart();

    return (
        <div className={styles.item}>
            <div className={styles.itemImageWrapper}>
                <img
                    src={item.image || '/placeholder-food.jpg'}
                    alt={item.name}
                    className={styles.itemImage}
                />
            </div>

            <div className={styles.itemInfo}>
                <h4 className={styles.itemName}>{item.name}</h4>
                <p className={styles.itemDesc}>
                    {item.description || `Hand-crafted ${item.category.toLowerCase()} made with premium ingredients.`}
                </p>
                <div className={styles.addNote}>
                    <FiEdit3 size={12} /> ADD NOTE
                </div>
            </div>

            <div className={styles.itemRight}>
                <span className={styles.itemPrice}>₹{item.price.toFixed(2)}</span>
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
