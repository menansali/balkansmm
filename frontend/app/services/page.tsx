'use client';
import { useState, useEffect } from 'react';
import api from '../../lib/api';
import Link from 'next/link';

export default function PublicServicesPage() {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await api.get('/services');
                setServices(res.data);
            } catch (error) {
                console.error("Failed to fetch services", error);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-ruby-500/30">
            {/* Navbar (Simplified) */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold tracking-tight">
                        Balkan<span className="text-ruby-500">SMM</span>
                    </Link>
                    <div className="flex items-center gap-6">
                        <Link href="/login" className="text-sm font-medium hover:text-white/80 transition-colors">Login</Link>
                        <Link href="/register" className="px-5 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:bg-gray-200 transition-colors">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
                        Our <span className="text-ruby-500 shimmer-text">Services</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Premium growth solutions for every platform. Instant delivery, guaranteed results.
                    </p>
                </div>

                {loading ? (
                    <div className="text-center text-gray-500 py-20">Loading services...</div>
                ) : (
                    <div className="glass-card rounded-3xl overflow-hidden border border-white/10">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 border-b border-white/10">
                                    <tr>
                                        <th className="p-6 font-bold text-gray-400 uppercase text-xs tracking-wider">ID</th>
                                        <th className="p-6 font-bold text-gray-400 uppercase text-xs tracking-wider">Service</th>
                                        <th className="p-6 font-bold text-gray-400 uppercase text-xs tracking-wider">Category</th>
                                        <th className="p-6 font-bold text-gray-400 uppercase text-xs tracking-wider">Rate (1k)</th>
                                        <th className="p-6 font-bold text-gray-400 uppercase text-xs tracking-wider">Min / Max</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {services.map((service) => (
                                        <tr key={service.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-6 text-gray-500 font-mono text-sm">{service.id}</td>
                                            <td className="p-6 font-medium text-white group-hover:text-ruby-400 transition-colors">
                                                {service.name}
                                            </td>
                                            <td className="p-6">
                                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 border border-white/5 text-gray-300">
                                                    {service.category}
                                                </span>
                                            </td>
                                            <td className="p-6 font-bold text-lg text-white">
                                                ${service.rate.toFixed(4)}
                                            </td>
                                            <td className="p-6 text-sm text-gray-500">
                                                {service.min} - {service.max.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
