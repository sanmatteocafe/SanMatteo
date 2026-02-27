'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { getOrders } from '@/services/orderService';
import { getMenuItems } from '@/services/menuService';
import { FiShoppingBag, FiDollarSign, FiGrid, FiCoffee, FiTrendingUp, FiClock } from 'react-icons/fi';
import styles from './page.module.css';

const demoOrders = [
    { id: '1', customerName: 'John', tableNumber: '5', total: 580, status: 'preparing', createdAt: new Date().toISOString(), items: [{ name: 'Cappuccino', quantity: 2 }, { name: 'Pizza', quantity: 1 }] },
    { id: '2', customerName: 'Sarah', tableNumber: '3', total: 350, status: 'pending', createdAt: new Date().toISOString(), items: [{ name: 'Matcha', quantity: 1 }, { name: 'Cake', quantity: 1 }] },
    { id: '3', customerName: 'Mike', tableNumber: '8', total: 220, status: 'ready', createdAt: new Date().toISOString(), items: [{ name: 'Espresso', quantity: 2 }] },
    { id: '4', customerName: 'Emma', tableNumber: '1', total: 480, status: 'completed', createdAt: new Date().toISOString(), items: [{ name: 'Avocado Toast', quantity: 2 }] },
    { id: '5', customerName: 'Alex', tableNumber: '12', total: 650, status: 'pending', createdAt: new Date().toISOString(), items: [{ name: 'Pizza', quantity: 2 }, { name: 'Smoothie', quantity: 1 }] },
];

export default function AdminDashboard() {
    const [orders, setOrders] = useState(demoOrders);
    const [menuCount, setMenuCount] = useState(12);

    useEffect(() => {
        const load = async () => {
            try {
                const [o, m] = await Promise.all([getOrders(), getMenuItems()]);
                if (o.length > 0) setOrders(o);
                if (m.length > 0) setMenuCount(m.length);
            } catch (e) { }
        };
        load();
    }, []);

    const todayOrders = orders;
    const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const activeTables = [...new Set(orders.filter(o => o.status !== 'completed').map(o => o.tableNumber))].length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;

    const stats = [
        { label: 'Orders Today', value: todayOrders.length, icon: <FiShoppingBag />, cls: 'orders' },
        { label: 'Revenue', value: `₹${revenue.toLocaleString()}`, icon: <FiDollarSign />, cls: 'revenue' },
        { label: 'Active Tables', value: activeTables, icon: <FiGrid />, cls: 'tables' },
        { label: 'Menu Items', value: menuCount, icon: <FiCoffee />, cls: 'items' },
    ];

    return (
        <AdminLayout>
            <div className="admin-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Welcome back! Here's your cafe overview.</p>
                </div>
            </div>

            <div className="dashboard-grid">
                {stats.map((stat, i) => (
                    <div key={i} className="dashboard-card">
                        <div className={`dashboard-card-icon ${stat.cls}`}>
                            {stat.icon}
                        </div>
                        <h3>{stat.label}</h3>
                        <div className="value">{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Recent Orders */}
            <div className="admin-table-wrapper">
                <div className="admin-table-header">
                    <h2>Recent Orders</h2>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                        <FiClock style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                        Live updates
                    </span>
                </div>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Order</th>
                            <th>Customer</th>
                            <th>Table</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.slice(0, 8).map((order) => (
                            <tr key={order.id}>
                                <td style={{ fontWeight: 600 }}>#{order.id.slice(0, 6)}</td>
                                <td>{order.customerName}</td>
                                <td>Table {order.tableNumber}</td>
                                <td>{order.items?.map(i => i.name).join(', ')}</td>
                                <td style={{ fontWeight: 700, fontFamily: 'var(--font-heading)' }}>₹{order.total}</td>
                                <td><span className={`status-badge ${order.status}`}>{order.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
