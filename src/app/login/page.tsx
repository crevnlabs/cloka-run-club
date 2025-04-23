'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function LoginRedirect() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            router.replace('/profile');
            return;
        }

        // Get all current search params
        const params = new URLSearchParams();
        searchParams.forEach((value, key) => {
            params.append(key, value);
        });

        // Redirect to the new auth page
        router.replace(`/auth${params.toString() ? '?' + params.toString() : ''}`);
    }, [router, searchParams, isAuthenticated]);

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <p>Redirecting...</p>
        </div>
    );
}