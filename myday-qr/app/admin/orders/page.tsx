'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import {
    Search,
    Filter,
    Eye,
    Trash2,
    CheckCircle,
    Truck,
    XCircle,
    MoreVertical,
    Calendar,
    Mail,
    User,
    Package as PackageIcon,
    ExternalLink
} from 'lucide-react';

interface Order {
    id: string;
    user_id: string | null;
    product_id: string | null;
    product_name: string;
    price: number;
    status: 'pending' | 'paid' | 'shipped' | 'cancelled' | 'completed';
    customer_email: string;
    customer_name: string | null;
    shipping_address: string | null;
    short_code: string | null;
    created_at: string;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setOrders(data);
        } catch (error) {
            console.error('Erro ao buscar encomendas:', error);
        }
        setLoading(false);
    };

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        setUpdating(orderId);
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', orderId);

            if (error) throw error;

            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus as any });
            }
        } catch (error) {
            console.error('Erro ao atualizar estado:', error);
        }
        setUpdating(null);
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (!confirm('Tens a certeza que queres eliminar esta encomenda?')) return;

        try {
            const { error } = await supabase
                .from('orders')
                .delete()
                .eq('id', orderId);

            if (error) throw error;
            setOrders(orders.filter(o => o.id !== orderId));
            setShowModal(false);
        } catch (error) {
            console.error('Erro ao eliminar encomenda:', error);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'paid': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'shipped': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'completed': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Encomendas</h1>
                    <p className="text-gray-400 mt-1">{orders.length} pedidos no total</p>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative md:col-span-2">
                    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Pesquisar por email, nome ou produto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                </div>
                <div className="relative">
                    <Filter size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white appearance-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                        <option value="all">Todos os estados</option>
                        <option value="pending">Pendente</option>
                        <option value="paid">Pago</option>
                        <option value="shipped">Enviado</option>
                        <option value="completed">Concluído</option>
                        <option value="cancelled">Cancelado</option>
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Encomenda</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Cliente</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Valor</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Data</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                        Nenhuma encomenda encontrada
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-700/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-white font-medium">{order.product_name}</p>
                                                {order.short_code && (
                                                    <span className="text-[10px] bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded mt-1 inline-block">
                                                        QR: {order.short_code}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-white text-sm">{order.customer_name || 'N/A'}</span>
                                                <span className="text-gray-400 text-xs">{order.customer_email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-white">
                                            {Number(order.price).toFixed(2)}€
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(order.status)}`}>
                                                {order.status === 'pending' ? 'Pendente' :
                                                    order.status === 'paid' ? 'Pago' :
                                                        order.status === 'shipped' ? 'Enviado' :
                                                            order.status === 'completed' ? 'Concluído' : 'Cancelado'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-sm">
                                            {new Date(order.created_at).toLocaleDateString('pt-PT')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => { setSelectedOrder(order); setShowModal(true); }}
                                                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                                                    title="Ver detalhes"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <div className="relative group/menu">
                                                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                                                        <MoreVertical size={18} />
                                                    </button>
                                                    <div className="absolute right-0 bottom-full mb-2 hidden group-hover/menu:block w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-10 p-1">
                                                        {order.status !== 'paid' && (
                                                            <button
                                                                onClick={() => handleUpdateStatus(order.id, 'paid')}
                                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-green-400 hover:bg-gray-800 rounded transition-colors"
                                                            >
                                                                <CheckCircle size={16} /> Marcar como Pago
                                                            </button>
                                                        )}
                                                        {order.status === 'paid' && (
                                                            <button
                                                                onClick={() => handleUpdateStatus(order.id, 'shipped')}
                                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-400 hover:bg-gray-800 rounded transition-colors"
                                                            >
                                                                <Truck size={16} /> Marcar como Enviado
                                                            </button>
                                                        )}
                                                        {order.status !== 'cancelled' && (
                                                            <button
                                                                onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-gray-800 rounded transition-colors"
                                                            >
                                                                <XCircle size={16} /> Cancelar Encomenda
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Detail Modal */}
            {showModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70" onClick={() => setShowModal(false)} />
                    <div className="relative bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-700">
                        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white">Detalhes da Encomenda</h2>
                                <p className="text-xs text-gray-500 mt-1">ID: {selectedOrder.id}</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-8">
                            {/* Order Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Product Info */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase flex items-center gap-2">
                                        <PackageIcon size={16} /> Produto
                                    </h3>
                                    <div className="bg-gray-700/30 rounded-lg p-4">
                                        <p className="text-lg font-bold text-white">{selectedOrder.product_name}</p>
                                        <p className="text-2xl font-bold text-red-500 mt-2">{Number(selectedOrder.price).toFixed(2)}€</p>
                                        {selectedOrder.short_code && (
                                            <div className="mt-4 flex items-center justify-between p-2 bg-gray-900 rounded border border-gray-700">
                                                <span className="text-xs text-gray-400">QR Code Associado:</span>
                                                <Link
                                                    href={`/q/${selectedOrder.short_code}`}
                                                    target="_blank"
                                                    className="text-red-400 font-bold flex items-center gap-1 hover:underline"
                                                >
                                                    {selectedOrder.short_code} <ExternalLink size={12} />
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Customer Info */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase flex items-center gap-2">
                                        <User size={16} /> Cliente
                                    </h3>
                                    <div className="bg-gray-700/30 rounded-lg p-4 space-y-3">
                                        <div>
                                            <p className="text-xs text-gray-500">Nome</p>
                                            <p className="text-white font-medium">{selectedOrder.customer_name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Email</p>
                                            <div className="flex items-center gap-2 text-white">
                                                {selectedOrder.customer_email}
                                                <a href={`mailto:${selectedOrder.customer_email}`} className="text-gray-400 hover:text-red-400">
                                                    <Mail size={14} />
                                                </a>
                                            </div>
                                        </div>
                                        {selectedOrder.shipping_address && (
                                            <div>
                                                <p className="text-xs text-gray-500">Morada de Envio</p>
                                                <p className="text-white text-sm">{selectedOrder.shipping_address}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Status & Timeline */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-500 uppercase flex items-center gap-2">
                                    <Calendar size={16} /> Estado da Encomenda
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {['pending', 'paid', 'shipped', 'cancelled', 'completed'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                                            disabled={updating === selectedOrder.id}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold uppercase transition-all ${selectedOrder.status === status
                                                ? getStatusColor(status) + ' ring-1 ring-current'
                                                : 'bg-gray-700 text-gray-500 hover:bg-gray-600'
                                                } ${updating === selectedOrder.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {status === 'pending' ? 'Pendente' :
                                                status === 'paid' ? 'Pago' :
                                                    status === 'shipped' ? 'Enviado' :
                                                        status === 'completed' ? 'Concluído' : 'Cancelado'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-700 flex items-center justify-between gap-4">
                            <button
                                onClick={() => handleDeleteOrder(selectedOrder.id)}
                                className="flex items-center gap-2 text-red-500 hover:text-red-400 text-sm font-medium px-4 py-2 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                                <Trash2 size={18} /> Eliminar Encomenda
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
