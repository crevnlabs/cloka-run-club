'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Header from '@/components/Header';
import RunRegistration from '@/components/RunRegistration';
import Footer from '@/components/Footer';

// Create a client component that uses useSearchParams
function RegisterContent() {
    const searchParams = useSearchParams();
    const eventId = searchParams.get('event');

    return (
        <>
            <div className="pt-20 pb-10 bg-black">
                <div className="luxury-container">
                    <h1 className="text-4xl md:text-6xl font-black text-white text-center">Register for Run</h1>
                    <p className="text-white text-center mt-4 max-w-2xl mx-auto luxury-text">
                        Join our community of runners and be part of the CLOKA movement.
                    </p>
                </div>
            </div>

            <RunRegistration eventId={eventId || undefined} />
        </>
    );
}

export default function RegisterPage() {
    return (
        <main>
            <Header />
            <Suspense fallback={
                <div className="pt-20 pb-10 bg-black">
                    <div className="luxury-container">
                        <h1 className="text-4xl md:text-6xl font-black text-white text-center">Register for Run</h1>
                        <p className="text-white text-center mt-4 max-w-2xl mx-auto luxury-text">
                            Loading...
                        </p>
                    </div>
                </div>
            }>
                <RegisterContent />
            </Suspense>
            <Footer />
        </main>
    );
} 