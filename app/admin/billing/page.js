'use client';
import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { updateOrderStatus } from '@/services/orderService';
import { getBills } from '@/services/billingService';
import { getSettings, updateSettings } from '@/services/settingsService';
import toast from 'react-hot-toast';
import { FiSearch, FiPrinter, FiDownload, FiClock, FiFileText, FiCoffee, FiGrid, FiSettings, FiSave } from 'react-icons/fi';
import styles from './page.module.css';

export default function BillingPage() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All Orders');
    const [selectedBill, setSelectedBill] = useState(null);
    const invoiceRef = useRef(null);
    const [gstNumber, setGstNumber] = useState('');
    const [gstInput, setGstInput] = useState('');
    const [savingGst, setSavingGst] = useState(false);
    const [showGstSettings, setShowGstSettings] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [billsData, settings] = await Promise.all([
                    getBills(),
                    getSettings()
                ]);
                setBills(billsData);
                if (billsData.length > 0) setSelectedBill(billsData[0]);
                if (settings.gstNumber) {
                    setGstNumber(settings.gstNumber);
                    setGstInput(settings.gstNumber);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load bills');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSaveGst = async () => {
        setSavingGst(true);
        try {
            await updateSettings({ gstNumber: gstInput.trim() });
            setGstNumber(gstInput.trim());
            toast.success(gstInput.trim() ? 'GST number saved!' : 'GST number removed');
            setShowGstSettings(false);
        } catch (err) {
            toast.error('Failed to save GST');
        } finally {
            setSavingGst(false);
        }
    };

    const filteredBills = bills.filter(b => {
        const matchesSearch = (b.orderNumber || b.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.customerName?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'All Orders' ||
            (filterStatus === 'Unpaid' && b.status === 'pending') ||
            (filterStatus === 'Completed' && b.status === 'completed') ||
            (filterStatus === 'Refunded' && b.status === 'refunded');
        return matchesSearch && matchesFilter;
    });

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Just now';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getTimeAgo = (timestamp) => {
        if (!timestamp) return 'Just now';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const mins = Math.floor((new Date() - date) / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        return `${Math.floor(mins / 60)}h ago`;
    };

    const handlePrint = () => {
        if (!selectedBill) return;
        window.print();
        toast.success('Sending to printer...');
    };

    const handleDownload = async () => {
        if (!selectedBill || !invoiceRef.current) return;
        const loadingToast = toast.loading('Generating PDF...');
        try {
            const html2canvas = (await import('html2canvas')).default;
            const { jsPDF } = await import('jspdf');

            const canvas = await html2canvas(invoiceRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#FFFFFF',
                logging: false,
            });

            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            const pdf = new jsPDF('p', 'mm', 'a4');
            const marginX = 0;
            const marginY = 10;
            pdf.addImage(imgData, 'PNG', marginX, marginY, imgWidth, imgHeight);
            pdf.save(`SanMatteo-${selectedBill.orderNumber || selectedBill.id.slice(-6)}.pdf`);

            toast.dismiss(loadingToast);
            toast.success('PDF downloaded!');
        } catch (err) {
            console.error('PDF generation error:', err);
            toast.dismiss(loadingToast);
            toast.error('Failed to generate PDF');
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex-center" style={{ height: '80vh' }}>
                    <div className="loader"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className={styles.mainContainer}>
                {/* Sidebar */}
                <aside className={styles.sidebar}>
                    <div className={styles.sidebarHeader}>
                        <div className={styles.sidebarTitle}>
                            <h2>Recent Orders</h2>
                            <span className={styles.viewAll}>View All</span>
                        </div>
                        <div className={styles.filterRow}>
                            {['All Orders', 'Unpaid', 'Completed', 'Refunded'].map(tab => (
                                <button
                                    key={tab}
                                    className={`${styles.filterTab} ${filterStatus === tab ? styles.active : ''}`}
                                    onClick={() => setFilterStatus(tab)}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div style={{ position: 'relative', marginTop: '1.5rem' }}>
                            <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#A89F94' }} />
                            <input
                                type="text"
                                placeholder="Search Order ID..."
                                className={styles.searchInput}
                                style={{
                                    width: '100%',
                                    paddingLeft: '40px',
                                    background: '#FDFCFB',
                                    border: '1px solid #F1EBE5',
                                    borderRadius: '12px',
                                    fontSize: '13px',
                                    height: '44px'
                                }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className={styles.orderList}>
                        {filteredBills.map(bill => (
                            <div
                                key={bill.id}
                                className={`${styles.orderCard} ${selectedBill?.id === bill.id ? styles.active : ''}`}
                                onClick={() => setSelectedBill(bill)}
                            >
                                <div className={styles.iconBox}>
                                    {bill.category === 'Coffee' ? <FiCoffee /> : <FiFileText />}
                                </div>
                                <div className={styles.cardBody}>
                                    <div className={styles.cardTop}>
                                        <h4>Order #{bill.orderNumber || bill.id.slice(-3)}</h4>
                                        <span className={`${styles.statusPill} ${styles[bill.status || 'paid']}`}>
                                            {bill.status || 'Paid'}
                                        </span>
                                    </div>
                                    <div className={styles.cardMeta}>
                                        Table {bill.tableNumber} • {bill.paymentType || 'Dine-in'}
                                        <span style={{ float: 'right' }}>{getTimeAgo(bill.createdAt)}</span>
                                    </div>
                                    <div className={styles.cardPrice}>₹{bill.grandTotal?.toFixed(2) || bill.total?.toFixed(2)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Preview Pane */}
                <main className={styles.previewPane}>
                    {selectedBill ? (
                        <>
                            <header className={styles.previewHeader}>
                                <div className={styles.previewTitle}>
                                    <h2>Invoice Preview</h2>
                                    <p>Review details before printing</p>
                                </div>
                                <div className={styles.previewActions}>
                                    <button className={`${styles.btnAction} ${styles.btnOutline}`} onClick={handleDownload}>
                                        <FiDownload /> PDF
                                    </button>
                                    <button className={`${styles.btnAction} ${styles.btnOutline}`} onClick={() => setShowGstSettings(!showGstSettings)}>
                                        <FiSettings /> GST
                                    </button>
                                    <button className={`${styles.btnAction} ${styles.btnPrimary}`} onClick={handlePrint}>
                                        <FiPrinter /> Print Bill
                                    </button>
                                </div>
                            </header>

                            {/* GST Settings Panel */}
                            {showGstSettings && (
                                <div className={styles.gstPanel}>
                                    <div className={styles.gstPanelHeader}>
                                        <h4>GST Settings</h4>
                                        <span className={styles.gstStatus}>
                                            {gstNumber ? `Active: ${gstNumber}` : 'Not configured'}
                                        </span>
                                    </div>
                                    <div className={styles.gstInputRow}>
                                        <input
                                            type="text"
                                            placeholder="Enter GST Number (e.g. 22AAAAA0000A1Z5)"
                                            value={gstInput}
                                            onChange={(e) => setGstInput(e.target.value.toUpperCase())}
                                            className={styles.gstInput}
                                            maxLength={15}
                                        />
                                        <button
                                            className={`${styles.btnAction} ${styles.btnPrimary}`}
                                            onClick={handleSaveGst}
                                            disabled={savingGst}
                                            style={{ height: '44px' }}
                                        >
                                            <FiSave /> {savingGst ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className={styles.invoiceWrapper} ref={invoiceRef}>
                                <div className={styles.invoiceCard}>
                                    <div className={styles.brandLogo}>
                                        <h3>SAN MATTEO</h3>
                                        <span>Ultra-Luxury Cafe</span>
                                    </div>

                                    <div className={styles.invoiceMeta}>
                                        <div className={styles.metaCol}>
                                            <label>DATE</label>
                                            <span>{formatDate(selectedBill.createdAt)}</span>
                                        </div>
                                        <div className={styles.metaCol}>
                                            <label>ORDER ID</label>
                                            <span>#{selectedBill.orderNumber || selectedBill.id.slice(-6).toUpperCase()}</span>
                                        </div>
                                        <div className={styles.metaCol}>
                                            <label>TABLE</label>
                                            <span>{selectedBill.tableNumber}</span>
                                        </div>
                                    </div>

                                    <div className={styles.invoiceMeta}>
                                        <div className={styles.metaCol}>
                                            <label>CUSTOMER</label>
                                            <span>{(selectedBill.customerName || '—').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}</span>
                                        </div>
                                        <div className={styles.metaCol}>
                                            <label>PAYMENT</label>
                                            <span style={{ textTransform: 'capitalize' }}>{selectedBill.paymentType || 'Cash'}</span>
                                        </div>
                                        <div className={styles.metaCol}>
                                            <label>STATUS</label>
                                            <span style={{
                                                textTransform: 'capitalize',
                                                fontWeight: 800,
                                                color: selectedBill.status === 'completed' ? '#2E7D32'
                                                    : selectedBill.status === 'ready' ? '#2E7D32'
                                                        : selectedBill.status === 'preparing' ? '#E65100'
                                                            : '#F57F17'
                                            }}>{selectedBill.status || 'Paid'}</span>
                                        </div>
                                    </div>

                                    <div className={styles.itemsArea}>
                                        <div className={styles.itemsHeader}>
                                            <span>ITEM</span>
                                            <span>QTY</span>
                                            <span style={{ textAlign: 'right' }}>PRICE</span>
                                        </div>
                                        {selectedBill.items?.map((item, idx) => (
                                            <div key={idx} className={styles.itemRow}>
                                                <span className={styles.itemName}>{item.name}</span>
                                                <span className={styles.itemQty}>{item.qty || item.quantity}</span>
                                                <span className={styles.itemPrice}>₹{(item.price * (item.qty || item.quantity)).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className={styles.totalsArea}>
                                        <div className={styles.totalSubRow}>
                                            <span>Subtotal</span>
                                            <span>₹{(selectedBill.total || 0).toFixed(2)}</span>
                                        </div>
                                        <div className={styles.totalSubRow}>
                                            <span>Tax (5%)</span>
                                            <span>₹{(selectedBill.tax || Math.round((selectedBill.total || 0) * 0.05)).toFixed(2)}</span>
                                        </div>
                                        <div className={styles.grandTotal}>
                                            <label>Grand Total</label>
                                            <span>₹{(selectedBill.grandTotal || (selectedBill.total || 0) * 1.05).toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* GST Footer */}
                                    {gstNumber && (
                                        <div className={styles.gstFooter}>
                                            <span>GSTIN: {gstNumber}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-center" style={{ flex: 1 }}>
                            <p style={{ color: '#A89F94' }}>Select an order from the list to preview invoice</p>
                        </div>
                    )}
                </main>
            </div>
        </AdminLayout>
    );
}
