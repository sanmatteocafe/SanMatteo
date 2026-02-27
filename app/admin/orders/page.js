'use client';
import { useEffect, useState, useMemo } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Modal from '@/components/Modal';
import { updateOrderStatus, subscribeToOrdersByDateRange } from '@/services/orderService';
import { getQRCodes } from '@/services/qrService';
import { getTables, toggleTableOccupied } from '@/services/tableService';
import toast from 'react-hot-toast';
import { FiFilter, FiPrinter, FiDownload, FiUser, FiSmartphone, FiHash, FiCreditCard, FiCalendar } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const statusFlow = ['pending', 'preparing', 'ready', 'completed'];

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [dateRange, setDateRange] = useState('Today'); // Today, Yesterday, 7 Days, Custom
    const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
    const [manualOccupancy, setManualOccupancy] = useState({}); // { tableNumber: boolean }
    const [registeredTables, setRegisteredTables] = useState([]);

    // Fetch registered tables from QR codes and manual occupancy from Firebase
    useEffect(() => {
        const fetchTables = async () => {
            try {
                const [qrCodes, tablesData] = await Promise.all([
                    getQRCodes(),
                    getTables()
                ]);
                setRegisteredTables(qrCodes.map(qr => ({ number: qr.tableNumber, name: qr.tableName || '' })));
                // Build manual occupancy map from Firebase tables collection
                const manual = {};
                tablesData.forEach(t => {
                    if (t.manuallyOccupied) manual[t.tableNumber] = true;
                });
                setManualOccupancy(manual);
            } catch (err) {
                console.error('Error fetching tables:', err);
            }
        };
        fetchTables();
    }, []);

    // Derive table occupancy from current orders + manual overrides
    const tableStatuses = useMemo(() => {
        const activeStatuses = ['pending', 'preparing', 'ready'];
        const activeOrders = orders.filter(o => activeStatuses.includes(o.status));
        // Map: tableNumber -> order
        const occupiedMap = {};
        activeOrders.forEach(o => {
            if (!occupiedMap[o.tableNumber]) occupiedMap[o.tableNumber] = o;
        });
        return registeredTables.map(t => {
            const hasOrder = !!occupiedMap[t.number];
            const isManual = !!manualOccupancy[t.number];
            return {
                ...t,
                status: (hasOrder || isManual) ? 'occupied' : 'available',
                occupancySource: hasOrder ? 'order' : (isManual ? 'manual' : null),
                order: occupiedMap[t.number] || null,
            };
        });
    }, [orders, registeredTables, manualOccupancy]);

    // Calculate start and end dates based on filter
    const rangeDates = useMemo(() => {
        const start = new Date();
        const end = new Date();

        if (dateRange === 'Today') {
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
        } else if (dateRange === 'Yesterday') {
            start.setDate(start.getDate() - 1);
            start.setHours(0, 0, 0, 0);
            end.setDate(end.getDate() - 1);
            end.setHours(23, 59, 59, 999);
        } else if (dateRange === '7 Days') {
            start.setDate(start.getDate() - 7);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
        } else if (dateRange === 'Custom') {
            const d = new Date(customDate);
            start.setTime(d.getTime());
            start.setHours(0, 0, 0, 0);
            end.setTime(d.getTime());
            end.setHours(23, 59, 59, 999);
        }
        return { start, end };
    }, [dateRange, customDate]);

    // Real-time listener based on date range
    useEffect(() => {
        setLoading(true);
        const unsubscribe = subscribeToOrdersByDateRange(
            rangeDates.start,
            rangeDates.end,
            (newOrders) => {
                setOrders(newOrders);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [rangeDates]);

    // Auto-refresh logic for midnight transition
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            // If it's the first minute of the day and we are on "Today", trigger a range recalculation
            if (now.getHours() === 0 && now.getMinutes() === 0 && dateRange === 'Today') {
                // Changing dateRange slightly or forcing a re-render of useMemo
                setDateRange('Today');
            }
        }, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [dateRange]);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await updateOrderStatus(orderId, newStatus);
            if (selectedOrder?.id === orderId) {
                setSelectedOrder(prev => ({ ...prev, status: newStatus }));
            }
            toast.success(`Order updated to ${newStatus}`);
        } catch (e) {
            toast.error('Failed to update status');
        }
    };

    const handleToggleOccupied = async (tableNumber, e) => {
        e.stopPropagation();
        const currentlyManual = !!manualOccupancy[tableNumber];
        const newValue = !currentlyManual;
        try {
            await toggleTableOccupied(tableNumber, newValue);
            setManualOccupancy(prev => {
                const updated = { ...prev };
                if (newValue) {
                    updated[tableNumber] = true;
                } else {
                    delete updated[tableNumber];
                }
                return updated;
            });
            toast.success(newValue ? `Table ${tableNumber} marked as occupied` : `Table ${tableNumber} marked as available`);
        } catch (err) {
            toast.error('Failed to update table status');
        }
    };

    const filteredOrders = filterStatus === 'all'
        ? orders
        : orders.filter(o => o.status === filterStatus);

    return (
        <AdminLayout>
            <div className="admin-header">
                <div>
                    <h1>Orders</h1>
                    <p>Real-time order management for {dateRange === 'Custom' ? customDate : dateRange}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="export-btn" onClick={() => toast('Exporting orders...')}>
                        <FiDownload /> Export
                    </button>
                </div>
            </div>

            {/* Table Status Grid */}
            {tableStatuses.length > 0 && (
                <div className={styles.tableStatusSection}>
                    <div className={styles.tableStatusHeader}>
                        <h3>Table Status</h3>
                        <div className={styles.tableStatusLegend}>
                            <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.available}`}></span> Available</span>
                            <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.occupiedDot}`}></span> Occupied (Order)</span>
                            <span className={styles.legendItem}><span className={`${styles.legendDot} ${styles.manualDot}`}></span> Occupied (Manual)</span>
                        </div>
                    </div>
                    <div className={styles.tableStatusGrid}>
                        {tableStatuses.map((table) => (
                            <div
                                key={table.number}
                                className={`${styles.tableStatusCard} ${table.status === 'occupied' ? (table.occupancySource === 'manual' ? styles.statusManual : styles.statusOccupied) : styles.statusAvailable}`}
                                onClick={() => table.order && setSelectedOrder(table.order)}
                                style={{ cursor: table.order ? 'pointer' : 'default' }}
                            >
                                <div className={styles.tableNum}>T{table.number}</div>
                                <div className={styles.tableStatusLabel}>
                                    {table.status === 'occupied' ? (
                                        table.occupancySource === 'order' ? (
                                            <>
                                                <span className={styles.occupiedBadge}>{table.order?.status}</span>
                                                <span className={styles.tableOrderId}>#{table.order?.id?.slice(-4).toUpperCase()}</span>
                                            </>
                                        ) : (
                                            <span className={styles.manualBadge}>Manual</span>
                                        )
                                    ) : (
                                        <span className={styles.availableBadge}>Available</span>
                                    )}
                                </div>
                                {/* Toggle button - only show when no active order */}
                                {!table.order && (
                                    <button
                                        className={`${styles.toggleBtn} ${manualOccupancy[table.number] ? styles.toggleBtnOccupied : ''}`}
                                        onClick={(e) => handleToggleOccupied(table.number, e)}
                                        title={manualOccupancy[table.number] ? 'Mark as Available' : 'Mark as Occupied'}
                                    >
                                        {manualOccupancy[table.number] ? 'Set Available' : 'Set Occupied'}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className={styles.filterGroup}>
                <div className={styles.filterLabel}>Time Range</div>
                <div className={styles.filters}>
                    {['Today', 'Yesterday', '7 Days', 'Custom'].map(range => (
                        <button
                            key={range}
                            className={`${styles.filterBtn} ${dateRange === range ? styles.active : ''}`}
                            onClick={() => setDateRange(range)}
                        >
                            {range}
                        </button>
                    ))}
                    {dateRange === 'Custom' && (
                        <div className={styles.dateInputWrapper}>
                            <FiCalendar color="#D4A373" />
                            <input
                                type="date"
                                className={styles.dateInput}
                                value={customDate}
                                onChange={(e) => setCustomDate(e.target.value)}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.filterGroup} style={{ marginTop: '-1rem' }}>
                <div className={styles.filterLabel}>Order Status</div>
                <div className={styles.filters}>
                    <FiFilter color="#D4A373" />
                    {['all', ...statusFlow].map(status => (
                        <button
                            key={status}
                            className={`${styles.filterBtn} ${filterStatus === status ? styles.active : ''}`}
                            onClick={() => setFilterStatus(status)}
                        >
                            {status === 'all' ? 'All' : status}
                            <span className={styles.count}>
                                {status === 'all' ? orders.length : orders.filter(o => o.status === status).length}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex-center" style={{ height: '300px' }}>
                    <div className="loader"></div>
                </div>
            ) : (
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Table</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#A89F94' }}>
                                        No orders found for this period.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => {
                                    const currentIdx = statusFlow.indexOf(order.status);
                                    const nextStatus = statusFlow[currentIdx + 1];
                                    return (
                                        <tr key={order.id} className={styles.interactableRow} onClick={() => setSelectedOrder(order)}>
                                            <td style={{ fontWeight: 800 }}>#{order.id.slice(-6).toUpperCase()}</td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{order.customerName}</div>
                                                <span style={{ fontSize: '11px', color: '#A89F94' }}>{order.phone}</span>
                                            </td>
                                            <td>Table {order.tableNumber}</td>
                                            <td style={{ fontSize: '12px' }}>
                                                {order.items?.length || 0} items
                                            </td>
                                            <td style={{ fontWeight: 800, color: '#D4A373' }}>₹{order.total}</td>
                                            <td><span className={`status-badge ${order.status}`}>{order.status}</span></td>
                                            <td onClick={(e) => e.stopPropagation()}>
                                                {nextStatus ? (
                                                    <button
                                                        className={styles.actionBtn}
                                                        onClick={() => handleStatusChange(order.id, nextStatus)}
                                                    >
                                                        → {nextStatus}
                                                    </button>
                                                ) : (
                                                    <span style={{ color: '#A89F94', fontSize: '12px' }}>Done</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Order Details Modal */}
            <Modal
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                title="Order Details"
            >
                {selectedOrder && (
                    <div className={styles.receiptContainer}>
                        <div className={styles.receiptHeader}>
                            <div className={styles.orderNum}>ORDER #{selectedOrder.id.toUpperCase()}</div>
                            <div className={styles.receiptTime}>
                                {new Date(selectedOrder.createdAt).toLocaleString()}
                            </div>
                        </div>

                        <div className={styles.metaGrid}>
                            <div className={styles.metaItem}>
                                <label><FiUser size={10} /> Customer</label>
                                <div className={styles.metaValue}>{selectedOrder.customerName}</div>
                            </div>
                            <div className={styles.metaItem}>
                                <label><FiSmartphone size={10} /> Phone</label>
                                <div className={styles.metaValue}>{selectedOrder.phone}</div>
                            </div>
                            <div className={styles.metaItem}>
                                <label><FiHash size={10} /> Table</label>
                                <div className={styles.metaValue}>Table {selectedOrder.tableNumber}</div>
                            </div>
                            <div className={styles.metaItem}>
                                <label><FiCreditCard size={10} /> Payment</label>
                                <div className={styles.metaValue} style={{ textTransform: 'uppercase' }}>{selectedOrder.paymentType}</div>
                            </div>
                        </div>

                        <div className={styles.itemizedList}>
                            {selectedOrder.specialInstructions && (
                                <div className={styles.adminInstructions}>
                                    <label className={styles.sectionLabel}>📝 Special Instructions</label>
                                    <p className={styles.instructionsText}>{selectedOrder.specialInstructions}</p>
                                </div>
                            )}
                            <label className={styles.sectionLabel}>Items Ordered</label>
                            {selectedOrder.items?.map((item, idx) => (
                                <div key={idx} className={styles.itemRow}>
                                    <div className={styles.itemNameCol}>
                                        <span className={styles.itemName}>{item.name}</span>
                                        <span className={styles.itemQty}>Quantity: {item.quantity || item.qty}</span>
                                    </div>
                                    <div className={styles.itemPrice}>₹{(item.price * (item.quantity || item.qty)).toFixed(2)}</div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.receiptTotals}>
                            <div className={styles.receiptRow}>
                                <span>Subtotal</span>
                                <span>₹{(selectedOrder.total || 0).toFixed(2)}</span>
                            </div>
                            <div className={styles.receiptRow}>
                                <span>Service Charge (5%)</span>
                                <span>₹{((selectedOrder.total || 0) * 0.05).toFixed(2)}</span>
                            </div>
                            <div className={styles.receiptRow}>
                                <span>Estimated Tax (6%)</span>
                                <span>₹{((selectedOrder.total || 0) * 0.06).toFixed(2)}</span>
                            </div>
                            <div className={styles.grandTotalRow}>
                                <span>Grand Total</span>
                                <span>₹{((selectedOrder.total || 0) * 1.11).toFixed(2)}</span>
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                            <button className={styles.actionBtn} style={{ flex: 1 }} onClick={() => window.print()}>
                                <FiPrinter /> Print Receipt
                            </button>
                            {statusFlow.indexOf(selectedOrder.status) < statusFlow.length - 1 && (
                                <button
                                    className={styles.actionBtn}
                                    style={{ flex: 1, backgroundColor: '#3D2B1F', color: 'white' }}
                                    onClick={() => handleStatusChange(selectedOrder.id, statusFlow[statusFlow.indexOf(selectedOrder.status) + 1])}
                                >
                                    Advance to {statusFlow[statusFlow.indexOf(selectedOrder.status) + 1]}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
}
