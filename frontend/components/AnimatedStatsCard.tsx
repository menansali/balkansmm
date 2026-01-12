'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface AnimatedStatsCardProps {
    title: string;
    value: number;
    prefix?: string;
    suffix?: string;
    color: 'ruby' | 'blue' | 'purple' | 'emerald' | 'gold';
    trend?: number;
    sparklineData?: number[];
    icon?: React.ReactNode;
}

export default function AnimatedStatsCard({
    title,
    value,
    prefix = '',
    suffix = '',
    color,
    trend,
    sparklineData,
    icon,
}: AnimatedStatsCardProps) {
    const [displayValue, setDisplayValue] = useState(0);
    const countRef = useRef<NodeJS.Timeout | null>(null);

    const colorMap = {
        ruby: {
            bg: 'from-ruby-500/20 via-ruby-900/10 to-transparent',
            border: 'border-ruby-500/30',
            text: 'text-ruby-400',
            glow: 'shadow-ruby-500/20',
            sparkline: '#e11d48',
        },
        blue: {
            bg: 'from-blue-500/20 via-blue-900/10 to-transparent',
            border: 'border-blue-500/30',
            text: 'text-blue-400',
            glow: 'shadow-blue-500/20',
            sparkline: '#3b82f6',
        },
        purple: {
            bg: 'from-purple-500/20 via-purple-900/10 to-transparent',
            border: 'border-purple-500/30',
            text: 'text-purple-400',
            glow: 'shadow-purple-500/20',
            sparkline: '#a855f7',
        },
        emerald: {
            bg: 'from-emerald-500/20 via-emerald-900/10 to-transparent',
            border: 'border-emerald-500/30',
            text: 'text-emerald-400',
            glow: 'shadow-emerald-500/20',
            sparkline: '#10b981',
        },
        gold: {
            bg: 'from-yellow-500/20 via-yellow-900/10 to-transparent',
            border: 'border-yellow-500/30',
            text: 'text-yellow-400',
            glow: 'shadow-yellow-500/20',
            sparkline: '#eab308',
        },
    };

    const colors = colorMap[color];

    useEffect(() => {
        const duration = 1500;
        const steps = 60;
        const increment = value / steps;
        let current = 0;
        let step = 0;

        countRef.current = setInterval(() => {
            step++;
            current = Math.min(value, increment * step);
            setDisplayValue(current);

            if (step >= steps) {
                clearInterval(countRef.current!);
                setDisplayValue(value);
            }
        }, duration / steps);

        return () => {
            if (countRef.current) clearInterval(countRef.current);
        };
    }, [value]);

    const formatValue = (val: number) => {
        if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
        if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
        return val.toFixed(prefix === '$' ? 2 : 0);
    };

    const renderSparkline = () => {
        if (!sparklineData || sparklineData.length < 2) return null;

        const max = Math.max(...sparklineData);
        const min = Math.min(...sparklineData);
        const range = max - min || 1;
        const width = 100;
        const height = 30;

        const points = sparklineData
            .map((val, i) => {
                const x = (i / (sparklineData.length - 1)) * width;
                const y = height - ((val - min) / range) * height;
                return `${x},${y}`;
            })
            .join(' ');

        return (
            <svg className="absolute bottom-3 right-3 opacity-50" width={width} height={height}>
                <polyline
                    fill="none"
                    stroke={colors.sparkline}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                />
            </svg>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`relative overflow-hidden p-6 rounded-2xl border bg-gradient-to-br backdrop-blur-md shadow-lg ${colors.bg} ${colors.border} ${colors.glow} group`}
        >
            {/* Animated glow effect */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 bg-gradient-to-br ${colors.bg}`} />

            {/* Icon */}
            {icon && (
                <div className={`absolute top-4 right-4 ${colors.text} opacity-20 group-hover:opacity-40 transition-opacity`}>
                    {icon}
                </div>
            )}

            <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                {title}
                {trend !== undefined && (
                    <span className={`flex items-center gap-0.5 text-xs font-bold ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {Math.abs(trend).toFixed(1)}%
                    </span>
                )}
            </h3>

            <motion.p
                key={displayValue}
                className={`text-4xl font-bold ${colors.text} font-mono tabular-nums`}
            >
                {prefix}{formatValue(displayValue)}{suffix}
            </motion.p>

            {renderSparkline()}
        </motion.div>
    );
}
