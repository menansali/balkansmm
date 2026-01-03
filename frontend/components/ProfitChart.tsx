'use client';

export default function ProfitChart() {
    return (
        <div className="h-64 flex items-end justify-between gap-2 px-4 pb-4">
            {[35, 45, 30, 60, 75, 50, 80].map((h, i) => (
                <div key={i} className="w-full bg-white/5 rounded-t-lg relative group overflow-hidden">
                    <div
                        className="absolute bottom-0 w-full bg-gradient-to-t from-green-500/50 to-emerald-400/50 transition-all duration-500 group-hover:opacity-100"
                        style={{ height: `${h}%` }}
                    ></div>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold text-green-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        +${h * 12}
                    </div>
                </div>
            ))}
        </div>
    );
}
