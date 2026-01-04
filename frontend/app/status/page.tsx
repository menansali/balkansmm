'use client';
import { useEffect, useState } from 'react';
import api from '../../lib/api';
import Navbar from '@/components/LandingNavbar';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Search } from 'lucide-react';

export default function StatusPage() {
    const [services, setServices] = useState<any[]>([]);
    const [filter, setFilter] = useState('');
    const [category, setCategory] = useState('All');

    useEffect(() => {
        api.get('/services').then(res => setServices(res.data)).catch(console.error);
    }, []);

    const categories = ['All', ...Array.from(new Set(services.map(s => s.category)))];
    const filtered = services.filter(s =>
        (category === 'All' || s.category === category) &&
        s.name.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-ruby-500 selection:text-white">
            <Navbar />

            <div className="pt-32 pb-20 px-4 max-w-6xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
                        System Status
                    </h1>
                    <p className="text-gray-400 text-lg">Real-time performance metrics for all services.</p>
                </div>

                {/* Controls */}
                <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input
                            type="text"
                            placeholder="Search services..."
                            className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-ruby-500 focus:outline-none transition-colors"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                    <select
                        className="bg-black/50 border border-white/10 rounded-xl px-6 py-3 text-white focus:border-ruby-500 outline-none appearance-none cursor-pointer"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                {/* Table */}
                <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                                <th className="p-4">ID</th>
                                <th className="p-4">Service</th>
                                <th className="p-4">Category</th>
                                <th className="p-4 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.map(service => (
                                <motion.tr
                                    key={service.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-white/5 transition-colors group"
                                >
                                    <td className="p-4 font-mono text-gray-500 text-xs">#{service.id}</td>
                                    <td className="p-4 font-medium">{service.name}</td>
                                    <td className="p-4 text-sm text-gray-400">{service.category}</td>
                                    <td className="p-4 text-right">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-bold uppercase border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                                            <CheckCircle size={12} />
                                            Operational
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div className="p-12 text-center text-gray-500">No services found matching your criteria.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
