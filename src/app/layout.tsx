import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/query-provider';
import { AuthProvider } from '@/providers/auth-context';
import { ThemeProvider } from '@/providers/theme-provider';
import { BrandThemeRoot } from '@/components/dashboard/BrandThemeRoot';
import { Toaster } from 'sonner';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
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
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={`${plusJakarta.variable} font-sans antialiased h-full bg-canvas text-foreground`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <BrandThemeRoot>{children}</BrandThemeRoot>
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
        </ThemeProvider>
      </body>
    </html>
  );
}
