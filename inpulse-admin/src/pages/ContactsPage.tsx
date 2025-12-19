import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Contact } from '../lib/supabase';
import { Mail, Phone, MessageSquare, Check, Loader, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    const { data } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setContacts(data);
    setLoading(false);
  };

  const markAsRead = async (contact: Contact) => {
    const { error } = await supabase
      .from('contacts')
      .update({ is_read: true })
      .eq('id', contact.id);

    if (!error) {
      setContacts(contacts.map(c => c.id === contact.id ? { ...c, is_read: true } : c));
      if (selectedContact?.id === contact.id) {
        setSelectedContact({ ...contact, is_read: true });
      }
    }
  };

  const deleteContact = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este contato?')) return;
    
    const { error } = await supabase.from('contacts').delete().eq('id', id);
    
    if (!error) {
      setContacts(contacts.filter(c => c.id !== id));
      if (selectedContact?.id === id) {
        setSelectedContact(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* List */}
      <div className="lg:col-span-1 bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-semibold">
            Mensagens ({contacts.filter(c => !c.is_read).length} não lidas)
          </h3>
        </div>
        <div className="divide-y max-h-[calc(100vh-16rem)] overflow-y-auto">
          {contacts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhum contato recebido
            </div>
          ) : (
            contacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => {
                  setSelectedContact(contact);
                  if (!contact.is_read) markAsRead(contact);
                }}
                className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                  selectedContact?.id === contact.id ? 'bg-gray-100' : ''
                } ${!contact.is_read ? 'bg-orange-50' : ''}`}
              >
                <div className="flex items-start justify-between mb-1">
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    {contact.name}
                    {!contact.is_read && (
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    )}
                  </p>
                  <span className="text-xs text-gray-500">
                    {format(new Date(contact.created_at), 'dd/MM', { locale: ptBR })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{contact.email}</p>
                {contact.subject && (
                  <p className="text-sm text-gray-700 font-medium truncate">{contact.subject}</p>
                )}
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">{contact.message}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Detail */}
      <div className="lg:col-span-2">
        {selectedContact ? (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedContact.name}</h2>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail size={16} />
                    <a href={`mailto:${selectedContact.email}`} className="hover:text-gray-900">
                      {selectedContact.email}
                    </a>
                  </div>
                  {selectedContact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={16} />
                      <a href={`tel:${selectedContact.phone}`} className="hover:text-gray-900">
                        {selectedContact.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {!selectedContact.is_read && (
                  <button
                    onClick={() => markAsRead(selectedContact)}
                    className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    title="Marcar como lido"
                  >
                    <Check size={20} />
                  </button>
                )}
                <button
                  onClick={() => deleteContact(selectedContact.id)}
                  className="px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm"
                >
                  Deletar
                </button>
              </div>
            </div>

            {selectedContact.subject && (
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">Assunto:</p>
                <p className="text-lg font-semibold text-gray-900">{selectedContact.subject}</p>
              </div>
            )}

            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">Mensagem:</p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900 whitespace-pre-wrap">{selectedContact.message}</p>
              </div>
            </div>

            <div className="pt-6 border-t">
              <p className="text-sm text-gray-500">
                Recebido em {format(new Date(selectedContact.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <a
                href={`mailto:${selectedContact.email}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Mail size={20} />
                Responder por Email
              </a>
              {selectedContact.phone && (
                <a
                  href={`tel:${selectedContact.phone}`}
                  className="flex items-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Phone size={20} />
                  Ligar
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Eye size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Selecione um contato para ver os detalhes</p>
          </div>
        )}
      </div>
    </div>
  );
}
