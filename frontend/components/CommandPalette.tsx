'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Search,
    Home,
    ShoppingCart,
    List,
    DollarSign,
    Settings,
    LifeBuoy,
    BarChart3,
    Calendar,
    Store,
    Users,
    Wand2,
    Code,
    Command,
    ArrowRight,
} from 'lucide-react';

interface CommandItem {
    id: string;
    title: string;
    description?: string;
    icon: React.ElementType;
    action: () => void;
    keywords?: string[];
    category: 'navigation' | 'action' | 'tool';
}

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const navigate = useCallback((path: string) => {
        router.push(path);
        setIsOpen(false);
    }, [router]);

    const commands: CommandItem[] = [
        // Navigation
        { id: 'dashboard', title: 'Dashboard', icon: Home, action: () => navigate('/dashboard'), category: 'navigation', keywords: ['home', 'main'] },
        { id: 'new-order', title: 'New Order', icon: ShoppingCart, action: () => navigate('/dashboard/new-order'), category: 'navigation', keywords: ['buy', 'purchase', 'service'] },
        { id: 'orders', title: 'My Orders', icon: List, action: () => navigate('/dashboard/orders'), category: 'navigation', keywords: ['history', 'list'] },
        { id: 'add-funds', title: 'Add Funds', icon: DollarSign, action: () => navigate('/dashboard/add-funds'), category: 'navigation', keywords: ['deposit', 'money', 'payment'] },
        { id: 'analytics', title: 'Analytics', icon: BarChart3, action: () => navigate('/dashboard/analytics'), category: 'navigation', keywords: ['stats', 'growth', 'tracking'] },
        { id: 'scheduler', title: 'Content Scheduler', icon: Calendar, action: () => navigate('/dashboard/scheduler'), category: 'navigation', keywords: ['schedule', 'post', 'content'] },
        { id: 'reseller', title: 'Reseller Panel', icon: Store, action: () => navigate('/dashboard/reseller'), category: 'navigation', keywords: ['whitelabel', 'store'] },
        { id: 'affiliates', title: 'Affiliates', icon: Users, action: () => navigate('/dashboard/affiliates'), category: 'navigation', keywords: ['referral', 'invite'] },
        { id: 'support', title: 'Support', icon: LifeBuoy, action: () => navigate('/dashboard/support'), category: 'navigation', keywords: ['help', 'ticket'] },
        { id: 'settings', title: 'Settings', icon: Settings, action: () => navigate('/dashboard/settings'), category: 'navigation', keywords: ['account', 'profile'] },

        // Tools
        { id: 'virality', title: 'Virality Predictor', icon: Wand2, action: () => navigate('/dashboard/tools/virality'), category: 'tool', keywords: ['ai', 'predict'] },
        { id: 'api', title: 'API Documentation', icon: Code, action: () => navigate('/dashboard/api'), category: 'tool', keywords: ['developer', 'integration'] },
    ];

    const filteredCommands = query
        ? commands.filter((cmd) => {
            const searchQuery = query.toLowerCase();
            return (
                cmd.title.toLowerCase().includes(searchQuery) ||
                cmd.keywords?.some((kw) => kw.toLowerCase().includes(searchQuery))
            );
        })
        : commands;

    const groupedCommands = {
        navigation: filteredCommands.filter((c) => c.category === 'navigation'),
        tool: filteredCommands.filter((c) => c.category === 'tool'),
        action: filteredCommands.filter((c) => c.category === 'action'),
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }

            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
            e.preventDefault();
            filteredCommands[selectedIndex].action();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-start justify-center pt-[15vh]"
                    onClick={() => setIsOpen(false)}
                >
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-xl bg-gray-900/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Search Input */}
                        <div className="flex items-center gap-3 p-4 border-b border-white/10">
                            <Search size={20} className="text-gray-500" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Search commands, pages, actions..."
                                className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
                            />
                            <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 bg-white/5 rounded text-xs text-gray-400 font-mono">
                                <Command size={12} />K
                            </kbd>
                        </div>

                        {/* Results */}
                        <div className="max-h-80 overflow-y-auto p-2">
                            {filteredCommands.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No results found for "{query}"
                                </div>
                            ) : (
                                <>
                                    {groupedCommands.navigation.length > 0 && (
                                        <div className="mb-2">
                                            <div className="text-xs text-gray-500 font-bold uppercase tracking-widest px-3 py-2">
                                                Navigation
                                            </div>
                                            {groupedCommands.navigation.map((cmd, i) => {
                                                const globalIndex = filteredCommands.indexOf(cmd);
                                                return (
                                                    <button
                                                        key={cmd.id}
                                                        onClick={() => cmd.action()}
                                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${selectedIndex === globalIndex
                                                                ? 'bg-ruby-500/20 text-white'
                                                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                                            }`}
                                                    >
                                                        <cmd.icon size={18} className={selectedIndex === globalIndex ? 'text-ruby-400' : ''} />
                                                        <span className="flex-1">{cmd.title}</span>
                                                        {selectedIndex === globalIndex && (
                                                            <ArrowRight size={14} className="text-ruby-400" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {groupedCommands.tool.length > 0 && (
                                        <div className="mb-2">
                                            <div className="text-xs text-gray-500 font-bold uppercase tracking-widest px-3 py-2">
                                                Tools
                                            </div>
                                            {groupedCommands.tool.map((cmd) => {
                                                const globalIndex = filteredCommands.indexOf(cmd);
                                                return (
                                                    <button
                                                        key={cmd.id}
                                                        onClick={() => cmd.action()}
                                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${selectedIndex === globalIndex
                                                                ? 'bg-purple-500/20 text-white'
                                                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                                            }`}
                                                    >
                                                        <cmd.icon size={18} className={selectedIndex === globalIndex ? 'text-purple-400' : ''} />
                                                        <span className="flex-1">{cmd.title}</span>
                                                        {selectedIndex === globalIndex && (
                                                            <ArrowRight size={14} className="text-purple-400" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 text-xs text-gray-500">
                            <div className="flex gap-4">
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 bg-white/5 rounded">↑↓</kbd>
                                    Navigate
                                </span>
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 bg-white/5 rounded">↵</kbd>
                                    Select
                                </span>
                            </div>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-white/5 rounded">Esc</kbd>
                                Close
                            </span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
