import { db } from '@/firebase/config';
import {
    collection, getDocs, setDoc, updateDoc, doc, query, where, orderBy
} from 'firebase/firestore';

const COLLECTION = 'tables';

export async function getTables() {
    const q = query(collection(db, COLLECTION), orderBy('tableNumber'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getTableByNumber(tableNumber) {
    const q = query(collection(db, COLLECTION), where('tableNumber', '==', tableNumber));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const d = snapshot.docs[0];
    return { id: d.id, ...d.data() };
}

export async function updateTableStatus(tableNumber, status, currentOrder = null) {
    const ref = doc(db, COLLECTION, `table${tableNumber}`);
    const data = { tableNumber, status };
    if (currentOrder) data.currentOrder = currentOrder;
    return setDoc(ref, data, { merge: true });
}

export async function toggleTableOccupied(tableNumber, isOccupied) {
    const ref = doc(db, COLLECTION, `table${tableNumber}`);
    return setDoc(ref, { tableNumber, manuallyOccupied: isOccupied }, { merge: true });
}

export async function initializeTables(count = 5) {
    for (let i = 1; i <= count; i++) {
        const ref = doc(db, COLLECTION, `table${i}`);
        await setDoc(ref, {
            tableNumber: i,
            status: 'available',
            currentOrder: null,
        }, { merge: true });
    }
}
