'use client';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, List, PlusCircle, Settings, Box, LifeBuoy, DollarSign, LogOut, Users, Wand2, Code } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import api from '../lib/api'; // Import API client

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'New Order', href: '/dashboard/new-order', icon: PlusCircle },
    { name: 'Orders', href: '/dashboard/orders', icon: List },
    { name: 'Services', href: '/dashboard/services', icon: Box },
    { name: 'Add Funds', href: '/dashboard/add-funds', icon: DollarSign },
    { name: 'Affiliates', href: '/dashboard/affiliates', icon: Users },
    { name: 'AI Tools', href: '/dashboard/tools/virality', icon: Wand2 },
    { name: 'API', href: '/dashboard/api', icon: Code },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    { name: 'Support', href: '/dashboard/support', icon: LifeBuoy },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isAdmin, setIsAdmin] = useState(false);
    const isActive = (path: string) => pathname === path;

    useEffect(() => {
        // 1. Initial check from LocalStorage for instant UI
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const parsed = JSON.parse(user);
                if (parsed.role === 'admin') setIsAdmin(true);
            } catch (e) { }
        }

        // 2. Verify with Backend (Source of Truth)
        const verifyRole = async () => {
            try {
                const res = await api.get('/auth/profile');
                if (res.data.role === 'admin') {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
                // Update storage to stay in sync
                localStorage.setItem('user', JSON.stringify(res.data));
            } catch (error) {
                // If token invalid, maybe logout? Or just ignore for sidebar
                console.error("Role verification failed", error);
            }
        };
        verifyRole();
    }, []);

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-20 md:w-64 bg-black/90 backdrop-blur-xl border-r border-white/10 flex flex-col z-50">
            {/* Logo area */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ruby-500 to-purple-600 animate-pulse-slow"></div>
                <span className="hidden md:block font-bold text-xl tracking-tight">Balkan<span className="text-ruby-500">SMM</span></span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 py-4 overflow-y-auto">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={clsx(
                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                            isActive(item.href)
                                ? "bg-white/10 text-white shadow-lg shadow-white/5"
                                : "text-gray-400 hover:bg-white/5 hover:text-white"
                        )}
                    >
                        <item.icon size={20} className={clsx("transition-transform group-hover:scale-110", isActive(item.href) && "text-ruby-400")} />
                        <span className="hidden md:block font-medium text-sm">{item.name}</span>
                        {isActive(item.href) && (
                            <motion.div layoutId="activeTab" className="absolute left-0 w-1 h-8 bg-ruby-500 rounded-r-full" />
                        )}
                    </Link>
                ))}

                {isAdmin && (
                    <>
                        <div className="h-px bg-white/10 my-4 mx-2" />
                        <Link
                            href="/dashboard/admin"
                            className={clsx(
                                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group',
                                pathname.startsWith('/dashboard/admin')
                                    ? 'bg-ruby-600/20 text-ruby-400 border border-ruby-500/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                            )}
                        >
                            <Settings className={clsx("w-5 h-5", pathname.startsWith('/dashboard/admin') ? "text-ruby-400" : "text-gray-500 group-hover:text-white")} />
                            Admin Panel
                        </Link>
                    </>
                )}
            </nav>

            <div className="p-4 border-t border-white/10">
                <button
                    onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-gray-400 w-full transition-colors font-medium text-sm hover:text-white hover:bg-white/5 rounded-lg"
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
