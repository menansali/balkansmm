'use client';
import { useRef, useState } from 'react';
import html2canvas from 'html2canvas'; // Make sure this is installed
import { Download, Camera, Check, Clock } from 'lucide-react';

export default function ScreenshotGenerator({ order }: { order: any }) {
    const receiptRef = useRef<HTMLDivElement>(null);
    const [generating, setGenerating] = useState(false);

    const handleDownload = async () => {
        if (!receiptRef.current) return;
        setGenerating(true);
        try {
            const canvas = await html2canvas(receiptRef.current, {
                backgroundColor: '#000000',
                scale: 2, // High res
            });
            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `Receipt-Order-${order.id}.png`;
            link.click();
        } catch (e) {
            console.error(e);
        }
        setGenerating(false);
    };

    return (
        <div>
            {/* The Actual Receipt (Hidden off-screen usually, but we show it here for now or just render hidden) */}
            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                <div ref={receiptRef} className="w-[400px] bg-black text-white p-8 font-sans border-t-4 border-ruby-500">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold tracking-tighter">BALKAN<span className="text-ruby-500">SMM</span></h2>
                        <div className="text-xs text-gray-500 uppercase tracking-widest">Official Receipt</div>
                    </div>

                    <div className="space-y-6 mb-8">
                        <div>
                            <div className="text-gray-500 text-xs uppercase mb-1">Service</div>
                            <div className="font-medium text-lg leading-snug">{order.service.name}</div>
                        </div>
                        <div>
                            <div className="text-gray-500 text-xs uppercase mb-1">Link</div>
                            <div className="font-mono text-xs text-gray-300 break-all bg-gray-900 p-2 rounded">{order.link}</div>
                        </div>
                        <div className="flex justify-between">
                            <div>
                                <div className="text-gray-500 text-xs uppercase mb-1">Quantity</div>
                                <div className="font-bold text-xl">{order.quantity.toLocaleString()}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-gray-500 text-xs uppercase mb-1">Start Count</div>
                                <div className="font-bold text-xl">0</div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 pt-6 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            {order.status === 'completed' ? (
                                <div className="w-8 h-8 rounded-full bg-green-900/30 flex items-center justify-center text-green-500"><Check size={16} /></div>
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-500"><Clock size={16} /></div>
                            )}
                            <div>
                                <div className="font-bold capitalize">{order.status}</div>
                                <div className="text-xs text-gray-500">{new Date().toLocaleDateString()}</div>
                            </div>
                        </div>
                        <div className="text-xs text-gray-600">ID: #{order.id}992</div>
                    </div>
                </div>
            </div>

            <button
                onClick={handleDownload}
                disabled={generating}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-gray-300 transition-colors"
            >
                {generating ? 'Saving...' : <><Camera size={14} /> Receipt</>}
            </button>
        </div>
    );
}
