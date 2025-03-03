import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { LoadingProvider } from "@/components/LoadingProvider";
import ErrorBoundary from "@/components/ErrorBoundary";

const urbanist = Urbanist({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-urbanist',
});

export const metadata: Metadata = {
  title: "CLOKA - Beyond the Seen",
  description: "A premium clothing brand rooted in the soul of India, dedicated to rekindling pride in our heritage.",
  keywords: "CLOKA, luxury clothing, Indian heritage, premium brand, Cloka Club, Run Club",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://cloka.in'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "CLOKA - Beyond the Seen",
    description: "A premium clothing brand rooted in the soul of India, dedicated to rekindling pride in our heritage.",
    url: 'https://cloka.in',
    siteName: 'CLOKA',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'CLOKA Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "CLOKA - Beyond the Seen",
    description: "A premium clothing brand rooted in the soul of India, dedicated to rekindling pride in our heritage.",
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code', // Replace with actual verification code when available
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={`${urbanist.variable} antialiased`}>
        <ErrorBoundary>
          <LoadingProvider>
            <GoogleAnalytics />
            {children}
          </LoadingProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
