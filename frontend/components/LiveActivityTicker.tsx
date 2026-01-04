'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LiveActivityTicker() {
    const [events, setEvents] = useState<{ text: string, time: string }[]>([]);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        // Initial Fetch
        const fetchEvents = () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            fetch(`${apiUrl}/activity`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data) && data.length > 0) setEvents(data);
                })
                .catch(err => console.error('Stats error', err));
        };
        fetchEvents();

        // Poll every 30s
        const poll = setInterval(fetchEvents, 30000);
        return () => clearInterval(poll);
    }, []);

    useEffect(() => {
        if (events.length === 0) return;
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % events.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [events]);

    if (events.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    className="glass-card px-4 py-3 rounded-2xl flex items-center gap-3 shadow-2xl bg-black/60 border border-white/10"
                >
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <div>
                        <div className="text-xs font-bold text-white max-w-[200px] truncate">{events[index]?.text}</div>
                        <div className="text-[10px] text-gray-400">{events[index]?.time}</div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
