import { notFound } from 'next/navigation';

const SUPABASE_URL = 'https://mqkqfpbaxnjtadinctek.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xa3FmcGJheG5qdGFkaW5jdGVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNTQxNTYsImV4cCI6MjA4MTczMDE1Nn0.Ve8L7DAAsbUXUp6aXoPBo0MqTi5I1a-mg6EV37KR3s4';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function QRCodePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const response = await fetch(`${SUPABASE_URL}/rest/v1/qrcodes?short_code=eq.${code}&select=phrase,created_at`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
    cache: 'no-store',
  });

  const data = await response.json();
  const qrCode = data[0];

  if (!qrCode) {
    notFound();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 via-red-600 to-rose-700 px-4 py-12">
      <div className="max-w-2xl w-full" style={{ animation: 'fadeIn 0.6s ease-out forwards' }}>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}} />
        
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-rose-600 px-8 py-6 text-center">
            <h1 className="text-2xl font-bold text-white tracking-tight">MyDay QR</h1>
          </div>
          
          <div className="p-8 md:p-12">
            <div className="relative">
              <div className="absolute -top-4 left-0 text-6xl text-red-200 font-serif leading-none select-none">"</div>
              <div className="absolute -bottom-4 right-0 text-6xl text-red-200 font-serif leading-none select-none">"</div>
              
              <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-8 md:p-10 border border-red-100">
                <p className="text-2xl md:text-3xl text-gray-800 leading-relaxed text-center font-light whitespace-pre-wrap">
                  {qrCode.phrase}
                </p>
              </div>
            </div>
            
            <p className="text-center text-gray-400 text-sm mt-8">
              Criado em {new Date(qrCode.created_at).toLocaleDateString('pt-PT', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
          
          <div className="border-t border-gray-100 px-8 py-6 bg-gray-50 text-center">
            <p className="text-gray-500 mb-4">Cria a tua mensagem especial</p>
            <a 
              href="/" 
              className="inline-block px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              Criar QR Code
            </a>
          </div>
        </div>
        
        <p className="text-center text-white/80 text-sm mt-6">
          Powered by <span className="font-semibold">Inpulse Events</span>
        </p>
      </div>
    </div>
  );
}
