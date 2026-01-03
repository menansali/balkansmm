'use client';
import { useState } from 'react';
import { CreditCard, DollarSign, Bitcoin, Landmark, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function AddFundsPage() {
    const [amount, setAmount] = useState<string>('');
    const [method, setMethod] = useState<'card' | 'crypto' | 'bank'>('card');
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Address copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDeposit = async () => {
        if (!amount || isNaN(Number(amount)) || Number(amount) < 5) {
            toast.error("Minimum deposit is $5");
            return;
        }

        if (method === 'card') {
            setIsLoading(true);
            try {
                // Simulate processing delay
                await new Promise(r => setTimeout(r, 1500));

                await api.post('/payments/mock-deposit', { amount: Number(amount) });
                toast.success(`Successfully deposited $${amount}!`);
                setAmount('');
                // Optionally redirect or refresh balance
                window.location.reload();
            } catch (error) {
                toast.error("Payment failed. Please try again.");
            } finally {
                setIsLoading(false);
            }
        } else {
            toast("Manual transfer instructions (Mock)", { icon: 'ℹ️' });
        }
    };

    const parsedAmount = parseFloat(amount) || 0;
    const bonus = method === 'crypto' ? parsedAmount * 0.10 : 0;
    const total = parsedAmount + bonus;

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20">
            <header>
                <h1 className="text-3xl font-bold">Add Funds</h1>
                <p className="text-gray-400">Securely top up your account balance.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Methods */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <CreditCard size={20} className="text-ruby-500" />
                        Select Payment Method
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => setMethod('card')}
                            className={`p-6 rounded-2xl border transition-all text-left group relative overflow-hidden
                                ${method === 'card'
                                    ? 'bg-ruby-900/10 border-ruby-500/50 ring-1 ring-ruby-500/20'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                        >
                            <CreditCard size={32} className={`mb-4 ${method === 'card' ? 'text-ruby-400' : 'text-gray-400'}`} />
                            <div className="font-bold text-lg">Credit / Debit Card</div>
                            <div className="text-xs text-gray-500 mt-1">Instant Deposit • 0% Fee</div>
                            {method === 'card' && <div className="absolute top-4 right-4 text-ruby-500"><Check size={20} /></div>}
                        </button>

                        <button
                            onClick={() => setMethod('crypto')}
                            className={`p-6 rounded-2xl border transition-all text-left group relative overflow-hidden
                                ${method === 'crypto'
                                    ? 'bg-orange-900/10 border-orange-500/50 ring-1 ring-orange-500/20'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                        >
                            <Bitcoin size={32} className={`mb-4 ${method === 'crypto' ? 'text-orange-400' : 'text-gray-400'}`} />
                            <div className="font-bold text-lg">Crypto (BTC/USDT)</div>
                            <div className="text-xs text-orange-400 font-bold mt-1">+10% Bonus • Instant</div>
                            {method === 'crypto' && <div className="absolute top-4 right-4 text-orange-500"><Check size={20} /></div>}
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {method === 'crypto' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-4"
                            >
                                <h3 className="font-bold text-orange-400">Send USDT (TRC20)</h3>
                                <p className="text-sm text-gray-400">Send the exact amount to the address below. Your balance will be updated automatically after 1 confirmation.</p>

                                <div className="bg-black border border-white/10 p-4 rounded-xl flex items-center justify-between gap-4 font-mono text-sm break-all">
                                    <span>TKz8sxxxxxxMOCKADDRESSxxxxxx</span>
                                    <button onClick={() => handleCopy("TKz8sxxxxxxMOCKADDRESSxxxxxx")} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {method === 'bank' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-4"
                            >
                                <h3 className="font-bold text-blue-400">Bank Transfer Details</h3>
                                <p className="text-sm text-gray-400">Please include your username in the reference.</p>
                                {/* Details... */}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right: Amount & Checkout */}
                <div className="space-y-6">
                    <div className="glass-card p-8 rounded-3xl border border-white/10 sticky top-8">
                        <h2 className="text-xl font-bold mb-6">Enter Amount</h2>

                        <div className="relative mb-6">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-2xl font-bold outline-none focus:border-ruby-500 transition-colors"
                            />
                        </div>

                        <div className="flex gap-3 mb-8">
                            {[10, 25, 50, 100].map(val => (
                                <button
                                    key={val}
                                    onClick={() => setAmount(val.toString())}
                                    className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-bold border border-white/5 transition-colors"
                                >
                                    ${val}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4 text-sm text-gray-400 border-t border-white/10 pt-6 mb-6">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>${parsedAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className={bonus > 0 ? "text-green-400 font-bold" : ""}>Bonus</span>
                                <span className={bonus > 0 ? "text-green-400 font-bold" : ""}>+${bonus.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-white/5 mt-2">
                                <span>Total Credited</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleDeposit}
                            disabled={isLoading || parsedAmount < 5 || method === 'bank'}
                            className="w-full py-4 bg-gradient-to-r from-ruby-600 to-ruby-800 rounded-xl font-bold hover:from-ruby-500 hover:to-ruby-700 transition-all shadow-lg shadow-ruby-900/40 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? 'Processing...' : method === 'card' ? 'Pay Securely' : method === 'crypto' ? 'I Have Paid' : 'Contact Support'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
