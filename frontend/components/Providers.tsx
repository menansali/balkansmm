'use client';
import { Toaster } from 'react-hot-toast';
import CursorFollower from '@/components/CursorFollower';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <>
            <CursorFollower />
            <Toaster
                position="top-right"
                toastOptions={{
                    className: '!bg-black/80 !backdrop-blur-xl !border !border-white/10 !text-white !rounded-xl',
                    duration: 4000
                }}
            />
            {children}
        </>
    );
}
