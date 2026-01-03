'use client';
import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import api from '../lib/api';

type Announcement = {
    id: number;
    message: string;
    type: string;
};

export default function AnnouncementBanner() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const res = await api.get('/admin/announcements/active');
                setAnnouncements(res.data);
            } catch (e) {
                // Silent error
            }
        };
        fetchAnnouncements();
    }, []);

    if (announcements.length === 0 || !visible) return null;

    // Show only the latest one for banner to avoid clutter, or rotate?
    // Let's show the latest one.
    const latest = announcements[0];

    const getColor = (type: string) => {
        switch (type) {
            case 'warning': return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500';
            case 'alert': return 'bg-red-500/10 border-red-500/20 text-red-500';
            case 'success': return 'bg-green-500/10 border-green-500/20 text-green-500';
            default: return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
        }
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 pt-6"
                >
                    <div className={`p-4 rounded-xl border flex items-start gap-3 relative ${getColor(latest.type)}`}>
                        <Bell size={20} className="mt-0.5 shrink-0" />
                        <div className="flex-1 text-sm font-medium pr-8">
                            {latest.message}
                        </div>
                        <button
                            onClick={() => setVisible(false)}
                            className="absolute top-4 right-4 opacity-50 hover:opacity-100 transition-opacity"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
