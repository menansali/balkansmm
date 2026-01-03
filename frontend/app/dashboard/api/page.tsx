'use client';
import { useState } from 'react';
import { Key, Copy, Check, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../../lib/api';

export default function ApiPage() {
    const [apiKey, setApiKey] = useState('********************************');
    const [revealed, setRevealed] = useState(false);
    const [copied, setCopied] = useState(false);

    const generateKey = async () => {
        // In real app, call API to generate/fetch key
        // For now, mock it
        const mockKey = 'bsmm_' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
        setApiKey(mockKey);
        setRevealed(true);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Key className="text-ruby-500" />
                    Developer API
                </h1>
                <p className="text-gray-400 mt-2">Connect your SMM panel directly to BalkanSMM for instant automation.</p>
            </header>

            <div className="glass-card p-8 rounded-3xl border border-white/10 space-y-6">
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-start gap-3">
                    <ShieldAlert className="text-yellow-500 shrink-0" />
                    <div>
                        <h4 className="font-bold text-yellow-500 text-sm">Security Warning</h4>
                        <p className="text-xs text-yellow-200/60 mt-1">
                            Your API Key grants full access to your funds. Never share this key with anyone.
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Your API Key</label>
                    <div className="flex gap-2">
                        <div className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-4 font-mono text-gray-300 relative overflow-hidden">
                            {revealed ? apiKey : '••••••••••••••••••••••••••••••••'}
                            {!revealed && (
                                <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm">
                                    <span className="text-xs text-gray-500">Hidden for security</span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={revealed ? copyToClipboard : generateKey}
                            className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl px-6 transition-colors font-bold flex items-center gap-2"
                        >
                            {revealed ? (copied ? <Check size={18} /> : <Copy size={18} />) : 'Generate'}
                            {revealed ? (copied ? 'Copied' : 'Copy') : 'Generate'}
                        </button>
                    </div>
                </div>

                <div className="pt-6 border-t border-white/10">
                    <h3 className="font-bold mb-4">API Documentation</h3>
                    <div className="space-y-4">
                        <div className="bg-black/30 p-4 rounded-xl border border-white/5 font-mono text-sm space-y-2">
                            <div className="text-gray-500"># Endpoint</div>
                            <div className="text-green-400">POST https://balkansmm.com/api/v2</div>
                            <div className="text-gray-500 mt-4"># Payload (Place Order)</div>
                            <pre className="text-blue-300 overflow-x-auto">
                                {`{
  "key": "YOUR_API_KEY",
  "action": "add",
  "service": 123,
  "link": "https://instagram.com/p/...",
  "quantity": 1000
}`}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
