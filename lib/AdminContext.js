'use client';
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { subscribeToNewOrders } from '@/services/orderService';
import { playChime } from './audioUtils';
import toast from 'react-hot-toast';

const AdminContext = createContext();

export function AdminProvider({ children }) {
    const [unreadOrders, setUnreadOrders] = useState([]);
    const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        // Initialize audio
        audioRef.current = new Audio('/sounds/order-alert.mp3');
        audioRef.current.loop = true;

        const unsubscribe = subscribeToNewOrders((newOrder) => {
            // Add to unread
            setUnreadOrders(prev => [newOrder, ...prev]);

            // Play chime and alarm
            playChime();
            playAlarm();

            // Show Toast
            toast.custom((t) => (
                <div className={`custom-notification ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
                    <div className="notif-header">
                        <span className="notif-icon">🔔</span>
                        <div className="notif-content">
                            <p className="notif-title">New Order Received!</p>
                            <p className="notif-desc">Table {newOrder.tableNumber} • ₹{newOrder.grandTotal || newOrder.total}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            stopAlarm();
                        }}
                        className="notif-action"
                    >
                        ACKNOWLEDGE
                    </button>
                </div>
            ), { duration: Infinity, position: 'top-right' });
        });

        return () => {
            unsubscribe();
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, []);

    const playAlarm = () => {
        if (audioRef.current) {
            audioRef.current.play().catch(e => console.log("Audio play deferred:", e));
            setIsAlarmPlaying(true);
        }
    };

    const stopAlarm = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsAlarmPlaying(false);
        }
    };

    const clearUnread = () => {
        setUnreadOrders([]);
        stopAlarm();
    };

    return (
        <AdminContext.Provider value={{
            unreadCount: unreadOrders.length,
            unreadOrders,
            isAlarmPlaying,
            stopAlarm,
            clearUnread
        }}>
            {children}
        </AdminContext.Provider>
    );
}

export const useAdmin = () => useContext(AdminContext);
