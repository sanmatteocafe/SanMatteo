import { db } from '@/firebase/config';
import {
    collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp
} from 'firebase/firestore';

const COLLECTION = 'menu';

export async function getMenuItems() {
    const q = query(collection(db, COLLECTION));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addMenuItem(item) {
    return addDoc(collection(db, COLLECTION), {
        ...item,
        available: item.available !== undefined ? item.available : true,
        createdAt: Timestamp.now(),
    });
}

export async function updateMenuItem(id, data) {
    const ref = doc(db, COLLECTION, id);
    return updateDoc(ref, data);
}

export async function deleteMenuItem(id) {
    const ref = doc(db, COLLECTION, id);
    return deleteDoc(ref);
}
