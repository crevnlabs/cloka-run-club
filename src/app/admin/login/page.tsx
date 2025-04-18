'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import PasswordInput from '@/components/PasswordInput';
import Button from '@/components/Button';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check if dark mode is active
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkMode(darkModeQuery.matches);

        // Listen for changes
        const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
        darkModeQuery.addEventListener('change', handleChange);

        return () => darkModeQuery.removeEventListener('change', handleChange);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            console.log('Login response:', { status: response.status, data });

            if (response.ok && data.success) {
                // Successful login
                console.log('Login successful, redirecting...');
                // Force a small delay to ensure cookie is set
                await new Promise(resolve => setTimeout(resolve, 100));
                router.push('/admin/event-registrations');
                // If the above doesn't work, try replacing with:
                // window.location.href = '/admin/event-registrations';
            } else {
                console.error('Login failed:', data.message);
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--background)' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="p-8 rounded-lg shadow-lg max-w-md w-full"
                style={{
                    background: isDarkMode ? '#1a1a1a' : '#f5f5f5',
                    color: 'var(--foreground)',
                    borderColor: 'var(--accent)',
                    borderWidth: '1px'
                }}
            >
                <h1 className="text-2xl font-bold text-center mb-6" style={{ color: 'var(--foreground)' }}>Admin Login</h1>

                {error && (
                    <div className="p-4 rounded-md mb-4" style={{
                        backgroundColor: isDarkMode ? '#3b0d0d' : '#fee2e2',
                        borderColor: isDarkMode ? '#7f1d1d' : '#fecaca',
                        color: isDarkMode ? '#fca5a5' : '#b91c1c',
                        border: '1px solid'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2"
                            style={{
                                borderColor: 'var(--accent)',
                                backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
                                color: 'var(--foreground)',
                            }}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                            Password
                        </label>
                        <PasswordInput
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2"
                            style={{
                                borderColor: 'var(--accent)',
                                backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
                                color: 'var(--foreground)',
                            }}
                            showHelperText={false}
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3 rounded-md transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        style={{
                            backgroundColor: 'var(--foreground)',
                            color: 'var(--background)',
                        }}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </Button>
                </form>
            </motion.div>
        </div>
    );
} 