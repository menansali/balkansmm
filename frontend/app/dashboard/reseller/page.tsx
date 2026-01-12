'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Store,
    Users,
    DollarSign,
    TrendingUp,
    Settings,
    Copy,
    ExternalLink,
    Palette,
    Percent,
    Globe,
    Mail,
    Plus,
    Eye,
    CheckCircle,
    AlertCircle,
} from 'lucide-react';
import api from '@/lib/api';

interface ResellerStore {
    id: number;
    storeName: string;
    storeSlug: string;
    customDomain: string | null;
    logoUrl: string | null;
    primaryColor: string;
    secondaryColor: string;
    markupPercent: number;
    supportEmail: string | null;
    welcomeMessage: string | null;
    isActive: boolean;
}

interface StoreStats {
    totalCustomers: number;
    totalOrders: number;
    totalRevenue: string;
    totalProfit: string;
}

interface ResellerCustomer {
    id: number;
    email: string;
    name: string | null;
    balance: number;
    totalSpent: number;
    _count: { orders: number };
}

export default function ResellerPage() {
    const [hasStore, setHasStore] = useState<boolean | null>(null);
    const [store, setStore] = useState<ResellerStore | null>(null);
    const [stats, setStats] = useState<StoreStats | null>(null);
    const [customers, setCustomers] = useState<ResellerCustomer[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'customers' | 'settings'>('dashboard');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAddBalanceModal, setShowAddBalanceModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<ResellerCustomer | null>(null);
    const [addBalanceAmount, setAddBalanceAmount] = useState('');

    const [newStore, setNewStore] = useState({
        storeName: '',
        storeSlug: '',
        markupPercent: 30,
        supportEmail: '',
        welcomeMessage: '',
        primaryColor: '#e11d48',
        secondaryColor: '#7c3aed',
    });

    const [creating, setCreating] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        checkStore();
    }, []);

    const checkStore = async () => {
        try {
            const res = await api.get('/reseller/dashboard');
            setStore(res.data.store);
            setStats(res.data.stats);
            setHasStore(true);
            fetchCustomers();
        } catch (error: any) {
            if (error.response?.status === 404) {
                setHasStore(false);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            const res = await api.get('/reseller/customers');
            setCustomers(res.data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    const createStore = async () => {
        if (!newStore.storeName || !newStore.storeSlug) return;
        setCreating(true);
        try {
            await api.post('/reseller/store', newStore);
            await checkStore();
            setShowCreateModal(false);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to create store');
        } finally {
            setCreating(false);
        }
    };

    const updateStore = async () => {
        if (!store) return;
        setSaving(true);
        try {
            await api.put('/reseller/store', store);
            alert('Settings saved!');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const addBalance = async () => {
        if (!selectedCustomer || !addBalanceAmount) return;
        try {
            await api.post(`/reseller/customers/${selectedCustomer.id}/add-balance`, {
                amount: parseFloat(addBalanceAmount),
            });
            await fetchCustomers();
            setShowAddBalanceModal(false);
            setAddBalanceAmount('');
            setSelectedCustomer(null);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to add balance');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-ruby-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!hasStore) {
        return (
            <div className="space-y-8">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16 bg-gradient-to-br from-purple-500/10 via-ruby-500/10 to-blue-500/10 rounded-3xl border border-white/10"
                >
                    <Store size={64} className="mx-auto text-ruby-400 mb-6" />
                    <h1 className="text-4xl font-bold mb-4">Start Your Reseller Business</h1>
                    <p className="text-gray-400 max-w-xl mx-auto mb-8">
                        Create your own white-label SMM panel with custom branding, pricing, and domain.
                        Earn passive income by reselling our services to your customers.
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-8 py-4 bg-gradient-to-r from-ruby-600 to-purple-600 rounded-xl font-bold text-lg hover:scale-105 transition-transform"
                    >
                        Create Your Store
                    </button>
                </motion.div>

                {/* Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            icon: Palette,
                            title: 'Custom Branding',
                            desc: 'Your logo, colors, and domain. Fully white-labeled panel.',
                        },
                        {
                            icon: Percent,
                            title: 'Set Your Prices',
                            desc: 'Add any markup percentage. Keep 100% of profits.',
                        },
                        {
                            icon: Users,
                            title: 'Manage Customers',
                            desc: "Your customers, your panel. Full control over everything.",
                        },
                    ].map((benefit, i) => (
                        <motion.div
                            key={benefit.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white/5 rounded-2xl p-6 border border-white/10"
                        >
                            <benefit.icon size={32} className="text-ruby-400 mb-4" />
                            <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                            <p className="text-gray-400 text-sm">{benefit.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Create Store Modal */}
                <AnimatePresence>
                    {showCreateModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={() => setShowCreateModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-gray-900 rounded-3xl p-8 w-full max-w-lg border border-white/10"
                            >
                                <h2 className="text-2xl font-bold mb-6">Create Your Store</h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Store Name</label>
                                        <input
                                            type="text"
                                            value={newStore.storeName}
                                            onChange={(e) => setNewStore({ ...newStore, storeName: e.target.value })}
                                            placeholder="My SMM Panel"
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-ruby-500 transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Store Slug (URL)</label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500">balkansmm.com/store/</span>
                                            <input
                                                type="text"
                                                value={newStore.storeSlug}
                                                onChange={(e) =>
                                                    setNewStore({
                                                        ...newStore,
                                                        storeSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                                                    })
                                                }
                                                placeholder="my-store"
                                                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-ruby-500 transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Markup Percentage</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={newStore.markupPercent}
                                                onChange={(e) =>
                                                    setNewStore({ ...newStore, markupPercent: parseInt(e.target.value) || 0 })
                                                }
                                                min={0}
                                                max={200}
                                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-ruby-500 transition-colors"
                                            />
                                            <Percent size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Your customers will pay {newStore.markupPercent}% more than base prices
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Primary Color</label>
                                            <input
                                                type="color"
                                                value={newStore.primaryColor}
                                                onChange={(e) => setNewStore({ ...newStore, primaryColor: e.target.value })}
                                                className="w-full h-12 rounded-xl cursor-pointer"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Secondary Color</label>
                                            <input
                                                type="color"
                                                value={newStore.secondaryColor}
                                                onChange={(e) => setNewStore({ ...newStore, secondaryColor: e.target.value })}
                                                className="w-full h-12 rounded-xl cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-8">
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 py-3 border border-white/10 rounded-xl font-semibold hover:bg-white/5 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={createStore}
                                        disabled={creating || !newStore.storeName || !newStore.storeSlug}
                                        className="flex-1 py-3 bg-gradient-to-r from-ruby-600 to-purple-600 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                                    >
                                        {creating ? 'Creating...' : 'Create Store'}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Store className="text-ruby-400" />
                        Reseller Dashboard
                    </h1>
                    <p className="text-gray-400 mt-1">{store?.storeName}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm ${store?.isActive
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                    >
                        {store?.isActive ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                        {store?.isActive ? 'Active' : 'Inactive'}
                    </div>
                    <a
                        href={`/store/${store?.storeSlug}`}
                        target="_blank"
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    >
                        <ExternalLink size={14} />
                        View Store
                    </a>
                </div>
            </div>

            {/* Store URL */}
            <div className="bg-gradient-to-r from-ruby-500/10 to-purple-500/10 rounded-2xl p-6 border border-ruby-500/20">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm text-gray-400 mb-1">Your Store URL</div>
                        <div className="text-xl font-mono font-bold">
                            https://balkansmm.com/store/{store?.storeSlug}
                        </div>
                    </div>
                    <button
                        onClick={() => copyToClipboard(`https://balkansmm.com/store/${store?.storeSlug}`)}
                        className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    >
                        <Copy size={20} />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/10">
                {[
                    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
                    { id: 'customers', label: 'Customers', icon: Users },
                    { id: 'settings', label: 'Settings', icon: Settings },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${activeTab === tab.id
                                ? 'border-ruby-500 text-white'
                                : 'border-transparent text-gray-400 hover:text-white'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && stats && (
                <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Total Customers', value: stats.totalCustomers, icon: Users, color: 'blue' },
                            { label: 'Total Orders', value: stats.totalOrders, icon: TrendingUp, color: 'purple' },
                            { label: 'Total Revenue', value: `$${stats.totalRevenue}`, icon: DollarSign, color: 'green' },
                            { label: 'Total Profit', value: `$${stats.totalProfit}`, icon: DollarSign, color: 'ruby' },
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white/5 rounded-2xl p-6 border border-white/10"
                            >
                                <stat.icon size={24} className={`text-${stat.color}-400 mb-4`} />
                                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                                <div className="text-sm text-gray-400">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <h3 className="text-lg font-bold mb-4">Recent Orders</h3>
                        <div className="text-center py-8 text-gray-500">
                            Orders from your customers will appear here
                        </div>
                    </div>
                </div>
            )}

            {/* Customers Tab */}
            {activeTab === 'customers' && (
                <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <h3 className="text-lg font-bold">Your Customers ({customers.length})</h3>
                    </div>
                    {customers.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No customers yet. Share your store link to get started!
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {customers.map((customer) => (
                                <div
                                    key={customer.id}
                                    className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ruby-500 to-purple-600 flex items-center justify-center font-bold">
                                            {customer.name?.charAt(0) || customer.email.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-medium">{customer.name || customer.email}</div>
                                            <div className="text-sm text-gray-400">{customer.email}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <div className="font-bold">${customer.balance.toFixed(2)}</div>
                                            <div className="text-xs text-gray-500">Balance</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold">{customer._count.orders}</div>
                                            <div className="text-xs text-gray-500">Orders</div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelectedCustomer(customer);
                                                setShowAddBalanceModal(true);
                                            }}
                                            className="px-4 py-2 bg-ruby-500/20 text-ruby-400 rounded-lg hover:bg-ruby-500/30 transition-colors text-sm"
                                        >
                                            Add Balance
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && store && (
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Store Name</label>
                            <input
                                type="text"
                                value={store.storeName}
                                onChange={(e) => setStore({ ...store, storeName: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-ruby-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Markup Percentage</label>
                            <input
                                type="number"
                                value={store.markupPercent}
                                onChange={(e) =>
                                    setStore({ ...store, markupPercent: parseFloat(e.target.value) || 0 })
                                }
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-ruby-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Support Email</label>
                            <input
                                type="email"
                                value={store.supportEmail || ''}
                                onChange={(e) => setStore({ ...store, supportEmail: e.target.value })}
                                placeholder="support@yourstore.com"
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-ruby-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Custom Domain</label>
                            <input
                                type="text"
                                value={store.customDomain || ''}
                                onChange={(e) => setStore({ ...store, customDomain: e.target.value })}
                                placeholder="smm.yourdomain.com"
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-ruby-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Welcome Message</label>
                        <textarea
                            value={store.welcomeMessage || ''}
                            onChange={(e) => setStore({ ...store, welcomeMessage: e.target.value })}
                            placeholder="Welcome to our SMM panel..."
                            rows={3}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-ruby-500 transition-colors resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Primary Color</label>
                            <input
                                type="color"
                                value={store.primaryColor}
                                onChange={(e) => setStore({ ...store, primaryColor: e.target.value })}
                                className="w-full h-12 rounded-xl cursor-pointer"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Secondary Color</label>
                            <input
                                type="color"
                                value={store.secondaryColor}
                                onChange={(e) => setStore({ ...store, secondaryColor: e.target.value })}
                                className="w-full h-12 rounded-xl cursor-pointer"
                            />
                        </div>
                    </div>

                    <button
                        onClick={updateStore}
                        disabled={saving}
                        className="w-full py-4 bg-gradient-to-r from-ruby-600 to-purple-600 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            )}

            {/* Add Balance Modal */}
            <AnimatePresence>
                {showAddBalanceModal && selectedCustomer && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowAddBalanceModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gray-900 rounded-3xl p-8 w-full max-w-md border border-white/10"
                        >
                            <h2 className="text-2xl font-bold mb-2">Add Balance</h2>
                            <p className="text-gray-400 mb-6">
                                Adding funds to <strong>{selectedCustomer.name || selectedCustomer.email}</strong>
                            </p>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Amount (USD)</label>
                                <input
                                    type="number"
                                    value={addBalanceAmount}
                                    onChange={(e) => setAddBalanceAmount(e.target.value)}
                                    placeholder="10.00"
                                    min="1"
                                    step="0.01"
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-ruby-500 transition-colors"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    This will be deducted from your main balance.
                                </p>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowAddBalanceModal(false)}
                                    className="flex-1 py-3 border border-white/10 rounded-xl font-semibold hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={addBalance}
                                    disabled={!addBalanceAmount || parseFloat(addBalanceAmount) <= 0}
                                    className="flex-1 py-3 bg-ruby-600 rounded-xl font-semibold hover:bg-ruby-500 transition-colors disabled:opacity-50"
                                >
                                    Add ${addBalanceAmount || '0.00'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
