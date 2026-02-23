'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { UserPlus, Trash2, Shield, ShieldCheck, Save, Check } from 'lucide-react';

interface Admin {
  id: string;
  user_id: string | null;
  email: string;
  name: string | null;
  role: string;
  created_at: string;
}

export default function SettingsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [adding, setAdding] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>('admin');

  useEffect(() => {
    fetchAdmins();
    checkCurrentUserRole();
  }, []);

  const checkCurrentUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('admins')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (data) setCurrentUserRole(data.role);
    }
  };

  const fetchAdmins = async () => {
    try {
      const { data } = await supabase
        .from('admins')
        .select('*')
        .order('created_at', { ascending: true });

      if (data) setAdmins(data);
    } catch (error) {
      console.error('Erro ao buscar admins:', error);
    }
    setLoading(false);
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail) return;

    setAdding(true);
    try {
      await supabase
        .from('admins')
        .insert({
          email: newAdminEmail,
          name: newAdminName || null,
          role: 'admin'
        });

      setNewAdminEmail('');
      setNewAdminName('');
      fetchAdmins();
    } catch (error) {
      console.error('Erro ao adicionar admin:', error);
    }
    setAdding(false);
  };

  const handleRemoveAdmin = async (id: string) => {
    if (!confirm('Tens a certeza que queres remover este administrador?')) return;

    try {
      await supabase
        .from('admins')
        .delete()
        .eq('id', id);

      fetchAdmins();
    } catch (error) {
      console.error('Erro ao remover admin:', error);
    }
  };

  const handleToggleRole = async (admin: Admin) => {
    const newRole = admin.role === 'super_admin' ? 'admin' : 'super_admin';
    
    try {
      await supabase
        .from('admins')
        .update({ role: newRole })
        .eq('id', admin.id);

      fetchAdmins();
    } catch (error) {
      console.error('Erro ao atualizar role:', error);
    }
  };

  const isSuperAdmin = currentUserRole === 'super_admin';

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
        <h1 className="text-2xl font-bold text-white">Configurações</h1>
        <p className="text-gray-400 mt-1">Gerir administradores e configurações do sistema</p>
      </div>

      {/* Adicionar Admin */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <UserPlus size={20} className="text-gray-400" />
          Adicionar Administrador
        </h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              placeholder="Email do administrador"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={newAdminName}
              onChange={(e) => setNewAdminName(e.target.value)}
              placeholder="Nome (opcional)"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleAddAdmin}
            disabled={!newAdminEmail || adding}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {adding ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <UserPlus size={20} />
            )}
            Adicionar
          </button>
        </div>
        <p className="text-sm text-gray-400 mt-3">
          O administrador poderá aceder ao painel após fazer login com este email.
        </p>
      </div>

      {/* Lista de Admins */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Administradores</h2>
        </div>
        <div className="divide-y divide-gray-700">
          {admins.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              Nenhum administrador cadastrado
            </div>
          ) : (
            admins.map((admin) => (
              <div key={admin.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    admin.role === 'super_admin' ? 'bg-amber-600' : 'bg-gray-700'
                  }`}>
                    {admin.role === 'super_admin' ? (
                      <ShieldCheck size={20} className="text-white" />
                    ) : (
                      <Shield size={20} className="text-gray-300" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {admin.name || admin.email.split('@')[0]}
                    </p>
                    <p className="text-sm text-gray-400">{admin.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    admin.role === 'super_admin' 
                      ? 'bg-amber-600/20 text-amber-400'
                      : 'bg-gray-700 text-gray-300'
                  }`}>
                    {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </span>
                  {isSuperAdmin && (
                    <>
                      <button
                        onClick={() => handleToggleRole(admin)}
                        className="p-2 text-gray-400 hover:text-amber-400 hover:bg-gray-700 rounded-lg transition-colors"
                        title={admin.role === 'super_admin' ? 'Remover super admin' : 'Tornar super admin'}
                      >
                        <ShieldCheck size={18} />
                      </button>
                      <button
                        onClick={() => handleRemoveAdmin(admin.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Remover administrador"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-600/10 border border-blue-600/30 rounded-xl p-6">
        <h3 className="text-blue-400 font-medium mb-2">Sobre os níveis de acesso</h3>
        <ul className="text-sm text-gray-300 space-y-2">
          <li><strong>Admin:</strong> Pode gerir produtos, exemplos, conteúdo e ver utilizadores.</li>
          <li><strong>Super Admin:</strong> Pode fazer tudo acima + gerir outros administradores.</li>
        </ul>
      </div>
    </div>
  );
}
