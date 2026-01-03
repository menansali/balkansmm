'use client';
import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import DashboardCard from '@/components/DashboardCard';
import { Copy, Users, DollarSign, Link as LinkIcon } from 'lucide-react';

export default function AffiliatePage() {
    const [stats, setStats] = useState({
        code: 'LOADING...',
        earnings: 0,
        referrals: 0,
        visitors: 0
    });

    useEffect(() => {
        // Mocking for now, real implementation would fetch from /auth/profile or new endpoint
        const fetchStats = async () => {
            try {
                const res = await api.get('/auth/profile');
                setStats({
                    code: res.data.referralCode || 'Generate One',
                    earnings: res.data.affiliateBalance || 0,
                    referrals: res.data.referralCount || 0, // Need to make sure backend sends this
                    visitors: Math.floor((res.data.referralCount || 0) * 5.2) // Simulated visitor count
                });
            } catch (e) {
                console.error(e);
            }
        };
        fetchStats();
    }, []);

    const copyLink = () => {
        navigator.clipboard.writeText(`https://balkansmm.com/register?ref=${stats.code}`);
        // Show toast
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold">Affiliate Program</h1>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Invite friends and earn <span className="text-white font-bold">10%</span> of their deposits forever.
                    Withdraw your earnings to PayPal, Crypto, or your SMM Balance.
                </p>
            </div>

            {/* Main Link Card */}
            <div className="glass-card p-8 rounded-3xl border border-ruby-500/20 bg-ruby-900/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-ruby-500/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 justify-between">
                    <div>
                        <div className="text-sm text-ruby-400 font-bold tracking-widest uppercase mb-2">Your Unique Referral Link</div>
                        <div className="font-mono text-xl md:text-2xl text-white bg-black/40 px-6 py-3 rounded-xl border border-white/10">
                            https://balkansmm.com/register?ref={stats.code}
                        </div>
                    </div>
                    <button onClick={copyLink} className="whitespace-nowrap flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform">
                        <Copy size={20} /> Copy Link
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DashboardCard title="Total Earnings" value={`$${stats.earnings.toFixed(2)}`} color="ruby" />
                <DashboardCard title="Active Referrals" value={stats.referrals.toString()} color="blue" />
                <DashboardCard title="Link Clicks" value={stats.visitors.toString()} color="purple" />
            </div>

            {/* How it works */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Step number="1" title="Share Link" desc="Post your link on WhatsApp, Forums, or YouTube." />
                <Step number="2" title="They Register" desc="Users create an account using your exclusive link." />
                <Step number="3" title="You Earn" desc="Get paid every time they make a deposit." />
            </div>
        </div>
    );
}

function Step({ number, title, desc }: { number: string, title: string, desc: string }) {
    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold mb-4">{number}</div>
            <h3 className="font-bold text-lg mb-2">{title}</h3>
            <p className="text-sm text-gray-400">{desc}</p>
        </div>
    );
}
