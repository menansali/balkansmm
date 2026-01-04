'use client';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function LandingNavbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed w-full z-50 top-0 left-0 p-4 md:p-6">
            <div className="max-w-5xl mx-auto h-16 rounded-full glass-card px-6 md:px-8 flex items-center justify-between bg-black/40 backdrop-blur-xl border border-white/10 relative z-50">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-ruby-500 shadow-[0_0_10px_#9f1239]"></div>
                        <span className="font-sans font-bold tracking-tight text-lg text-white">BALKAN<span className="text-gray-400 font-light">SMM</span></span>
                    </Link>
                </div>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8 text-sm font-light text-gray-300">
                    <Link href="/services" className="hover:text-white transition-colors">Services</Link>
                    <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
                    <Link href="/api" className="hover:text-white transition-colors">API</Link>
                    <Link href="/support" className="hover:text-white transition-colors">Support</Link>
                </div>

                {/* Desktop Buttons */}
                <div className="hidden md:flex items-center gap-4">
                    <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-2">
                        Login
                    </Link>
                    <Link href="/register" className="px-6 py-2 rounded-full bg-white text-black hover:bg-gray-200 transition-all font-medium text-sm">
                        Get Started
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-20 left-4 right-4 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 flex flex-col gap-4 md:hidden shadow-2xl z-40"
                    >
                        <Link href="/services" className="text-lg font-medium text-gray-200">Services</Link>
                        <Link href="/blog" className="text-lg font-medium text-gray-200">Blog</Link>
                        <Link href="/api" className="text-lg font-medium text-gray-200">API</Link>
                        <Link href="/support" className="text-lg font-medium text-gray-200">Support</Link>
                        <hr className="border-white/10" />
                        <div className="flex gap-4">
                            <Link href="/login" className="flex-1 py-3 text-center rounded-xl bg-white/5 border border-white/5 font-bold text-white">Login</Link>
                            <Link href="/register" className="flex-1 py-3 text-center rounded-xl bg-white text-black font-bold">Get Started</Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
