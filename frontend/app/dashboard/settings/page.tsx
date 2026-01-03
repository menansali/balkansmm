'use client';
import { useState, useEffect } from 'react';
import { User, Mail, Lock, Save, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../lib/api';

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null);
    const [name, setName] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Fetch current user details
        const fetchUser = async () => {
            // We can use /auth/profile to get fresh data
            try {
                const res = await api.get('/auth/profile');
                setUser(res.data);
                setName(res.data.name || '');
            } catch (e) {
                toast.error("Failed to load profile");
            }
        };
        fetchUser();
    }, []);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.patch(`/users/${user.id}`, { name });
            toast.success("Profile updated successfully");
            // Update local storage if needed
            const stored = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...stored, name }));
        } catch (e) {
            toast.error("Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPassword) return;
        setIsLoading(true);
        try {
            // Note: In a real app we should verify current password first on backend
            // Here we just update it.
            await api.patch(`/users/${user.id}`, { password: newPassword });
            toast.success("Password updated successfully");
            setNewPassword('');
            setCurrentPassword('');
        } catch (e) {
            toast.error("Failed to update password");
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <header>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <User className="text-ruby-500" />
                    Account Settings
                </h1>
                <p className="text-gray-400 mt-2">Manage your profile and security preferences.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Profile Card */}
                <div className="glass-card p-8 rounded-3xl border border-white/10 space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <User size={20} className="text-gray-400" />
                        Profile Information
                    </h2>

                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-2">Full Name</label>
                            <div className="relative">
                                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:border-ruby-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-2">Email Address</label>
                            <div className="relative opacity-50">
                                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="email"
                                    value={user.email}
                                    disabled
                                    className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-3 cursor-not-allowed"
                                />
                            </div>
                            <p className="text-[10px] text-gray-500 mt-1">Email cannot be changed.</p>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
                            >
                                <Save size={16} /> Save Changes
                            </button>
                        </div>
                    </form>
                </div>

                {/* Security Card */}
                <div className="glass-card p-8 rounded-3xl border border-white/10 space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Shield size={20} className="text-gray-400" />
                        Security
                    </h2>

                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-2">New Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:border-ruby-500 transition-colors"
                                    placeholder="Enter new password"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isLoading || !newPassword}
                                className="bg-ruby-600/20 hover:bg-ruby-600/30 text-ruby-400 border border-ruby-500/30 px-6 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
                            >
                                <Lock size={16} /> Update Password
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* API Key Link Hint */}
            <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <Shield size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-blue-400">Developer API Key</h3>
                        <p className="text-xs text-gray-400">Need to automate your orders? Generate an API key.</p>
                    </div>
                </div>
                <button
                    onClick={() => window.location.href = '/dashboard/api'}
                    className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-sm font-bold transition-colors"
                >
                    Manage Keys
                </button>
            </div>
        </div>
    );
}
