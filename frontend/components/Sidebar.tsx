'use client';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, List, PlusCircle, Settings, Box, LifeBuoy, DollarSign, LogOut, Users, Wand2, Code, BarChart3, Calendar, Store } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import api from '../lib/api';
import { useTheme } from '../context/ThemeContext';

interface UserProfile {
    name?: string;
    balance?: number;
    role?: string;
}

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'New Order', href: '/dashboard/new-order', icon: PlusCircle },
    { name: 'Orders', href: '/dashboard/orders', icon: List },
    { name: 'Services', href: '/dashboard/services', icon: Box },
    { name: 'Add Funds', href: '/dashboard/add-funds', icon: DollarSign },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Scheduler', href: '/dashboard/scheduler', icon: Calendar },
    { name: 'Reseller', href: '/dashboard/reseller', icon: Store },
    { name: 'Affiliates', href: '/dashboard/affiliates', icon: Users },
    { name: 'AI Tools', href: '/dashboard/tools/virality', icon: Wand2 },
    { name: 'API', href: '/dashboard/api', icon: Code },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    { name: 'Support', href: '/dashboard/support', icon: LifeBuoy },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isAdmin, setIsAdmin] = useState(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const { theme } = useTheme();
    const isActive = (path: string) => pathname === path;

    const isDark = theme === 'dark';

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const parsed = JSON.parse(user) as UserProfile;
                queueMicrotask(() => {
                    setUserProfile(parsed);
                    if (parsed.role === 'admin') setIsAdmin(true);
                });
            } catch { }
        }

        const verifyRole = async () => {
            try {
                const res = await api.get('/auth/profile');
                setUserProfile(res.data);
                if (res.data.role === 'admin') {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
                localStorage.setItem('user', JSON.stringify(res.data));
            } catch (error: unknown) {
                const err = error as { response?: { status?: number } };
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }
            }
        };
        verifyRole();
    }, []);

    return (
        <aside className={clsx(
            "fixed left-0 top-0 bottom-0 w-20 md:w-64 backdrop-blur-xl border-r flex flex-col z-50 transition-colors duration-300",
            isDark
                ? "bg-black/90 border-white/10"
                : "bg-white/90 border-slate-200"
        )}>
            {/* Logo area */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-ruby-500 to-purple-600 animate-pulse-slow"></div>
                <span className={clsx(
                    "hidden md:block font-bold text-xl tracking-tight",
                    isDark ? "text-white" : "text-slate-900"
                )}>
                    Balkan<span className="text-ruby-500">SMM</span>
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 py-4 overflow-y-auto">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={clsx(
                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative",
                            isActive(item.href)
                                ? isDark
                                    ? "bg-white/10 text-white shadow-lg shadow-white/5"
                                    : "bg-ruby-500/10 text-ruby-600 shadow-lg shadow-ruby-500/5"
                                : isDark
                                    ? "text-gray-400 hover:bg-white/5 hover:text-white"
                                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        )}
                    >
                        <item.icon size={20} className={clsx(
                            "transition-transform group-hover:scale-110",
                            isActive(item.href) && "text-ruby-400"
                        )} />
                        <span className="hidden md:block font-medium text-sm">{item.name}</span>
                        {isActive(item.href) && (
                            <motion.div layoutId="activeTab" className="absolute left-0 w-1 h-8 bg-ruby-500 rounded-r-full" />
                        )}
                    </Link>
                ))}

                {isAdmin && (
                    <>
                        <div className={clsx(
                            "h-px my-4 mx-2",
                            isDark ? "bg-white/10" : "bg-slate-200"
                        )} />
                        <Link
                            href="/dashboard/admin"
                            className={clsx(
                                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group',
                                pathname.startsWith('/dashboard/admin')
                                    ? 'bg-ruby-600/20 text-ruby-400 border border-ruby-500/20'
                                    : isDark
                                        ? 'text-gray-400 hover:text-white hover:bg-white/5'
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                            )}
                        >
                            <Settings className={clsx(
                                "w-5 h-5",
                                pathname.startsWith('/dashboard/admin')
                                    ? "text-ruby-400"
                                    : isDark ? "text-gray-500 group-hover:text-white" : "text-slate-400 group-hover:text-slate-900"
                            )} />
                            Admin Panel
                        </Link>
                    </>
                )}
            </nav>

            {/* User Profile & Logout */}
            <div className={clsx(
                "p-4 border-t space-y-3",
                isDark ? "border-white/10" : "border-slate-200"
            )}>
                <div className={clsx(
                    "rounded-xl p-3 flex items-center gap-3 border",
                    isDark
                        ? "bg-white/5 border-white/5"
                        : "bg-slate-100 border-slate-200"
                )}>
                    <div className="w-8 h-8 rounded-full bg-linear-to-tr from-ruby-500 to-orange-500 flex items-center justify-center text-white font-bold text-xs">
                        {userProfile?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="overflow-hidden">
                        <div className={clsx(
                            "text-sm font-medium truncate",
                            isDark ? "text-white" : "text-slate-900"
                        )}>{userProfile?.name || 'User'}</div>
                        <div className="text-xs text-ruby-400 font-bold">${userProfile?.balance?.toFixed(2) || '0.00'}</div>
                    </div>
                </div>

                <button
                    onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                    }}
                    className={clsx(
                        "flex items-center gap-3 px-4 py-2 w-full transition-colors font-medium text-xs rounded-lg justify-center",
                        isDark
                            ? "text-gray-400 hover:text-white hover:bg-white/5"
                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                    )}
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
