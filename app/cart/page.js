'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import CartItem from '@/components/CartItem';
import { useCart } from '@/lib/CartContext';
import { getMenuItems } from '@/services/menuService';
import { FiShoppingBag, FiArrowRight, FiCreditCard, FiSmartphone } from 'react-icons/fi';
import { SiApplepay, SiGooglepay } from 'react-icons/si';
import styles from './page.module.css';
import toast from 'react-hot-toast';

export default function CartPage() {
    const { items, totalItems, totalPrice, addItem, specialInstructions, setInstructions } = useCart();
    const [pairedItems, setPairedItems] = useState([]);

    useEffect(() => {
        const fetchPaired = async () => {
            try {
                const allItems = await getMenuItems();
                // Randomly pick some desserts or drinks as "paired" items
                const suggestions = allItems
                    .filter(i => i.category === 'Artisan Pastries' || i.category === 'Pastry' || i.category === 'Desserts')
                    .slice(0, 3);
                setPairedItems(suggestions);
            } catch (e) {
                console.error('Failed to fetch pairings');
            }
        };
        fetchPaired();
    }, []);

    const serviceCharge = totalPrice * 0.05;
    const tax = totalPrice * 0.06;
    const grandTotal = totalPrice + serviceCharge + tax;

    if (items.length === 0) {
        return (
            <>
                <Navbar />
                <main className={styles.main}>
                    <div className="container">
                        <div className={styles.empty}>
                            <FiShoppingBag size={64} color="#D4A373" style={{ marginBottom: '2rem' }} />
                            <h2 className={styles.title}>Your Selection is Empty</h2>
                            <p className={styles.subtitle}>Begin your bespoke journey by exploring our signature menu.</p>
                            <Link href="/menu" style={{ display: 'inline-block', marginTop: '2rem' }}>
                                <button className={styles.checkoutBtn} style={{ width: 'auto', padding: '1rem 2.5rem' }}>
                                    BROWSE MENU <FiArrowRight />
                                </button>
                            </Link>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className={styles.main}>
                <div className="container">
                    <header className={styles.header}>
                        <h1 className={styles.title}>Review Cart</h1>
                        <p className={styles.subtitle}>Refining your bespoke selection for the morning.</p>
                    </header>

                    <div className={styles.layout}>
                        {/* Primary Items List */}
                        <div className={styles.cartContent}>
                            <div className={styles.itemsList}>
                                {items.map((item) => (
                                    <CartItem key={item.id} item={item} />
                                ))}
                            </div>

                            {/* Special Instructions */}
                            <div className={styles.instructionsSection}>
                                <label className={styles.sectionLabel}>Special Instructions</label>
                                <textarea
                                    className={styles.textarea}
                                    placeholder="e.g. Extra hot, no sugar, allergies..."
                                    value={specialInstructions}
                                    onChange={(e) => setInstructions(e.target.value)}
                                />
                            </div>

                            {/* Frequently Paired With */}
                            <div className={styles.crossSellSection}>
                                <h3 className={styles.crossSellHeader}>Frequently Paired With</h3>
                                <div className={styles.crossSellGrid}>
                                    {pairedItems.map(item => (
                                        <div key={item.id} className={styles.crossSellCard}>
                                            <div className={styles.cardTop}>
                                                <img
                                                    src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'}
                                                    alt={item.name}
                                                    className={styles.cardImg}
                                                />
                                            </div>
                                            <div className={styles.cardBody}>
                                                <div className={styles.cardHeader}>
                                                    <span className={styles.cardName}>{item.name}</span>
                                                    <span className={styles.cardPrice}>₹{item.price.toFixed(2)}</span>
                                                </div>
                                                <p className={styles.cardDesc}>Hand-crafted seasonal treat.</p>
                                                <button
                                                    className={styles.addSmallBtn}
                                                    onClick={() => {
                                                        addItem(item);
                                                        toast.success(`${item.name} added!`);
                                                    }}
                                                >
                                                    + Add to Order
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sticky Desktop Summary (Optional but helpful) */}
                        <aside className={styles.summarySide}>
                            <h3>Order Summary</h3>
                            <div className={styles.sumRow}>
                                <span>Subtotal</span>
                                <span>₹{totalPrice.toFixed(2)}</span>
                            </div>
                            <div className={styles.sumRow}>
                                <span>Service Charge (5%)</span>
                                <span>₹{serviceCharge.toFixed(2)}</span>
                            </div>
                            <div className={styles.sumRow}>
                                <span>Estimated Tax (6%)</span>
                                <span>₹{tax.toFixed(2)}</span>
                            </div>
                            <div className={styles.sumTotal}>
                                <label>Total</label>
                                <span>₹{grandTotal.toFixed(2)}</span>
                            </div>

                            <Link href="/checkout">
                                <button className={styles.checkoutBtn}>
                                    PROCEED TO CHECKOUT <FiArrowRight />
                                </button>
                            </Link>

                            <div className={styles.securityNote}>
                                Secure Luxury Encrypted Payment
                            </div>

                            <div className={styles.paymentIcons}>
                                <FiCreditCard size={18} />
                                <SiApplepay size={24} />
                                <FiSmartphone size={18} />
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            {/* Premium Floating Footer */}
            <div className={styles.floatingFooter}>
                <div className={styles.barLeft}>
                    <span className={styles.barLabel}>TOTAL AMOUNT</span>
                    <span className={styles.barTotal}>₹{grandTotal.toFixed(2)}</span>
                </div>
                <Link href="/checkout">
                    <button className={styles.barCheckoutBtn}>
                        PLACE ORDER <FiArrowRight size={20} />
                    </button>
                </Link>
            </div>
        </>
    );
}
