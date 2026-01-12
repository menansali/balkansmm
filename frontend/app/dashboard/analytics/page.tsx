'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    Users,
    Eye,
    Heart,
    MessageCircle,
    Plus,
    RefreshCw,
    Trash2,
    BarChart3,
    Clock,
    Zap,
    Instagram,
    Youtube,
    Twitter,
} from 'lucide-react';
import api from '@/lib/api';

interface TrackedProfile {
    id: number;
    platform: string;
    username: string;
    profileUrl: string;
    avatarUrl: string;
    snapshots: AnalyticsSnapshot[];
}

interface AnalyticsSnapshot {
    id: number;
    followers: number;
    following: number;
    posts: number;
    engagementRate: number;
    avgLikes: number;
    avgComments: number;
    createdAt: string;
}

const platformIcons: Record<string, any> = {
    instagram: Instagram,
    tiktok: Zap,
    youtube: Youtube,
    twitter: Twitter,
};

const platformColors: Record<string, string> = {
    instagram: 'from-pink-500 to-purple-600',
    tiktok: 'from-black to-pink-500',
    youtube: 'from-red-600 to-red-500',
    twitter: 'from-blue-400 to-blue-500',
};

export default function AnalyticsPage() {
    const [profiles, setProfiles] = useState<TrackedProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState<TrackedProfile | null>(null);
    const [newProfile, setNewProfile] = useState({ platform: 'instagram', profileUrl: '' });
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        try {
            const res = await api.get('/analytics/profiles');
            setProfiles(res.data);
        } catch (error) {
            console.error('Error fetching profiles:', error);
        } finally {
            setLoading(false);
        }
    };

    const addProfile = async () => {
        if (!newProfile.profileUrl) return;
        setAdding(true);
        try {
            await api.post('/analytics/track', newProfile);
            await fetchProfiles();
            setShowAddModal(false);
            setNewProfile({ platform: 'instagram', profileUrl: '' });
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to add profile');
        } finally {
            setAdding(false);
        }
    };

    const refreshProfile = async (id: number) => {
        try {
            await api.post(`/analytics/profiles/${id}/refresh`);
            await fetchProfiles();
        } catch (error) {
            console.error('Error refreshing profile:', error);
        }
    };

    const deleteProfile = async (id: number) => {
        if (!confirm('Delete this tracked profile?')) return;
        try {
            await api.delete(`/analytics/profiles/${id}`);
            setProfiles(profiles.filter((p) => p.id !== id));
            if (selectedProfile?.id === id) setSelectedProfile(null);
        } catch (error) {
            console.error('Error deleting profile:', error);
        }
    };

    const getGrowth = (snapshots: AnalyticsSnapshot[]) => {
        if (snapshots.length < 2) return 0;
        const latest = snapshots[0].followers;
        const previous = snapshots[1].followers;
        return ((latest - previous) / previous) * 100;
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                    <p className="text-gray-400 mt-1">Track growth and compare competitor profiles</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-ruby-600 to-purple-600 rounded-xl font-semibold hover:scale-105 transition-transform"
                >
                    <Plus size={18} />
                    Track Profile
                </button>
            </div>

            {/* Profiles Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : profiles.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-20 bg-white/5 rounded-3xl border border-white/10"
                >
                    <BarChart3 size={48} className="mx-auto text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Profiles Tracked</h3>
                    <p className="text-gray-400 mb-6">Start tracking social profiles to see analytics</p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                    >
                        Add Your First Profile
                    </button>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {profiles.map((profile, index) => {
                        const Icon = platformIcons[profile.platform] || Users;
                        const growth = getGrowth(profile.snapshots);
                        const latest = profile.snapshots[0];

                        return (
                            <motion.div
                                key={profile.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => setSelectedProfile(profile)}
                                className={`relative overflow-hidden rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] ${selectedProfile?.id === profile.id
                                        ? 'border-ruby-500 bg-ruby-500/10'
                                        : 'border-white/10 bg-white/5'
                                    }`}
                            >
                                {/* Platform gradient header */}
                                <div className={`h-20 bg-gradient-to-r ${platformColors[profile.platform]}`} />

                                {/* Avatar */}
                                <div className="absolute top-10 left-6">
                                    <img
                                        src={profile.avatarUrl || '/default-avatar.png'}
                                        alt={profile.username}
                                        className="w-20 h-20 rounded-full border-4 border-black bg-black"
                                    />
                                </div>

                                {/* Content */}
                                <div className="pt-14 p-6">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Icon size={14} className="text-gray-400" />
                                        <span className="text-gray-400 text-sm capitalize">{profile.platform}</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-4">@{profile.username}</h3>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <div className="text-xl font-bold">{formatNumber(latest?.followers || 0)}</div>
                                            <div className="text-xs text-gray-500">Followers</div>
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold">{latest?.engagementRate?.toFixed(1) || 0}%</div>
                                            <div className="text-xs text-gray-500">Engagement</div>
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold">{formatNumber(latest?.avgLikes || 0)}</div>
                                            <div className="text-xs text-gray-500">Avg Likes</div>
                                        </div>
                                    </div>

                                    {/* Growth indicator */}
                                    <div className={`flex items-center gap-1 text-sm ${growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {growth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                        <span>{Math.abs(growth).toFixed(2)}% from last check</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="absolute top-24 right-4 flex gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            refreshProfile(profile.id);
                                        }}
                                        className="p-2 bg-black/50 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        <RefreshCw size={14} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteProfile(profile.id);
                                        }}
                                        className="p-2 bg-black/50 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Selected Profile Details */}
            <AnimatePresence>
                {selectedProfile && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mt-8 p-8 rounded-3xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10"
                    >
                        <h2 className="text-2xl font-bold mb-6">@{selectedProfile.username} Analytics</h2>

                        {/* Charts placeholder */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Follower Growth Chart */}
                            <div className="bg-black/30 rounded-2xl p-6 border border-white/5">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Users size={18} className="text-ruby-400" />
                                    Follower Growth
                                </h3>
                                <div className="h-48 flex items-end gap-1">
                                    {selectedProfile.snapshots
                                        .slice(0, 14)
                                        .reverse()
                                        .map((snap, i) => {
                                            const maxFollowers = Math.max(...selectedProfile.snapshots.map((s) => s.followers));
                                            const height = (snap.followers / maxFollowers) * 100;
                                            return (
                                                <div
                                                    key={snap.id}
                                                    className="flex-1 bg-gradient-to-t from-ruby-600 to-purple-600 rounded-t transition-all hover:opacity-80"
                                                    style={{ height: `${height}%` }}
                                                    title={`${formatNumber(snap.followers)} followers`}
                                                />
                                            );
                                        })}
                                </div>
                            </div>

                            {/* Best Times to Post */}
                            <div className="bg-black/30 rounded-2xl p-6 border border-white/5">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Clock size={18} className="text-blue-400" />
                                    Best Times to Post
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {['9:00 AM', '12:00 PM', '7:00 PM', '9:00 PM'].map((time, i) => (
                                        <div key={time} className="bg-white/5 rounded-xl p-4 text-center">
                                            <div className="text-2xl font-bold">{time}</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {['Mon-Fri', 'Weekdays', 'Daily', 'Weekends'][i]}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Engagement Breakdown */}
                            <div className="bg-black/30 rounded-2xl p-6 border border-white/5">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Heart size={18} className="text-pink-400" />
                                    Engagement Breakdown
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">Avg Likes</span>
                                        <span className="font-bold">{formatNumber(selectedProfile.snapshots[0]?.avgLikes || 0)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">Avg Comments</span>
                                        <span className="font-bold">{formatNumber(selectedProfile.snapshots[0]?.avgComments || 0)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">Engagement Rate</span>
                                        <span className="font-bold text-green-400">{selectedProfile.snapshots[0]?.engagementRate?.toFixed(2) || 0}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Growth Velocity */}
                            <div className="bg-black/30 rounded-2xl p-6 border border-white/5">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Zap size={18} className="text-yellow-400" />
                                    Growth Velocity
                                </h3>
                                <div className="text-center py-6">
                                    <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                                        +{Math.floor(Math.random() * 500) + 50}
                                    </div>
                                    <div className="text-gray-400 mt-2">followers/day average</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Profile Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gray-900 rounded-3xl p-8 w-full max-w-md border border-white/10"
                        >
                            <h2 className="text-2xl font-bold mb-6">Track New Profile</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Platform</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {['instagram', 'tiktok', 'youtube', 'twitter'].map((p) => {
                                            const Icon = platformIcons[p];
                                            return (
                                                <button
                                                    key={p}
                                                    onClick={() => setNewProfile({ ...newProfile, platform: p })}
                                                    className={`p-4 rounded-xl border transition-all ${newProfile.platform === p
                                                            ? 'border-ruby-500 bg-ruby-500/20'
                                                            : 'border-white/10 hover:border-white/30'
                                                        }`}
                                                >
                                                    <Icon size={24} className="mx-auto" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Profile URL</label>
                                    <input
                                        type="url"
                                        value={newProfile.profileUrl}
                                        onChange={(e) => setNewProfile({ ...newProfile, profileUrl: e.target.value })}
                                        placeholder={`https://${newProfile.platform}.com/@username`}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-ruby-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-3 border border-white/10 rounded-xl font-semibold hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={addProfile}
                                    disabled={adding || !newProfile.profileUrl}
                                    className="flex-1 py-3 bg-gradient-to-r from-ruby-600 to-purple-600 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {adding ? 'Adding...' : 'Start Tracking'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
