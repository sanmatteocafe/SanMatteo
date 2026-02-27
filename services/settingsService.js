import { db } from '@/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const DOC_PATH = 'settings/cafe';

const defaultSettings = {
    cafeName: 'SAN MATTEEO',
    address: 'Surat',
    phone: '9999999999',
    taxPercent: 5,
    gstNumber: '',
};

export async function getSettings() {
    const ref = doc(db, 'settings', 'cafe');
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) {
        // Initialize with defaults
        await setDoc(ref, defaultSettings);
        return defaultSettings;
    }
    return snapshot.data();
}

export async function updateSettings(data) {
    const ref = doc(db, 'settings', 'cafe');
    return setDoc(ref, data, { merge: true });
}
