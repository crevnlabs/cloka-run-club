'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TestLoginPage() {
    const [message, setMessage] = useState('Testing login...');
    const router = useRouter();

    useEffect(() => {
        const testLogin = async () => {
            try {
                // Set a test cookie directly
                document.cookie = "cloka_admin_auth=default_admin_token_for_auth; path=/; max-age=86400; samesite=lax";

                setMessage('Test cookie set. Redirecting in 3 seconds...');

                // Wait 3 seconds then redirect
                setTimeout(() => {
                    setMessage('Redirecting now...');
                    // Try both methods
                    try {
                        router.push('/admin/registrations');
                    } catch (err) {
                        console.error('Router navigation failed:', err);
                        window.location.href = '/admin/registrations';
                    }
                }, 3000);
            } catch (err) {
                console.error('Test login error:', err);
                setMessage('Error: ' + (err instanceof Error ? err.message : String(err)));
            }
        };

        testLogin();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
                <h1 className="text-2xl font-bold text-center mb-6">Admin Login Test</h1>
                <p className="text-center">{message}</p>
            </div>
        </div>
    );
} 