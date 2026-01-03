'use client';
import { toast } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import DashboardCard from '../../components/DashboardCard';
import AnalyticsGraph from '../../components/AnalyticsGraph';
import InstallAppButton from '../../components/InstallAppButton';
import { CreditCard, ShoppingBag, TrendingUp, Activity, Bell } from 'lucide-react';
import api from '../../lib/api';

export default function DashboardPage() {
    const [stats, setStats] = useState({
        balance: 0,
        orders: 0,
        spent: 0
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/auth/profile');
                setStats({
                    balance: res.data.balance,
                    orders: 5,
                    spent: 0
                });
            } catch (error) {
                console.error("Failed to fetch profile", error);
                toast.error("Failed to load profile data");
            }
        };
        fetchProfile();
    }, []);

    // VIP Logic
    const nextTier = stats.spent < 100 ? 100 : stats.spent < 500 ? 500 : 10000;
    const currentTier = stats.spent < 100 ? 'Bronze' : stats.spent < 500 ? 'Silver' : 'Gold';
    const progress = Math.min((stats.spent / nextTier) * 100, 100);
    const tierColor = currentTier === 'Gold' ? 'text-yellow-400' : currentTier === 'Silver' ? 'text-gray-300' : 'text-orange-400';

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <div className="flex items-center gap-3">
                        <p className="text-gray-400">Welcome back to BalkanSMM</p>
                        <InstallAppButton />
                    </div>
                </div>
                <div className="text-right">
                    <div className={`text-sm font-bold uppercase tracking-widest ${tierColor}`}>
                        {currentTier} Member
                    </div>
                    {(currentTier !== 'Gold') && (
                        <div className="text-xs text-gray-500 mt-1">
                            Spend ${(nextTier - stats.spent).toFixed(2)} more for {currentTier === 'Bronze' ? 'Silver' : 'Gold'}
                        </div>
                    )}
                </div>
            </header>

            {/* VIP Progress Bar */}
            <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                    className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out 
                        ${currentTier === 'Gold' ? 'bg-gradient-to-r from-yellow-600 to-yellow-300' :
                            currentTier === 'Silver' ? 'bg-gradient-to-r from-gray-600 to-white' :
                                'bg-gradient-to-r from-orange-800 to-orange-500'}`}
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DashboardCard title="Current Balance" value={`$${(stats.balance || 0).toFixed(2)}`} color="ruby" />
                <DashboardCard title="Total Orders" value={(stats.orders || 0).toString()} color="blue" />
                <DashboardCard title="Total Spent" value={`$${(stats.spent || 0).toFixed(2)}`} color="emerald" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <AnalyticsGraph />
                </div>
                <div className="space-y-6">
                    <div className="glass-card p-6 rounded-3xl border border-white/10">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <Activity size={18} className="text-ruby-500" />
                            Live Activity
                        </h3>
                        <div className="space-y-4">
                            <div className="text-sm text-gray-500">System functional.</div>
                        </div>
                    </div>
                    <div className="glass-card p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-ruby-900/20 to-black">
                        <h3 className="font-bold mb-2 flex items-center gap-2">
                            <Bell size={18} className="text-yellow-400" />
                            New Service Added
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">
                            We've just added <strong>TikTok Views [Instant]</strong> to the list. Check it out now!
                        </p>
                        <button className="text-xs font-bold bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-colors">
                            View Service
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
