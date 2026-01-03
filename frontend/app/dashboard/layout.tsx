'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import LiveActivityTicker from '@/components/LiveActivityTicker';
import CountdownBanner from '@/components/CountdownBanner';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import { NotificationProvider } from '@/context/NotificationContext';
import NotificationBell from '@/components/NotificationBell'; // We'll add this to header

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
        } else {
            const userData = localStorage.getItem('user');
            setUser(userData ? JSON.parse(userData) : {});
        }
    }, [router]);

    if (!user) return null;

    return (
        <NotificationProvider>
            <div className="flex min-h-screen bg-black text-white selection:bg-ruby-500/30 font-sans">
                <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-ruby-900/10 blur-[150px]"></div>
                    <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-blue-900/10 blur-[150px]"></div>
                </div>

                <div className="z-50">
                    <Sidebar />
                </div>

                <main className="flex-1 ml-20 md:ml-64 relative flex flex-col">
                    <CountdownBanner />
                    <AnnouncementBanner />

                    {/* Header with Notification Bell */}
                    <div className="absolute top-6 right-8 z-50">
                        <NotificationBell />
                    </div>

                    <div className="p-8 max-w-7xl mx-auto w-full relative z-10 pb-20">
                        {children}
                    </div>
                    <LiveActivityTicker />
                </main>
            </div>
        </NotificationProvider>
    );
}
