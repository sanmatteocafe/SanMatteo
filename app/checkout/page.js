'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { createOrder, getOrders } from '@/services/orderService';
import { createBill } from '@/services/billingService';
import { getQRCodes } from '@/services/qrService';
import { getTables } from '@/services/tableService';
import toast from 'react-hot-toast';
import { FiUser, FiPhone, FiHash, FiCreditCard, FiLock, FiMinus, FiPlus, FiChevronDown, FiBook, FiArrowRight } from 'react-icons/fi';
import { playChime } from '@/lib/audioUtils';
import styles from './page.module.css';

export default function CheckoutPage() {
    const router = useRouter();
    const { items, totalPrice, tableNumber, clearCart, updateQuantity, removeItem, specialInstructions } = useCart();
    const { user, userProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [phoneError, setPhoneError] = useState(false);
    const [availableTables, setAvailableTables] = useState([]);
    const [occupiedTables, setOccupiedTables] = useState(new Set());
    const [tablesLoading, setTablesLoading] = useState(true);

    // Table is locked if it was set via QR code
    const isTableLocked = !!tableNumber;

    // Auto-fill from user profile if logged in
    const isProfileFilled = !!(user && userProfile);

    const [form, setForm] = useState({
        name: userProfile?.name || '',
        phone: userProfile?.phone || '',
        tableNumber: tableNumber || '',
        paymentType: 'online',
    });

    // Fetch tables from QR codes, active orders, and manual occupancy
    useEffect(() => {
        const fetchTableData = async () => {
            try {
                const [qrCodes, allOrders, tablesData] = await Promise.all([
                    getQRCodes(),
                    getOrders(),
                    getTables()
                ]);

                // Get table numbers from QR codes
                const tables = qrCodes
                    .map(qr => ({ number: qr.tableNumber, name: qr.tableName || '' }))
                    .sort((a, b) => a.number - b.number);
                setAvailableTables(tables);

                // Find occupied tables (orders with active status)
                const activeStatuses = ['pending', 'preparing', 'ready'];
                const occupied = new Set(
                    allOrders
                        .filter(o => activeStatuses.includes(o.status))
                        .map(o => o.tableNumber)
                );

                // Also include manually occupied tables from admin
                tablesData.forEach(t => {
                    if (t.manuallyOccupied) occupied.add(t.tableNumber);
                });

                setOccupiedTables(occupied);
            } catch (err) {
                console.error('Error loading table data:', err);
            } finally {
                setTablesLoading(false);
            }
        };
        fetchTableData();
    }, []);

    const tax = Math.round(totalPrice * 0.05);
    const grandTotal = totalPrice + tax;

    const validatePhone = (num) => {
        return /^[0-9]{10}$/.test(num);
    };

    const handleChange = (field) => (e) => {
        if (field === 'tableNumber' && isTableLocked) return;

        let value = e.target.value;
        if (field === 'phone') {
            // Integer only: remove non-numeric characters
            value = value.replace(/\D/g, '');
            // Max length 10
            if (value.length > 10) value = value.slice(0, 10);

            // Real-time validation check
            if (value.length === 10) {
                setPhoneError(false);
            }
        }

        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handlePaymentSelect = (type) => {
        setForm(prev => ({ ...prev, paymentType: type }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (items.length === 0) {
            toast.error('Your cart is empty!');
            return;
        }

        if (!validatePhone(form.phone)) {
            setPhoneError(true);
            toast.error('Please enter a valid 10-digit phone number.');
            return;
        }

        if (!form.tableNumber) {
            toast.error('Please select a table number.');
            return;
        }

        setLoading(true);
        try {
            const orderData = {
                orderNumber: `SAN-${Date.now().toString().slice(-6)}`,
                tableNumber: Number(form.tableNumber),
                customerName: form.name,
                phone: Number(form.phone), // STORE AS INTEGER
                userId: user?.uid || null,
                items: items.map(item => ({
                    name: item.name,
                    price: item.price,
                    qty: item.quantity,
                })),
                total: totalPrice,
                tax,
                grandTotal,
                paymentType: form.paymentType,
                status: 'pending',
                specialInstructions: specialInstructions || '', // Fallback to empty string to avoid undefined error
            };

            const docRef = await createOrder(orderData);

            await createBill({
                orderId: docRef.id,
                orderNumber: orderData.orderNumber,
                tableNumber: orderData.tableNumber,
                customerName: orderData.customerName,
                items: orderData.items,
                total: orderData.total,
                tax: orderData.tax,
                grandTotal: orderData.grandTotal,
                paymentType: orderData.paymentType,
                status: 'ready'
            });

            clearCart();
            playChime(); // Play synthesized confirmation sound
            toast.success('Order placed successfully!', { duration: 5000 });
            router.push(`/ordertracking?orderId=${docRef.id}`);
        } catch (err) {
            console.error('Checkout Error:', err);
            toast.error(`Error: ${err.message || 'Failed to place order'}`);
        }
        setLoading(false);
    };

    return (
        <>
            <Navbar />
            <main className={styles.main}>
                <div className="container">
                    <header style={{ marginBottom: '40px' }}>
                        <h1 className={styles.title}>Checkout</h1>
                        <p className={styles.subtitle}>Review your order and complete details below.</p>
                    </header>

                    <div className={styles.layout}>
                        {/* Left Column: Items & Details */}
                        <div className={styles.leftCol}>
                            <div className={styles.itemsList}>
                                {items.map((item) => (
                                    <div key={item.id} className={styles.itemCard}>
                                        <img
                                            src={item.image || "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=400"}
                                            alt={item.name}
                                            className={styles.itemImage}
                                        />
                                        <div className={styles.itemInfo}>
                                            <h3 className={styles.itemName}>{item.name}</h3>
                                            <p className={styles.itemDesc}>{item.description || 'Premium selection'}</p>
                                            <span className={styles.itemPrice}>₹{item.price}</span>
                                        </div>
                                        <div className={styles.qtyControls}>
                                            <button
                                                className={styles.qtyBtn}
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
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
                                ))}
                            </div>

                            <div className={styles.formSection}>
                                <div className={styles.sectionHeader}>
                                    <FiUser />
                                    <span>Your Details</span>
                                </div>

                                <div className={styles.formGrid}>
                                    <div className={styles.fullWidth}>
                                        <Input
                                            label="Full Name"
                                            placeholder="e.g. Jane Doe"
                                            value={form.name}
                                            onChange={handleChange('name')}
                                            required
                                            readOnly={isProfileFilled && !!userProfile?.name}
                                        />
                                    </div>
                                    <div className={styles.fullWidth}>
                                        <Input
                                            label="Phone Number"
                                            placeholder="10-digit mobile number"
                                            value={form.phone}
                                            onChange={handleChange('phone')}
                                            required
                                            maxLength={10}
                                            readOnly={isProfileFilled && !!userProfile?.phone}
                                        />
                                        {phoneError && (
                                            <p className={styles.errorText}>
                                                Please enter a valid 10-digit number.
                                            </p>
                                        )}
                                    </div>
                                    <div className={styles.fullWidth}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#8A7A6E' }}>Table Number</label>

                                        {isTableLocked ? (
                                            <div className={styles.tableLockedBadge}>
                                                <FiLock className={styles.lockedIcon} />
                                                <div>
                                                    <span className={styles.lockedText}>Table {form.tableNumber}</span>
                                                    <span className={styles.lockedSub}>Auto-detected via QR Code</span>
                                                </div>
                                            </div>
                                        ) : tablesLoading ? (
                                            <div className={styles.tableGrid}>
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <div key={i} className={`${styles.tableBubble} ${styles.skeleton}`}></div>
                                                ))}
                                            </div>
                                        ) : availableTables.length === 0 ? (
                                            <div style={{ padding: '20px', textAlign: 'center', color: '#8A7A6E', fontSize: '14px', background: '#F9F6F2', borderRadius: '12px' }}>
                                                No tables available. Ask admin to create tables in QR Code Manager.
                                            </div>
                                        ) : (
                                            <div className={styles.tableGrid}>
                                                {availableTables.map((table) => {
                                                    const isOccupied = occupiedTables.has(table.number);
                                                    const isSelected = Number(form.tableNumber) === table.number;
                                                    return (
                                                        <button
                                                            key={table.number}
                                                            type="button"
                                                            className={`${styles.tableBubble} ${isSelected ? styles.selected : ''} ${isOccupied ? styles.occupied : ''}`}
                                                            onClick={() => {
                                                                if (!isOccupied) {
                                                                    setForm(prev => ({ ...prev, tableNumber: table.number }));
                                                                }
                                                            }}
                                                            disabled={isOccupied}
                                                            title={isOccupied ? `Table ${table.number} is occupied` : table.name || `Table ${table.number}`}
                                                        >
                                                            <span>{table.number}</span>
                                                            {isOccupied && <span className={styles.occupiedLabel}>Busy</span>}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Sidebar */}
                        <aside className={styles.sidebar}>
                            <div className={styles.summaryCard}>
                                <div className={styles.summaryHeader}>
                                    <FiBook />
                                    <span>Order Total</span>
                                </div>

                                <div className={styles.summaryRow}>
                                    <span>Subtotal</span>
                                    <span>₹{totalPrice.toFixed(2)}</span>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span>Tax (5%)</span>
                                    <span>₹{tax.toFixed(2)}</span>
                                </div>

                                <div className={styles.summaryDivider} />

                                <div className={styles.grandTotalRow}>
                                    <span>Grand Total</span>
                                    <span>₹{grandTotal.toFixed(2)}</span>
                                </div>

                                <h4 className={styles.paymentTitle}>Payment Method</h4>
                                <div className={styles.paymentOptions}>
                                    <div
                                        className={`${styles.paymentOption} ${form.paymentType === 'online' ? styles.selected : ''}`}
                                        onClick={() => handlePaymentSelect('online')}
                                    >
                                        <div className={styles.radioCircle}>
                                            {form.paymentType === 'online' && <div className={styles.radioInner} />}
                                        </div>
                                        <div className={styles.paymentMeta}>
                                            <span className={styles.paymentName}>Online Payment</span>
                                            <span className={styles.paymentDesc}>Apple Pay, Google Pay, Card</span>
                                        </div>
                                        <FiCreditCard className={styles.paymentIcon} />
                                    </div>

                                    <div
                                        className={`${styles.paymentOption} ${form.paymentType === 'cash' ? styles.selected : ''}`}
                                        onClick={() => handlePaymentSelect('cash')}
                                    >
                                        <div className={styles.radioCircle}>
                                            {form.paymentType === 'cash' && <div className={styles.radioInner} />}
                                        </div>
                                        <div className={styles.paymentMeta}>
                                            <span className={styles.paymentName}>Cash at Counter</span>
                                            <span className={styles.paymentDesc}>Pay when picking up order</span>
                                        </div>
                                        <FiCreditCard className={styles.paymentIcon} />
                                    </div>
                                </div>

                                <button
                                    className={styles.placeOrderBtn}
                                    onClick={handleSubmit}
                                    disabled={loading || items.length === 0 || !validatePhone(form.phone)}
                                >
                                    {loading ? 'Placing Order...' : 'Place Order'}
                                    <FiArrowRight />
                                </button>

                                <p className={styles.termsText}>
                                    By placing an order, you agree to our Terms of Service.
                                </p>
                            </div>
                        </aside>
                    </div>

                    <footer className={styles.footer}>
                        © 2024 SAN MATTEO. All rights reserved.
                    </footer>
                </div>
            </main>
        </>
    );
}
