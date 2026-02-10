'use client';
import { useState, useEffect } from 'react';
import { Edit2, X, Search, DollarSign, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

type UserRow = { id: number; email: string; name?: string; role: string; balance: number };

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editingUser, setEditingUser] = useState<UserRow | null>(null);

    const [formData, setFormData] = useState({
        balance: 0,
        role: 'user'
    });

    const loadUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data);
            setIsLoading(false);
        } catch {
            toast.error("Failed to load users");
            setIsLoading(false);
        }
    };

    useEffect(() => {
        queueMicrotask(() => loadUsers());
    }, []);

    const handleEditClick = (user: UserRow) => {
        setEditingUser(user);
        setFormData({
            balance: user.balance,
            role: user.role
        });
    };

    const handleSave = async () => {
        if (!editingUser) return;
        try {
            await api.patch(`/admin/users/${editingUser.id}`, {
                balance: Number(formData.balance),
                role: formData.role
            });
            toast.success("User updated successfully");
            setEditingUser(null);
            loadUsers(); // Refresh
        } catch {
            toast.error("Failed to update user");
        }
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.id.toString().includes(search)
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">User Management</h1>
                    <p className="text-gray-400">Manage balances and permissions.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 focus:border-ruby-500 outline-none w-64 transition-colors"
                    />
                </div>
            </header>

            <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 text-xs text-gray-400 uppercase tracking-widest">
                                <th className="p-4">ID</th>
                                <th className="p-4">User</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Balance</th>
                                <th className="p-4">Created</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">Loading users...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">No users found.</td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-mono text-gray-500">#{user.id}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-ruby-500 to-purple-600 flex items-center justify-center font-bold text-xs">
                                                    {user.name?.[0] || user.email[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold">{user.name || 'No Name'}</div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                                                ${user.role === 'admin' ? 'bg-ruby-500/20 text-ruby-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 font-mono font-bold text-green-400">
                                            ${user.balance.toFixed(2)}
                                        </td>
                                        <td className="p-4 text-gray-500 text-xs">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleEditClick(user)}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md bg-[#111] border border-white/10 p-6 rounded-2xl shadow-xl space-y-6 relative"
                        >
                            <button
                                onClick={() => setEditingUser(null)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-white"
                            >
                                <X size={20} />
                            </button>

                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Edit2 size={20} className="text-ruby-500" />
                                Edit User
                            </h2>

                            <div className="space-y-4">
                                <div className="p-3 bg-white/5 rounded-xl text-sm border border-white/5">
                                    <p className="text-gray-400 text-xs">Editing</p>
                                    <p className="font-bold">{editingUser.email}</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                        <DollarSign size={14} /> Balance
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.balance}
                                        onChange={e => setFormData({ ...formData, balance: parseFloat(e.target.value) })}
                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-green-500 outline-none font-mono"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                        <Shield size={14} /> Role
                                    </label>
                                    <select
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 focus:border-ruby-500 outline-none appearance-none"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setEditingUser(null)}
                                    className="flex-1 py-3 rounded-xl font-bold border border-white/10 hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex-1 py-3 bg-ruby-600 hover:bg-ruby-500 rounded-xl font-bold transition-colors text-white shadow-lg shadow-ruby-900/20"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
