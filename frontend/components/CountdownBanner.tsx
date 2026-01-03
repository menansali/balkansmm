'use client';
import { useState, useEffect } from 'react';
import { Timer, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CountdownBanner() {
    const [timeLeft, setTimeLeft] = useState<{ m: number; s: number } | null>(null);

    useEffect(() => {
        // Mock Happy Hour: Ends in 42 minutes from load
        const endTime = new Date();
        endTime.setMinutes(endTime.getMinutes() + 42);

        const timer = setInterval(() => {
            const now = new Date();
            const diff = endTime.getTime() - now.getTime();

            if (diff <= 0) {
                clearInterval(timer);
                setTimeLeft(null);
            } else {
                setTimeLeft({
                    m: Math.floor((diff / 1000 / 60) % 60),
                    s: Math.floor((diff / 1000) % 60)
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    if (!timeLeft) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 text-black font-bold py-2 px-4 shadow-[0_0_20px_rgba(234,179,8,0.4)] relative z-50 overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse-slow"></div>
                <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 relative z-10 text-xs md:text-sm uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                        <Zap size={16} fill="black" />
                        <span>Happy Hour Active!</span>
                    </div>
                    <span>•</span>
                    <span>50% OFF All Instagram Services</span>
                    <span>•</span>
                    <div className="flex items-center gap-2 font-mono bg-black/10 px-2 py-0.5 rounded">
                        <Timer size={14} />
                        {String(timeLeft.m).padStart(2, '0')}:{String(timeLeft.s).padStart(2, '0')}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
