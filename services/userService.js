import { db } from '@/firebase/config';
import {
    collection, getDocs, getDoc, doc, updateDoc, query, orderBy
} from 'firebase/firestore';

const COLLECTION = 'users';

export async function getAllUsers() {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
    }));
}

export async function getUserById(userId) {
    const ref = doc(db, COLLECTION, userId);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() };
}

export async function updateUserRole(userId, role) {
    const ref = doc(db, COLLECTION, userId);
    return updateDoc(ref, { role });
}
