import type { Metadata } from 'next'
import './globals.css'
import PwaRegistrar from '@/components/PwaRegistrar'
import InstallBanner from '@/components/InstallBanner'
import SplashScreen from '@/components/SplashScreen'

export const metadata: Metadata = {
  title: { default: 'Gestão de Manutenção', template: '%s | Manutenção' },
  description: 'Sistema de gestão de manutenção — Inpulse Events',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/icons/icon.svg',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Manutenção',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className="h-full">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#2563eb" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@400;500;600;700;800&family=Red+Hat+Text:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full">
        <SplashScreen />
        {children}
        <PwaRegistrar />
        <InstallBanner />
      </body>
    </html>
  )
}
