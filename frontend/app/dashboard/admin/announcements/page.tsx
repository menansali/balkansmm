'use client';
import { useState, useEffect } from 'react';
import { Megaphone, Trash2, Plus, Bell } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../../lib/api';

type Announcement = {
    id: number;
    message: string;
    type: string;
    isActive: boolean;
    createdAt: string;
};

export default function AdminAnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [message, setMessage] = useState('');
    const [type, setType] = useState('info'); // info, warning, success

    const loadAnnouncements = async () => {
        try {
            const res = await api.get('/admin/announcements/all');
            setAnnouncements(res.data);
        } catch {
            toast.error('Failed to load announcements');
        }
    };

    useEffect(() => {
        queueMicrotask(() => loadAnnouncements());
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/admin/announcements', { message, type });
            toast.success('Announcement published');
            setMessage('');
            loadAnnouncements();
        } catch {
            toast.error('Failed to create');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this announcement?')) return;
        try {
            await api.delete(`/admin/announcements/${id}`);
            toast.success('Deleted');
            loadAnnouncements();
        } catch {
            toast.error('Failed to delete');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Megaphone className="text-ruby-500" />
                    Broadcast System
                </h1>
                <p className="text-gray-400 mt-2">Send announcements to all user dashboards.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Create Form */}
                <div className="glass-card p-6 rounded-2xl border border-white/10">
                    <h2 className="font-bold text-lg mb-4">New Announcement</h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-500">Message</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-ruby-500 h-32 resize-none"
                                placeholder="e.g., We are experiencing delays with Instagram..."
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-500">Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white"
                            >
                                <option value="info">Info (Blue)</option>
                                <option value="warning">Warning (Yellow)</option>
                                <option value="success">Success (Green)</option>
                                <option value="alert">Alert (Red)</option>
                            </select>
                        </div>
                        <button className="w-full py-3 bg-ruby-500 rounded-xl font-bold hover:bg-ruby-600 transition-colors flex items-center justify-center gap-2">
                            <Plus size={18} /> Publish
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="space-y-4">
                    <h2 className="font-bold text-lg">Active Broadcasts</h2>
                    {announcements.map(a => (
                        <div key={a.id} className="glass-card p-4 rounded-xl border border-white/10 flex justify-between items-start gap-3">
                            <div className="flex gap-3">
                                <div className={`mt-1 p-2 rounded-lg ${a.type === 'warning' ? 'bg-yellow-500/20 text-yellow-500' :
                                        a.type === 'success' ? 'bg-green-500/20 text-green-500' :
                                            a.type === 'alert' ? 'bg-red-500/20 text-red-500' :
                                                'bg-blue-500/20 text-blue-500'
                                    }`}>
                                    <Bell size={16} />
                                </div>
                                <div>
                                    <p className="font-medium text-sm leading-relaxed">{a.message}</p>
                                    <p className="text-[10px] text-gray-500 mt-1">{new Date(a.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(a.id)}
                                className="text-gray-500 hover:text-red-500 transition-colors p-2"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    {announcements.length === 0 && (
                        <div className="p-8 text-center text-gray-500 text-sm border border-dashed border-white/10 rounded-xl">
                            No active announcements.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
