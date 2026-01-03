export default function DashboardCard({ title, value, color }: { title: string, value: string, color: string }) {
    const colors: any = {
        ruby: 'from-ruby-500/20 to-ruby-900/10 border-ruby-500/30 text-ruby-400',
        blue: 'from-blue-500/20 to-blue-900/10 border-blue-500/30 text-blue-400',
        purple: 'from-purple-500/20 to-purple-900/10 border-purple-500/30 text-purple-400',
        emerald: 'from-emerald-500/20 to-emerald-900/10 border-emerald-500/30 text-emerald-400',
    };

    // Fallback to blue if color not found
    const colorClasses = colors[color] || colors['blue'];
    const textColor = colorClasses.split(' ').pop();

    return (
        <div className={`p-6 rounded-2xl border bg-gradient-to-br backdrop-blur-md ${colorClasses}`}>
            <h3 className="text-sm font-medium text-gray-400 mb-1">{title}</h3>
            <p className={`text-4xl font-bold ${textColor}`}>{value}</p>
        </div>
    );
}
