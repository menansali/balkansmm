import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { blogPosts } from '../../../lib/blog-posts';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import Image from 'next/image';

interface Props {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const slug = (await params).slug;
    const post = blogPosts.find(p => p.slug === slug);
    if (!post) return { title: 'Not Found' };

    return {
        title: `${post.title} | BalkanSMM Blog`,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            type: 'article',
            publishedTime: post.date,
            authors: [post.author],
            images: [post.image],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt,
            images: [post.image],
        }
    };
}

export default async function BlogPostPage({ params }: Props) {
    const slug = (await params).slug;
    const post = blogPosts.find(p => p.slug === slug);
    if (!post) notFound();

    // JSON-LD for Google Structure Data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        image: [post.image],
        datePublished: post.date,
        author: [{
            '@type': 'Person',
            name: post.author,
        }]
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-ruby-500/30">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <nav className="fixed w-full z-50 top-0 left-0 p-6 pointer-events-none">
                <Link href="/blog" className="pointer-events-auto inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors text-sm font-medium">
                    <ArrowLeft size={16} /> Back to Blog
                </Link>
            </nav>

            <article className="pt-32 pb-20">
                <header className="max-w-4xl mx-auto px-6 text-center mb-16">
                    <div className="inline-block px-4 py-1 rounded-full border border-ruby-500/30 bg-ruby-500/10 text-ruby-400 text-xs font-bold uppercase tracking-widest mb-6">
                        {post.category}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-sans font-bold mb-8 leading-tight">
                        {post.title}
                    </h1>
                    <div className="flex items-center justify-center gap-6 text-gray-500 text-sm font-mono border-y border-white/10 py-4 max-w-lg mx-auto">
                        <span className="flex items-center gap-2"><User size={14} /> {post.author}</span>
                        <span className="w-px h-4 bg-white/10"></span>
                        <span className="flex items-center gap-2"><Calendar size={14} /> {post.date}</span>
                    </div>
                </header>

                <div className="max-w-5xl mx-auto px-6 mb-16">
                    <div className="aspect-[21/9] rounded-3xl overflow-hidden border border-white/10 relative group">
                        <Image src={post.image} alt={post.title} fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto px-6">
                    <div
                        className="prose prose-invert prose-lg prose-headings:font-sans prose-headings:font-light prose-p:text-gray-400 prose-p:leading-relaxed prose-a:text-ruby-400 hover:prose-a:text-ruby-300"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </div>
            </article>

            <footer className="border-t border-white/5 py-20 mt-20 text-center">
                <h3 className="text-2xl font-light mb-6">Ready to go viral?</h3>
                <Link href="/register">
                    <button className="px-8 py-4 rounded-full bg-white text-black font-medium hover:scale-105 transition-transform">
                        Start Your Campaign
                    </button>
                </Link>
            </footer>
        </div>
    );
}
