'use client';
import { motion } from 'framer-motion';

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] rounded ${className}`}
            style={{ animation: 'shimmer 1.5s infinite' }}
        />
    );
}

export function SkeletonCard() {
    return (
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-32" />
        </div>
    );
}

export function SkeletonRow() {
    return (
        <div className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/5">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
    );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
    return (
        <div className="rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-white/5">
                <Skeleton className="h-6 w-48" />
            </div>
            <div className="divide-y divide-white/5">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="w-8 h-8 rounded" />
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                        </div>
                        <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function SkeletonGraph() {
    return (
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="h-48 flex items-end gap-2">
                {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${((i * 37) % 60) + 20}%` }}
                        transition={{ duration: 0.5, delay: i * 0.05 }}
                        className="flex-1 bg-gradient-to-t from-white/10 to-white/5 rounded-t"
                    />
                ))}
            </div>
        </div>
    );
}

export function SkeletonServiceList() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, j) => (
                            <div key={j} className="p-4 rounded-xl border border-white/5 bg-white/5">
                                <div className="flex justify-between mb-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                                <div className="flex gap-4">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export function SkeletonDashboard() {
    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-6 w-24" />
            </div>

            {/* Progress bar */}
            <Skeleton className="h-2 w-full rounded-full" />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <SkeletonGraph />
                </div>
                <div className="space-y-6">
                    <SkeletonRow />
                    <SkeletonRow />
                </div>
            </div>
        </div>
    );
}
