import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Zipy — Zippy Express',
  description: 'Tu delivery local más rápido. Pide de tus restaurantes favoritos y recibe en minutos.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Zipy' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#f97316',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-screen bg-orange-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
