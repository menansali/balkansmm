'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EVENTS = [
    { text: 'New order from Belgrade: 5,000 TikTok Views', time: 'Just now' },
    { text: 'Order #10292 completed successfully', time: '2s ago' },
    { text: 'New user registered from Sarajevo', time: '5s ago' },
    { text: 'Order #10291 started processing', time: '12s ago' },
    { text: 'New deposit: $50.00 via Crypto', time: '25s ago' },
    { text: 'Service update: Instagram Likes price dropped', time: '1m ago' },
    { text: 'New order from Zagreb: 10k IG Followers', time: '1m ago' },
];

export default function LiveActivityTicker() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % EVENTS.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

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
                        <div className="text-xs font-bold text-white max-w-[200px] truncate">{EVENTS[index].text}</div>
                        <div className="text-[10px] text-gray-400">{EVENTS[index].time}</div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
