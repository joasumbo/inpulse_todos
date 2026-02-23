'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import {
  ArrowLeft,
  ShoppingCart,
  Palette,
  Coffee,
  Key,
  Magnet,
  Download,
  CheckCircle2,
  X,
  Loader2
} from 'lucide-react';

const categorias = [
  {
    id: 'decoracao',
    nome: 'Decoração',
    icone: Palette,
    cor: 'red',
    descricao: 'Peças decorativas em metal, pensadas para ficar à vista e ter significado. Cada palavra representa um sentimento e integra um QR discreto, que liga o físico ao digital. Não é só decoração — é uma mensagem presente todos os dias.',
    preco: '24,90€',
    produtos: [
      {
        nome: 'LOVE - Decoração Metal',
        descricao: 'Uma palavra simples, universal e direta. Decoração em metal com QR integrado, pensada para mesas, estantes ou secretárias. Para quem acredita que o amor também vive nos detalhes.',
        imagem: '/imagens/decor-love.jpeg'
      },
      {
        nome: 'AMOR - Decoração Metal',
        descricao: 'Mais próxima, mais nossa. Uma peça decorativa com presença e significado, com QR integrado de forma discreta. Ideal para casa, para oferecer ou para marcar um espaço especial.',
        imagem: '/imagens/decor-amor.jpeg'
      },
      {
        nome: 'TE AMO - Decoração Metal',
        descricao: 'Direto ao ponto, sem rodeios. Uma declaração clara, transformada numa peça decorativa sólida e intencional. Para quando a mensagem precisa de ser dita… e ficar.',
        imagem: '/imagens/decor-teamo.jpeg'
      },
      {
        nome: 'FAMÍLIA - Decoração Metal',
        descricao: 'Uma palavra que não precisa de explicação. Decoração em metal com QR integrado, pensada para o centro da casa. Porque família é presença constante.',
        imagem: '/imagens/decor-familia.jpeg'
      }
    ]
  },
  {
    id: 'canecas',
    nome: 'Canecas',
    icone: Coffee,
    cor: 'amber',
    descricao: 'Canecas pensadas para oferecer ou usar no dia a dia. Simples, diretas, com uma palavra forte e um QR integrado que acrescenta uma dimensão pessoal. Um objeto comum com um detalhe que faz a diferença.',
    preco: '13,90€',
    produtos: [
      {
        nome: 'Caneca LOVE',
        descricao: 'Uma caneca simples com uma palavra que todos reconhecem. O QR acrescenta uma camada pessoal a um objeto do dia a dia. Ideal para oferecer.',
        imagem: '/imagens/caneca-love.jpeg'
      },
      {
        nome: 'Caneca AMOR',
        descricao: 'Uma caneca pensada para casa, para uso diário ou como presente. A palavra "Amor" é clara, próxima e intemporal. O QR está lá, sem interferir no design.',
        imagem: '/imagens/caneca-amor.jpeg'
      },
      {
        nome: 'Caneca TE AMO',
        descricao: 'Para quem prefere dizer as coisas sem filtros. Uma caneca direta, com uma mensagem forte e um QR integrado. Funciona como objeto e como gesto.',
        imagem: '/imagens/caneca-teamo.jpeg'
      },
      {
        nome: 'Caneca FAMÍLIA',
        descricao: 'Uma caneca que faz sentido em qualquer cozinha. Pensada para uso diário, com uma palavra que une e um QR discreto. Simples e significativa.',
        imagem: '/imagens/caneca-familia.jpeg'
      }
    ]
  },
  {
    id: 'porta-chaves',
    nome: 'Porta-chaves',
    icone: Key,
    cor: 'blue',
    descricao: 'Produtos funcionais, sem palavras, feitos para quem quer algo discreto e prático. O QR está presente sem chamar atenção — no porta-chaves, no frigorífico ou no portátil. Para usar, não para mostrar.',
    preco: '8,90€',
    produtos: [
      {
        nome: 'Porta-chaves QR Neutro',
        descricao: 'Design simples e discreto. Feito para uso diário, sem texto nem símbolos desnecessários. Funcional e direto.',
        imagem: '/imagens/chaveiro-neutro.jpeg'
      },
      {
        nome: 'Porta-chaves QR Feminino',
        descricao: 'Linhas suaves e acabamento cuidado. Pensado para quem prefere um objeto funcional com um toque mais delicado. Sem palavras, só utilidade.',
        imagem: '/imagens/chaveiro-feminino.jpeg'
      },
      {
        nome: 'Porta-chaves QR Masculino',
        descricao: 'Mais sóbrio, mais direto. Um porta-chaves resistente, com QR discreto e sem elementos decorativos. Para uso diário, sem distrações.',
        imagem: '/imagens/chaveiro-masculino.jpeg'
      },
      {
        nome: 'Porta-chaves QR Minimal Premium',
        descricao: 'Versão mais refinada, com materiais e acabamento superiores. Pensado para quem gosta de objetos simples, mas bem feitos. Funcional e elegante.',
        imagem: '/imagens/chaveiro-premium.jpeg'
      }
    ]
  },
  {
    id: 'iman-autocolante',
    nome: 'Íman / Autocolante',
    icone: Magnet,
    cor: 'purple',
    descricao: 'Produtos funcionais, sem palavras, feitos para quem quer algo discreto e prático. O QR está presente sem chamar atenção — no frigorífico, no espelho ou no portátil.',
    preco: '6,90€',
    produtos: [
      {
        nome: 'Íman QR Clássico',
        descricao: 'Pensado para o frigorífico ou superfícies metálicas. Discreto, funcional e sempre acessível. Faz parte da casa sem chamar atenção.',
        imagem: '/imagens/iman-classico.jpeg'
      },
      {
        nome: 'Íman QR Minimal',
        descricao: 'Design preto e branco, sem texto. Ideal para quem quer algo o mais neutro possível. Funciona onde for preciso.',
        imagem: '/imagens/iman-minimal.jpeg'
      },
      {
        nome: 'Autocolante QR Espelho/Portátil',
        descricao: 'Autocolante discreto para superfícies lisas. Ideal para espelhos, portáteis ou uso pessoal. Está lá sem interferir.',
        imagem: '/imagens/autocolante-espelho.jpeg'
      },
      {
        nome: 'Autocolante QR Vinil Removível',
        descricao: 'Vinil mate, fácil de aplicar e remover. Pensado para quem quer flexibilidade. Funcional, simples e prático.',
        imagem: '/imagens/autocolante-vinil.jpeg'
      }
    ]
  },
  {
    id: 'digital',
    nome: 'Digital',
    icone: Download,
    cor: 'green',
    descricao: 'QR em formato digital para quem não quer um objeto físico. Ideal para imprimir, usar no telemóvel ou colar onde fizer sentido. Entrega imediata, sem envio.',
    preco: '2,90€',
    produtos: [
      {
        nome: 'QR Digital',
        descricao: 'Versão digital. Ideal para uso discreto ou integração em outros objetos. Download imediato.',
        imagem: null
      }
    ]
  }
];

const corClasses: Record<string, { bg: string; text: string; border: string; bgLight: string }> = {
  red: { bg: 'bg-red-600', text: 'text-red-600', border: 'border-red-600', bgLight: 'bg-red-50' },
  amber: { bg: 'bg-amber-600', text: 'text-amber-600', border: 'border-amber-600', bgLight: 'bg-amber-50' },
  blue: { bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-600', bgLight: 'bg-blue-50' },
  purple: { bg: 'bg-purple-600', text: 'text-purple-600', border: 'border-purple-600', bgLight: 'bg-purple-50' },
  green: { bg: 'bg-green-600', text: 'text-green-600', border: 'border-green-600', bgLight: 'bg-green-50' },
};

export default function PresentesPage() {
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const [showEmailPrompt, setShowEmailPrompt] = useState<any>(null);
  const [emailInput, setEmailInput] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const handleOrder = async (produto: any, preco: string) => {
    if (!user && !emailInput) {
      setShowEmailPrompt({ produto, preco });
      return;
    }

    setLoading(true);
    const email = user?.email || emailInput;
    const priceValue = parseFloat(preco.replace('€', '').replace(',', '.'));

    try {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null,
          product_name: produto.nome,
          price: priceValue,
          customer_email: email,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      setOrderSuccess(data);
      setShowEmailPrompt(null);
      setEmailInput('');

      // Abrir email em nova aba (opcional, como backup)
      const mailto = `mailto:geral.inpulse@gmail.com?subject=Encomenda: ${produto.nome}&body=Olá, gostaria de encomendar:%0A%0AProduto: ${produto.nome}%0APreço: ${preco}%0AEmail de contacto: ${email}%0A%0AEm breve entraremos em contacto para combinar o pagamento e envio.`;
      window.location.href = mailto;

    } catch (error) {
      console.error('Erro ao encomendar:', error);
      alert('Houve um erro ao processar a encomenda. Por favor, tenta novamente ou contacta-nos por email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white py-12">
        <div className="container mx-auto px-4">
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors">
            <ArrowLeft size={20} />
            Voltar ao início
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Loja MyDay QR</h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Produtos com significado. Cada peça integra um QR que liga o físico ao digital — uma mensagem que podes mudar sempre que quiseres.
          </p>
        </div>
      </div>

      {/* Categorias */}
      <div className="container mx-auto px-4 py-12">
        {/* Navegação por Categorias */}
        <div className="flex flex-wrap gap-3 mb-12 justify-center">
          <button
            onClick={() => setCategoriaAtiva(null)}
            className={`px-5 py-2.5 rounded-full font-medium transition-all ${categoriaAtiva === null
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
          >
            Todos
          </button>
          {categorias.map((cat) => {
            const cores = corClasses[cat.cor];
            const Icone = cat.icone;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoriaAtiva(cat.id)}
                className={`px-5 py-2.5 rounded-full font-medium transition-all flex items-center gap-2 ${categoriaAtiva === cat.id
                  ? `${cores.bg} text-white`
                  : `bg-white ${cores.text} hover:${cores.bgLight} border ${cores.border}`
                  }`}
              >
                <Icone size={18} />
                {cat.nome}
              </button>
            );
          })}
        </div>

        {/* Lista de Categorias e Produtos */}
        <div className="space-y-16">
          {categorias
            .filter(cat => categoriaAtiva === null || categoriaAtiva === cat.id)
            .map((categoria) => {
              const cores = corClasses[categoria.cor];
              const Icone = categoria.icone;

              return (
                <div key={categoria.id} id={categoria.id}>
                  {/* Header da Categoria */}
                  <div className={`${cores.bgLight} rounded-2xl p-8 mb-8`}>
                    <div className="flex items-start gap-4">
                      <div className={`${cores.bg} p-4 rounded-xl text-white`}>
                        <Icone size={32} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <h2 className={`text-3xl font-bold ${cores.text}`}>{categoria.nome}</h2>
                          <span className={`text-2xl font-bold ${cores.text}`}>{categoria.preco}</span>
                        </div>
                        <p className="text-gray-600 mt-3 max-w-3xl">{categoria.descricao}</p>
                      </div>
                    </div>
                  </div>

                  {/* Grid de Produtos */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categoria.produtos.map((produto, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group"
                      >
                        {produto.imagem ? (
                          <div className="aspect-square bg-gray-100 relative overflow-hidden">
                            <img
                              src={produto.imagem}
                              alt={produto.nome}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ) : (
                          <div className={`aspect-square ${cores.bgLight} flex items-center justify-center`}>
                            <Download size={48} className={cores.text} />
                          </div>
                        )}
                        <div className="p-5">
                          <h3 className="font-bold text-gray-900 mb-2">{produto.nome}</h3>
                          <p className="text-sm text-gray-500 mb-4 line-clamp-3">{produto.descricao}</p>
                          <div className="flex items-center justify-between">
                            <span className={`text-lg font-bold ${cores.text}`}>{categoria.preco}</span>
                            <button
                              onClick={() => handleOrder(produto, categoria.preco)}
                              disabled={loading}
                              className={`${cores.bg} text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50`}
                            >
                              {loading ? <Loader2 size={16} className="animate-spin" /> : <ShoppingCart size={16} />}
                              Encomendar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ainda não tens QR Code?</h2>
          <p className="text-xl text-gray-300 mb-8">Cria o teu QR Code gratuitamente e depois escolhe o produto</p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
          >
            Criar QR Code Grátis
          </Link>
        </div>
      </div>

      {/* Info Envio */}
      <div className="bg-white py-12 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl mb-3">📦</div>
              <h3 className="font-bold text-gray-900 mb-2">Envio Portugal</h3>
              <p className="text-gray-500 text-sm">Todos os preços incluem envio para Portugal Continental</p>
            </div>
            <div>
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-bold text-gray-900 mb-2">Produção Rápida</h3>
              <p className="text-gray-500 text-sm">Produtos expedidos em 3-5 dias úteis</p>
            </div>
            <div>
              <div className="text-3xl mb-3">💬</div>
              <h3 className="font-bold text-gray-900 mb-2">Suporte</h3>
              <p className="text-gray-500 text-sm">Dúvidas? Contacta-nos pelo email ou telefone</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-4 text-gray-400">MyDay QR — Inpulse Events</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm">
            <a href="mailto:geral.inpulse@gmail.com" className="text-red-400 hover:text-red-300 transition-colors">
              geral.inpulse@gmail.com
            </a>
            <span className="hidden sm:inline text-gray-600">|</span>
            <a href="tel:+351913698968" className="text-red-400 hover:text-red-300 transition-colors">
              +351 913 698 968
            </a>
          </div>
        </div>
      </footer>
      {/* Modal Sucesso */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOrderSuccess(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pedido Recebido!</h2>
            <p className="text-gray-600 mb-8">
              Obrigado! Registámos a tua intenção de encomenda para <strong>{orderSuccess.product_name}</strong>.
              Entraremos em contacto para o email <strong>{orderSuccess.customer_email}</strong> em breve.
            </p>
            <button
              onClick={() => setOrderSuccess(null)}
              className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Modal Email Prompt */}
      {showEmailPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowEmailPrompt(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full">
            <button
              onClick={() => setShowEmailPrompt(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quase lá!</h2>
            <p className="text-sm text-gray-600 mb-6">
              Precisamos do teu email para te contactar sobre a encomenda do <strong>{showEmailPrompt.produto.nome}</strong>.
            </p>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="O teu melhor email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                autoFocus
              />
              <button
                onClick={() => handleOrder(showEmailPrompt.produto, showEmailPrompt.preco)}
                disabled={!emailInput || !emailInput.includes('@') || loading}
                className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                Confirmar Pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
