'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

// Declare gtag as a global function
declare global {
    interface Window {
        gtag: (
            command: string,
            targetId: string,
            config?: Record<string, unknown>
        ) => void;
        dataLayer: unknown[];
    }
}

// Component that uses useSearchParams
function GoogleAnalyticsContent() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

    useEffect(() => {
        if (!measurementId) return;

        const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

        // Send pageview with path
        window.gtag?.('config', measurementId, {
            page_path: url,
        });
    }, [pathname, searchParams, measurementId]);

    if (!measurementId) {
        return null;
    }

    return (
        <>
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
            />
            <Script
                id="google-analytics"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              page_path: window.location.pathname,
            });
          `,
                }}
            />
        </>
    );
}

export default function GoogleAnalytics() {
    return (
        <Suspense fallback={null}>
            <GoogleAnalyticsContent />
        </Suspense>
    );
}