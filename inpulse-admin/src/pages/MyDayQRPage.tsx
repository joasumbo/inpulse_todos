import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { QrCode, Users, Eye, Trash2, Search, ExternalLink, RefreshCw } from 'lucide-react';

// Supabase client para MyDay QR
const supabase = createClient(
  'https://mqkqfpbaxnjtadinctek.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xa3FmcGJheG5qdGFkaW5jdGVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNTQxNTYsImV4cCI6MjA4MTczMDE1Nn0.Ve8L7DAAsbUXUp6aXoPBo0MqTi5I1a-mg6EV37KR3s4'
);

interface QRCode {
  id: string;
  user_id: string;
  phrase: string;
  short_code: string;
  created_at: string;
}

interface UserGroup {
  user_id: string;
  qrCodes: QRCode[];
  count: number;
  lastActivity: string;
}

export function MyDayQRPage() {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [users, setUsers] = useState<UserGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'qrcodes' | 'users'>('qrcodes');
  const [selectedUser, setSelectedUser] = useState<UserGroup | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('qrcodes')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setQrCodes(data);

        // Agrupar por user
        const userMap = new Map<string, UserGroup>();
        data.forEach(qr => {
          if (!userMap.has(qr.user_id)) {
            userMap.set(qr.user_id, {
              user_id: qr.user_id,
              qrCodes: [],
              count: 0,
              lastActivity: qr.created_at
            });
          }
          const user = userMap.get(qr.user_id)!;
          user.qrCodes.push(qr);
          user.count++;
          if (new Date(qr.created_at) > new Date(user.lastActivity)) {
            user.lastActivity = qr.created_at;
          }
        });
        setUsers(Array.from(userMap.values()));
      }
    } catch (error) {
      console.error('Erro:', error);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tens a certeza que queres excluir este QR Code?')) return;

    try {
      await supabase.from('qrcodes').delete().eq('id', id);
      fetchData();
    } catch (error) {
      console.error('Erro ao excluir:', error);
    }
  };

  const filteredQrCodes = qrCodes.filter(qr =>
    qr.phrase.toLowerCase().includes(searchTerm.toLowerCase()) ||
    qr.short_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    u.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.qrCodes.some(qr => qr.phrase.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    totalQrCodes: qrCodes.length,
    totalUsers: users.length,
    avgPerUser: users.length > 0 ? (qrCodes.length / users.length).toFixed(1) : '0'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <QrCode className="text-red-600" />
            MyDay QR
          </h1>
          <p className="text-gray-500 mt-1">Gestão de QR Codes e utilizadores</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw size={20} />
          </button>
          <a
            href="https://myday-qr.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <ExternalLink size={16} />
            Ver Site
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <QrCode size={24} className="text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalQrCodes}</p>
              <p className="text-sm text-gray-500">QR Codes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              <p className="text-sm text-gray-500">Utilizadores</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <QrCode size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.avgPerUser}</p>
              <p className="text-sm text-gray-500">Média por utilizador</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('qrcodes')}
          className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 -mb-px ${
            activeTab === 'qrcodes'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          QR Codes ({qrCodes.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 -mb-px ${
            activeTab === 'users'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Utilizadores ({users.length})
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Pesquisar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>

      {/* Content */}
      {activeTab === 'qrcodes' ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Frase</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Código</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Data</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredQrCodes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    Nenhum QR Code encontrado
                  </td>
                </tr>
              ) : (
                filteredQrCodes.map((qr) => (
                  <tr key={qr.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-gray-900 font-medium truncate max-w-xs">
                        {qr.phrase}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                        {qr.short_code}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(qr.created_at).toLocaleDateString('pt-PT')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`https://myday-qr.vercel.app/q/${qr.short_code}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Eye size={18} />
                        </a>
                        <button
                          onClick={() => handleDelete(qr.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Utilizador</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">QR Codes</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Última Atividade</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    Nenhum utilizador encontrado
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-gray-900 font-medium text-sm">
                        {user.user_id.substring(0, 8)}...
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                        {user.count}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(user.lastActivity).toLocaleDateString('pt-PT')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
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
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedUser(null)} />
          <div className="relative bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">QR Codes do Utilizador</h2>
              <p className="text-sm text-gray-500 mt-1">
                ID: {selectedUser.user_id.substring(0, 16)}...
              </p>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
              {selectedUser.qrCodes.map((qr) => (
                <div key={qr.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">{qr.phrase}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Código: {qr.short_code} · {new Date(qr.created_at).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`https://myday-qr.vercel.app/q/${qr.short_code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Eye size={18} />
                      </a>
                      <button
                        onClick={() => handleDelete(qr.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
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
