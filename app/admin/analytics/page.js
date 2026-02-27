'use client';
import { useEffect, useState, useMemo } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { getOrders } from '@/services/orderService';
import toast from 'react-hot-toast';
import {
    FiTrendingUp, FiDollarSign, FiShoppingBag, FiBarChart2,
    FiDownload, FiSearch, FiChevronLeft, FiChevronRight, FiFilter
} from 'react-icons/fi';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, BarElement, LineElement,
    PointElement, Title, Tooltip, Legend, Filler, ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import styles from './page.module.css';

ChartJS.register(
    CategoryScale, LinearScale, BarElement, LineElement,
    PointElement, Title, Tooltip, Legend, Filler, ArcElement
);

const ROWS_PER_PAGE = 15;

export default function AnalyticsPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateRange, setDateRange] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState('createdAt');
    const [sortDir, setSortDir] = useState('desc');

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getOrders();
                setOrders(data);
            } catch (e) {
                console.error('Failed to load orders:', e);
                toast.error('Failed to load order data');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // Filters
    const filteredOrders = useMemo(() => {
        let result = [...orders];

        // Date range filter
        if (dateRange !== 'all') {
            const now = new Date();
            let cutoff = new Date();
            if (dateRange === 'today') cutoff.setHours(0, 0, 0, 0);
            else if (dateRange === '7days') cutoff.setDate(now.getDate() - 7);
            else if (dateRange === '30days') cutoff.setDate(now.getDate() - 30);
            else if (dateRange === '90days') cutoff.setDate(now.getDate() - 90);
            result = result.filter(o => new Date(o.createdAt) >= cutoff);
        }

        // Status filter
        if (statusFilter !== 'all') {
            result = result.filter(o => o.status === statusFilter);
        }

        // Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(o =>
                (o.orderNumber || o.id || '').toLowerCase().includes(q) ||
                (o.customerName || '').toLowerCase().includes(q) ||
                String(o.tableNumber || '').includes(q)
            );
        }

        // Sort
        result.sort((a, b) => {
            let valA = a[sortField];
            let valB = b[sortField];
            if (sortField === 'createdAt') {
                valA = new Date(valA || 0);
                valB = new Date(valB || 0);
            }
            if (sortField === 'grandTotal' || sortField === 'total') {
                valA = Number(valA) || 0;
                valB = Number(valB) || 0;
            }
            if (valA < valB) return sortDir === 'asc' ? -1 : 1;
            if (valA > valB) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [orders, searchQuery, statusFilter, dateRange, sortField, sortDir]);

    // Pagination
    const totalPages = Math.ceil(filteredOrders.length / ROWS_PER_PAGE);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * ROWS_PER_PAGE,
        currentPage * ROWS_PER_PAGE
    );

    // Stats
    const stats = useMemo(() => {
        const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.grandTotal || o.total || 0), 0);
        const totalOrders = filteredOrders.length;
        const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        const completedOrders = filteredOrders.filter(o => o.status === 'completed' || o.status === 'ready').length;
        return { totalRevenue, totalOrders, avgOrder, completedOrders };
    }, [filteredOrders]);

    // Category breakdown for chart
    const categoryData = useMemo(() => {
        const map = {};
        filteredOrders.forEach(o => {
            (o.items || []).forEach(item => {
                const cat = item.category || 'Other';
                map[cat] = (map[cat] || 0) + (item.price * (item.qty || item.quantity || 1));
            });
        });
        return map;
    }, [filteredOrders]);

    // Daily revenue for bar chart (last 7 days)
    const dailyRevenue = useMemo(() => {
        const days = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
            days[key] = 0;
        }
        orders.forEach(o => {
            const d = new Date(o.createdAt);
            const key = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
            if (days[key] !== undefined) {
                days[key] += (o.grandTotal || o.total || 0);
            }
        });
        return days;
    }, [orders]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
            ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    const handleSort = (field) => {
        if (sortField === field) setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortDir('desc'); }
    };

    // CSV Download
    const handleDownloadCSV = () => {
        const headers = ['Order ID', 'Date', 'Customer', 'Table', 'Items', 'Status', 'Payment', 'Subtotal', 'Tax', 'Grand Total'];
        const rows = filteredOrders.map(o => [
            o.orderNumber || o.id,
            formatDate(o.createdAt),
            o.customerName || '—',
            o.tableNumber || '—',
            (o.items || []).map(i => `${i.name} x${i.qty || i.quantity}`).join('; '),
            o.status || '—',
            o.paymentType || '—',
            o.total || 0,
            o.tax || 0,
            o.grandTotal || o.total || 0,
        ]);

        const csv = [headers, ...rows].map(row =>
            row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ).join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `SanMatteeo-Orders-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success(`Downloaded ${filteredOrders.length} orders as CSV`);
    };

    const barChartData = {
        labels: Object.keys(dailyRevenue),
        datasets: [{
            label: 'Revenue (₹)',
            data: Object.values(dailyRevenue),
            backgroundColor: 'rgba(212, 163, 115, 0.3)',
            borderColor: 'rgba(212, 163, 115, 1)',
            borderWidth: 2,
            borderRadius: 6,
        }],
    };

    const catLabels = Object.keys(categoryData);
    const catValues = Object.values(categoryData);
    const catColors = ['#D4A373', '#E76F51', '#4CAF50', '#2196F3', '#9C27B0', '#FF9800', '#607D8B'];
    const doughnutData = {
        labels: catLabels,
        datasets: [{
            data: catValues,
            backgroundColor: catLabels.map((_, i) => catColors[i % catColors.length]),
            borderWidth: 0,
        }],
    };

    const chartOpts = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#9B8E82', font: { family: 'Inter' } } } },
        scales: {
            x: { ticks: { color: '#9B8E82' }, grid: { color: 'rgba(0,0,0,0.04)' } },
            y: { ticks: { color: '#9B8E82' }, grid: { color: 'rgba(0,0,0,0.04)' } },
        },
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex-center" style={{ height: '80vh' }}>
                    <div className="loader"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className={styles.page}>
                {/* Header */}
                <header className={styles.header}>
                    <div>
                        <h1>Analytics & Reports</h1>
                        <p>Complete order data and revenue insights</p>
                    </div>
                    <button className={styles.downloadBtn} onClick={handleDownloadCSV}>
                        <FiDownload /> Download CSV
                    </button>
                </header>

                {/* Summary Cards */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.revenue}`}><FiDollarSign /></div>
                        <div>
                            <span className={styles.statLabel}>Total Revenue</span>
                            <span className={styles.statValue}>₹{stats.totalRevenue.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.ordersIcon}`}><FiShoppingBag /></div>
                        <div>
                            <span className={styles.statLabel}>Total Orders</span>
                            <span className={styles.statValue}>{stats.totalOrders}</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.avg}`}><FiBarChart2 /></div>
                        <div>
                            <span className={styles.statLabel}>Avg Order Value</span>
                            <span className={styles.statValue}>₹{Math.round(stats.avgOrder).toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.completed}`}><FiTrendingUp /></div>
                        <div>
                            <span className={styles.statLabel}>Fulfilled</span>
                            <span className={styles.statValue}>{stats.completedOrders}</span>
                        </div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className={styles.chartsRow}>
                    <div className={styles.chartCard}>
                        <h3>Revenue — Last 7 Days</h3>
                        <div style={{ height: 260 }}>
                            <Bar data={barChartData} options={chartOpts} />
                        </div>
                    </div>
                    <div className={styles.chartCard}>
                        <h3>Sales by Category</h3>
                        <div style={{ height: 260, display: 'flex', justifyContent: 'center' }}>
                            <Doughnut data={doughnutData} options={{
                                ...chartOpts,
                                scales: undefined,
                                cutout: '60%',
                                plugins: { legend: { position: 'bottom', labels: { color: '#9B8E82', font: { family: 'Inter' }, padding: 12 } } },
                            }} />
                        </div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className={styles.controlBar}>
                    <div className={styles.searchBox}>
                        <FiSearch />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchQuery}
                            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                    <div className={styles.filters}>
                        <select value={dateRange} onChange={e => { setDateRange(e.target.value); setCurrentPage(1); }}>
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="7days">Last 7 Days</option>
                            <option value="30days">Last 30 Days</option>
                            <option value="90days">Last 90 Days</option>
                        </select>
                        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="preparing">Preparing</option>
                            <option value="ready">Ready</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>

                {/* Orders Table */}
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('orderNumber')}>Order ID {sortField === 'orderNumber' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                                <th onClick={() => handleSort('createdAt')}>Date {sortField === 'createdAt' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                                <th>Customer</th>
                                <th>Table</th>
                                <th>Items</th>
                                <th>Status</th>
                                <th>Payment</th>
                                <th onClick={() => handleSort('grandTotal')}>Total {sortField === 'grandTotal' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedOrders.length > 0 ? paginatedOrders.map(order => (
                                <tr key={order.id}>
                                    <td className={styles.orderId}>#{order.orderNumber || order.id?.slice(-6).toUpperCase()}</td>
                                    <td className={styles.dateCell}>{formatDate(order.createdAt)}</td>
                                    <td>{order.customerName || '—'}</td>
                                    <td>{order.tableNumber || '—'}</td>
                                    <td className={styles.itemsCell}>
                                        {(order.items || []).map((item, i) => (
                                            <span key={i} className={styles.itemTag}>
                                                {item.name} ×{item.qty || item.quantity}
                                            </span>
                                        ))}
                                    </td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[order.status] || ''}`}>
                                            {order.status || 'unknown'}
                                        </span>
                                    </td>
                                    <td style={{ textTransform: 'capitalize' }}>{order.paymentType || '—'}</td>
                                    <td className={styles.totalCell}>₹{(order.grandTotal || order.total || 0).toFixed(2)}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#A89F94' }}>No orders found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className={styles.pagination}>
                        <span className={styles.pageInfo}>
                            Showing {((currentPage - 1) * ROWS_PER_PAGE) + 1}–{Math.min(currentPage * ROWS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length}
                        </span>
                        <div className={styles.pageButtons}>
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><FiChevronLeft /></button>
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                let page;
                                if (totalPages <= 5) page = i + 1;
                                else if (currentPage <= 3) page = i + 1;
                                else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                                else page = currentPage - 2 + i;
                                return (
                                    <button
                                        key={page}
                                        className={currentPage === page ? styles.activePage : ''}
                                        onClick={() => setCurrentPage(page)}
                                    >{page}</button>
                                );
                            })}
                            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}><FiChevronRight /></button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
