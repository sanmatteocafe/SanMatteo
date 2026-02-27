'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Button from '@/components/Button';
import { getMenuItems, addMenuItem, updateMenuItem, deleteMenuItem } from '@/services/menuService';
import { getCategories } from '@/services/categoryService';
import { uploadImageToGitHub } from '@/services/githubImageService';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUpload, FiImage } from 'react-icons/fi';
import styles from './page.module.css';

export default function AdminMenuPage() {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', price: '', category: '', image: '', description: '' });
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const [m, c] = await Promise.all([getMenuItems(), getCategories()]);
                setItems(m);
                if (c.length > 0) {
                    setCategories(c.map(cat => cat.name));
                }
            } catch (e) {
                console.error("Admin Menu Load Error:", e);
                setItems([]);
            }
        };
        load();
    }, []);

    const openAdd = () => {
        setEditing(null);
        setForm({ name: '', price: '', category: categories[0] || '', image: '', description: '' });
        setImagePreview('');
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditing(item);
        setForm({ name: item.name, price: item.price.toString(), category: item.category, image: item.image || '', description: item.description || '' });
        setImagePreview(item.image || '');
        setShowModal(true);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        // Show local preview immediately
        const localPreview = URL.createObjectURL(file);
        setImagePreview(localPreview);

        // Upload to GitHub
        setUploading(true);
        try {
            const imageUrl = await uploadImageToGitHub(file);
            setForm(prev => ({ ...prev, image: imageUrl }));
            setImagePreview(imageUrl);
            toast.success('Image uploaded!');
        } catch (err) {
            console.error('Upload error:', err);
            toast.error(err.message || 'Failed to upload image');
            setImagePreview('');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (uploading) {
            toast.error('Please wait for image upload to finish');
            return;
        }
        const data = { ...form, price: Number(form.price) };
        try {
            if (editing) {
                await updateMenuItem(editing.id, data);
                setItems(prev => prev.map(i => i.id === editing.id ? { ...i, ...data } : i));
                toast.success('Item updated!');
            } else {
                const ref = await addMenuItem(data);
                setItems(prev => [...prev, { id: ref?.id || Date.now().toString(), ...data }]);
                toast.success('Item added!');
            }
        } catch (e) {
            console.error('Save error:', e);
            toast.error('Failed to save item');
        }
        setShowModal(false);
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this item?')) return;
        try { await deleteMenuItem(id); } catch (e) { }
        setItems(prev => prev.filter(i => i.id !== id));
        toast.success('Item deleted!');
    };

    return (
        <AdminLayout>
            <div className="admin-header">
                <div>
                    <h1>Menu Management</h1>
                    <p>Add, edit, and manage your menu items</p>
                </div>
                <Button variant="primary" onClick={openAdd}>
                    <FiPlus /> Add Item
                </Button>
            </div>

            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length > 0 ? items.map((item) => (
                            <tr key={item.id}>
                                <td>
                                    <img
                                        src={item.image || 'https://placehold.co/48x48/F5F0EB/8A7A6E?text=No+Img'}
                                        alt={item.name}
                                        style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }}
                                        onError={(e) => { e.target.src = 'https://placehold.co/48x48/F5F0EB/8A7A6E?text=No+Img'; }}
                                    />
                                </td>
                                <td style={{ fontWeight: 600 }}>{item.name}</td>
                                <td><span className="status-badge pending" style={{ textTransform: 'capitalize' }}>{item.category}</span></td>
                                <td style={{ fontWeight: 700 }}>₹{item.price}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className={styles.iconBtn} onClick={() => openEdit(item)}><FiEdit2 /></button>
                                        <button className={`${styles.iconBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(item.id)}><FiTrash2 /></button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#A89F94' }}>
                                    No menu items yet. Click "Add Item" to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2>{editing ? 'Edit Item' : 'Add New Item'}</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', color: 'var(--color-text-muted)', fontSize: '20px', cursor: 'pointer', border: 'none' }}><FiX /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            {/* Image Upload */}
                            <div className="admin-form-group">
                                <label>Image</label>
                                <div className={styles.imageUploadArea}>
                                    {imagePreview ? (
                                        <div className={styles.previewContainer}>
                                            <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
                                            <button
                                                type="button"
                                                className={styles.removeImage}
                                                onClick={() => { setImagePreview(''); setForm(prev => ({ ...prev, image: '' })); }}
                                            >
                                                <FiX />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className={styles.uploadLabel}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                style={{ display: 'none' }}
                                            />
                                            {uploading ? (
                                                <div className={styles.uploadingState}>
                                                    <div className="loader" style={{ width: 24, height: 24 }}></div>
                                                    <span>Uploading...</span>
                                                </div>
                                            ) : (
                                                <div className={styles.uploadPlaceholder}>
                                                    <FiUpload size={24} />
                                                    <span>Click to upload image</span>
                                                    <small>PNG, JPG, WEBP — Max 5MB</small>
                                                </div>
                                            )}
                                        </label>
                                    )}
                                </div>
                                <div className={styles.urlFallback}>
                                    <span>or paste URL:</span>
                                    <input
                                        value={form.image}
                                        onChange={e => { setForm({ ...form, image: e.target.value }); setImagePreview(e.target.value); }}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div className="admin-form-group">
                                <label>Name</label>
                                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Item name" required />
                            </div>
                            <div className="admin-form-group">
                                <label>Price (₹)</label>
                                <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0" required />
                            </div>
                            <div className="admin-form-group">
                                <label>Category</label>
                                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="admin-form-group">
                                <label>Description</label>
                                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Short description" rows={3} />
                            </div>
                            <Button type="submit" variant="primary" fullWidth disabled={uploading}>
                                {uploading ? 'Uploading...' : editing ? 'Update Item' : 'Add Item'}
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
