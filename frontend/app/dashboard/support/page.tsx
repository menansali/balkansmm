'use client';
import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Plus, Send, User, Shield, Clock } from 'lucide-react';
import api from '../../../lib/api';

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
    _count?: { messages: number };
    messages?: Message[];
};

export default function SupportPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // Create Form State
    const [subject, setSubject] = useState('');
    const [initialMessage, setInitialMessage] = useState('');
    const [priority, setPriority] = useState('Normal');

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
            const res = await api.get('/tickets');
            setTickets(res.data);
        } catch (e) {
            console.error('Failed to load tickets');
        }
    };

    const loadMessages = async (id: number) => {
        try {
            const res = await api.get(`/tickets/${id}`);
            setMessages(res.data.messages);
            setSelectedTicket(res.data); // Update full ticket data
        } catch (e) {
            console.error('Failed to load messages');
        }
    };

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/tickets', { subject, message: initialMessage, priority });
            setIsCreating(false);
            setSubject('');
            setInitialMessage('');
            loadTickets();
        } catch (e) {
            alert('Failed to create ticket');
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedTicket) return;

        try {
            const res = await api.post(`/tickets/${selectedTicket.id}/message`, { message: newMessage });
            // Optimistic update or reload? API usually returns logic. 
            // My backend returns the transaction result.
            // Let's just reload messages or append
            setMessages([...messages, {
                id: Date.now(),
                message: newMessage,
                isAdmin: false,
                createdAt: new Date().toISOString()
            }]);
            setNewMessage('');
        } catch (e) {
            alert('Failed to send message');
        }
    };

    return (
        <div className="flex h-[calc(100vh-140px)] gap-6">
            {/* Left: Ticket List */}
            <div className={`w-full md:w-1/3 flex flex-col glass-card rounded-2xl border border-white/10 overflow-hidden ${selectedTicket ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                    <h2 className="font-bold text-lg">Your Tickets</h2>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="p-2 rounded-full bg-ruby-500 hover:bg-ruby-600 transition-colors"
                    >
                        <Plus size={20} />
                    </button>
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
                            <div className="flex justify-between items-center text-xs text-gray-500">
                                <span>ID: #{ticket.id}</span>
                                <span>{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                    {tickets.length === 0 && (
                        <div className="text-center py-10 text-gray-500 text-sm">
                            No tickets yet. <br /> Click + to create one.
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Chat Area */}
            <div className={`w-full md:w-2/3 flex flex-col glass-card rounded-2xl border border-white/10 overflow-hidden ${!selectedTicket ? 'hidden md:flex' : 'flex'}`}>
                {selectedTicket ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 bg-black/20 flex items-center gap-3">
                            <button className="md:hidden" onClick={() => setSelectedTicket(null)}>←</button>
                            <div>
                                <h3 className="font-bold">{selectedTicket.subject}</h3>
                                <p className="text-xs text-gray-500">ID: #{selectedTicket.id} • {selectedTicket.priority} Priority</p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-black/40">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`max-w-[80%] rounded-2xl p-4 ${msg.isAdmin ? 'bg-white/10 text-gray-200 rounded-tl-none' : 'bg-ruby-500 text-white rounded-tr-none'}`}>
                                        <div className="flex items-center gap-2 mb-1 opacity-50 text-[10px] font-bold uppercase tracking-wider">
                                            {msg.isAdmin ? <Shield size={10} /> : <User size={10} />}
                                            {msg.isAdmin ? 'Support Team' : 'You'}
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
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-black/20 flex gap-3">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ruby-500/50 transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="p-3 bg-ruby-500 rounded-xl hover:bg-ruby-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <MessageSquare size={48} className="mb-4 opacity-20" />
                        <p>Select a ticket to view conversation</p>
                    </div>
                )}
            </div>

            {/* Create Ticket Modal */}
            {isCreating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h3 className="font-bold text-xl mb-6">Create New Ticket</h3>
                        <form onSubmit={handleCreateTicket} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Subject</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ruby-500"
                                    required
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Priority</label>
                                    <select
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Normal">Normal</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Message</label>
                                <textarea
                                    value={initialMessage}
                                    onChange={(e) => setInitialMessage(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ruby-500 h-32 resize-none"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="flex-1 py-3 text-gray-400 hover:text-white transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-ruby-500 rounded-xl text-white font-bold hover:bg-ruby-600 transition-colors"
                                >
                                    Create Ticket
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
