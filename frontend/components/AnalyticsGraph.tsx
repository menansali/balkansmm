'use client';

export default function AnalyticsGraph() {
    return (
        <div className="w-full h-32 flex items-end justify-between gap-1 px-2 pt-8 relative">
            <div className="absolute top-0 left-0 text-xs text-gray-500 uppercase tracking-widest font-bold">Estimated Reach (Simulated)</div>
            {[30, 45, 35, 60, 50, 75, 60, 80, 70, 90, 85, 100].map((h, i) => (
                <div key={i} className="flex-1 bg-gradient-to-t from-ruby-900/50 to-ruby-500 rounded-t-sm hover:opacity-80 transition-opacity" style={{ height: `${h}%` }}></div>
            ))}
        </div>
    );
}
