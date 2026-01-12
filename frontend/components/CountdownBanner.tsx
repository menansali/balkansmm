'use client';
import { useState, useEffect } from 'react';
import { Timer, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

interface HappyHourData {
    id: number;
    name: string;
    discountPercent: number;
    categories: string[];
    platforms: string[];
    endsAt: string;
}

export default function CountdownBanner() {
    const [happyHour, setHappyHour] = useState<HappyHourData | null>(null);
    const [timeLeft, setTimeLeft] = useState<{ h: number; m: number; s: number } | null>(null);

    useEffect(() => {
        const fetchHappyHour = async () => {
            try {
                const res = await api.get('/happy-hour/active');
                if (res.data) {
                    setHappyHour(res.data);
                }
            } catch (error) {
                // No active happy hour
                setHappyHour(null);
            }
        };

        fetchHappyHour();
        // Refresh every 5 minutes
        const refreshInterval = setInterval(fetchHappyHour, 5 * 60 * 1000);
        return () => clearInterval(refreshInterval);
    }, []);

    useEffect(() => {
        if (!happyHour) return;

        const endTime = new Date(happyHour.endsAt);

        const timer = setInterval(() => {
            const now = new Date();
            const diff = endTime.getTime() - now.getTime();

            if (diff <= 0) {
                clearInterval(timer);
                setTimeLeft(null);
                setHappyHour(null);
            } else {
                setTimeLeft({
                    h: Math.floor(diff / 1000 / 60 / 60),
                    m: Math.floor((diff / 1000 / 60) % 60),
                    s: Math.floor((diff / 1000) % 60)
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [happyHour]);

    if (!happyHour || !timeLeft) return null;

    const formatPlatforms = () => {
        if (happyHour.platforms.length === 0) return 'All Services';
        return happyHour.platforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ');
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 text-black font-bold py-2 px-4 shadow-[0_0_20px_rgba(234,179,8,0.4)] relative z-50 overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse-slow"></div>
                <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 relative z-10 text-xs md:text-sm uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                        <Zap size={16} fill="black" />
                        <span>{happyHour.name || 'Happy Hour'}!</span>
                    </div>
                    <span>•</span>
                    <span>{happyHour.discountPercent}% OFF {formatPlatforms()}</span>
                    <span>•</span>
                    <div className="flex items-center gap-2 font-mono bg-black/10 px-2 py-0.5 rounded">
                        <Timer size={14} />
                        {timeLeft.h > 0 && `${String(timeLeft.h).padStart(2, '0')}:`}
                        {String(timeLeft.m).padStart(2, '0')}:{String(timeLeft.s).padStart(2, '0')}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
