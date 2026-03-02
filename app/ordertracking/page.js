'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import Navbar from '@/components/Navbar';
import { FiClock, FiCheck, FiCoffee, FiTrendingUp, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import styles from './page.module.css';

function OrderTrackingContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Add specific class to body for dark tracking page
        document.body.classList.add('orderTracking');

        if (!orderId) {
            setLoading(false);
            return;
        }

        const unsub = onSnapshot(doc(db, 'orders', orderId), (snap) => {
            if (snap.exists()) {
                setOrder({ id: snap.id, ...snap.data() });
            }
            setLoading(false);
        }, (err) => {
            console.error("Tracking Error:", err);
            setLoading(false);
        });

        return () => {
            unsub();
            document.body.classList.remove('orderTracking');
        };
    }, [orderId]);

    if (loading) return <div className={styles.loading}><h2>Brewing your status...</h2><p>Please wait a moment.</p></div>;

    if (!order) {
        return (
            <div className={styles.error}>
                <h2>Order Not Found</h2>
                <p>We couldn't find the order session. Please check your link or order ID.</p>
                <Link href="/menu" className={styles.backLink}>
                    <FiArrowLeft /> Back to Menu
                </Link>
            </div>
        );
    }

    const getProgress = (status) => {
        switch (status) {
            case 'pending': return 25;
            case 'preparing': return 50;
            case 'ready': return 75;
            case 'completed': return 100;
            default: return 0;
        }
    };

    const getStatusName = (status) => {
        switch (status) {
            case 'pending': return 'Order Received';
            case 'preparing': return 'Cooking';
            case 'ready': return 'Ready to Serve';
            case 'completed': return 'Completed';
            default: return status;
        }
    };

    const progress = getProgress(order.status);
    const statusName = getStatusName(order.status);

    const timelineItems = [
        { id: 'pending', title: 'Order Received', desc: 'Your order has been sent to the kitchen.', icon: <FiCheck /> },
        { id: 'preparing', title: 'Barista Started', desc: 'Our chef is currently preparing your order with precision.', icon: <FiCoffee /> },
        { id: 'ready', title: 'Ready to Serve', desc: 'Your order is ready and will be served to your table.', icon: <FiTrendingUp /> },
        { id: 'completed', title: 'Served to Table', desc: 'Order served. Enjoy your meal at San Matteo!', icon: <FiClock /> },
    ];

    const currentStatusIndex = timelineItems.findIndex(item => item.id === order.status);

    return (
        <>
            <Navbar />
            <main className={styles.main}>
                <div className={styles.container}>
                    {/* Left Column: Progress Circle Card */}
                    <div className={styles.leftCol}>
                        <div className={styles.progressCard}>
                            <div className={styles.progressHeader}>
                                <span className={styles.label}>STATUS</span>
                            </div>

                            <div className={styles.circleWrapper}>
                                <CircularProgressbar
                                    value={progress}
                                    text={`${progress}%`}
                                    styles={buildStyles({
                                        pathColor: '#D4AF37',
                                        textColor: '#FFFFFF',
                                        trailColor: 'rgba(255, 255, 255, 0.05)',
                                        backgroundColor: 'transparent',
                                        textSize: '22px',
                                        pathTransitionDuration: 1.5,
                                    })}
                                />
                            </div>

                            <div className={styles.statusInfo}>
                                <h3 className={styles.statusTitle}>{statusName}</h3>
                                <p className={styles.sectionLabel}>Kitchen Progress</p>
                            </div>

                            <div className={styles.orderDetails}>
                                <div className={styles.orderMeta}>
                                    <span className={styles.orderNum}>Order #{order.orderNumber || order.id.slice(-6).toUpperCase()}</span>
                                    <span className={styles.tableNum}>Table {order.tableNumber}</span>
                                </div>
                                <div className={styles.waitBox}>
                                    <span className={styles.waitLabel}>Est. wait time</span>
                                    <span className={styles.waitValue}>
                                        {order.status === 'pending' ? '10-15' :
                                            order.status === 'preparing' ? '5-10' :
                                                order.status === 'ready' ? '1-2' : '0'} mins
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Link href="/menu" className={styles.backLink}>
                            <FiArrowLeft /> Need something else? Back to Menu
                        </Link>
                    </div>

                    {/* Right Column: Timeline Card */}
                    <div className={styles.rightCol}>
                        <div className={styles.timelineCard}>
                            <h2 className={styles.cardTitle}>Live Updates</h2>
                            <div className={styles.timeline}>
                                <div className={styles.timelineLine} />
                                {timelineItems.map((item, index) => {
                                    const isActive = index === currentStatusIndex;
                                    const isCompleted = index < currentStatusIndex;
                                    return (
                                        <div
                                            key={item.id}
                                            className={`${styles.timelineItem} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}
                                        >
                                            <div className={styles.timelineDot}>
                                                {item.icon}
                                            </div>
                                            <div className={styles.timelineContent}>
                                                <h4>{item.title}</h4>
                                                <p>{item.desc}</p>
                                                {isActive && (
                                                    <span className={styles.currentIndicator}>CURRENT STATUS</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

export default function OrderTrackingPage() {
    return (
        <Suspense fallback={<div className={styles.loading}><h2>Loading order status...</h2></div>}>
            <OrderTrackingContent />
        </Suspense>
    );
}
