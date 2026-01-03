'use client';
import Link from 'next/link';
import { Mail, MessageCircle, Phone, LifeBuoy } from 'lucide-react';

export default function SupportPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-ruby-500/30">
            {/* Navbar (Simplified) */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold tracking-tight">
                        Balkan<span className="text-ruby-500">SMM</span>
                    </Link>
                    <div className="flex items-center gap-6">
                        <Link href="/login" className="text-sm font-medium hover:text-white/80 transition-colors">Login</Link>
                        <Link href="/register" className="px-5 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:bg-gray-200 transition-colors">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
                        <LifeBuoy size={12} />
                        24/7 Support
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tighter">
                        We are here to <span className="text-ruby-500 shimmer-text">Help</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Need assistance? Our team is ready to answer your questions.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Live Chat */}
                    <div className="glass-card p-8 rounded-3xl border border-white/10 hover:bg-white/5 transition-colors group cursor-pointer">
                        <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <MessageCircle size={24} />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Live Chat</h2>
                        <p className="text-gray-400 mb-4">Chat with our agents instantly via WhatsApp.</p>
                        <span className="text-green-400 font-bold text-sm uppercase tracking-wide">Start Chat →</span>
                    </div>

                    {/* Email */}
                    <div className="glass-card p-8 rounded-3xl border border-white/10 hover:bg-white/5 transition-colors group cursor-pointer">
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Mail size={24} />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Email Support</h2>
                        <p className="text-gray-400 mb-4">Send us an email and we'll reply within 24h.</p>
                        <a href="mailto:support@balkansmm.com" className="text-blue-400 font-bold text-sm uppercase tracking-wide">support@balkansmm.com</a>
                    </div>
                </div>

                <div className="mt-12 glass-card p-8 rounded-3xl border border-white/10 text-center">
                    <h3 className="text-xl font-bold mb-4">Already have an account?</h3>
                    <p className="text-gray-400 mb-6">For faster resolution, please open a ticket from your dashboard.</p>
                    <Link href="/dashboard/support" className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors">
                        Open Ticket
                    </Link>
                </div>

            </main>
        </div>
    );
}
