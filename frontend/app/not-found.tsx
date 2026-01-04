import Link from 'next/link';
import { CloudOff } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden relative">
            {/* Ambient Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-ruby-900/20 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="z-10 text-center flex flex-col items-center space-y-6">
                <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                    <CloudOff size={48} className="text-gray-400" />
                </div>

                <h1 className="text-6xl md:text-8xl font-bold tracking-tighter">404</h1>
                <h2 className="text-2xl md:text-3xl font-light text-gray-300">Lost in the Clouds?</h2>
                <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                    The page you are looking for has been moved, deleted, or possibly never existed in this dimension.
                </p>

                <div className="pt-8">
                    <Link href="/">
                        <button className="px-8 py-3 rounded-full bg-white text-black font-bold hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                            Return Home
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
