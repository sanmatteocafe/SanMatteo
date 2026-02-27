import { db } from '@/firebase/config';
import {
    collection, getDocs, addDoc, updateDoc, doc, query, orderBy, where, Timestamp, getDoc, onSnapshot
} from 'firebase/firestore';

const COLLECTION = 'orders';

export async function createOrder(orderData) {
    return addDoc(collection(db, COLLECTION), {
        ...orderData,
        status: 'pending',
        createdAt: Timestamp.now(),
    });
}

export async function getOrders() {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => {
        const data = d.data();
        return {
            id: d.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
        };
    });
}

export async function getOrdersByUserId(userId) {
    const q = query(
        collection(db, COLLECTION),
        where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    const results = snapshot.docs.map(d => {
        const data = d.data();
        return {
            id: d.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
        };
    });
    // Sort client-side (newest first) to avoid needing a composite index
    return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Real-time subscription to orders within a date range
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @param {Function} callback 
 * @returns {Function} unsubscribe function
 */
/**
 * Subscription for new orders added after the current time
 * @param {Function} callback 
 * @returns {Function} unsubscribe function
 */
export function subscribeToNewOrders(callback) {
    const startTime = Timestamp.now();
    const q = query(
        collection(db, COLLECTION),
        where('createdAt', '>', startTime),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const data = change.doc.data();
                callback({
                    id: change.doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
                });
            }
        });
    }, (error) => {
        console.error("Error subscribing to new orders:", error);
    });
}

export function subscribeToOrdersByDateRange(startDate, endDate, callback) {
    const start = Timestamp.fromDate(startDate);
    const end = Timestamp.fromDate(endDate);

    const q = query(
        collection(db, COLLECTION),
        where('createdAt', '>=', start),
        where('createdAt', '<=', end),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map(d => {
            const data = d.data();
            return {
                id: d.id,
                ...data,
                createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
            };
        });
        callback(orders);
    }, (error) => {
        console.error("Error subscribing to orders:", error);
    });
}

export async function getTodayOrders() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = Timestamp.fromDate(today);

    const q = query(
        collection(db, COLLECTION),
        where('createdAt', '>=', todayTimestamp),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => {
        const data = d.data();
        return {
            id: d.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
        };
    });
}

export async function updateOrderStatus(id, status) {
    const ref = doc(db, COLLECTION, id);
    return updateDoc(ref, { status, updatedAt: Timestamp.now() });
}

export async function getOrderById(id) {
    const ref = doc(db, COLLECTION, id);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return null;
    const data = snapshot.data();
    return {
        id: snapshot.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt,
    };
}
