'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

export default function PresentesPage() {
  const presentes = [
    {
      title: 'Caneca Personalizada',
      price: '17€',
      description: 'Caneca de cerâmica com QR Code impresso. Mensagem editável sempre que quiseres.',
      image: '/imagens/WhatsApp Image 2026-01-11 at 00.02.42.jpeg'
    },
    {
      title: 'T-shirt com QR Code',
      price: '25€',
      description: 'T-shirt 100% algodão com QR Code. Design único e mensagem sempre nova.',
      image: '/imagens/WhatsApp Image 2026-01-11 at 00.02.43.jpeg'
    },
    {
      title: 'Autocolante QR',
      price: '5€',
      description: 'Autocolante resistente para aplicar em qualquer superfície.',
      image: '/imagens/WhatsApp Image 2026-01-11 at 00.02.43 (1).jpeg'
    },
    {
      title: 'Quadro Decorativo',
      price: '22€',
      description: 'Quadro com moldura e QR Code personalizado.',
      image: '/imagens/WhatsApp Image 2026-01-11 at 00.02.43 (2).jpeg'
    },
    {
      title: 'Porta-chaves',
      price: '8€',
      description: 'Porta-chaves com QR Code gravado.',
      image: '/imagens/WhatsApp Image 2026-01-11 at 00.02.43 (3).jpeg'
    },
    {
      title: 'Pack Romântico',
      price: '35€',
      description: 'Caneca + Autocolante + Cartão personalizado.',
      image: '/imagens/WhatsApp Image 2026-01-11 at 00.15.45.jpeg'
    },
    {
      title: 'Almofada Personalizada',
      price: '20€',
      description: 'Almofada macia com QR Code impresso.',
      image: '/imagens/WhatsApp Image 2026-01-11 at 00.43.09.jpeg'
    },
    {
      title: 'Copo Térmico',
      price: '19€',
      description: 'Copo térmico para levar contigo e a mensagem.',
      image: '/imagens/WhatsApp Image 2026-01-11 at 00.45.07.jpeg'
    },
    {
      title: 'Carteira QR',
      price: '15€',
      description: 'Carteira com QR Code embutido.',
      image: '/imagens/WhatsApp Image 2026-01-11 at 00.45.32.jpeg'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white py-8">
        <div className="container mx-auto px-4">
          <Link href="/" className="inline-flex items-center gap-2 text-white hover:text-gray-200 mb-4">
            <ArrowLeft size={20} />
            Voltar
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Presentes MyDay QR</h1>
          <p className="text-xl opacity-90">Escolhe o presente perfeito. Todos os preços incluem envio para Portugal.</p>
        </div>
      </div>

      {/* Grid de Presentes */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {presentes.map((presente, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative h-64 bg-gray-200">
                <Image
                  src={presente.image}
                  alt={presente.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{presente.title}</h3>
                <p className="text-3xl font-bold text-red-600 mb-3">{presente.price}</p>
                <p className="text-gray-600 mb-4">{presente.description}</p>
                <a
                  href={`mailto:geral.inpulse@gmail.com?subject=Encomenda: ${presente.title}&body=Olá, gostaria de encomendar: ${presente.title} - ${presente.price}`}
                  className="inline-flex items-center gap-2 w-full justify-center px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
                >
                  <ShoppingCart size={20} />
                  Encomendar
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-red-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ainda não tens QR Code?</h2>
          <p className="text-xl mb-8">Cria o teu QR Code gratuitamente primeiro</p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-white text-red-600 font-bold rounded-xl hover:bg-gray-100 transition"
          >
            Criar QR Code Grátis
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">Criado pela Inpulse Events — soluções práticas para pessoas reais.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm">
            <a href="mailto:geral.inpulse@gmail.com" className="text-red-400 hover:text-red-300">
              geral.inpulse@gmail.com
            </a>
            <span className="hidden sm:inline text-gray-600">|</span>
            <a href="tel:960101116" className="text-red-400 hover:text-red-300">
              960 101 116
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
