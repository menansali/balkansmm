'use client';
import Link from 'next/link';
import { Copy, Terminal } from 'lucide-react';

export default function ApiDocsPage() {
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
                            Get API Key
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ruby-900/30 border border-ruby-500/30 text-ruby-400 text-xs font-bold uppercase tracking-widest mb-4">
                        <Terminal size={12} />
                        Developer API v2
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tighter">
                        Build <span className="text-ruby-500 shimmer-text">Faster</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Integrate our premium services directly into your application.
                    </p>
                </div>

                <div className="space-y-12">
                    {/* Endpoint: Service List */}
                    <div className="glass-card p-8 rounded-3xl border border-white/10">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg text-sm font-mono">POST</span>
                            /v2/services
                        </h2>
                        <p className="text-gray-400 mb-6">Retrieve the list of available services.</p>

                        <div className="bg-black/50 rounded-xl p-4 border border-white/5 font-mono text-sm relative group">
                            <button className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                                <Copy size={16} />
                            </button>
                            <div className="text-gray-500 select-none mb-2"># Request</div>
                            <div className="text-green-400">curl <span className="text-white">https://balkansmm.com/api/v2</span> \</div>
                            <div className="pl-4">-d &apos;key=YOUR_API_KEY&apos; \</div>
                            <div className="pl-4">-d &apos;action=services&apos;</div>

                            <div className="text-gray-500 select-none mt-6 mb-2"># Response</div>
                            <div className="text-yellow-400">
                                {`[`}<br />
                                &nbsp;&nbsp;{`{ "service": 1, "name": "Instagram Likes", "rate": "0.95", "min": 100, "max": 10000, "category": "Instagram" },`}<br />
                                &nbsp;&nbsp;{`...`}<br />
                                {`]`}
                            </div>
                        </div>
                    </div>

                    {/* Endpoint: Add Order */}
                    <div className="glass-card p-8 rounded-3xl border border-white/10">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg text-sm font-mono">POST</span>
                            /v2/add
                        </h2>
                        <p className="text-gray-400 mb-6">Place a new order.</p>

                        <div className="bg-black/50 rounded-xl p-4 border border-white/5 font-mono text-sm relative group">
                            <div className="text-gray-500 select-none mb-2"># Request</div>
                            <div className="text-green-400">curl <span className="text-white">https://balkansmm.com/api/v2</span> \</div>
                            <div className="pl-4">-d &apos;key=YOUR_API_KEY&apos; \</div>
                            <div className="pl-4">-d &apos;action=add&apos; \</div>
                            <div className="pl-4">-d &apos;service=1&apos; \</div>
                            <div className="pl-4">-d &apos;link=https://instagram.com/p/...&apos; \</div>
                            <div className="pl-4">-d &apos;quantity=1000&apos;</div>

                            <div className="text-gray-500 select-none mt-6 mb-2"># Response</div>
                            <div className="text-yellow-400">
                                {`{ "order": 102931 }`}
                            </div>
                        </div>
                    </div>

                    {/* Endpoint: Order Status */}
                    <div className="glass-card p-8 rounded-3xl border border-white/10">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                            <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg text-sm font-mono">POST</span>
                            /v2/status
                        </h2>
                        <p className="text-gray-400 mb-6">Check the status of an existing order.</p>

                        <div className="bg-black/50 rounded-xl p-4 border border-white/5 font-mono text-sm relative group">
                            <div className="text-gray-500 select-none mb-2"># Request</div>
                            <div className="text-green-400">curl <span className="text-white">https://balkansmm.com/api/v2</span> \</div>
                            <div className="pl-4">-d &apos;key=YOUR_API_KEY&apos; \</div>
                            <div className="pl-4">-d &apos;action=status&apos; \</div>
                            <div className="pl-4">-d &apos;order=102931&apos;</div>

                            <div className="text-gray-500 select-none mt-6 mb-2"># Response</div>
                            <div className="text-yellow-400">
                                {`{ "status": "Pending", "start_count": 12, "remains": 500 }`}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
