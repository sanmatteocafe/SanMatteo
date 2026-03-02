'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/AuthContext';
import { getOrdersByUserId } from '@/services/orderService';
import { FiClock, FiCheckCircle, FiPackage } from 'react-icons/fi';
import styles from './page.module.css';

const tabs = ['All Orders', 'Active', 'Completed'];

function getStatusClass(status) {
    switch (status) {
        case 'completed': return styles.statusCompleted;
        case 'preparing': return styles.statusPreparing;
        case 'ready': return styles.statusReady;
        default: return styles.statusPending;
    }
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    }) + ' • ' + d.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit',
    });
}

export default function OrderHistoryPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All Orders');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        async function loadOrders() {
            if (!user) return;
            try {
                const data = await getOrdersByUserId(user.uid);
                setOrders(data);
            } catch (e) {
                console.error('Error loading orders:', e);
            } finally {
                setLoading(false);
            }
        }
        if (user) loadOrders();
    }, [user]);

    const filteredOrders = orders.filter(order => {
        if (activeTab === 'All Orders') return true;
        if (activeTab === 'Active') return ['pending', 'preparing', 'ready'].includes(order.status);
        if (activeTab === 'Completed') return order.status === 'completed';
        return true;
    });

    if (authLoading || !user) return null;

    return (
        <>
            <Navbar />
            <main className={styles.page}>
                <div className={styles.container}>
                    <header className={styles.header}>
                        <h1 className={styles.title}>Order History</h1>
                        <p className={styles.subtitle}>Your Past Royal Experiences at SAN MATTEO</p>
                    </header>

                    <div className={styles.tabs}>
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className={styles.emptyState}>
                            <p>Loading your orders...</p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className={styles.emptyState}>
                            <FiPackage className={styles.emptyIcon} />
                            <h3>No orders found</h3>
                            <p>{activeTab === 'All Orders'
                                ? 'You haven\'t placed any orders yet.'
                                : `No ${activeTab.toLowerCase()} orders.`}</p>
                        </div>
                    ) : (
                        <div className={styles.orderList}>
                            {filteredOrders.map(order => (
                                <div
                                    key={order.id}
                                    className={styles.orderCard}
                                    onClick={() => router.push(`/ordertracking?orderId=${order.id}`)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className={styles.orderTop}>
                                        <div className={styles.orderMeta}>
                                            <span className={styles.orderDate}>
                                                {formatDate(order.createdAt)}
                                            </span>
                                            <span className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
                                                {order.status?.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.orderBody}>
                                        <div className={styles.orderInfo}>
                                            <h3 className={styles.orderNumber}>
                                                Order #{order.orderNumber || order.id.slice(-6).toUpperCase()}
                                            </h3>
                                            <p className={styles.orderItems}>
                                                {order.items?.map(i => i.name).join(', ')}
                                                {order.tableNumber ? ` • Table ${order.tableNumber}` : ''}
                                            </p>
                                        </div>
                                        <div className={styles.orderTotal}>
                                            <span className={styles.totalAmount}>
                                                ₹{(order.grandTotal || order.total || 0).toFixed(2)}
                                            </span>
                                            <span className={styles.totalLabel}>TOTAL AMOUNT</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <footer className={styles.pageFooter}>
                    © 2024 SAN MATTEO LUXURY CAFE
                </footer>
            </main>
        </>
    );
}
