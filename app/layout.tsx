import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Chatbot Evaluator',
  description: 'Evaluate and improve your chatbots with data-driven insights',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${inter.className} bg-gray-50`}>
        <Navbar />
        <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {children}
        </main>
      </body>
    </html>
  );
}
