'use client';
import { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import api from '../../../../lib/api';
import { toast } from 'react-hot-toast';


export default function CryptoPaymentPage() {
    const [amount, setAmount] = useState(10);
    const [loading, setLoading] = useState(false);

    const handleDeposit = async () => {
        if (amount < 5) {
            toast.error('Minimum deposit is $5');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/payments/deposit', {
                amount,
                gateway: 'binance'
            });

            if (res.data.gatewayUrl) {
                // Redirect to Coinbase Commerce
                window.location.href = res.data.gatewayUrl;
            } else {
                toast.error('Failed to initialize payment gateway');
            }
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Deposit failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto space-y-8 pb-20">
            <header className="text-center">
                <h1 className="text-3xl font-bold mb-2">Deposit with Crypto</h1>
                <p className="text-gray-400">Pay securely via Binance Pay (USDT, BTC, ETH, BNB, BUSD).</p>
            </header>

            <div className="glass-card p-8 rounded-3xl border border-ruby-500/20 bg-gradient-to-br from-black to-ruby-900/10">
                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                        <CreditCard size={32} />
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-bold tracking-widest text-gray-500 uppercase block mb-3">Amount to Deposit (USD)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-8 pr-4 text-2xl font-bold text-white focus:outline-none focus:border-ruby-500 transition-colors"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleDeposit}
                        disabled={loading}
                        className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Pay with Binance'}
                    </button>

                    <div className="text-center text-xs text-gray-500">
                        Redirects to secure payment gateway. Funds are added automatically after 1 confirmation.
                    </div>
                </div>
            </div>
        </div>
    );
}
