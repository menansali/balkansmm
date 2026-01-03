'use client';
import { useState, useEffect } from 'react';
import { RefreshCw, Check, Database, List, Search, Edit2, Play, Pause, Save, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../../lib/api';

type Service = {
    id: number;
    name: string;
    category: string;
    rate: number;
    min: number;
    max: number;
    status: boolean;
    provider: string;
};

export default function AdminServicesPage() {
    const [activeTab, setActiveTab] = useState<'manage' | 'import'>('manage');

    // Manage Tab State
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<Service>>({});

    // Import Tab State
    const [syncStatus, setSyncStatus] = useState('idle');
    const [syncResult, setSyncResult] = useState<any>(null);
    const [margin, setMargin] = useState(30);

    useEffect(() => {
        if (activeTab === 'manage') {
            loadServices();
        }
    }, [activeTab]);

    const loadServices = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/services/admin');
            setServices(res.data);
        } catch (e) {
            toast.error('Failed to load services');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSync = async (provider: string) => {
        setSyncStatus('loading');
        try {
            const res = await api.post('/services/sync', { provider, margin });
            setSyncResult(res.data);
            setSyncStatus('success');
            toast.success(`Synced ${res.data.synced} services!`);
            if (activeTab === 'manage') loadServices();
        } catch (e) {
            setSyncStatus('error');
            toast.error('Sync failed');
        }
    };

    const handleEditClick = (service: Service) => {
        setEditingId(service.id);
        setEditForm({ ...service });
    };

    const handleSaveEdit = async () => {
        if (!editingId) return;
        try {
            await api.patch(`/services/${editingId}`, editForm);
            toast.success('Service updated');
            setEditingId(null);
            loadServices();
        } catch (e) {
            toast.error('Update failed');
        }
    };

    const toggleStatus = async (service: Service) => {
        try {
            await api.patch(`/services/${service.id}`, { status: !service.status });
            toast.success(`Service ${!service.status ? 'Enabled' : 'Disabled'}`);
            loadServices();
        } catch (e) {
            toast.error('Failed to toggle status');
        }
    };

    const filteredServices = services.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Database className="text-ruby-500" />
                        Services Management
                    </h1>
                    <p className="text-gray-400 mt-2">Manage prices, status, and sync from providers.</p>
                </div>

                {/* Tabs */}
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                    <button
                        onClick={() => setActiveTab('manage')}
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'manage' ? 'bg-ruby-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Manage Services
                    </button>
                    <button
                        onClick={() => setActiveTab('import')}
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'import' ? 'bg-ruby-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Import / Sync
                    </button>
                </div>
            </header>

            {activeTab === 'manage' ? (
                <div className="space-y-6">
                    {/* Toolbar */}
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input
                                type="text"
                                placeholder="Search services..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:border-ruby-500 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-400 uppercase bg-white/5 border-b border-white/5">
                                    <tr>
                                        <th className="px-6 py-4">ID</th>
                                        <th className="px-6 py-4">Service Name</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4">Rate ($)</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {isLoading ? (
                                        <tr><td colSpan={6} className="text-center py-8 text-gray-500">Loading services...</td></tr>
                                    ) : filteredServices.length === 0 ? (
                                        <tr><td colSpan={6} className="text-center py-8 text-gray-500">No services found.</td></tr>
                                    ) : (
                                        filteredServices.map(service => (
                                            <tr key={service.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 text-gray-500">#{service.id}</td>

                                                <td className="px-6 py-4 font-medium">
                                                    {editingId === service.id ? (
                                                        <input
                                                            className="bg-black/50 border border-white/20 rounded px-2 py-1 w-full"
                                                            value={editForm.name || ''}
                                                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                                        />
                                                    ) : (
                                                        <div className="max-w-xs truncate" title={service.name}>{service.name}</div>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 text-gray-400">{service.category}</td>

                                                <td className="px-6 py-4 text-emerald-400 font-mono">
                                                    {editingId === service.id ? (
                                                        <input
                                                            type="number"
                                                            className="bg-black/50 border border-white/20 rounded px-2 py-1 w-24"
                                                            value={editForm.rate || ''}
                                                            onChange={e => setEditForm({ ...editForm, rate: parseFloat(e.target.value) })}
                                                        />
                                                    ) : (
                                                        `$${service.rate}`
                                                    )}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${service.status ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                        {service.status ? 'Active' : 'Disabled'}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                                    {editingId === service.id ? (
                                                        <>
                                                            <button onClick={handleSaveEdit} className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30">
                                                                <Save size={16} />
                                                            </button>
                                                            <button onClick={() => setEditingId(null)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30">
                                                                <X size={16} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => toggleStatus(service)}
                                                                className={`p-2 rounded-lg transition-colors ${service.status ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'}`}
                                                                title={service.status ? 'Disable' : 'Enable'}
                                                            >
                                                                {service.status ? <Pause size={16} /> : <Play size={16} />}
                                                            </button>
                                                            <button
                                                                onClick={() => handleEditClick(service)}
                                                                className="p-2 bg-white/5 text-gray-400 rounded-lg hover:text-white hover:bg-white/10"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* JAP Syncer */}
                    <div className="glass-card p-8 rounded-3xl border border-white/10 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                                JAP
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">JustAnotherPanel</h3>
                                <p className="text-xs text-gray-500">World's Largest Provider</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-gray-500">Global Margin (%)</label>
                            <input
                                type="number"
                                value={margin}
                                onChange={(e) => setMargin(Number(e.target.value))}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white"
                            />
                            <p className="text-xs text-gray-600">Cost + {margin}% = Your Price</p>
                        </div>

                        <button
                            onClick={() => handleSync('justanotherpanel')}
                            disabled={syncStatus === 'loading'}
                            className="w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                        >
                            {syncStatus === 'loading' ? <RefreshCw className="animate-spin" /> : <RefreshCw />}
                            Sync Services Now
                        </button>

                        {syncResult && (
                            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-green-400 text-sm">
                                <Check size={16} className="inline mr-2" />
                                Success! Processed {syncResult.synced} services. Added {syncResult.added} new.
                            </div>
                        )}
                    </div>

                    {/* MTP Syncer */}
                    <div className="glass-card p-8 rounded-3xl border border-white/10 space-y-6 opacity-50 relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-10">
                            <span className="bg-white/10 px-4 py-2 rounded-lg font-bold text-sm">Coming Soon</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                                MTP
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">MoreThanPanel</h3>
                                <p className="text-xs text-gray-500">Premium Quality</p>
                            </div>
                        </div>
                        <button className="w-full py-4 bg-white/10 border border-white/10 rounded-xl font-bold text-gray-500 cursor-not-allowed">
                            Sync Services Now
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
