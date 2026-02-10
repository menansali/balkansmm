'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import LiveActivityTicker from '@/components/LiveActivityTicker';
import CountdownBanner from '@/components/CountdownBanner';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import { NotificationProvider } from '@/context/NotificationContext';
import NotificationBell from '@/components/NotificationBell';
import ThemeToggle from '@/components/ThemeToggle';
import QuickActionsMenu from '@/components/QuickActionsMenu';
import CommandPalette from '@/components/CommandPalette';
import { SkeletonDashboard } from '@/components/Skeleton';

type UserData = { name?: string; id?: number; email?: string; role?: string; balance?: number };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
        } else {
            const userData = localStorage.getItem('user');
            queueMicrotask(() => setUser(userData ? JSON.parse(userData) : {}));
        }

        // Initialize theme
        const stored = localStorage.getItem('theme') as 'dark' | 'light';
        if (stored) {
            setTheme(stored);
            document.documentElement.classList.add(stored);
            document.documentElement.classList.remove(stored === 'dark' ? 'light' : 'dark');
        }

        // Watch for theme changes
        const observer = new MutationObserver(() => {
            const isLight = document.documentElement.classList.contains('light');
            setTheme(isLight ? 'light' : 'dark');
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        setLoading(false);
        return () => observer.disconnect();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white p-8">
                <SkeletonDashboard />
            </div>
        );
    }

    if (!user) return null;

    const isDark = theme === 'dark';

    return (
        <NotificationProvider>
            <div className={`flex min-h-screen selection:bg-ruby-500/30 font-sans transition-colors duration-300 ${isDark
                    ? 'bg-black text-white'
                    : 'bg-slate-50 text-slate-900'
                }`}>
                {/* Aurora Background */}
                <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                    {isDark ? (
                        <>
                            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-ruby-900/10 blur-[150px]"></div>
                            <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-blue-900/10 blur-[150px]"></div>
                        </>
                    ) : (
                        <>
                            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-purple-200/40 blur-[150px]"></div>
                            <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-pink-200/40 blur-[150px]"></div>
                        </>
                    )}
                </div>

                {/* Sidebar */}
                <div className="z-50">
                    <Sidebar />
                </div>

                {/* Main Content */}
                <main className="flex-1 ml-20 md:ml-64 relative flex flex-col">
                    <CountdownBanner />
                    <AnnouncementBanner />

                    {/* Header with Theme Toggle & Notification Bell */}
                    <div className="absolute top-6 right-8 z-50 flex items-center gap-3">
                        <ThemeToggle />
                        <NotificationBell />
                    </div>

                    <div className="p-8 max-w-7xl mx-auto w-full relative z-10 pb-20">
                        {children}
                    </div>
                    <LiveActivityTicker />
                </main>

                {/* Global UI Components */}
                <QuickActionsMenu />
                <CommandPalette />
            </div>
        </NotificationProvider>
    );
}
