import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/query-provider';
import { AuthProvider } from '@/providers/auth-context';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'GymFlow - Owner Dashboard',
  description: 'Manage your gym business with ease. Staff, pricing, clients, and scheduling all in one place.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} font-sans antialiased h-full bg-zinc-50`} suppressHydrationWarning>
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              duration: 4000,
              className: 'text-sm',
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}

