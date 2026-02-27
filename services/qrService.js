import { db } from '@/firebase/config';
import {
    collection, getDocs, setDoc, doc, query, orderBy, Timestamp, deleteDoc, updateDoc, onSnapshot
} from 'firebase/firestore';

const COLLECTION = 'qrcodes';

export async function getQRCodes() {
    const q = query(collection(db, COLLECTION), orderBy('tableNumber', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Real-time subscription to QR codes
 * @param {Function} callback 
 * @returns {Function} unsubscribe function
 */
export function subscribeToQRCodes(callback) {
    const q = query(collection(db, COLLECTION), orderBy('tableNumber', 'asc'));
    return onSnapshot(q, (snapshot) => {
        const codes = snapshot.docs.map(d => ({
            id: d.id,
            ...d.data()
        }));
        callback(codes);
    }, (error) => {
        console.error("Error subscribing to QR codes:", error);
    });
}

export async function saveQRCode(tableNumber, qrUrl, tableName = '') {
    const id = `table${tableNumber}`;
    const ref = doc(db, COLLECTION, id);
    return setDoc(ref, {
        tableNumber: parseInt(tableNumber),
        tableName,
        qrUrl,
        createdAt: Timestamp.now(),
    }, { merge: true });
}

export async function updateQRCode(id, data) {
    const ref = doc(db, COLLECTION, id);
    return updateDoc(ref, {
        ...data,
        updatedAt: Timestamp.now()
    });
}

export async function deleteQRCode(id) {
    const ref = doc(db, COLLECTION, id);
    return deleteDoc(ref);
}
