'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Loader from './Loader';

interface PageTransitionProps {
    children: React.ReactNode;
    variant?: 'default' | 'admin';
}

export default function PageTransition({ children, variant = 'default' }: PageTransitionProps) {
    const pathname = usePathname();
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        setIsTransitioning(true);
        setShouldRender(true);

        const timer = setTimeout(() => {
            setIsTransitioning(false);
            // Add a small delay before removing the loader from DOM to ensure smooth transitions
            setTimeout(() => {
                setShouldRender(false);
            }, 200);
        }, 300);

        return () => {
            clearTimeout(timer);
        };
    }, [pathname]);

    const LoaderComponent = variant === 'admin' ? (
        <div className="fixed inset-0 bg-black z-40 flex items-center justify-center">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mb-4"></div>
                <p className="text-white">Loading...</p>
            </div>
        </div>
    ) : (
        <div className="fixed inset-0 bg-black z-40 flex items-center justify-center">
            <Loader
                size="large"
                variant="spinner"
                text="Loading CLOKA..."
            />
        </div>
    );

    return (
        <>
            {shouldRender && isTransitioning && LoaderComponent}
            <div className={isTransitioning ? 'opacity-0' : 'opacity-100 transition-opacity duration-200'}>
                {children}
            </div>
        </>
    );
} 