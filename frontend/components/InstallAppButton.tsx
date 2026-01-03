'use client';
import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

export default function InstallAppButton() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult: any) => {
            if (choiceResult.outcome === 'accepted') {
                setDeferredPrompt(null);
            }
        });
    };

    if (!deferredPrompt) return null;

    return (
        <button
            onClick={handleInstall}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider transition-colors"
        >
            <Download size={14} /> Install App
        </button>
    );
}
