'use client';
import { useState, useEffect } from 'react';
import { TrendingUp, Users, ShoppingBag, DollarSign, Database, MessageSquare, Megaphone } from 'lucide-react';
import api from '../../../lib/api';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const res = await api.get('/admin/stats');
            setStats(res.data);
            setIsLoading(false);
        } catch (e) {
            console.error('Not admin or failed');
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="p-10 text-center">Loading Admin Stats...</div>;
    if (!stats) return <div className="p-10 text-center text-red-500">Access Denied. You are not an admin.</div>;

    const cards = [
        { label: 'Total Revenue', value: `$${stats.revenue.toFixed(2)}`, icon: DollarSign, color: 'text-green-400' },
        { label: 'Net Profit', value: `$${stats.profit.toFixed(2)}`, icon: TrendingUp, color: 'text-ruby-400' },
        { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-400' },
        { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-purple-400' },
    ];

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <div key={i} className="glass-card p-6 rounded-2xl border border-white/10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">{card.label}</p>
                                <h3 className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</h3>
                            </div>
                            <div className="p-3 rounded-xl bg-white/5 text-white">
                                <card.icon size={24} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <a href="/dashboard/admin/users" className="glass-card p-6 rounded-2xl border border-white/10 hover:border-ruby-500/50 transition-all group flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-lg group-hover:text-ruby-400 transition-colors">Manage Users</h3>
                        <p className="text-sm text-gray-500">View balances, roles, and details.</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl group-hover:bg-ruby-500/20 transition-colors">
                        <Users size={24} className="text-gray-400 group-hover:text-ruby-400" />
                    </div>
                </a>

                <a href="/dashboard/admin/services" className="glass-card p-6 rounded-2xl border border-white/10 hover:border-blue-500/50 transition-all group flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-lg group-hover:text-blue-400 transition-colors">Services & Sync</h3>
                        <p className="text-sm text-gray-500">Import services and set prices.</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                        <Database size={24} className="text-gray-400 group-hover:text-blue-400" />
                    </div>
                </a>

                <a href="/dashboard/admin/support" className="glass-card p-6 rounded-2xl border border-white/10 hover:border-green-500/50 transition-all group flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-lg group-hover:text-green-400 transition-colors">Support Desk</h3>
                        <p className="text-sm text-gray-500">Reply to user tickets.</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl group-hover:bg-green-500/20 transition-colors">
                        <MessageSquare size={24} className="text-gray-400 group-hover:text-green-400" />
                    </div>
                </a>

                <a href="/dashboard/admin/announcements" className="glass-card p-6 rounded-2xl border border-white/10 hover:border-yellow-500/50 transition-all group flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-lg group-hover:text-yellow-400 transition-colors">Broadcasts</h3>
                        <p className="text-sm text-gray-500">Global announcements.</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl group-hover:bg-yellow-500/20 transition-colors">
                        <Megaphone size={24} className="text-gray-400 group-hover:text-yellow-400" />
                    </div>
                </a>
            </div>

            {/* Recent Orders Preview */}
            <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <h3 className="font-bold text-lg">Recent Global Orders</h3>
                </div>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 text-xs text-gray-400 uppercase">
                            <th className="p-4">ID</th>
                            <th className="p-4">User</th>
                            <th className="p-4">Service</th>
                            <th className="p-4">Cost</th>
                            <th className="p-4">Charge</th>
                            <th className="p-4">Profit</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {stats.recentOrders.map((order: any) => (
                            <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4">#{order.id}</td>
                                <td className="p-4 opacity-70">{order.user.email}</td>
                                <td className="p-4 opacity-70 truncate max-w-[200px]">{order.service.name}</td>
                                <td className="p-4 text-red-300 font-mono">${order.cost?.toFixed(4) || '0.000'}</td>
                                <td className="p-4 text-green-300 font-mono">${order.charge.toFixed(4)}</td>
                                <td className="p-4 text-ruby-400 font-bold font-mono">
                                    ${(order.charge - (order.cost || 0)).toFixed(4)}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${order.status === 'Completed' ? 'bg-green-500/10 text-green-500' :
                                        order.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-gray-500/10 text-gray-500'
                                        }`}>
                                        {order.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
