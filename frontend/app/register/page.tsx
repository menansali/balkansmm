'use client';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../lib/api';

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/register', { name, email, password });
            if (res.data.access_token) {
                localStorage.setItem('token', res.data.access_token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                toast.success('Registration successful! Welcome aboard.');
                router.push('/dashboard');
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Registration failed. Please try again.';
            setError(msg);
            toast.error(msg);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden aurora-bg text-white">
            <div className="absolute inset-0 z-0 bg-[url('/grid.svg')] opacity-10"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-md p-8 bg-black/50 backdrop-blur-xl border border-ruby-500/30 rounded-2xl shadow-[0_0_50px_rgba(224,17,95,0.2)]"
            >
                <h2 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-ruby-400 to-ruby-600">
                    Create Account
                </h2>

                {error && <div className="mb-4 p-3 bg-red-500/20 text-red-200 rounded text-sm text-center">{error}</div>}

                <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-ruby-500 transition-colors"
                            placeholder="Your full name"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-ruby-500 transition-colors"
                            placeholder="email@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-ruby-500 transition-colors"
                            placeholder="Secure password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-ruby-600 to-ruby-800 rounded-lg font-bold hover:from-ruby-500 hover:to-ruby-700 transition-all shadow-lg shadow-ruby-900/40"
                    >
                        Get Started
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-400">
                    Already have an account?{' '}
                    <Link href="/login" className="text-ruby-400 hover:text-ruby-300 transition-colors">
                        Sign In
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
