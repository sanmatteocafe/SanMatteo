'use client';
import { useState, useEffect, useMemo } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import AdminLayout from '@/components/AdminLayout';
import Modal from '@/components/Modal';
import Button from '@/components/Button';
import {
    subscribeToQRCodes,
    saveQRCode,
    updateQRCode,
    deleteQRCode
} from '@/services/qrService';
import toast from 'react-hot-toast';
import {
    FiDownload, FiPrinter, FiPlus, FiGrid, FiSearch,
    FiEye, FiEdit2, FiTrash2, FiLink, FiDownloadCloud
} from 'react-icons/fi';
import styles from './page.module.css';

function getDefaultBaseUrl() {
    if (typeof window === 'undefined') return 'https://sanmatteo.com';
    const { protocol, hostname, port } = window.location;
    return `${protocol}//${hostname}${port ? ':' + port : ''}`;
}

export default function QRManagerPage() {
    const [qrcodes, setQrcodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All Tables');
    const [baseUrl, setBaseUrl] = useState('');

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showUrlModal, setShowUrlModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);

    // Form States
    const [editingTable, setEditingTable] = useState(null);
    const [viewingTable, setViewingTable] = useState(null);
    const [formData, setFormData] = useState({ tableNumber: '', tableName: '' });
    const [tempUrl, setTempUrl] = useState('');

    useEffect(() => {
        setBaseUrl(getDefaultBaseUrl());
        const unsubscribe = subscribeToQRCodes((data) => {
            setQrcodes(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredQRCodes = useMemo(() => {
        return qrcodes.filter(qr => {
            const matchesSearch = qr.tableNumber.toString().includes(searchQuery) ||
                qr.tableName?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        });
    }, [qrcodes, searchQuery]);

    const handleSaveTable = async (e) => {
        e.preventDefault();
        if (!formData.tableNumber) return toast.error('Table number is required');

        try {
            const qrUrl = `${baseUrl}/?table=${formData.tableNumber}`;
            if (showAddModal) {
                await saveQRCode(formData.tableNumber, qrUrl, formData.tableName);
                toast.success('Table QR added successfully');
            } else {
                await updateQRCode(editingTable.id, {
                    tableNumber: parseInt(formData.tableNumber),
                    tableName: formData.tableName,
                    qrUrl
                });
                toast.success('Table updated successfully');
            }
            setShowAddModal(false);
            setShowEditModal(false);
            setFormData({ tableNumber: '', tableName: '' });
        } catch (error) {
            toast.error('Operation failed');
        }
    };

    const handleDelete = async (id, tableNum) => {
        if (window.confirm(`Delete Table ${tableNum} QR Code?`)) {
            try {
                await deleteQRCode(id);
                toast.success('Table deleted');
            } catch (error) {
                toast.error('Failed to delete');
            }
        }
    };

    const handleDownload = (tableNum) => {
        const canvas = document.getElementById(`qr-canvas-${tableNum}`);
        if (!canvas) return;
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `SanMatteo-Table-${tableNum}.png`;
        link.href = url;
        link.click();
        toast.success('Download started');
    };

    const handlePrint = (qr) => {
        const canvas = document.getElementById(`qr-canvas-${qr.tableNumber}`);
        if (!canvas) return;
        const dataUrl = canvas.toDataURL('image/png');
        const win = window.open('', '_blank');
        win.document.write(`
            <html><head><title>Print QR - Table ${qr.tableNumber}</title>
            <style>
                body { display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; font-family: sans-serif; }
                .card { border: 2px dashed #6F4E37; border-radius: 20px; padding: 40px; text-align: center; width: 300px; }
                .brand { font-size: 24px; font-weight: 900; color: #6F4E37; margin-bottom: 5px; }
                .table { font-size: 18px; font-weight: 700; margin-bottom: 20px; }
                img { width: 220px; margin-bottom: 20px; }
                .footer { font-size: 14px; color: #888; text-transform: uppercase; letter-spacing: 1px; }
            </style></head><body>
                <div class="card">
                    <div class="brand">SAN MATTEO</div>
                    <div class="table">Table ${qr.tableNumber}</div>
                    <img src="${dataUrl}" />
                    <div class="footer">Scan To Order</div>
                </div>
            </body></html>
        `);
        win.document.close();
        win.print();
    };

    const handlePrintAll = () => {
        const win = window.open('', '_blank');
        const cardsHtml = qrcodes.map(qr => {
            const canvas = document.getElementById(`qr-canvas-${qr.tableNumber}`);
            const dataUrl = canvas ? canvas.toDataURL('image/png') : '';
            return `
                <div class="card">
                    <div class="brand">SAN MATTEO</div>
                    <div class="table">Table ${qr.tableNumber}</div>
                    <img src="${dataUrl}" />
                    <div class="footer">Scan To Order</div>
                </div>
            `;
        }).join('');

        win.document.write(`
            <html><head><title>Print All QR Codes</title>
            <style>
                body { font-family: sans-serif; padding: 20px; }
                .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; }
                .card { border: 1px dashed #6F4E37; border-radius: 15px; padding: 25px; text-align: center; page-break-inside: avoid; }
                .brand { font-size: 18px; font-weight: 900; color: #6F4E37; margin-bottom: 2px; }
                .table { font-size: 14px; font-weight: 700; margin-bottom: 15px; }
                img { width: 140px; margin-bottom: 10px; }
                .footer { font-size: 11px; color: #888; text-transform: uppercase; }
            </style></head><body>
                <div class="grid">${cardsHtml}</div>
            </body></html>
        `);
        win.document.close();
        win.print();
    };

    return (
        <AdminLayout>
            <div className={styles.mainContainer}>
                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.headerTitle}>
                        <h1>QR Code Manager</h1>
                        <p>Manage and generate high-fidelity branding for your cafe tables</p>
                    </div>
                    <div className={styles.headerActions}>
                        <button className={styles.btnSecondary} onClick={handlePrintAll}><FiPrinter /> Print All</button>
                        <button className={styles.btnSecondary} onClick={() => toast('Exporting data...')}><FiDownloadCloud /> Export</button>
                        <button className={styles.btnPrimary} onClick={() => setShowAddModal(true)}><FiPlus /> Add Table QR</button>
                    </div>
                </header>

                {/* Base URL Config */}
                <div className={styles.urlConfig}>
                    <div className={styles.urlInfo}>
                        <h3>QR Base URL</h3>
                        <p>All QR codes point to this primary domain</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div className={styles.urlDisplay}>{baseUrl}</div>
                        <button className={styles.btnSecondary} style={{ height: '36px' }} onClick={() => {
                            setTempUrl(baseUrl);
                            setShowUrlModal(true);
                        }}>Change URL</button>
                    </div>
                </div>

                {/* Control Bar */}
                <div className={styles.controlBar}>
                    <div className={styles.searchWrapper}>
                        <FiSearch className={styles.searchIcon} />
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Search by table number or name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className={styles.filterTabs}>
                        {['All Tables', 'Active'].map(tab => (
                            <button
                                key={tab}
                                className={`${styles.tabBtn} ${filterStatus === tab ? styles.active : ''}`}
                                onClick={() => setFilterStatus(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* QR Grid */}
                {loading ? (
                    <div className={styles.qrGrid}>
                        {[1, 2, 3, 4].map(i => <div key={i} className={styles.qrCard} style={{ height: '300px', opacity: 0.5, background: '#eee' }}></div>)}
                    </div>
                ) : (
                    <div className={styles.qrGrid}>
                        {filteredQRCodes.map((qr) => (
                            <div key={qr.id} className={styles.qrCard}>
                                <div className={styles.cardHeader}>
                                    <h3>Table {qr.tableNumber}</h3>
                                    <span>{qr.tableName || 'Unnamed'}</span>
                                </div>
                                <div className={styles.qrContainer}>
                                    <div className={styles.qrBranding}>
                                        <h4>SAN MATTEO</h4>
                                    </div>
                                    <QRCodeCanvas
                                        id={`qr-canvas-${qr.tableNumber}`}
                                        value={`${baseUrl}/?table=${qr.tableNumber}`}
                                        size={140}
                                        level="H"
                                        includeMargin={false}
                                    />
                                    <div className={styles.qrBranding}>
                                        <p>Scan To Order</p>
                                    </div>
                                </div>
                                <div className={styles.qrActions}>
                                    <button className={styles.actionBtn} title="View" onClick={() => { setViewingTable(qr); setShowViewModal(true); }}><FiEye /></button>
                                    <button className={styles.actionBtn} title="Download" onClick={() => handleDownload(qr.tableNumber)}><FiDownload /></button>
                                    <button className={styles.actionBtn} title="Print" onClick={() => handlePrint(qr)}><FiPrinter /></button>
                                    <button className={styles.actionBtn} title="Edit" onClick={() => {
                                        setEditingTable(qr);
                                        setFormData({ tableNumber: qr.tableNumber, tableName: qr.tableName || '' });
                                        setShowEditModal(true);
                                    }}><FiEdit2 /></button>
                                    <button className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Delete" onClick={() => handleDelete(qr.id, qr.tableNumber)}><FiTrash2 /></button>
                                </div>
                            </div>
                        ))}
                        {filteredQRCodes.length === 0 && (
                            <div className="flex-center" style={{ gridColumn: '1/-1', height: '300px', flexDirection: 'column', gap: '1rem' }}>
                                <p style={{ color: '#999' }}>No QR codes found matching your search</p>
                                <Button variant="outline" onClick={() => setShowAddModal(true)}>Create New Table</Button>
                            </div>
                        )}
                    </div>
                )}

                {/* Modals */}
                <Modal isOpen={showAddModal || showEditModal} onClose={() => { setShowAddModal(false); setShowEditModal(false); }} title={showAddModal ? "Add Table QR" : "Edit Table QR"}>
                    <form className={styles.modalForm} onSubmit={handleSaveTable}>
                        <div className={styles.inputField}>
                            <label>Table Number</label>
                            <input
                                type="number"
                                value={formData.tableNumber}
                                onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                                placeholder="e.g. 5"
                            />
                        </div>
                        <div className={styles.inputField}>
                            <label>Table Name (Optional)</label>
                            <input
                                type="text"
                                value={formData.tableName}
                                onChange={(e) => setFormData({ ...formData, tableName: e.target.value })}
                                placeholder="e.g. Window Side"
                            />
                        </div>
                        <div className={styles.modalActions}>
                            <Button variant="outline" type="button" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}>Cancel</Button>
                            <Button variant="primary" type="submit">Save Table</Button>
                        </div>
                    </form>
                </Modal>

                <Modal isOpen={showUrlModal} onClose={() => setShowUrlModal(false)} title="Change Base URL">
                    <div className={styles.modalForm}>
                        <div className={styles.inputField}>
                            <label>Enter Base URL</label>
                            <input
                                type="text"
                                value={tempUrl}
                                onChange={(e) => setTempUrl(e.target.value)}
                                placeholder="https://yourdomain.com"
                            />
                            <p style={{ fontSize: '11px', color: '#999', marginTop: '8px' }}>This URL will be used for all newly generated QR codes.</p>
                        </div>
                        <div className={styles.modalActions}>
                            <Button variant="outline" onClick={() => setShowUrlModal(false)}>Cancel</Button>
                            <Button variant="primary" onClick={() => { setBaseUrl(tempUrl); setShowUrlModal(false); toast.success('Base URL Updated'); }}>Save Changes</Button>
                        </div>
                    </div>
                </Modal>

                <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title={`Table ${viewingTable?.tableNumber} QR`}>
                    {viewingTable && (
                        <div className="flex-center" style={{ flexDirection: 'column', gap: '2rem', padding: '2rem' }}>
                            <div className={styles.qrContainer} style={{ width: '100%', padding: '3rem' }}>
                                <div className={styles.qrBranding} style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={{ fontSize: '24px' }}>SAN MATTEO</h4>
                                </div>
                                <QRCodeCanvas
                                    value={`${baseUrl}/?table=${viewingTable.tableNumber}`}
                                    size={240}
                                    level="H"
                                />
                                <div className={styles.qrBranding} style={{ marginTop: '1.5rem' }}>
                                    <p style={{ fontSize: '14px' }}>Scan To Order</p>
                                </div>
                            </div>
                            <div style={{ width: '100%', display: 'flex', gap: '1rem' }}>
                                <Button variant="outline" style={{ flex: 1 }} onClick={() => handleDownload(viewingTable.tableNumber)}><FiDownload /> Download PNG</Button>
                                <Button variant="primary" style={{ flex: 1 }} onClick={() => handlePrint(viewingTable)}><FiPrinter /> Print</Button>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </AdminLayout>
    );
}
