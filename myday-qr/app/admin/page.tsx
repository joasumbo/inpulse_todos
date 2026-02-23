'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Package, QrCode, TrendingUp, ArrowUpRight, ArrowDownRight, ShoppingCart, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Stats {
  totalUsers: number;
  totalQrCodes: number;
  totalProducts: number;
  totalOrders: number;
  recentOrders: any[];
  recentQrCodes: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalQrCodes: 0,
    totalProducts: 0,
    totalOrders: 0,
    recentOrders: [],
    recentQrCodes: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Buscar total de QR codes
      const { count: qrCount } = await supabase
        .from('qrcodes')
        .select('*', { count: 'exact', head: true });

      // Buscar total de produtos
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Buscar QR codes recentes
      const { data: recentQrs } = await supabase
        .from('qrcodes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Contar usuários únicos
      const { data: uniqueUsers } = await supabase
        .from('qrcodes')
        .select('user_id');

      const uniqueUserIds = new Set(uniqueUsers?.map((u: any) => u.user_id) || []);

      // Buscar total de encomendas
      const { count: orderCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      // Buscar encomendas recentes
      const { data: recentOrders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalUsers: uniqueUserIds.size,
        totalQrCodes: qrCount || 0,
        totalProducts: productCount || 0,
        totalOrders: orderCount || 0,
        recentOrders: recentOrders || [],
        recentQrCodes: recentQrs || []
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
    setLoading(false);
  };

  const statCards = [
    {
      title: 'Utilizadores',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      positive: true
    },
    {
      title: 'QR Codes',
      value: stats.totalQrCodes,
      icon: QrCode,
      color: 'bg-green-500',
      change: '+23%',
      positive: true
    },
    {
      title: 'Encomendas',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-amber-500',
      change: stats.totalOrders > 0 ? '+1' : '0',
      positive: true
    },
    {
      title: 'Taxa Conversão',
      value: stats.totalUsers > 0 ? Math.round((stats.totalOrders / stats.totalUsers) * 100) + '%' : '0%',
      icon: TrendingUp,
      color: 'bg-red-500',
      change: '+2%',
      positive: true
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Visão geral do MyDay QR</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon size={20} className="text-white" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>
                {stat.positive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
              <p className="text-gray-400 text-sm mt-1">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Encomendas Recentes</h2>
            <Link href="/admin/orders" className="text-red-400 hover:text-red-300 text-sm font-medium">Ver todas</Link>
          </div>
          <div className="divide-y divide-gray-700">
            {stats.recentOrders.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <ShoppingCart size={40} className="mx-auto mb-3 opacity-20" />
                <p>Nenhuma encomenda recebida</p>
              </div>
            ) : (
              stats.recentOrders.map((order: any) => (
                <div key={order.id} className="p-4 hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{order.product_name}</p>
                      <p className="text-sm text-gray-400 truncate max-w-[200px]">{order.customer_email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-400 font-bold">{Number(order.price).toFixed(2)}€</p>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${order.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                          order.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                            'bg-blue-500/20 text-blue-400'
                        }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent QR Codes */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Últimos QR Codes</h2>
          </div>
          <div className="divide-y divide-gray-700">
            {stats.recentQrCodes.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <QrCode size={40} className="mx-auto mb-3 opacity-20" />
                <p>Nenhum QR code criado ainda</p>
              </div>
            ) : (
              stats.recentQrCodes.map((qr: any) => (
                <div key={qr.id} className="p-4 hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{qr.phrase}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <Clock size={12} />
                        {new Date(qr.created_at).toLocaleDateString('pt-PT')}
                      </div>
                    </div>
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                      {qr.short_code}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h2>
          <div className="space-y-3">
            <Link
              href="/admin/orders"
              className="flex items-center gap-3 p-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors group"
            >
              <ShoppingCart size={20} className="text-amber-400" />
              <span className="text-gray-200">Gerir Encomendas</span>
              <ArrowUpRight size={16} className="ml-auto text-gray-500 group-hover:text-white transition-colors" />
            </Link>
            <Link
              href="/admin/products"
              className="flex items-center gap-3 p-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors group"
            >
              <Package size={20} className="text-purple-400" />
              <span className="text-gray-200">Gerir Produtos</span>
              <ArrowUpRight size={16} className="ml-auto text-gray-500 group-hover:text-white transition-colors" />
            </Link>
            <Link
              href="/admin/content"
              className="flex items-center gap-3 p-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors group"
            >
              <TrendingUp size={20} className="text-green-400" />
              <span className="text-gray-200">Editar Conteúdo</span>
              <ArrowUpRight size={16} className="ml-auto text-gray-500 group-hover:text-white transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
