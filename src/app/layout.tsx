import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  themeColor: '#0B1713',
};

export const metadata: Metadata = {
  title: 'Hacktoberfest Yaoundé 26 — AI + Hackfest | Modulis Team Balancer',
  description:
    'Application officielle de matchmaking et d\'équilibrage d\'équipes de 3 pour le Hacktoberfest Yaoundé 26 par Modulis. Classement en direct des commits GitHub et parité garantie.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <meta name="theme-color" content="#0B1713" />
        <link rel="preconnect" href="https://api.github.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://avatars.githubusercontent.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.github.com" />
        <link rel="dns-prefetch" href="https://avatars.githubusercontent.com" />
      </head>
      <body className="min-h-full flex flex-col bg-[#0B1713] text-[#F3F4F6] selection:bg-[#E6392F]/30 selection:text-white antialiased">{children}</body>
    </html>
  );
}
