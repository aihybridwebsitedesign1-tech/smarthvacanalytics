import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'SmartHVACAnalytics - HVAC Business Analytics & KPI Tracking',
  description: 'Transform your HVAC business with real-time analytics, performance tracking, and actionable insights. 14-day free trial. No credit card required.',
  keywords: ['HVAC analytics', 'HVAC KPI tracking', 'HVAC business software', 'technician productivity', 'HVAC management'],
  authors: [{ name: 'SmartHVACAnalytics' }],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png' }
    ],
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'SmartHVACAnalytics - HVAC Business Analytics',
    description: 'Transform your HVAC business with real-time analytics and performance tracking.',
    url: 'https://smarthvacanalytics.com',
    siteName: 'SmartHVACAnalytics',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SmartHVACAnalytics',
    description: 'Transform your HVAC business with real-time analytics and performance tracking.',
  },
  metadataBase: new URL('https://smarthvacanalytics.com'),
  alternates: {
    canonical: 'https://smarthvacanalytics.com',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
