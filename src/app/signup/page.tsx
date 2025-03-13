'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SignupRedirect() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Get all current search params
        const params = new URLSearchParams();
        searchParams.forEach((value, key) => {
            params.append(key, value);
        });

        // Add the signup mode
        params.set('mode', 'signup');

        // Redirect to the new auth page
        router.replace(`/auth${params.toString() ? '?' + params.toString() : ''}`);
    }, [router, searchParams]);

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <p>Redirecting to signup page...</p>
        </div>
    );
} 