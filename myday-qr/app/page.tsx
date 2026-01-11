'use client';

import Link from 'next/link';
import { Heart, Gift, Calendar, Sparkles, QrCode, ShoppingBag } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-red-500 via-red-600 to-rose-700 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo/Brand */}
            <div className="inline-block bg-white px-8 py-4 rounded-2xl shadow-2xl mb-8">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                MyDay QR
              </h1>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Um presente que nunca fica igual
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl mb-12 leading-relaxed opacity-95">
              Um objeto físico com um QR Code que te permite mudar a mensagem sempre que quiseres.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link
                href="/register"
                className="px-10 py-4 bg-white hover:bg-gray-100 text-red-600 font-bold rounded-xl shadow-2xl hover:shadow-xl transition-all transform hover:scale-105 text-lg"
              >
                Criar Conta Grátis
              </Link>
              <Link
                href="/login"
                className="px-10 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-lg text-white font-bold rounded-xl border-2 border-white/30 transition-all transform hover:scale-105 text-lg"
              >
                Já tenho conta
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Context Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-2xl text-gray-800 leading-relaxed mb-4">
              Canecas, autocolantes, t-shirts e pequenas decorações com um QR Code especial.
            </p>
            <p className="text-2xl font-semibold text-red-600">
              Hoje uma frase. Amanhã outra. Sempre a mesma peça.
            </p>
          </div>
        </div>
      </div>

      {/* Para quem é */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
              Para quem é este tipo de presente
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 p-6 bg-red-50 rounded-xl">
                <Heart className="text-red-600 flex-shrink-0" size={32} />
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Namorados e namoradas</h3>
                  <p className="text-gray-600">Surpreende quem amas com mensagens que renovas sempre que quiseres</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 bg-red-50 rounded-xl">
                <Gift className="text-red-600 flex-shrink-0" size={32} />
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Casais</h3>
                  <p className="text-gray-600">Um presente único que evolui com a vossa relação</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 bg-red-50 rounded-xl">
                <Calendar className="text-red-600 flex-shrink-0" size={32} />
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Datas especiais</h3>
                  <p className="text-gray-600">Aniversários, Natal, Dia dos Namorados... sempre especial</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 bg-red-50 rounded-xl">
                <Sparkles className="text-red-600 flex-shrink-0" size={32} />
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Pessoas que gostam de pequenos gestos diários</h3>
                  <p className="text-gray-600">Para quem valoriza atenção e afeto no dia a dia</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Porque é diferente */}
      <div className="py-20 bg-gradient-to-br from-red-50 to-rose-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
              Porque este presente é diferente
            </h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-md">
                <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-lg text-gray-800">O objeto é físico e fica em casa</p>
              </div>
              <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-md">
                <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-lg text-gray-800">A mensagem pode mudar todos os dias</p>
              </div>
              <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-md">
                <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-lg text-gray-800">Não é descartável</p>
              </div>
              <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-md">
                <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-lg text-gray-800">Cria um hábito simples e emocional</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exemplos reais */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
              Exemplos reais
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center group">
                <div className="bg-gray-50 rounded-xl overflow-hidden mb-4 h-56 flex items-center justify-center relative">
                  <img 
                    src="/imagens/caneca.jpeg" 
                    alt="Caneca com QR Code" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-2">Caneca com frase diária</h3>
                <p className="text-gray-600">Café da manhã com uma mensagem sempre nova</p>
              </div>
              <div className="text-center group">
                <div className="bg-gray-50 rounded-xl overflow-hidden mb-4 h-56 flex items-center justify-center relative">
                  <img 
                    src="/imagens/autocolante.jpeg" 
                    alt="Autocolante com QR Code" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-2">Autocolante para colocar num objeto</h3>
                <p className="text-gray-600">No portátil, agenda ou espelho</p>
              </div>
              <div className="text-center group">
                <div className="bg-gray-50 rounded-xl overflow-hidden mb-4 h-56 flex items-center justify-center relative">
                  <img 
                    src="/imagens/quadro.jpeg" 
                    alt="Quadro com QR Code" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-2">Peça na mesa de cabeceira</h3>
                <p className="text-gray-600">A última coisa que vês antes de dormir</p>
              </div>
              <div className="text-center group">
                <div className="bg-gray-50 rounded-xl overflow-hidden mb-4 h-56 flex items-center justify-center relative">
                  <img 
                    src="/imagens/tshirt.jpeg" 
                    alt="T-shirt com QR Code" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-2">T-shirt com mensagem sempre nova</h3>
                <p className="text-gray-600">Uma t-shirt que nunca enjoa</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Como funciona */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
              Como funciona
            </h2>
            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="bg-red-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Crias o QR Code</h3>
                  <p className="text-gray-600">Regista-te gratuitamente e gera o teu QR code personalizado</p>
                </div>
              </div>
              <div className="flex items-start gap-6">
                <div className="bg-red-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Escolhes o objeto</h3>
                  <p className="text-gray-600">Caneca, t-shirt, autocolante ou outra peça à tua escolha</p>
                </div>
              </div>
              <div className="flex items-start gap-6">
                <div className="bg-red-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Decides a mensagem inicial</h3>
                  <p className="text-gray-600">E mudas sempre que quiseres, quantas vezes quiseres</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preços */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
              Preços
            </h2>
            <p className="text-center text-gray-600 mb-12">Já inclui envio para Portugal</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-6 text-center border-2 border-red-200">
                <h3 className="font-bold text-xl text-gray-900 mb-2">Download</h3>
                <p className="text-4xl font-bold text-red-600 mb-4">2€</p>
                <p className="text-gray-600 text-sm">Arquivo digital do QR Code</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-6 text-center border-2 border-red-200">
                <h3 className="font-bold text-xl text-gray-900 mb-2">Imagem com QR</h3>
                <p className="text-4xl font-bold text-red-600 mb-4">5€</p>
                <p className="text-gray-600 text-sm">Design personalizado</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-6 text-center border-2 border-red-200">
                <h3 className="font-bold text-xl text-gray-900 mb-2">Caneca</h3>
                <p className="text-4xl font-bold text-red-600 mb-4">17€</p>
                <p className="text-gray-600 text-sm">Caneca personalizada</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-6 text-center border-2 border-red-200">
                <h3 className="font-bold text-xl text-gray-900 mb-2">T-shirt</h3>
                <p className="text-4xl font-bold text-red-600 mb-4">25€</p>
                <p className="text-gray-600 text-sm">T-shirt com QR Code</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Link Presentes */}
      <div className="py-12 bg-red-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <Link
            href="/presentes"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-red-600 font-bold rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105"
          >
            <ShoppingBag size={24} />
            Ver Presentes
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg mb-4">
              Criado pela Inpulse Events — soluções práticas para pessoas reais.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="mailto:geral.inpulse@gmail.com" className="text-red-400 hover:text-red-300 transition">
                geral.inpulse@gmail.com
              </a>
              <span className="hidden sm:inline text-gray-600">|</span>
              <a href="tel:960101116" className="text-red-400 hover:text-red-300 transition">
                960 101 116
              </a>
            </div>
            <p className="text-gray-500 text-sm mt-6">
              © {new Date().getFullYear()} MyDay QR - Inpulse Events
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
