import { Metadata } from 'next';
import Link from 'next/link';
import { blogPosts } from '../../lib/blog-posts';
import { ArrowRight, Calendar, User, Tag } from 'lucide-react';

export const metadata: Metadata = {
    title: 'SMM Blog & Social Media Tips | BalkanSMM',
    description: 'Expert guides, strategies, and news about Social Media Marketing, TikTok growth, Instagram algorithms, and YouTube monetization.',
    openGraph: {
        title: 'SMM Blog & Social Media Tips | BalkanSMM',
        description: 'Read the latest expert strategies for social media growth.',
        type: 'website',
    }
};

export default function BlogIndex() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-ruby-500/30">
            {/* Navbar Placeholder - Ideally should be a component */}
            <nav className="fixed w-full z-50 top-6 px-6 pointer-events-none">
                <div className="max-w-5xl mx-auto h-16 rounded-full glass-card px-8 flex items-center justify-between bg-black/40 backdrop-blur-xl border border-white/10 pointer-events-auto">
                    <Link href="/" className="font-bold tracking-tight text-lg">BALKAN<span className="text-gray-400 font-light">SMM</span></Link>
                    <Link href="/register" className="px-5 py-2 rounded-full bg-white text-black text-sm font-medium">Get Started</Link>
                </div>
            </nav>

            <header className="pt-40 pb-20 px-6 text-center max-w-4xl mx-auto">
                <h1 className="text-5xl md:text-7xl font-sans font-light mb-6">Values & <span className="font-serif italic text-gray-500">Insights</span></h1>
                <p className="text-xl text-gray-400 font-light">Master the art of digital influence with our expert breakdown of algorithms and trends.</p>
            </header>

            <section className="px-6 pb-32 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogPosts.map((post) => (
                        <Link href={`/blog/${post.slug}`} key={post.slug} className="group">
                            <article className="h-full glass-card rounded-3xl overflow-hidden border border-white/5 hover:border-ruby-500/30 transition-all hover:bg-white/5 flex flex-col">
                                <div className="aspect-[16/10] overflow-hidden relative">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-xs font-bold uppercase tracking-widest text-white border border-white/10">
                                        {post.category}
                                    </div>
                                </div>
                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 font-mono">
                                        <div className="flex items-center gap-1"><Calendar size={12} /> {post.date}</div>
                                        <div className="flex items-center gap-1"><User size={12} /> {post.author}</div>
                                    </div>
                                    <h2 className="text-2xl font-bold mb-3 leading-tight group-hover:text-ruby-400 transition-colors">
                                        {post.title}
                                    </h2>
                                    <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3">
                                        {post.excerpt}
                                    </p>
                                    <div className="mt-auto pt-6 border-t border-white/5 flex items-center text-sm font-medium text-white group-hover:translate-x-2 transition-transform">
                                        Read Article <ArrowRight size={16} className="ml-2" />
                                    </div>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
