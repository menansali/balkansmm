'use client';
import { useState } from 'react';
import { Wand2, TrendingUp, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

export default function ViralityToolPage() {
    const [link, setLink] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const checkVirality = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        // Simulate API call & Analysis
        // In real app, you'd fetch likes/views/comments count
        setTimeout(() => {
            // Mock logic
            const score = Math.floor(Math.random() * 60) + 20; // 20-80
            setResult({
                score: score,
                status: score > 70 ? 'Viral' : score > 50 ? 'Rising' : 'Stagnant',
                recommendation: score > 70
                    ? 'Keep pushing! Add 500 Comments to spark debate.'
                    : score > 50
                        ? 'Good momentum. Needs 2,000 Likes to hit Explore Page.'
                        : 'Low engagement. Needs Kickstart Package (5k Views + 1k Likes).'
            });
            setLoading(false);
        }, 2000);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <header className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/30 border border-purple-500/30 text-purple-400 text-xs font-bold uppercase tracking-widest mb-4">
                    <Wand2 size={12} />
                    AI Powered
                </div>
                <h1 className="text-4xl font-bold mb-4">Virality Predictor</h1>
                <p className="text-gray-400">
                    Paste your post link. Our AI analyzes engagement ratios to predict viral potential.
                </p>
            </header>

            <form onSubmit={checkVirality} className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                    type="url"
                    placeholder="https://tiktok.com/@user/video/..."
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-full py-5 pl-14 pr-32 text-lg outline-none focus:border-purple-500 transition-colors shadow-xl"
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-purple-600 to-blue-600 px-8 rounded-full font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100"
                >
                    {loading ? 'Analyzing...' : 'Analyze'}
                </button>
            </form>

            {result && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-8 rounded-3xl border border-white/10 space-y-8"
                >
                    <div className="text-center">
                        <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Virality Score</div>
                        <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 font-mono">
                            {result.score}/100
                        </div>
                    </div>

                    <div className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                        <div className={`p-3 rounded-full h-fit ${result.score > 50 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {result.score > 50 ? <TrendingUp /> : <AlertTriangle />}
                        </div>
                        <div>
                            <h4 className="font-bold text-lg mb-1">{result.status}</h4>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                {result.recommendation}
                            </p>
                        </div>
                    </div>

                    <button className="w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                        <CheckCircle size={18} />
                        Apply Recommended Boost
                    </button>
                </motion.div>
            )}
        </div>
    );
}
