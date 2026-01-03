'use client';
import { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Check, Zap, Search, Instagram, Facebook, Youtube, Twitter, Music2, Send, Mic, Globe, Layers, Filter, Heart, Users, Eye, MessageCircle, Share2, Bookmark, Radio, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

// Platform Definitions
const PLATFORMS = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-500', bg: 'from-pink-500/20 to-purple-600/20', border: 'border-pink-500/30' },
    { id: 'tiktok', name: 'TikTok', icon: Music2, color: 'text-cyan-400', bg: 'from-black to-gray-800', border: 'border-cyan-500/30' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-500', bg: 'from-red-600/20 to-red-900/20', border: 'border-red-500/30' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-500', bg: 'from-blue-600/20 to-blue-800/20', border: 'border-blue-500/30' },
    { id: 'twitter', name: 'X / Twitter', icon: Twitter, color: 'text-gray-400', bg: 'from-gray-800 to-black', border: 'border-white/10' },
    { id: 'telegram', name: 'Telegram', icon: Send, color: 'text-sky-500', bg: 'from-sky-500/20 to-blue-500/20', border: 'border-sky-500/30' },
    { id: 'spotify', name: 'Spotify', icon: Mic, color: 'text-green-500', bg: 'from-green-500/20 to-emerald-900/20', border: 'border-green-500/30' },
    { id: 'website', name: 'Website Traffic', icon: Globe, color: 'text-purple-400', bg: 'from-purple-500/20 to-indigo-900/20', border: 'border-purple-500/30' },
    { id: 'other', name: 'Other Services', icon: Layers, color: 'text-gray-400', bg: 'from-gray-800 to-gray-900', border: 'border-white/10' },
];

const SERVICE_TYPES = [
    { name: 'Followers', icon: Users },
    { name: 'Likes', icon: Heart },
    { name: 'Views', icon: Eye },
    { name: 'Comments', icon: MessageCircle },
    { name: 'Shares', icon: Share2 },
    { name: 'Saves', icon: Bookmark },
    { name: 'Live', icon: Radio },
    { name: 'Watch Time', icon: PlayCircle },
];

export default function NewOrderPage() {
    const [allServices, setAllServices] = useState<any[]>([]);
    const [selectedPlatform, setSelectedPlatform] = useState('instagram');
    const [selectedType, setSelectedType] = useState('All'); // NEW: Sub-category filter
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedService, setSelectedService] = useState<any>(null);
    const [link, setLink] = useState('');
    const [quantity, setQuantity] = useState<number>(0);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [previewData, setPreviewData] = useState<any>(null);
    const [dripFeed, setDripFeed] = useState(false);
    const [runs, setRuns] = useState<number>(0);
    const [interval, setInterval] = useState<number>(0);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await api.get('/services');
                setAllServices(res.data);
            } catch (error) {
                toast.error("Failed to load services");
            }
        };
        fetchServices();
    }, []);

    const getServicePlatform = (category: string) => {
        const cat = category.toLowerCase();
        if (cat.includes('instagram')) return 'instagram';
        if (cat.includes('tiktok')) return 'tiktok';
        if (cat.includes('youtube')) return 'youtube';
        if (cat.includes('facebook')) return 'facebook';
        if (cat.includes('twitter') || cat.includes(' x ')) return 'twitter';
        if (cat.includes('telegram')) return 'telegram';
        if (cat.includes('spotify')) return 'spotify';
        if (cat.includes('traffic') || cat.includes('website')) return 'website';
        return 'other';
    };

    const getServiceType = (category: string) => {
        const lower = category.toLowerCase();
        if (lower.includes('follower') || lower.includes('sub')) return 'Followers';
        if (lower.includes('like')) return 'Likes';
        if (lower.includes('view')) return 'Views';
        if (lower.includes('comment')) return 'Comments';
        if (lower.includes('share') || lower.includes('repost')) return 'Shares';
        if (lower.includes('save') || lower.includes('fav')) return 'Saves';
        if (lower.includes('live') || lower.includes('stream')) return 'Live';
        if (lower.includes('watch') || lower.includes('time')) return 'Watch Time';
        return 'Other';
    };

    // 1. Filter by Platform
    const platformServices = useMemo(() => {
        return allServices.filter(s => getServicePlatform(s.category) === selectedPlatform);
    }, [allServices, selectedPlatform]);

    // 2. Extract Available Types for this Platform
    const availableTypes = useMemo(() => {
        const types = new Set<string>();
        platformServices.forEach(s => {
            types.add(getServiceType(s.category));
        });
        // Sort based on predefined order
        return ['All', ...SERVICE_TYPES.map(t => t.name).filter(t => types.has(t)), 'Other'].filter((t, i, arr) => arr.indexOf(t) === i && (t === 'All' || types.has(t) || (t === 'Other' && types.has('Other'))));
    }, [platformServices]);

    // 3. Filter by Type and Search
    const finalFilteredServices = useMemo(() => {
        return platformServices.filter(s => {
            const matchesType = selectedType === 'All' || getServiceType(s.category) === selectedType;
            const matchesSearch = searchQuery === '' ||
                s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.id.toString().includes(searchQuery);
            return matchesType && matchesSearch;
        });
    }, [platformServices, selectedType, searchQuery]);

    const groupedServices = useMemo(() => {
        const groups: Record<string, any[]> = {};
        finalFilteredServices.forEach(s => {
            if (!groups[s.category]) groups[s.category] = [];
            groups[s.category].push(s);
        });
        return groups;
    }, [finalFilteredServices]);

    const handleLinkPaste = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setLink(val);
        if (val.length > 10) {
            try {
                const res = await api.post('/services/preview', { url: val });
                setPreviewData(res.data);
            } catch (error) { }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedService) return;
        setStatus('loading');
        try {
            await api.post('/orders', {
                serviceId: selectedService.id,
                link,
                quantity,
                dripFeed,
                runs: dripFeed ? Number(runs) : null,
                interval: dripFeed ? Number(interval) : null
            });
            setStatus('success');
            toast.success("Order placed successfully!");
            setTimeout(() => setStatus('idle'), 3000);
            setLink('');
            setQuantity(0);
            setSelectedService(null);
            setPreviewData(null);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to place order");
            setStatus('error');
        }
    };

    const totalCharge = selectedService ? (selectedService.rate * quantity) / 1000 : 0;
    const activePlatform = PLATFORMS.find(p => p.id === selectedPlatform);

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            <header>
                <h1 className="text-3xl font-bold">New Order</h1>
                <p className="text-gray-400">Select a category and maximize your growth.</p>
            </header>

            {/* Platform Selector */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {PLATFORMS.map(p => (
                    <button
                        key={p.id}
                        onClick={() => {
                            setSelectedPlatform(p.id);
                            setSelectedType('All');
                            setSelectedService(null);
                            setSearchQuery('');
                        }}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition-all whitespace-nowrap min-w-[120px] select-none
                            ${selectedPlatform === p.id
                                ? `bg-gradient-to-br ${p.bg} ${p.border} ring-1 ring-white/20`
                                : 'bg-black/40 border-white/5 hover:bg-white/5 text-gray-400 hover:text-white'}`}
                    >
                        <p.icon size={18} className={selectedPlatform === p.id ? p.color : 'text-gray-500'} />
                        <span className={`font-bold text-sm ${selectedPlatform === p.id ? 'text-white' : ''}`}>{p.name}</span>
                    </button>
                ))}
            </div>

            {/* Sub-Category Chips (NEW) */}
            <div className="flex flex-wrap gap-2">
                {availableTypes.map(type => {
                    const TypeIcon = SERVICE_TYPES.find(t => t.name === type)?.icon || Layers;
                    const isActive = selectedType === type;
                    return (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all select-none
                                ${isActive
                                    ? 'bg-white text-black shadow-lg shadow-white/20 scale-105'
                                    : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5'}`}
                        >
                            {type !== 'All' && <TypeIcon size={14} />}
                            {type}
                        </button>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT: Service Selection */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Search Bar */}
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-ruby-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder={`Search ${activePlatform?.name} services...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-ruby-500 transition-all font-medium"
                        />
                    </div>

                    {/* Services List */}
                    <div className="space-y-6">
                        {Object.keys(groupedServices).length === 0 ? (
                            <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-2xl">
                                <Filter size={32} className="mx-auto mb-2 opacity-50" />
                                <p>No services found matching your criteria.</p>
                            </div>
                        ) : (
                            Object.entries(groupedServices).map(([category, services]) => (
                                <div key={category} className="space-y-3">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-3 border-l-2 border-ruby-500/50">
                                        {category.replace(activePlatform?.name || '', '').replace(/^-/, '').trim() || category}
                                    </h3>
                                    <div className="grid grid-cols-1 gap-2">
                                        {services.map(service => (
                                            <button
                                                key={service.id}
                                                onClick={() => setSelectedService(service)}
                                                className={`text-left w-full p-4 rounded-xl border transition-all relative overflow-hidden group
                                                    ${selectedService?.id === service.id
                                                        ? 'bg-ruby-900/20 border-ruby-500/50 ring-1 ring-ruby-500/20'
                                                        : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-medium text-sm pr-12 text-white/90 group-hover:text-white transition-colors">
                                                        {service.name.replace(/^[0-9]+ - /, '')}
                                                    </span>
                                                    <span className="font-bold font-mono text-ruby-400 bg-ruby-900/20 px-2 py-0.5 rounded text-xs whitespace-nowrap">
                                                        ${service.rate}/1k
                                                    </span>
                                                </div>
                                                <div className="flex gap-4 text-[10px] text-gray-500 font-mono uppercase tracking-wide">
                                                    <span>Min: {service.min}</span>
                                                    <span>Max: {service.max.toLocaleString()}</span>
                                                    <span>Ref: #{service.id}</span>
                                                </div>
                                                {selectedService?.id === service.id && (
                                                    <motion.div layoutId="selected-check" className="absolute top-4 right-4 text-ruby-500">
                                                        <Check size={18} />
                                                    </motion.div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* RIGHT: Order Form (Sticky) */}
                <div className="lg:col-span-5">
                    <div className="sticky top-8 space-y-6">
                        <form onSubmit={handleSubmit} className="glass-card p-6 rounded-3xl border border-white/10 space-y-6 relative overflow-hidden">
                            {/* Dynamic Background Gradient */}
                            <div className={`absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br ${activePlatform?.bg} blur-[80px] opacity-40 pointer-events-none transition-all duration-700`} />

                            <div className="space-y-5 relative z-10">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    {selectedService ? (
                                        <>
                                            <Zap size={20} className="text-yellow-400 fill-yellow-400" />
                                            Configure Order
                                        </>
                                    ) : (
                                        <span className="text-gray-500">Select a service to proceed</span>
                                    )}
                                </h2>

                                <AnimatePresence mode="wait">
                                    {selectedService && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="bg-white/5 rounded-xl p-4 text-sm border border-white/5 shadow-inner"
                                        >
                                            <p className="font-bold text-white mb-1 line-clamp-2">{selectedService.name}</p>
                                            <div className="flex gap-2 text-xs text-gray-400 mt-2">
                                                <span className="bg-black/30 px-2 py-1 rounded">ID: {selectedService.id}</span>
                                                <span className="bg-black/30 px-2 py-1 rounded">Min: {selectedService.min}</span>
                                                <span className="bg-black/30 px-2 py-1 rounded">Max: {selectedService.max}</span>
                                            </div>
                                            {selectedService.description && (
                                                <div className="mt-3 pt-3 border-t border-white/5 text-xs text-gray-400 leading-relaxed">
                                                    <span className="block font-bold text-gray-500 text-[10px] uppercase mb-1">Description</span>
                                                    {selectedService.description}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Link</label>
                                    <input
                                        type="url"
                                        required
                                        disabled={!selectedService}
                                        value={link}
                                        onChange={handleLinkPaste}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-ruby-500 disabled:opacity-50 transition-colors text-sm"
                                        placeholder="https://..."
                                    />
                                    {/* Link Preview */}
                                    <AnimatePresence>
                                        {previewData && previewData.title && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="mt-2 bg-white/5 rounded-lg p-3 flex gap-3 items-center overflow-hidden border border-white/5"
                                            >
                                                {previewData.image && <img src={previewData.image} className="w-10 h-10 rounded-lg object-cover" />}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold truncate text-white">{previewData.title}</p>
                                                    <p className="text-[10px] text-gray-500 truncate">{previewData.description}</p>
                                                </div>
                                                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                                    <Check size={12} className="text-green-500" />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Quantity</label>
                                    <input
                                        type="number"
                                        required
                                        disabled={!selectedService}
                                        value={quantity || ''}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:border-ruby-500 disabled:opacity-50 font-mono transition-colors"
                                        placeholder={`${selectedService?.min || 100} - ${selectedService?.max || 1000}`}
                                    />
                                </div>

                                {/* Drip Feed Toggle & Inputs */}
                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-gray-400">Drip Feed</label>
                                        <button
                                            type="button"
                                            onClick={() => setDripFeed(!dripFeed)}
                                            className={`w-11 h-6 rounded-full transition-colors relative ${dripFeed ? 'bg-ruby-500' : 'bg-gray-700'}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${dripFeed ? 'left-6' : 'left-1'}`} />
                                        </button>
                                    </div>

                                    <AnimatePresence>
                                        {dripFeed && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="grid grid-cols-2 gap-4 overflow-hidden"
                                            >
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Runs</label>
                                                    <input
                                                        type="number"
                                                        value={runs || ''}
                                                        onChange={(e) => setRuns(Number(e.target.value))}
                                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-ruby-500"
                                                        placeholder="Ex: 5"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Interval (Min)</label>
                                                    <input
                                                        type="number"
                                                        value={interval || ''}
                                                        onChange={(e) => setInterval(Number(e.target.value))}
                                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-ruby-500"
                                                        placeholder="Ex: 60"
                                                    />
                                                </div>
                                                <div className="col-span-2 text-[10px] text-gray-500 text-center">
                                                    Total Quantity: <strong>{(runs || 0) * (quantity || 0)}</strong>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Total Price */}
                                <div className="bg-gradient-to-r from-ruby-950 to-transparent border border-ruby-500/20 rounded-xl p-4 flex justify-between items-center group">
                                    <span className="text-sm font-bold text-ruby-400 group-hover:text-ruby-300 transition-colors">Total Charge</span>
                                    <span className="text-2xl font-bold text-white font-mono">${totalCharge.toFixed(4)}</span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!selectedService || status === 'loading' || quantity < (selectedService?.min || 0)}
                                    className="w-full py-4 bg-gradient-to-r from-ruby-600 to-ruby-800 rounded-xl font-bold shadow-lg shadow-ruby-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none text-white relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform duration-300" />
                                    <span className="relative z-10">{status === 'loading' ? 'Processing...' : 'Place Order'}</span>
                                </button>
                            </div>
                        </form>

                        <div className="text-center text-[10px] text-gray-600 uppercase tracking-widest">
                            Secure • Instant • Guaranteed
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
