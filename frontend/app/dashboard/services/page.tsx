'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';

export default function ServicesPage() {
    const [services, setServices] = useState<any[]>([]);

    useEffect(() => {
        // Mocking or fetching from backend
        const fetchServices = async () => {
            try {
                const res = await api.get('/services');
                setServices(res.data);
            } catch (e) {
                // If backend empty, show some dummy data for UI demo
                setServices([
                    { id: 1, name: 'Instagram Followers [Premium]', category: 'Instagram', rate: 1.50, min: 100, max: 10000 },
                    { id: 2, name: 'TikTok Views [Instant]', category: 'TikTok', rate: 0.05, min: 1000, max: 1000000 },
                    { id: 3, name: 'YouTube Subscribers', category: 'YouTube', rate: 25.00, min: 50, max: 2000 },
                ]);
            }
        };
        fetchServices();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Services</h1>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-white/5 text-gray-200 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Service</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Rate (per 1k)</th>
                                <th className="px-6 py-4">Min / Max</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {services.map((service) => (
                                <tr key={service.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-mono">{service.id}</td>
                                    <td className="px-6 py-4 text-white font-medium">{service.name}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-full bg-ruby-900/30 text-ruby-400 text-xs border border-ruby-500/20">
                                            {service.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-white">${service.rate.toFixed(2)}</td>
                                    <td className="px-6 py-4">{service.min} - {service.max}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
