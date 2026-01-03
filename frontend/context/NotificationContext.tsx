'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Notification = {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    timestamp: Date;
};

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    addNotification: (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = (n: Omit<Notification, 'id' | 'read' | 'timestamp'>) => {
        const newNotification: Notification = {
            ...n,
            id: Math.random().toString(36).substring(2),
            read: false,
            timestamp: new Date(),
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    // Simulate real-time events
    useEffect(() => {
        const timer = setTimeout(() => {
            addNotification({
                title: 'Order Completed',
                message: 'Order #12853 (Instagram Likes) has been completed.',
                type: 'success'
            });
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, addNotification }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
    return context;
}
