'use client';
import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, User, Shield, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../../lib/api';

type Message = {
    id: number;
    message: string;
    isAdmin: boolean;
    createdAt: string;
};

type Ticket = {
    id: number;
    subject: string;
    status: string;
    priority: string;
    updatedAt: string;
    user: { email: string; name: string };
    messages?: Message[];
};

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [replyMessage, setReplyMessage] = useState('');
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    useEffect(() => {
        loadTickets();
    }, []);

    useEffect(() => {
        if (selectedTicket) {
            loadMessages(selectedTicket.id);
        }
    }, [selectedTicket]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadTickets = async () => {
        try {
            const res = await api.get('/tickets/admin/all');
            setTickets(res.data);
        } catch (e) {
            toast.error('Failed to load tickets');
        }
    };

    const loadMessages = async (id: number) => {
        try {
            const res = await api.get(`/tickets/admin/${id}`);
            setMessages(res.data.messages);
            setSelectedTicket(res.data);
        } catch (e) {
            toast.error('Failed to load messages');
        }
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyMessage.trim() || !selectedTicket) return;

        try {
            await api.post(`/tickets/admin/${selectedTicket.id}/reply`, {
                message: replyMessage,
                status: 'Answered'
            });

            // Append message locally
            setMessages([...messages, {
                id: Date.now(),
                message: replyMessage,
                isAdmin: true,
                createdAt: new Date().toISOString()
            }]);
            setReplyMessage('');

            // Update ticket status in list locally
            setTickets(tickets.map(t => t.id === selectedTicket.id ? { ...t, status: 'Answered', updatedAt: new Date().toISOString() } : t));

            toast.success('Reply sent');
        } catch (e) {
            toast.error('Failed to send reply');
        }
    };

    return (
        <div className="flex h-[calc(100vh-140px)] gap-6">
            {/* Left: Ticket List */}
            <div className={`w-full md:w-1/3 flex flex-col glass-card rounded-2xl border border-white/10 overflow-hidden ${selectedTicket ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-white/10 bg-black/20">
                    <h2 className="font-bold text-lg">Support Inbox</h2>
                    <p className="text-xs text-gray-500">{tickets.length} tickets total</p>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {tickets.map(ticket => (
                        <div
                            key={ticket.id}
                            onClick={() => setSelectedTicket(ticket)}
                            className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedTicket?.id === ticket.id ? 'bg-white/10 border-ruby-500/50' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-sm truncate pr-2">{ticket.subject}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${ticket.status === 'Open' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                    {ticket.status}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                                <span>{ticket.user?.email}</span>
                                <span>#{ticket.id}</span>
                            </div>
                            <div className="text-[10px] text-gray-600">
                                {new Date(ticket.updatedAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                    {tickets.length === 0 && (
                        <div className="text-center py-10 text-gray-500 text-sm">
                            All caught up! No tickets.
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Chat Area */}
            <div className={`w-full md:w-2/3 flex flex-col glass-card rounded-2xl border border-white/10 overflow-hidden ${!selectedTicket ? 'hidden md:flex' : 'flex'}`}>
                {selectedTicket ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 bg-black/20 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button className="md:hidden" onClick={() => setSelectedTicket(null)}>←</button>
                                <div>
                                    <h3 className="font-bold">{selectedTicket.subject}</h3>
                                    <p className="text-xs text-gray-500">
                                        From: <span className="text-ruby-400">{selectedTicket.user?.name} ({selectedTicket.user?.email})</span> • Priority: {selectedTicket.priority}
                                    </p>
                                </div>
                            </div>
                            <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded border border-white/10">#{selectedTicket.id}</span>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-black/40">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-2xl p-4 ${msg.isAdmin ? 'bg-ruby-500 text-white rounded-tr-none' : 'bg-white/10 text-gray-200 rounded-tl-none'}`}>
                                        <div className="flex items-center gap-2 mb-1 opacity-50 text-[10px] font-bold uppercase tracking-wider">
                                            {msg.isAdmin ? <Shield size={10} /> : <User size={10} />}
                                            {msg.isAdmin ? 'You (Admin)' : 'User'}
                                        </div>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                        <div className="mt-2 text-[10px] opacity-40 text-right">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleReply} className="p-4 border-t border-white/10 bg-black/20 flex gap-3">
                            <input
                                type="text"
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                                placeholder="Write a reply..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ruby-500/50 transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={!replyMessage.trim()}
                                className="p-3 bg-ruby-500 rounded-xl hover:bg-ruby-600 transition-colors disabled:opacity-50"
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <MessageSquare size={48} className="mb-4 opacity-20" />
                        <p>Select a ticket to reply.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
