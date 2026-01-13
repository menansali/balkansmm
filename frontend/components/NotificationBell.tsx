'use client';
import { useState } from 'react';
import { Bell, CheckCheck, X } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationBell() {
    const { notifications, unreadCount, markAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative z-[100]">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
            >
                <Bell size={20} className="text-gray-300" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-ruby-500 rounded-full border border-black animate-pulse"></span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop to close */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Dropdown */}
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 top-full mt-2 w-80 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 origin-top-right"
                        >
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <h3 className="font-bold text-sm">Notifications</h3>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-500">{unreadCount} unread</span>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={() => notifications.forEach(n => markAsRead(n.id))}
                                            className="text-[10px] uppercase font-bold text-ruby-400 hover:text-ruby-300 transition-colors"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500 text-sm">
                                        No new notifications
                                    </div>
                                ) : (
                                    notifications.map(n => (
                                        <div
                                            key={n.id}
                                            onClick={() => markAsRead(n.id)}
                                            className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${!n.read ? 'bg-ruby-500/5' : ''}`}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!n.read ? 'bg-ruby-500' : 'bg-gray-600'}`}></div>
                                                <div>
                                                    <h4 className={`text-sm ${!n.read ? 'font-bold text-white' : 'font-medium text-gray-400'}`}>
                                                        {n.title}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                                        {n.message}
                                                    </p>
                                                    <span className="text-[10px] text-gray-600 mt-2 block">
                                                        {n.timestamp.toLocaleTimeString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
