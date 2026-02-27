import { db } from '@/firebase/config';
import {
    collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, Timestamp
} from 'firebase/firestore';

const COLLECTION = 'categories';

export async function getCategories() {
    // Order by displayOrder first, then name
    const q = query(collection(db, COLLECTION), orderBy('name'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addCategory(data) {
    const categoryData = typeof data === 'string' ? { name: data } : data;
    return addDoc(collection(db, COLLECTION), {
        status: 'active',
        displayOrder: 0,
        image: '',
        description: '',
        ...categoryData,
        createdAt: Timestamp.now(),
    });
}

export async function updateCategory(id, data) {
    const ref = doc(db, COLLECTION, id);
    return updateDoc(ref, {
        ...data,
        updatedAt: Timestamp.now(),
    });
}

export async function deleteCategory(id) {
    const ref = doc(db, COLLECTION, id);
    return deleteDoc(ref);
}
