'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { LogOut, Download, Pencil, Trash2, Plus, Check, X, ExternalLink, Copy } from 'lucide-react';

interface QRCodeItem {
  id: string;
  user_id: string;
  phrase: string;
  short_code: string;
  created_at: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [phrase, setPhrase] = useState('');
  const [qrCodes, setQrCodes] = useState<QRCodeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPhrase, setEditPhrase] = useState('');
  const [qrImages, setQrImages] = useState<Record<string, string>>({});
  const [newQrImage, setNewQrImage] = useState<string>('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    // Gerar imagens QR para todos os códigos
    qrCodes.forEach(async (qr) => {
      if (!qrImages[qr.short_code]) {
        const url = `${window.location.origin}/q/${qr.short_code}`;
        const dataUrl = await QRCode.toDataURL(url, { width: 200, margin: 2 });
        setQrImages(prev => ({ ...prev, [qr.short_code]: dataUrl }));
      }
    });
  }, [qrCodes]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
    } else {
      setUser(user);
      fetchQRCodes();
    }
  };

  const fetchQRCodes = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from('qrcodes')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setQrCodes(data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phrase.trim() || !user) return;

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showToast('error', 'Sessão expirada');
        return;
      }

      const response = await fetch('/api/qrcodes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ phrase: phrase.trim() }),
      });

      const data = await response.json();
      if (response.ok) {
        // Gerar preview do QR
        const url = `${window.location.origin}/q/${data.short_code}`;
        const dataUrl = await QRCode.toDataURL(url, { width: 300, margin: 2 });
        setNewQrImage(dataUrl);
        setPhrase('');
        fetchQRCodes();
        showToast('success', 'QR Code criado!');
      } else {
        showToast('error', data.error || 'Erro ao criar');
      }
    } catch (error) {
      showToast('error', 'Erro ao criar QR code');
    }
    setLoading(false);
  };

  const handleUpdate = async (id: string) => {
    if (!editPhrase.trim()) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/qrcodes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id, phrase: editPhrase.trim() }),
      });

      if (response.ok) {
        setEditingId(null);
        setEditPhrase('');
        fetchQRCodes();
        showToast('success', 'Atualizado!');
      } else {
        const data = await response.json();
        showToast('error', data.error || 'Erro ao atualizar');
      }
    } catch (error) {
      showToast('error', 'Erro ao atualizar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este QR Code?')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`/api/qrcodes?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });

      if (response.ok) {
        fetchQRCodes();
        showToast('success', 'Excluído!');
      }
    } catch (error) {
      showToast('error', 'Erro ao excluir');
    }
  };

  const handleDownload = async (shortCode: string) => {
    const url = `${window.location.origin}/q/${shortCode}`;
    const dataUrl = await QRCode.toDataURL(url, { width: 800, margin: 3 });
    const link = document.createElement('a');
    link.download = `qrcode-${shortCode}.png`;
    link.href = dataUrl;
    link.click();
    showToast('success', 'Download iniciado!');
  };

  const copyLink = (shortCode: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/q/${shortCode}`);
    showToast('success', 'Link copiado!');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg animate-slide-in ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white font-medium flex items-center gap-2`}>
          {toast.type === 'success' ? <Check size={18} /> : <X size={18} />}
          {toast.text}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">MyDay QR</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:block font-medium">
              {user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0]}
            </span>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Sair"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Criar novo */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Criar novo QR Code</h2>
          <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <textarea
                value={phrase}
                onChange={(e) => setPhrase(e.target.value)}
                placeholder="Escreve a tua mensagem aqui..."
                rows={3}
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400 transition-shadow"
              />
              <p className="text-xs text-gray-400 mt-1">{phrase.length}/500</p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={loading || !phrase.trim()}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                {loading ? 'Criando...' : 'Criar'}
              </button>
            </div>
          </form>

          {/* Preview do novo QR */}
          {newQrImage && (
            <div className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex flex-col sm:flex-row items-center gap-6 animate-fade-in border border-gray-200">
              <div className="bg-white p-3 rounded-xl shadow-sm">
                <img src={newQrImage} alt="QR Code" className="w-40 h-40 sm:w-48 sm:h-48 rounded-lg" />
              </div>
              <div className="text-center sm:text-left flex-1">
                <p className="text-green-600 font-semibold text-lg flex items-center justify-center sm:justify-start gap-2">
                  <Check size={20} /> QR Code criado com sucesso!
                </p>
                <p className="text-gray-500 mt-1">Já podes partilhar ou imprimir</p>
              </div>
              <button
                onClick={() => setNewQrImage('')}
                className="absolute top-2 right-2 sm:relative sm:top-auto sm:right-auto p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
          )}
        </div>

        {/* Lista de QR Codes */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Meus QR Codes</h2>
          </div>
          
          {qrCodes.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500">Ainda não tens QR Codes</p>
              <p className="text-sm text-gray-400">Cria o primeiro acima</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {qrCodes.map((qr, index) => (
                <div 
                  key={qr.id} 
                  className="p-4 hover:bg-gray-50 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    {/* QR Preview */}
                    <div className="flex-shrink-0">
                      {qrImages[qr.short_code] ? (
                        <img 
                          src={qrImages[qr.short_code]} 
                          alt="QR Code" 
                          className="w-20 h-20 rounded-lg border border-gray-200"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 rounded-lg animate-pulse" />
                      )}
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      {editingId === qr.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editPhrase}
                            onChange={(e) => setEditPhrase(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 text-gray-900 text-sm"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdate(qr.id)}
                              className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Salvar
                            </button>
                            <button
                              onClick={() => { setEditingId(null); setEditPhrase(''); }}
                              className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-gray-900 font-medium mb-1">{qr.phrase}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(qr.created_at).toLocaleDateString('pt-PT')}
                          </p>
                        </>
                      )}
                    </div>

                    {/* Ações */}
                    {editingId !== qr.id && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => copyLink(qr.short_code)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Copiar link"
                        >
                          <Copy size={16} />
                        </button>
                        <a
                          href={`/q/${qr.short_code}`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Ver página"
                        >
                          <ExternalLink size={16} />
                        </a>
                        <button
                          onClick={() => handleDownload(qr.short_code)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => { setEditingId(qr.id); setEditPhrase(qr.phrase); }}
                          className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(qr.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <style jsx global>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; opacity: 0; }
      `}</style>
    </div>
  );
}
