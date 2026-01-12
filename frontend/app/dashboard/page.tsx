'use client';
import { toast } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import AnimatedStatsCard from '../../components/AnimatedStatsCard';
import AnalyticsGraph from '../../components/AnalyticsGraph';
import InstallAppButton from '../../components/InstallAppButton';
import { SkeletonDashboard } from '../../components/Skeleton';
import { TrendingUp, Activity, Bell, Wallet, Receipt } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../lib/api';

interface DashboardStats {
    balance: number;
    orders: number;
    spent: number;
    balanceTrend: number;
    ordersTrend: number;
    spentTrend: number;
    recentOrders: number[];
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats>({
        balance: 0,
        orders: 0,
        spent: 0,
        balanceTrend: 0,
        ordersTrend: 0,
        spentTrend: 0,
        recentOrders: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch profile data
                const profileRes = await api.get('/auth/profile');
                const profile = profileRes.data;

                // Fetch orders for trend calculation
                let orders: any[] = [];
                try {
                    const ordersRes = await api.get('/orders');
                    orders = ordersRes.data || [];
                } catch (e) {
                    // User might not have orders
                }

                // Calculate trends based on real data
                const now = new Date();
                const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

                const recentOrders = orders.filter(
                    (o: any) => new Date(o.createdAt) >= thirtyDaysAgo
                );
                const previousOrders = orders.filter(
                    (o: any) => new Date(o.createdAt) >= sixtyDaysAgo && new Date(o.createdAt) < thirtyDaysAgo
                );

                // Calculate spending trends
                const recentSpending = recentOrders.reduce((sum: number, o: any) => sum + (o.charge || 0), 0);
                const previousSpending = previousOrders.reduce((sum: number, o: any) => sum + (o.charge || 0), 0);

                const spentTrend = previousSpending > 0
                    ? ((recentSpending - previousSpending) / previousSpending) * 100
                    : recentSpending > 0 ? 100 : 0;

                const ordersTrend = previousOrders.length > 0
                    ? ((recentOrders.length - previousOrders.length) / previousOrders.length) * 100
                    : recentOrders.length > 0 ? 100 : 0;

                // Generate sparkline from order history
                const sparklineData: number[] = [];
                for (let i = 13; i >= 0; i--) {
                    const dayStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                    dayStart.setHours(0, 0, 0, 0);
                    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

                    const dayOrders = orders.filter((o: any) => {
                        const orderDate = new Date(o.createdAt);
                        return orderDate >= dayStart && orderDate < dayEnd;
                    });

                    sparklineData.push(dayOrders.length * 10 + Math.random() * 5);
                }

                setStats({
                    balance: profile.balance || 0,
                    orders: profile._count?.orders || orders.length || 0,
                    spent: profile.totalSpent || 0,
                    balanceTrend: 0, // Balance trend depends on deposits vs spending
                    ordersTrend: parseFloat(ordersTrend.toFixed(1)),
                    spentTrend: parseFloat(spentTrend.toFixed(1)),
                    recentOrders: sparklineData
                });
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
                toast.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    // VIP Logic
    const nextTier = stats.spent < 100 ? 100 : stats.spent < 500 ? 500 : 10000;
    const currentTier = stats.spent < 100 ? 'Bronze' : stats.spent < 500 ? 'Silver' : 'Gold';
    const progress = Math.min((stats.spent / nextTier) * 100, 100);
    const tierColor = currentTier === 'Gold' ? 'text-yellow-400' : currentTier === 'Silver' ? 'text-gray-300' : 'text-orange-400';
    const tierIcon = currentTier === 'Gold' ? '👑' : currentTier === 'Silver' ? '🥈' : '🥉';

    if (loading) {
        return <SkeletonDashboard />;
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-end"
            >
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <div className="flex items-center gap-3">
                        <p className="text-gray-400">Welcome back to BalkanSMM</p>
                        <InstallAppButton />
                    </div>
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-right"
                >
                    <div className={`text-sm font-bold uppercase tracking-widest ${tierColor} flex items-center gap-2 justify-end`}>
                        <span>{tierIcon}</span>
                        {currentTier} Member
                    </div>
                    {(currentTier !== 'Gold') && (
                        <div className="text-xs text-gray-500 mt-1">
                            Spend ${(nextTier - stats.spent).toFixed(2)} more for {currentTier === 'Bronze' ? 'Silver' : 'Gold'}
                        </div>
                    )}
                </motion.div>
            </motion.header>

            {/* VIP Progress Bar */}
            <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className={`absolute top-0 left-0 h-full transition-all
                        ${currentTier === 'Gold' ? 'bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-300' :
                            currentTier === 'Silver' ? 'bg-gradient-to-r from-gray-600 via-gray-400 to-white' :
                                'bg-gradient-to-r from-orange-800 via-orange-600 to-orange-400'}`}
                />
            </div>

            {/* Stats Cards with Real Trends */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AnimatedStatsCard
                    title="Current Balance"
                    value={stats.balance}
                    prefix="$"
                    color="ruby"
                    trend={stats.balanceTrend}
                    icon={<Wallet size={48} />}
                    sparklineData={stats.recentOrders}
                />
                <AnimatedStatsCard
                    title="Total Orders"
                    value={stats.orders}
                    color="blue"
                    trend={stats.ordersTrend}
                    icon={<Receipt size={48} />}
                    sparklineData={stats.recentOrders.map(v => v * 0.8)}
                />
                <AnimatedStatsCard
                    title="Total Spent"
                    value={stats.spent}
                    prefix="$"
                    color="emerald"
                    trend={stats.spentTrend}
                    icon={<TrendingUp size={48} />}
                    sparklineData={stats.recentOrders.map(v => v * 1.2)}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2"
                >
                    <AnalyticsGraph />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-6"
                >
                    {/* Live Activity Card */}
                    <div className="glass-card p-6 rounded-3xl border border-white/10 hover:border-white/20 transition-colors">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <Activity size={18} className="text-ruby-500" />
                            Live Activity
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-gray-400">All systems operational</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span className="text-gray-400">Orders processing normally</span>
                            </div>
                        </div>
                    </div>

                    {/* Feature Highlight Card */}
                    <div className="glass-card p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-ruby-900/20 to-black hover:border-ruby-500/30 transition-colors group">
                        <h3 className="font-bold mb-2 flex items-center gap-2">
                            <Bell size={18} className="text-yellow-400 group-hover:animate-bounce" />
                            New Features Added! 🎉
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Try our new <strong>Analytics Dashboard</strong>, <strong>AI Scheduler</strong>, and <strong>Reseller Panel</strong>!
                        </p>
                        <div className="flex gap-2">
                            <span className="text-[10px] font-bold bg-ruby-500/20 text-ruby-400 px-2 py-1 rounded">Analytics</span>
                            <span className="text-[10px] font-bold bg-purple-500/20 text-purple-400 px-2 py-1 rounded">Scheduler</span>
                            <span className="text-[10px] font-bold bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Reseller</span>
                        </div>
                    </div>

                    {/* Keyboard Shortcut Hint */}
                    <div className="text-center text-xs text-gray-600">
                        <kbd className="px-2 py-1 bg-white/5 rounded font-mono">⌘K</kbd>
                        <span className="ml-2">Quick navigation</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
