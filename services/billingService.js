import { db } from '@/firebase/config';
import {
    collection, getDocs, addDoc, doc, query, where, orderBy, Timestamp
} from 'firebase/firestore';

const COLLECTION = 'billing';

export async function createBill(billData) {
    return addDoc(collection(db, COLLECTION), {
        ...billData,
        printed: true,
        printedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
    });
}

export async function getBills() {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getBillByOrderId(orderId) {
    const q = query(collection(db, COLLECTION), where('orderId', '==', orderId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const d = snapshot.docs[0];
    return { id: d.id, ...d.data() };
}
