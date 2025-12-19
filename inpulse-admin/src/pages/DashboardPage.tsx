import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { FileText, Newspaper, MessageSquare, Eye } from 'lucide-react';
import { DashboardSkeleton } from '../components/Skeleton';

interface Stats {
  pages: number;
  posts: number;
  contacts: number;
  unreadContacts: number;
}

export function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    pages: 0,
    posts: 0,
    contacts: 0,
    unreadContacts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentContacts, setRecentContacts] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
    loadRecentContacts();
  }, []);

  const loadStats = async () => {
    try {
      const [pagesRes, postsRes, contactsRes, unreadRes] = await Promise.all([
        supabase.from('pages').select('id', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
        supabase.from('contacts').select('id', { count: 'exact', head: true }),
        supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('is_read', false),
      ]);

      setStats({
        pages: pagesRes.count || 0,
        posts: postsRes.count || 0,
        contacts: contactsRes.count || 0,
        unreadContacts: unreadRes.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentContacts = async () => {
    const { data } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    setRecentContacts(data || []);
  };

  const statCards = [
    { icon: FileText, label: 'Páginas', value: stats.pages, color: 'bg-blue-500' },
    { icon: Newspaper, label: 'Posts no Blog', value: stats.posts, color: 'bg-purple-500' },
    { icon: MessageSquare, label: 'Total Contatos', value: stats.contacts, color: 'bg-green-500' },
    { icon: Eye, label: 'Não Lidos', value: stats.unreadContacts, color: 'bg-orange-500' },
  ];

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-4">
                <div className={`${card.color} p-3 rounded-lg text-white`}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Contacts */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contatos Recentes</h3>
        <div className="space-y-4">
          {recentContacts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum contato ainda</p>
          ) : (
            recentContacts.map((contact) => (
              <div
                key={contact.id}
                className={`border rounded-lg p-4 ${
                  contact.is_read ? 'border-gray-200' : 'border-orange-300 bg-orange-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900">{contact.name}</p>
                      {!contact.is_read && (
                        <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded">
                          Novo
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{contact.email}</p>
                    {contact.subject && (
                      <p className="text-sm text-gray-700 mt-1 font-medium">{contact.subject}</p>
                    )}
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{contact.message}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(contact.created_at).toLocaleDateString('pt-PT')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a
          href="/pages"
          className="block bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white hover:shadow-lg transition-shadow"
        >
          <FileText size={32} className="mb-3" />
          <h3 className="text-lg font-semibold mb-2">Gerenciar Páginas</h3>
          <p className="text-sm text-blue-100">Criar e editar páginas do site</p>
        </a>

        <a
          href="/blog"
          className="block bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm p-6 text-white hover:shadow-lg transition-shadow"
        >
          <Newspaper size={32} className="mb-3" />
          <h3 className="text-lg font-semibold mb-2">Posts do Blog</h3>
          <p className="text-sm text-purple-100">Publicar novos artigos</p>
        </a>

        <a
          href="/settings"
          className="block bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl shadow-sm p-6 text-white hover:shadow-lg transition-shadow"
        >
          <Eye size={32} className="mb-3" />
          <h3 className="text-lg font-semibold mb-2">Configurações</h3>
          <p className="text-sm text-gray-300">Ajustar informações do site</p>
        </a>
      </div>
    </div>
  );
}
