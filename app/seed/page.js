'use client';
import { useState } from 'react';
import { db } from '@/firebase/config';
import { collection, setDoc, doc, getDocs, Timestamp } from 'firebase/firestore';

const CATEGORIES = [
    { id: 'coffee', name: 'Coffee' },
    { id: 'tea', name: 'Tea' },
    { id: 'snacks', name: 'Snacks' },
    { id: 'desserts', name: 'Desserts' },
    { id: 'beverages', name: 'Beverages' },
];

const MENU_ITEMS = [
    { id: 'item001', name: 'Cold Coffee', price: 120, category: 'Coffee', categoryId: 'coffee', description: 'Cold coffee with ice cream', image: '', available: true },
    { id: 'item002', name: 'Hot Cappuccino', price: 100, category: 'Coffee', categoryId: 'coffee', description: 'Rich creamy cappuccino', image: '', available: true },
    { id: 'item003', name: 'Espresso', price: 80, category: 'Coffee', categoryId: 'coffee', description: 'Strong Italian espresso', image: '', available: true },
    { id: 'item004', name: 'Latte', price: 130, category: 'Coffee', categoryId: 'coffee', description: 'Smooth and creamy latte', image: '', available: true },
    { id: 'item005', name: 'Masala Chai', price: 50, category: 'Tea', categoryId: 'tea', description: 'Traditional Indian masala chai', image: '', available: true },
    { id: 'item006', name: 'Green Tea', price: 60, category: 'Tea', categoryId: 'tea', description: 'Healthy Japanese green tea', image: '', available: true },
    { id: 'item007', name: 'Veg Sandwich', price: 90, category: 'Snacks', categoryId: 'snacks', description: 'Grilled veg sandwich with cheese', image: '', available: true },
    { id: 'item008', name: 'Paneer Puff', price: 60, category: 'Snacks', categoryId: 'snacks', description: 'Crispy puff with paneer filling', image: '', available: true },
    { id: 'item009', name: 'Chocolate Brownie', price: 100, category: 'Desserts', categoryId: 'desserts', description: 'Rich dark chocolate brownie', image: '', available: true },
    { id: 'item010', name: 'Fresh Orange Juice', price: 80, category: 'Beverages', categoryId: 'beverages', description: 'Freshly squeezed orange juice', image: '', available: true },
];

const TABLES = [
    { id: 'table1', tableNumber: 1, status: 'available', currentOrder: null },
    { id: 'table2', tableNumber: 2, status: 'available', currentOrder: null },
    { id: 'table3', tableNumber: 3, status: 'available', currentOrder: null },
    { id: 'table4', tableNumber: 4, status: 'available', currentOrder: null },
    { id: 'table5', tableNumber: 5, status: 'available', currentOrder: null },
];

const SETTINGS = {
    cafeName: 'SAN MATTEEO',
    address: 'Surat',
    phone: '9999999999',
    taxPercent: 5,
};

export default function SeedPage() {
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);

    const addResult = (msg) => setResults(prev => [...prev, msg]);

    const seedDatabase = async () => {
        setLoading(true);
        setStatus('Seeding...');
        setResults([]);

        try {
            // 1. Categories
            addResult('📂 Adding categories...');
            for (const cat of CATEGORIES) {
                await setDoc(doc(db, 'categories', cat.id), {
                    name: cat.name,
                    createdAt: Timestamp.now(),
                });
            }
            addResult(`✅ ${CATEGORIES.length} categories added`);

            // 2. Menu Items
            addResult('🍽️ Adding menu items...');
            for (const item of MENU_ITEMS) {
                const { id, ...data } = item;
                await setDoc(doc(db, 'menu', id), {
                    ...data,
                    createdAt: Timestamp.now(),
                });
            }
            addResult(`✅ ${MENU_ITEMS.length} menu items added`);

            // 3. Tables
            addResult('🪑 Adding tables...');
            for (const table of TABLES) {
                const { id, ...data } = table;
                await setDoc(doc(db, 'tables', id), data);
            }
            addResult(`✅ ${TABLES.length} tables added`);

            // 4. Settings
            addResult('⚙️ Adding settings...');
            await setDoc(doc(db, 'settings', 'cafe'), SETTINGS);
            addResult('✅ Settings added');

            // 5. Sample admin user doc
            addResult('👤 Adding admin user record...');
            await setDoc(doc(db, 'users', 'admin1'), {
                name: 'Admin',
                email: 'admin@sanmatteeo.com',
                role: 'admin',
                createdAt: Timestamp.now(),
            });
            addResult('✅ Admin user record added');

            setStatus('🎉 Database seeded successfully!');
        } catch (error) {
            setStatus(`❌ Error: ${error.message}`);
            addResult(`❌ Failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const checkData = async () => {
        setLoading(true);
        setResults([]);
        setStatus('Checking...');

        try {
            const collections = ['categories', 'menu', 'tables', 'settings', 'users', 'orders', 'billing', 'qrcodes'];
            for (const col of collections) {
                const snapshot = await getDocs(collection(db, col));
                addResult(`📊 ${col}: ${snapshot.size} documents`);
            }
            setStatus('✅ Check complete');
        } catch (error) {
            setStatus(`❌ Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0F0F10',
            color: '#F5F5F5',
            padding: '40px',
            fontFamily: 'system-ui, sans-serif',
        }}>
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
                <h1 style={{ fontSize: 28, marginBottom: 8, color: '#D4AF37' }}>🔥 Firebase Database Seeder</h1>
                <p style={{ color: '#8A8A8A', marginBottom: 32 }}>
                    Populate your Firestore with sample SAN MATTEEO data
                </p>

                <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                    <button
                        onClick={seedDatabase}
                        disabled={loading}
                        style={{
                            padding: '14px 28px',
                            background: loading ? '#444' : '#C67C4E',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 10,
                            fontSize: 16,
                            fontWeight: 700,
                            cursor: loading ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {loading ? '⏳ Working...' : '🚀 Seed Database'}
                    </button>

                    <button
                        onClick={checkData}
                        disabled={loading}
                        style={{
                            padding: '14px 28px',
                            background: 'transparent',
                            color: '#D4AF37',
                            border: '1px solid #D4AF37',
                            borderRadius: 10,
                            fontSize: 16,
                            fontWeight: 700,
                            cursor: loading ? 'not-allowed' : 'pointer',
                        }}
                    >
                        📊 Check Data
                    </button>
                </div>

                {status && (
                    <div style={{
                        padding: '14px 20px',
                        background: status.includes('❌') ? 'rgba(239,68,68,0.1)' : 'rgba(212,175,55,0.1)',
                        border: `1px solid ${status.includes('❌') ? 'rgba(239,68,68,0.3)' : 'rgba(212,175,55,0.3)'}`,
                        borderRadius: 10,
                        marginBottom: 20,
                        fontWeight: 600,
                        fontSize: 15,
                    }}>
                        {status}
                    </div>
                )}

                {results.length > 0 && (
                    <div style={{
                        background: '#1A1A1A',
                        borderRadius: 12,
                        padding: 20,
                        border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                        <h3 style={{ marginBottom: 12, fontSize: 14, color: '#8A8A8A', textTransform: 'uppercase', letterSpacing: 1 }}>Log</h3>
                        {results.map((r, i) => (
                            <div key={i} style={{
                                padding: '8px 0',
                                borderBottom: i < results.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                fontSize: 14,
                            }}>
                                {r}
                            </div>
                        ))}
                    </div>
                )}

                <div style={{
                    marginTop: 32,
                    padding: 20,
                    background: '#1A1A1A',
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.06)',
                }}>
                    <h3 style={{ fontSize: 14, color: '#8A8A8A', marginBottom: 10 }}>WHAT GETS CREATED</h3>
                    <ul style={{ listStyle: 'none', padding: 0, fontSize: 14, lineHeight: 2 }}>
                        <li>📂 5 Categories (Coffee, Tea, Snacks, Desserts, Beverages)</li>
                        <li>🍽️ 10 Menu Items</li>
                        <li>🪑 5 Tables</li>
                        <li>⚙️ Cafe Settings (name, address, tax)</li>
                        <li>👤 Admin user record</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
