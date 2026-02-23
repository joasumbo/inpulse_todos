'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, QrCode, Calendar, Eye, Trash2, MoreVertical } from 'lucide-react';

interface UserWithQRCodes {
  user_id: string;
  email?: string;
  qrCodes: any[];
  totalQrCodes: number;
  lastActivity: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserWithQRCodes[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithQRCodes | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Buscar todos os QR codes agrupados por usuário
      const { data: qrCodes } = await supabase
        .from('qrcodes')
        .select('*')
        .order('created_at', { ascending: false });

      if (qrCodes) {
        // Agrupar por user_id
        const userMap = new Map<string, UserWithQRCodes>();
        
        qrCodes.forEach(qr => {
          if (!userMap.has(qr.user_id)) {
            userMap.set(qr.user_id, {
              user_id: qr.user_id,
              qrCodes: [],
              totalQrCodes: 0,
              lastActivity: qr.created_at
            });
          }
          const user = userMap.get(qr.user_id)!;
          user.qrCodes.push(qr);
          user.totalQrCodes++;
          if (new Date(qr.created_at) > new Date(user.lastActivity)) {
            user.lastActivity = qr.created_at;
          }
        });

        setUsers(Array.from(userMap.values()));
      }
    } catch (error) {
      console.error('Erro ao buscar utilizadores:', error);
    }
    setLoading(false);
  };

  const handleViewUser = (user: UserWithQRCodes) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDeleteQRCode = async (id: string) => {
    if (!confirm('Tens a certeza que queres excluir este QR Code?')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await supabase
        .from('qrcodes')
        .delete()
        .eq('id', id);

      fetchUsers();
      if (selectedUser) {
        setSelectedUser({
          ...selectedUser,
          qrCodes: selectedUser.qrCodes.filter(qr => qr.id !== id),
          totalQrCodes: selectedUser.totalQrCodes - 1
        });
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.qrCodes.some(qr => qr.phrase.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          <h1 className="text-2xl font-bold text-white">Utilizadores</h1>
          <p className="text-gray-400 mt-1">{users.length} utilizadores registados</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Pesquisar por ID ou frase..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>

      {/* Users Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Utilizador ID</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">QR Codes</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Última Atividade</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    Nenhum utilizador encontrado
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.user_id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-gray-300 font-medium">
                            {user.user_id.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm truncate max-w-[200px]">
                            {user.user_id.substring(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <QrCode size={16} className="text-gray-400" />
                        <span className="text-white">{user.totalQrCodes}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar size={16} className="text-gray-400" />
                        {new Date(user.lastActivity).toLocaleDateString('pt-PT', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowModal(false)} />
          <div className="relative bg-gray-800 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">QR Codes do Utilizador</h2>
              <p className="text-sm text-gray-400 mt-1">
                ID: {selectedUser.user_id.substring(0, 16)}...
              </p>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {selectedUser.qrCodes.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Nenhum QR Code</p>
              ) : (
                <div className="space-y-4">
                  {selectedUser.qrCodes.map((qr) => (
                    <div key={qr.id} className="bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium">{qr.phrase}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                            <span>Código: {qr.short_code}</span>
                            <span>
                              {new Date(qr.created_at).toLocaleDateString('pt-PT')}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={`/q/${qr.short_code}`}
                            target="_blank"
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors"
                          >
                            <Eye size={18} />
                          </a>
                          <button
                            onClick={() => handleDeleteQRCode(qr.id)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-700 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
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
