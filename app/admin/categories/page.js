'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { getCategories, addCategory, deleteCategory } from '@/services/categoryService';
import { getMenuItems } from '@/services/menuService';
import toast from 'react-hot-toast';
import {
    FiPlus, FiTrash2, FiSearch, FiLayers, FiCheckCircle,
    FiEyeOff, FiTrendingUp, FiArrowRight, FiMoreVertical, FiFilter
} from 'react-icons/fi';
import styles from './page.module.css';
import Link from 'next/link';

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [newCat, setNewCat] = useState({
        name: '',
        description: '',
        displayOrder: 0
    });

    useEffect(() => {
        const load = async () => {
            try {
                const [catData, itemData] = await Promise.all([
                    getCategories(),
                    getMenuItems()
                ]);
                setCategories(catData);
                setMenuItems(itemData);
            } catch (e) {
                console.error('Error loading data:', e);
                toast.error('Failed to load categories');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleAdd = async () => {
        if (!newCat.name.trim()) return;
        try {
            const data = {
                ...newCat,
                name: newCat.name.trim(),
                image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=400', // Default placeholder
            };
            const ref = await addCategory(data);
            setCategories(prev => [...prev, { id: ref?.id || Date.now().toString(), ...data }]);
            toast.success('Category created!');
            setNewCat({ name: '', description: '', displayOrder: 0 });
        } catch (e) {
            toast.error('Failed to add category');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure? This will not delete items in this category.')) return;
        try {
            await deleteCategory(id);
            setCategories(prev => prev.filter(c => c.id !== id));
            toast.success('Category removed');
        } catch (e) {
            toast.error('Delete failed');
        }
    };

    // Stats calculations
    const stats = {
        total: categories.length,
        activeItems: menuItems.filter(i => i.available !== false).length,
        hiddenItems: menuItems.filter(i => i.available === false).length,
        topCategory: categories.length > 0 ? categories[0].name : 'None'
    };

    const getItemCount = (catName) => {
        return menuItems.filter(item => item.category === catName).length;
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className={styles.container}>
                <div className="admin-header">
                    <div>
                        <h1 className="admin-title">Category Management</h1>
                        <p className="admin-subtitle">Manage categories and organize your menu structure.</p>
                    </div>
                    <button className="export-btn" onClick={() => toast('Exporting data...')}>
                        📤 Export Data
                    </button>
                </div>

                {/* Stats Row */}
                <div className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ color: '#D4A373' }}><FiLayers /></div>
                        <span className={styles.statLabel}>Total Categories</span>
                        <div className={styles.statValue}>{stats.total}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ color: '#10B981' }}><FiCheckCircle /></div>
                        <span className={styles.statLabel}>Active Items</span>
                        <div className={styles.statValue}>{stats.activeItems}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ color: '#F97316' }}><FiEyeOff /></div>
                        <span className={styles.statLabel}>Hidden Items</span>
                        <div className={styles.statValue}>{stats.hiddenItems}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ color: '#6366F1' }}><FiTrendingUp /></div>
                        <span className={styles.statLabel}>Top Category</span>
                        <div className={styles.statValue} style={{ fontSize: '18px', marginTop: '10px' }}>{stats.topCategory}</div>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className={styles.layoutGrid}>
                    {/* New Category Form */}
                    <div className={styles.formCard}>
                        <div className={styles.cardTitle}><FiPlus /> Create New</div>
                        <div className={styles.formSection}>
                            <h2>New Category</h2>
                            <p>Create a new section for your digital menu. Changes apply instantly.</p>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Category Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Signature Coffees"
                                className={styles.input}
                                value={newCat.name}
                                onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Display Order</label>
                            <select
                                className={`${styles.input} ${styles.select}`}
                                value={newCat.displayOrder}
                                onChange={(e) => setNewCat({ ...newCat, displayOrder: parseInt(e.target.value) })}
                            >
                                <option value={0}>At the beginning</option>
                                <option value={1}>Position 2</option>
                                <option value={2}>Position 3</option>
                                <option value={99}>At the end</option>
                            </select>
                        </div>

                        <button className={styles.saveBtn} onClick={handleAdd}>
                            <FiCheckCircle /> Save Category
                        </button>
                    </div>

                    {/* Banner Card */}
                    <div className={styles.bannerCard}>
                        <img
                            src="https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=800"
                            className={styles.bannerBg}
                            alt="Banner"
                        />
                        <div className={styles.bannerContent}>
                            <span className={styles.bannerBadge}>Seasonal Update</span>
                            <h2>Winter Menu Collection</h2>
                            <p>Update your seasonal offerings with our new bulk-edit tool. Perfect for limited-time specials.</p>
                            <Link href="/admin/menu" className={styles.bannerLink}>
                                Start Editing <FiArrowRight />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Existing Categories Grid */}
                <div className={styles.gridHeader}>
                    <h2>Existing Categories</h2>
                    <div className={styles.controls}>
                        <div className={styles.searchBox}>
                            <FiSearch className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search..."
                                className={styles.searchInput}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className={styles.filterBtn}><FiFilter /></button>
                    </div>
                </div>

                <div className={styles.categoryGrid}>
                    {filteredCategories.map((cat) => (
                        <div key={cat.id} className={styles.categoryCard}>
                            <div className={styles.cardImageWrapper}>
                                <img
                                    src={cat.image || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=400'}
                                    alt={cat.name}
                                    className={styles.cardImage}
                                />
                                <div className={styles.itemCountBadge}>
                                    {getItemCount(cat.name)} Items
                                </div>
                                <button className={styles.moreBtn} onClick={() => handleDelete(cat.id)}>
                                    <FiTrash2 size={14} color="#EF4444" />
                                </button>
                            </div>
                            <div className={styles.cardInfo}>
                                <h3>{cat.name}</h3>
                                <p>{cat.description || `Selection of our finest ${cat.name.toLowerCase()} items.`}</p>
                                <div className={styles.cardFooter}>
                                    <div className={styles.statusIndicator}>
                                        <span
                                            className={styles.statusDot}
                                            style={{ backgroundColor: cat.status !== 'hidden' ? '#10B981' : '#F97316' }}
                                        ></span>
                                        {cat.status || 'Active'}
                                    </div>
                                    <Link href={`/admin/menu?category=${cat.name}`} className={styles.manageLink}>
                                        Manage Items <FiArrowRight />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
