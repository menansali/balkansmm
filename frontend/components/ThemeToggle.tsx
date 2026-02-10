'use client';
import { useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const emptySubscribe = () => () => {};

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

    if (!mounted) {
        return (
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10" />
        );
    }

    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors border ${theme === 'dark'
                ? 'bg-white/10 border-white/10 hover:bg-white/20'
                : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
                }`}
            aria-label="Toggle theme"
        >
            <motion.div
                initial={false}
                animate={{ rotate: theme === 'dark' ? 0 : 180 }}
                transition={{ duration: 0.3 }}
            >
                {theme === 'dark' ? (
                    <Moon size={18} className="text-yellow-400" />
                ) : (
                    <Sun size={18} className="text-yellow-500" />
                )}
            </motion.div>
        </motion.button>
    );
}
