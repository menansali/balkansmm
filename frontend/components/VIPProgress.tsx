'use client';
import { motion } from 'framer-motion';
import { Crown, TrendingUp } from 'lucide-react';

interface VIPProps {
    totalSpent: number;
}

export default function VIPProgress({ totalSpent }: VIPProps) {
    // Tiers: Bronze ($0), Silver ($100), Gold ($500), Platinum ($1000)
    const tiers = [
        { name: 'Bronze', limit: 0, color: 'text-orange-400' },
        { name: 'Silver', limit: 100, color: 'text-gray-300' },
        { name: 'Gold', limit: 500, color: 'text-yellow-400' },
        { name: 'Platinum', limit: 1000, color: 'text-purple-400' },
    ];

    const currentTierIndex = tiers.slice().reverse().findIndex(t => totalSpent >= t.limit);
    const tierLevel = currentTierIndex === -1 ? 0 : tiers.length - 1 - currentTierIndex;
    const currentTier = tiers[tierLevel];
    const nextTier = tiers[tierLevel + 1];

    if (!nextTier) {
        // Max Level Reached
        return (
            <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Crown className="text-purple-400 fill-purple-400 animate-pulse" />
                    <div>
                        <h3 className="font-bold text-lg text-white">Platinum VIP</h3>
                        <p className="text-xs text-purple-200">Max level achieved! You get 10% off.</p>
                    </div>
                </div>
            </div>
        );
    }

    const progress = Math.min(100, Math.max(0, ((totalSpent - currentTier.limit) / (nextTier.limit - currentTier.limit)) * 100));
    const toGo = nextTier.limit - totalSpent;

    return (
        <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Crown size={60} />
            </div>

            <div className="flex justify-between items-end">
                <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">VIP Status</p>
                    <h3 className={`font-bold text-xl ${currentTier.color}`}>{currentTier.name} Member</h3>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500">Next: <span className={nextTier.color}>{nextTier.name}</span></p>
                    <p className="font-mono text-sm">${toGo.toFixed(2)} to go</p>
                </div>
            </div>

            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={`h-full rounded-full bg-gradient-to-r relative overflow-hidden ${currentTier.name === 'Gold' ? 'from-yellow-600 to-yellow-300' : 'from-ruby-600 to-ruby-400'
                        } after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:animate-shimmer-fast`}
                />
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400">
                <TrendingUp size={12} className="text-green-400" />
                <span>Spend more to unlock <span className="text-white font-bold">5% discount</span></span>
            </div>
        </div>
    );
}
