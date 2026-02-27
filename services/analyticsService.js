import { db } from '@/firebase/config';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

export async function getSalesData(period = 'daily') {
    const orders = await getAllOrders();

    const now = new Date();
    let filteredOrders;
    let labels = [];
    let data = [];

    switch (period) {
        case 'daily': {
            // Last 7 days
            const days = 7;
            for (let i = days - 1; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
                const dayOrders = orders.filter(o =>
                    o.createdAt && o.createdAt.startsWith(dateStr)
                );
                data.push(dayOrders.reduce((sum, o) => sum + (o.total || 0), 0));
            }
            break;
        }
        case 'weekly': {
            // Last 4 weeks
            for (let i = 3; i >= 0; i--) {
                const weekStart = new Date(now);
                weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);
                labels.push(`Week ${4 - i}`);
                const weekOrders = orders.filter(o => {
                    const d = new Date(o.createdAt);
                    return d >= weekStart && d <= weekEnd;
                });
                data.push(weekOrders.reduce((sum, o) => sum + (o.total || 0), 0));
            }
            break;
        }
        case 'monthly': {
            // Last 6 months
            for (let i = 5; i >= 0; i--) {
                const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
                labels.push(month.toLocaleDateString('en-US', { month: 'short' }));
                const monthOrders = orders.filter(o => {
                    const d = new Date(o.createdAt);
                    return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
                });
                data.push(monthOrders.reduce((sum, o) => sum + (o.total || 0), 0));
            }
            break;
        }
    }

    return { labels, data };
}

async function getAllOrders() {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getAnalyticsSummary() {
    const orders = await getAllOrders();
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(o => o.createdAt && o.createdAt.startsWith(today));

    return {
        totalOrders: orders.length,
        todayOrders: todayOrders.length,
        todayRevenue: todayOrders.reduce((sum, o) => sum + (o.total || 0), 0),
        totalRevenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
    };
}
