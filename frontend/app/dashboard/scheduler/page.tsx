'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Plus,
    Clock,
    Image,
    Video,
    Wand2,
    Send,
    Trash2,
    Edit2,
    ChevronLeft,
    ChevronRight,
    Instagram,
    Zap,
    Twitter,
    Sparkles,
    Rocket,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';

interface ScheduledPost {
    id: number;
    platform: string;
    postType: string;
    caption: string;
    mediaUrls: string[];
    hashtags: string[];
    scheduledAt: string;
    status: string;
    autoBoost: boolean;
}

const platformIcons: Record<string, any> = {
    instagram: Instagram,
    tiktok: Zap,
    twitter: Twitter,
};

const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    published: 'bg-green-500/20 text-green-400 border-green-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
    cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export default function SchedulerPage() {
    const [posts, setPosts] = useState<ScheduledPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [calendarView, setCalendarView] = useState<Record<string, ScheduledPost[]>>({});
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    const [newPost, setNewPost] = useState({
        platform: 'instagram',
        postType: 'image',
        caption: '',
        mediaUrls: [] as string[],
        hashtags: [] as string[],
        scheduledAt: '',
        autoBoost: false,
        boostServiceId: null as number | null,
        boostQuantity: 1000,
    });

    const [aiPrompt, setAiPrompt] = useState('');
    const [generating, setGenerating] = useState(false);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchPosts();
        fetchCalendar();
    }, [currentMonth]);

    const fetchPosts = async () => {
        try {
            const res = await api.get('/scheduler/posts');
            setPosts(res.data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCalendar = async () => {
        try {
            const month = currentMonth.getMonth() + 1;
            const year = currentMonth.getFullYear();
            const res = await api.get(`/scheduler/calendar?month=${month}&year=${year}`);
            setCalendarView(res.data);
        } catch (error) {
            console.error('Error fetching calendar:', error);
        }
    };

    const generateCaption = async () => {
        if (!aiPrompt) return;
        setGenerating(true);
        try {
            const res = await api.post('/scheduler/generate-caption', {
                topic: aiPrompt,
                tone: 'casual',
                platform: newPost.platform,
                includeEmojis: true,
                includeHashtags: true,
            });
            setNewPost({
                ...newPost,
                caption: res.data.caption,
                hashtags: res.data.suggestedHashtags,
            });
        } catch (error) {
            console.error('Error generating caption:', error);
        } finally {
            setGenerating(false);
        }
    };

    const createPost = async () => {
        if (!newPost.caption || !newPost.scheduledAt) return;
        setCreating(true);
        try {
            await api.post('/scheduler/posts', newPost);
            await fetchPosts();
            await fetchCalendar();
            setShowCreateModal(false);
            resetForm();
            toast.success('Post scheduled successfully!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to schedule post');
        } finally {
            setCreating(false);
        }
    };

    const cancelPost = async (id: number) => {
        if (!confirm('Cancel this scheduled post?')) return;
        try {
            await api.post(`/scheduler/posts/${id}/cancel`);
            await fetchPosts();
            await fetchCalendar();
        } catch (error) {
            console.error('Error cancelling post:', error);
        }
    };

    const deletePost = async (id: number) => {
        if (!confirm('Delete this post?')) return;
        try {
            await api.delete(`/scheduler/posts/${id}`);
            await fetchPosts();
            await fetchCalendar();
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const resetForm = () => {
        setNewPost({
            platform: 'instagram',
            postType: 'image',
            caption: '',
            mediaUrls: [],
            hashtags: [],
            scheduledAt: '',
            autoBoost: false,
            boostServiceId: null,
            boostQuantity: 1000,
        });
        setAiPrompt('');
    };

    const getDaysInMonth = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];

        // Add empty slots for days before the first day
        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(null);
        }

        // Add actual days
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(i);
        }

        return days;
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Sparkles className="text-purple-400" />
                        AI Content Scheduler
                    </h1>
                    <p className="text-gray-400 mt-1">Schedule posts and auto-boost with AI-generated captions</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-semibold hover:scale-105 transition-transform"
                >
                    <Plus size={18} />
                    Schedule Post
                </button>
            </div>

            {/* Calendar View */}
            <div className="bg-white/5 rounded-3xl border border-white/10 p-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h2 className="text-xl font-bold">
                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="text-center text-sm text-gray-500 py-2">
                            {day}
                        </div>
                    ))}
                    {getDaysInMonth().map((day, index) => {
                        const dayPosts = day ? calendarView[day.toString()] || [] : [];
                        const isToday =
                            day &&
                            new Date().getDate() === day &&
                            new Date().getMonth() === currentMonth.getMonth() &&
                            new Date().getFullYear() === currentMonth.getFullYear();

                        return (
                            <div
                                key={index}
                                onClick={() => day && setSelectedDay(selectedDay === day ? null : day)}
                                className={`min-h-24 p-2 rounded-xl border transition-all cursor-pointer ${day
                                    ? selectedDay === day
                                        ? 'border-purple-500 bg-purple-500/10'
                                        : 'border-white/5 hover:border-white/20'
                                    : 'border-transparent'
                                    } ${isToday ? 'bg-purple-500/20' : ''}`}
                            >
                                {day && (
                                    <>
                                        <div className={`text-sm mb-1 ${isToday ? 'text-purple-400 font-bold' : 'text-gray-400'}`}>
                                            {day}
                                        </div>
                                        {dayPosts.slice(0, 3).map((post) => {
                                            const Icon = platformIcons[post.platform] || Calendar;
                                            return (
                                                <div
                                                    key={post.id}
                                                    className={`text-xs p-1 rounded mb-1 truncate flex items-center gap-1 ${statusColors[post.status]}`}
                                                >
                                                    <Icon size={10} />
                                                    <span className="truncate">{post.caption.substring(0, 15)}...</span>
                                                </div>
                                            );
                                        })}
                                        {dayPosts.length > 3 && (
                                            <div className="text-xs text-gray-500">+{dayPosts.length - 3} more</div>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Upcoming Posts List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Scheduled */}
                <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Clock size={18} className="text-blue-400" />
                        Scheduled ({posts.filter((p) => p.status === 'scheduled').length})
                    </h3>
                    <div className="space-y-3">
                        {posts
                            .filter((p) => p.status === 'scheduled')
                            .slice(0, 5)
                            .map((post) => {
                                const Icon = platformIcons[post.platform] || Calendar;
                                return (
                                    <motion.div
                                        key={post.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="bg-black/30 rounded-xl p-4 border border-white/5"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Icon size={16} className="text-gray-400" />
                                                <span className="text-sm text-gray-400 capitalize">{post.platform}</span>
                                                {post.autoBoost && (
                                                    <span className="text-xs px-2 py-0.5 bg-ruby-500/20 text-ruby-400 rounded-full">
                                                        Auto-Boost
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => cancelPost(post.id)}
                                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={14} className="text-gray-400" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm mb-2 line-clamp-2">{post.caption}</p>
                                        <div className="text-xs text-gray-500">{formatDate(post.scheduledAt)}</div>
                                    </motion.div>
                                );
                            })}
                        {posts.filter((p) => p.status === 'scheduled').length === 0 && (
                            <div className="text-center py-8 text-gray-500">No scheduled posts</div>
                        )}
                    </div>
                </div>

                {/* Published */}
                <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Send size={18} className="text-green-400" />
                        Published ({posts.filter((p) => p.status === 'published').length})
                    </h3>
                    <div className="space-y-3">
                        {posts
                            .filter((p) => p.status === 'published')
                            .slice(0, 5)
                            .map((post) => {
                                const Icon = platformIcons[post.platform] || Calendar;
                                return (
                                    <motion.div
                                        key={post.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="bg-black/30 rounded-xl p-4 border border-green-500/20"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <Icon size={16} className="text-gray-400" />
                                            <span className="text-sm text-gray-400 capitalize">{post.platform}</span>
                                            <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">
                                                Published
                                            </span>
                                        </div>
                                        <p className="text-sm mb-2 line-clamp-2">{post.caption}</p>
                                        <div className="text-xs text-gray-500">{formatDate(post.scheduledAt)}</div>
                                    </motion.div>
                                );
                            })}
                        {posts.filter((p) => p.status === 'published').length === 0 && (
                            <div className="text-center py-8 text-gray-500">No published posts yet</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Post Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gray-900 rounded-3xl p-8 w-full max-w-2xl border border-white/10 my-8"
                        >
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <Rocket className="text-purple-400" />
                                Schedule New Post
                            </h2>

                            <div className="space-y-6">
                                {/* Platform Selection */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Platform</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['instagram', 'tiktok', 'twitter'].map((p) => {
                                            const Icon = platformIcons[p];
                                            return (
                                                <button
                                                    key={p}
                                                    onClick={() => setNewPost({ ...newPost, platform: p })}
                                                    className={`p-4 rounded-xl border transition-all flex items-center justify-center gap-2 ${newPost.platform === p
                                                        ? 'border-purple-500 bg-purple-500/20'
                                                        : 'border-white/10 hover:border-white/30'
                                                        }`}
                                                >
                                                    <Icon size={20} />
                                                    <span className="capitalize">{p}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Post Type */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Content Type</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { type: 'image', icon: Image, label: 'Image' },
                                            { type: 'video', icon: Video, label: 'Video' },
                                            { type: 'carousel', icon: Image, label: 'Carousel' },
                                        ].map(({ type, icon: Icon, label }) => (
                                            <button
                                                key={type}
                                                onClick={() => setNewPost({ ...newPost, postType: type })}
                                                className={`p-3 rounded-xl border transition-all flex items-center justify-center gap-2 ${newPost.postType === type
                                                    ? 'border-purple-500 bg-purple-500/20'
                                                    : 'border-white/10 hover:border-white/30'
                                                    }`}
                                            >
                                                <Icon size={16} />
                                                <span>{label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* AI Caption Generator */}
                                <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-4 border border-purple-500/20">
                                    <label className="block text-sm text-purple-400 mb-2 flex items-center gap-2">
                                        <Wand2 size={14} />
                                        AI Caption Generator
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={aiPrompt}
                                            onChange={(e) => setAiPrompt(e.target.value)}
                                            placeholder="Describe your post topic..."
                                            className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-purple-500 transition-colors text-sm"
                                        />
                                        <button
                                            onClick={generateCaption}
                                            disabled={generating || !aiPrompt}
                                            className="px-4 py-2 bg-purple-600 rounded-lg font-semibold hover:bg-purple-500 transition-colors disabled:opacity-50 text-sm"
                                        >
                                            {generating ? 'Generating...' : 'Generate'}
                                        </button>
                                    </div>
                                </div>

                                {/* Caption */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Caption</label>
                                    <textarea
                                        value={newPost.caption}
                                        onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })}
                                        placeholder="Write your caption or use AI to generate..."
                                        rows={4}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-colors resize-none"
                                    />
                                </div>

                                {/* Schedule Time */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Schedule For</label>
                                    <input
                                        type="datetime-local"
                                        value={newPost.scheduledAt}
                                        onChange={(e) => setNewPost({ ...newPost, scheduledAt: e.target.value })}
                                        min={new Date().toISOString().slice(0, 16)}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-colors"
                                    />
                                </div>

                                {/* Auto-Boost Toggle */}
                                <div className="flex items-center justify-between p-4 bg-ruby-500/10 rounded-xl border border-ruby-500/20">
                                    <div>
                                        <div className="font-semibold flex items-center gap-2">
                                            <Rocket size={16} className="text-ruby-400" />
                                            Auto-Boost on Publish
                                        </div>
                                        <div className="text-sm text-gray-400">Automatically boost engagement when published</div>
                                    </div>
                                    <button
                                        onClick={() => setNewPost({ ...newPost, autoBoost: !newPost.autoBoost })}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${newPost.autoBoost ? 'bg-ruby-500' : 'bg-gray-700'
                                            }`}
                                    >
                                        <div
                                            className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${newPost.autoBoost ? 'translate-x-6' : 'translate-x-0.5'
                                                }`}
                                        />
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        resetForm();
                                    }}
                                    className="flex-1 py-3 border border-white/10 rounded-xl font-semibold hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={createPost}
                                    disabled={creating || !newPost.caption || !newPost.scheduledAt}
                                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {creating ? 'Scheduling...' : 'Schedule Post'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
