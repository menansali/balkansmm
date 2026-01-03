'use client';
import { useState } from 'react';
import { Copy, Check, Bitcoin } from 'lucide-react';

export default function CryptoPaymentPage() {
    const [copied, setCopied] = useState(false);

    // In a real app, you would generate a unique specific address for each transaction
    // using Coinbase Commerce or BitPay API.
    const WALLET_ADDRESS = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";

    const copyToClipboard = () => {
        navigator.clipboard.writeText(WALLET_ADDRESS);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <header className="text-center">
                <h1 className="text-3xl font-bold mb-2">Deposit with Crypto</h1>
                <p className="text-gray-400">Pay securely with Bitcoin, USDT, or ETH. 10% Bonus applied automatically.</p>
            </header>

            <div className="glass-card p-8 rounded-3xl border border-ruby-500/20 bg-gradient-to-br from-black to-ruby-900/10">
                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 shadow-[0_0_30px_rgba(255,165,0,0.3)]">
                        <Bitcoin size={32} />
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-bold tracking-widest text-gray-500 uppercase block mb-3">Send BTC to this address</label>
                        <div onClick={copyToClipboard} className="flex items-center justify-between p-4 bg-black/40 border border-white/10 rounded-xl cursor-pointer hover:border-white/30 transition-colors group">
                            <span className="font-mono text-sm break-all text-white/90">{WALLET_ADDRESS}</span>
                            <div className={`p-2 rounded-lg transition-colors ${copied ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-400 group-hover:text-white'}`}>
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                            </div>
                        </div>
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl text-sm text-yellow-200/80">
                        <strong>Important:</strong> Only send BTC to this address. Sending any other network asset will result in permanent loss. Deposits are credited after 1 confirmation.
                    </div>
                </div>
            </div>

            <div className="text-center text-xs text-gray-500">
                Need to pay with USDT (TRC20)? <span className="text-ruby-400 cursor-pointer hover:underline">Click here</span>
            </div>
        </div>
    );
}
