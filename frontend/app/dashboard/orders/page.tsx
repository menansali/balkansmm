'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import ScreenshotGenerator from '../../../components/ScreenshotGenerator';
import { ChevronLeft, ChevronRight, RefreshCw, Layers, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchOrders(page);
    }, [page]);

    const fetchOrders = async (pageNum: number) => {
        setIsLoading(true);
        try {
            const res = await api.get(`/orders?page=${pageNum}&limit=10`);
            setOrders(res.data.data);
            setTotalPages(res.data.totalPages || 1);
        } catch (e) {
            toast.error("Failed to load orders");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefill = async (orderId: number) => {
        const promise = api.post(`/orders/${orderId}/refill`);
        toast.promise(promise, {
            loading: 'Requesting refill from provider...',
            success: 'Refill queued successfully!',
            error: (err) => err.response?.data?.message || 'Refill failed'
        });
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Order History</h1>
                    <p className="text-gray-400">Track all your purchases.</p>
                </div>
                <button
                    onClick={() => fetchOrders(page)}
                    className="bg-white/5 hover:bg-white/10 p-2 rounded-lg border border-white/5 transition-colors"
                >
                    <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                </button>
            </header>

            <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 text-xs text-gray-400 uppercase tracking-widest">
                                <th className="p-4">ID</th>
                                <th className="p-4">Service</th>
                                <th className="p-4">Link</th>
                                <th className="p-4">Quantity</th>
                                <th className="p-4">Charge</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {isLoading && orders.length === 0 ? (
                                <tr><td colSpan={7} className="p-8 text-center text-gray-500">Loading orders...</td></tr>
                            ) : orders.length === 0 ? (
                                <tr><td colSpan={7} className="p-8 text-center text-gray-500">No orders found.</td></tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 font-mono text-gray-500">#{order.id}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Layers size={14} className="text-ruby-500" />
                                                <span className="font-bold">{order.service?.name || `Service #${order.serviceId}`}</span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 pl-6">
                                                Provider ID: {order.providerOrderId || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <a href={order.link} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline flex items-center gap-1 max-w-[200px] truncate">
                                                {order.link}
                                            </a>
                                        </td>
                                        <td className="p-4">{order.quantity.toLocaleString()}</td>
                                        <td className="p-4 font-mono text-ruby-400 font-bold">${order.charge.toFixed(4)}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                                                ${order.status === 'Completed' ? 'bg-green-500/10 text-green-500' :
                                                    order.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                                        order.status === 'Canceled' ? 'bg-red-500/10 text-red-500' :
                                                            'bg-blue-500/10 text-blue-500'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="p-4 flex gap-2">
                                            <ScreenshotGenerator order={order} />
                                            <button
                                                onClick={() => handleRefill(order.id)}
                                                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                                title="Request Refill"
                                            >
                                                <RotateCcw size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-white/10 flex items-center justify-between bg-black/20">
                    <span className="text-xs text-gray-400">Page {page} of {totalPages}</span>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent px-4 py-2 rounded-lg text-sm border border-white/5 transition-colors flex items-center gap-1"
                        >
                            <ChevronLeft size={14} /> Prev
                        </button>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent px-4 py-2 rounded-lg text-sm border border-white/5 transition-colors flex items-center gap-1"
                        >
                            Next <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
