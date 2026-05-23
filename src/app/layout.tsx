import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CrisisSwarm - AI-Powered Incident Response',
  description: 'Real-time AI-powered incident monitoring and autonomous response dashboard.',
  keywords: ['incident response', 'monitoring', 'AI', 'Azure', 'DevOps'],
  authors: [{ name: 'CrisisSwarm Team' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="theme-color" content="#0B1220" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body
        className={`${inter.className} bg-cs-dark-800 text-cs-dark-50 antialiased overflow-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
