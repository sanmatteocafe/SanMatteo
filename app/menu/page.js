'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import MenuCard from '@/components/MenuCard';
import CategoryFilter from '@/components/CategoryFilter';
import { useCart } from '@/lib/CartContext';
import { getMenuItems } from '@/services/menuService';
import { getCategories } from '@/services/categoryService';
import { FiSearch, FiArrowRight } from 'react-icons/fi';
import styles from './page.module.css';
import Link from 'next/link';

const demoItems = [
    {
        id: '1', name: 'Gold Leaf Latte', price: 450, category: 'Signature Brews',
        image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=400',
        description: 'Rich espresso infused with 24k gold flakes, topped with velvety micro-foam and saffron.',
        badge: 'BESTSELLER'
    },
    {
        id: '2', name: 'Truffle Mocha', price: 520, category: 'Signature Brews',
        image: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&q=80&w=400',
        description: 'Dark Belgian chocolate ganache blended with espresso and a hint of white truffle oil.'
    },
    {
        id: '3', name: 'Cold Brew Reserve', price: 380, category: 'Signature Brews',
        image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=400',
        description: 'Steeped for 18 hours, served over artisanal crystal clear ice blocks.'
    },
    {
        id: '4', name: 'Butter Croissant', price: 220, category: 'Artisan Pastries',
        image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=400',
        description: 'Classic French croissant made with imported Normandy butter, flaky and golden.'
    },
    {
        id: '5', name: 'Macaron Selection', price: 650, category: 'Artisan Pastries',
        image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=400',
        description: 'Box of 6 signature flavors: Rose, Pistachio, Salted Caramel, Dark Chocolate, Lemon, and Lavender.',
        badge: 'NEW'
    },
    {
        id: '6', name: 'Royal Breakfast', price: 850, category: 'Royal Breakfast',
        image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&q=80&w=400',
        description: 'Our ultimate spread: Smoked salmon, organic eggs, avocados, and a side of fresh sourdough.'
    }
];

const categoryDescriptions = {
    'Signature Brews': 'Exquisite coffee blends sourced from the finest estates, roasted to perfection.',
    'Artisan Pastries': 'Freshly baked in-house using traditional French techniques.',
    'Royal Breakfast': 'Start your day with our curated selection of luxury morning favorites.',
    'all': 'Explore our delightful selection of food & beverages'
};

function MenuContent() {
    const [menuItems, setMenuItems] = useState(demoItems);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const searchParams = useSearchParams();
    const { setTable, tableNumber, items, totalPrice } = useCart();

    useEffect(() => {
        const cat = searchParams.get('category');
        if (cat) setSelectedCategory(cat);

        const table = searchParams.get('table');
        if (table) {
            const tableNum = parseInt(table, 10);
            if (tableNum >= 1 && tableNum <= 20) {
                setTable(String(tableNum));
            }
        }

        const loadData = async () => {
            try {
                const [itemsData, cats] = await Promise.all([getMenuItems(), getCategories()]);

                // If items exist in Firestore, use them. Otherwise, if we strictly want only real data, set to itemsData.
                // For a live app, we should show itemsData even if [].
                setMenuItems(itemsData);

                // Construct category list with icons
                const getIcon = (name) => {
                    const map = {
                        'Signature Brews': '☕',
                        'Artisan Pastries': '🥐',
                        'Royal Breakfast': '🍳',
                        'Coffee': '☕',
                        'Pastry': '🥐',
                        'Breakfast': '🍳',
                        'Desserts': '🍰',
                        'Snacks': '🥪',
                        'Pizza': '🍕',
                        'Drinks': '🥤'
                    };
                    return map[name] || '🍽️';
                };

                if (cats.length > 0) {
                    setCategories(cats.map(c => ({
                        ...c,
                        icon: getIcon(c.name)
                    })));
                } else {
                    const uniqueCats = [...new Set(itemsData.map(i => i.category))];
                    setCategories(uniqueCats.map((name, i) => ({
                        id: String(i),
                        name,
                        icon: getIcon(name)
                    })));
                }
            } catch (err) {
                console.error("Menu Load Error:", err);
                // Fallback to demo only on error
                setMenuItems(demoItems);
                const uniqueCats = [...new Set(demoItems.map(i => i.category))];
                setCategories(uniqueCats.map((name, i) => ({
                    id: String(i),
                    name,
                    icon: '🍽️'
                })));
            }
        };
        loadData();
    }, [searchParams, setTable]);

    const filteredItems = menuItems.filter(item => {
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Grouping logic
    const groupedItems = filteredItems.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {});

    const totalCartItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <>
            <Navbar />

            {tableNumber && (
                <div className={styles.tableBanner}>
                    <span>🍽️ Ordering for Table {String(tableNumber).padStart(2, '0')}</span>
                </div>
            )}

            <main className={styles.main}>
                <div className="container">
                    <div className={styles.header}>
                        <div>
                            <h1 className={styles.title}>Menu</h1>
                            <p className={styles.subtitle}>
                                {categoryDescriptions[selectedCategory] || categoryDescriptions['all']}
                            </p>
                        </div>
                        <div className={styles.searchBar}>
                            <FiSearch className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search our signature menu..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={styles.searchInput}
                            />
                        </div>
                    </div>

                    <CategoryFilter
                        categories={categories}
                        selected={selectedCategory}
                        onSelect={setSelectedCategory}
                    />

                    {Object.keys(groupedItems).length > 0 ? (
                        Object.entries(groupedItems).map(([category, categoryItems]) => (
                            <section key={category} className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <h2 className={styles.sectionTitle}>{category}</h2>
                                    <p className={styles.sectionDesc}>{categoryDescriptions[category]}</p>
                                </div>
                                <div className={styles.grid}>
                                    {categoryItems.map((item) => (
                                        <MenuCard key={item.id} item={item} />
                                    ))}
                                </div>
                            </section>
                        ))
                    ) : (
                        <div className={styles.empty}>
                            <span className={styles.emptyEmoji}>🔍</span>
                            <h3>No items found</h3>
                            <p>Try adjusting your search or category filter</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Floating Order Bar */}
            {totalCartItems > 0 && (
                <div className={styles.floatingBarWrapper}>
                    <Link href="/checkout" className={styles.floatingBar}>
                        <div className={styles.barLeft}>
                            <div className={styles.itemCount}>{totalCartItems}</div>
                            <span className={styles.viewOrderText}>VIEW ORDER</span>
                        </div>
                        <div className={styles.barRight}>
                            <span className={styles.barPrice}>₹{totalPrice}</span>
                            <FiArrowRight className={styles.barArrow} />
                        </div>
                    </Link>
                </div>
            )}
        </>
    );
}

export default function MenuPage() {
    return (
        <Suspense fallback={<div className={styles.loading}>Loading Menu...</div>}>
            <MenuContent />
        </Suspense>
    );
}
