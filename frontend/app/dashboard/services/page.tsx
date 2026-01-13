'use client';
import { useEffect, useState } from 'react';
import { Search, Filter, ArrowRight, Zap, Instagram, Youtube, Video, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';

export default function ServicesPage() {
    const router = useRouter();
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await api.get('/services');
                setServices(res.data);
            } catch (e) {
                // Formatting mock data
                setServices([
                    { id: 1, name: 'Instagram Followers [Premium] [Real]', category: 'Instagram', rate: 1.50, min: 100, max: 10000 },
                    { id: 2, name: 'Instagram Likes [Instant] [HQ]', category: 'Instagram', rate: 0.50, min: 50, max: 50000 },
                    { id: 3, name: 'TikTok Views [Instant] [Viral]', category: 'TikTok', rate: 0.05, min: 1000, max: 1000000 },
                    { id: 4, name: 'TikTok Followers [Real]', category: 'TikTok', rate: 5.00, min: 100, max: 10000 },
                    { id: 5, name: 'YouTube Subscribers [Non-Drop]', category: 'YouTube', rate: 25.00, min: 50, max: 2000 },
                    { id: 6, name: 'Twitter Followers', category: 'Twitter', rate: 8.00, min: 100, max: 5000 },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    const categories = ['All', 'Instagram', 'TikTok', 'YouTube', 'Twitter'];

    const filteredServices = services.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) || service.id.toString().includes(searchTerm);
        const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const getCategoryIcon = (cat: string) => {
        switch (cat) {
            case 'Instagram': return <Instagram size={14} />;
            case 'YouTube': return <Youtube size={14} />;
            case 'TikTok': return <Video size={14} />;
            default: return <Hash size={14} />;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Zap className="text-yellow-400 fill-yellow-400" />
                        Services Catalog
                    </h1>
                    <p className="text-gray-400 mt-2">Explore our premium services and boost your social presence.</p>
                </div>

                {/* Search Bar */}
                <div className="relative group w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-ruby-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search services (ID or Name)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-ruby-500 transition-colors placeholder:text-gray-600"
                    />
                </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border ${selectedCategory === cat
                                ? 'bg-white text-black border-white scale-105'
                                : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:border-white/10'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Services List Used to be a basic table, now a polished data grid */}
            <div className="bg-black/20 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-gray-400 font-medium border-b border-white/5">
                            <tr>
                                <th className="px-6 py-4 w-20 text-center">ID</th>
                                <th className="px-6 py-4">Service Name</th>
                                <th className="px-6 py-4 w-40">Rate <span className="text-xs text-gray-600 font-normal">(/1000)</span></th>
                                <th className="px-6 py-4 w-40">Min / Max</th>
                                <th className="px-6 py-4 w-32 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence>
                                {filteredServices.length > 0 ? (
                                    filteredServices.map((service) => (
                                        <motion.tr
                                            key={service.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="group hover:bg-white/[0.03] transition-colors"
                                        >
                                            <td className="px-6 py-4 text-center font-mono text-gray-500 group-hover:text-ruby-400 transition-colors">
                                                {service.id}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-200 group-hover:text-white transition-colors">
                                                    {service.name}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border border-white/5 uppercase tracking-wider font-bold
                                                        ${service.category === 'Instagram' ? 'bg-pink-500/10 text-pink-400' :
                                                            service.category === 'TikTok' ? 'bg-cyan-500/10 text-cyan-400' :
                                                                service.category === 'YouTube' ? 'bg-red-500/10 text-red-400' :
                                                                    'bg-gray-500/10 text-gray-400'}
                                                    `}>
                                                        {getCategoryIcon(service.category)}
                                                        {service.category}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-gray-300">
                                                ${service.rate.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-xs">
                                                {service.min.toLocaleString()} - {service.max.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => router.push(`/dashboard/new-order?service=${service.id}`)}
                                                    className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:scale-105 transition-all flex items-center gap-1 ml-auto"
                                                >
                                                    Order <ArrowRight size={12} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            No services found matching "{searchTerm}"
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="text-center text-xs text-gray-600">
                Showing {filteredServices.length} services
            </div>
        </div>
    );
}
