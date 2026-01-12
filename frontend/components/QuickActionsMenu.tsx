'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ShoppingCart, DollarSign, LifeBuoy, Zap, X, BarChart3, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

const actions = [
    { icon: ShoppingCart, label: 'New Order', href: '/dashboard/new-order', color: 'bg-ruby-500' },
    { icon: DollarSign, label: 'Add Funds', href: '/dashboard/add-funds', color: 'bg-green-500' },
    { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics', color: 'bg-blue-500' },
    { icon: Calendar, label: 'Scheduler', href: '/dashboard/scheduler', color: 'bg-purple-500' },
    { icon: LifeBuoy, label: 'Support', href: '/dashboard/support', color: 'bg-orange-500' },
];

export default function QuickActionsMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const handleAction = (href: string) => {
        setIsOpen(false);
        router.push(href);
    };

    return (
        <>
            {/* Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />
                )}
            </AnimatePresence>

            {/* FAB Container */}
            <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
                {/* Action Items */}
                <AnimatePresence>
                    {isOpen && (
                        <>
                            {actions.map((action, index) => (
                                <motion.button
                                    key={action.label}
                                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 20, scale: 0.8 }}
                                    transition={{ delay: (actions.length - 1 - index) * 0.05 }}
                                    onClick={() => handleAction(action.href)}
                                    className="flex items-center gap-3 group"
                                >
                                    <span className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-lg text-sm font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {action.label}
                                    </span>
                                    <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center shadow-lg hover:scale-110 transition-transform`}>
                                        <action.icon size={20} className="text-white" />
                                    </div>
                                </motion.button>
                            ))}
                        </>
                    )}
                </AnimatePresence>

                {/* Main FAB Button */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${isOpen
                            ? 'bg-white/10 backdrop-blur-md border border-white/20'
                            : 'bg-gradient-to-br from-ruby-500 to-purple-600 shadow-ruby-500/30'
                        }`}
                >
                    <motion.div
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        {isOpen ? <X size={24} className="text-white" /> : <Zap size={24} className="text-white" />}
                    </motion.div>
                </motion.button>

                {/* Keyboard hint */}
                {!isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute -top-2 -left-2 text-[10px] text-gray-500 bg-black/80 px-1.5 py-0.5 rounded font-mono"
                    >
                        ⌘K
                    </motion.div>
                )}
            </div>
        </>
    );
}
