'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PasswordInput from '@/components/PasswordInput';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/profile';
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            console.log("Attempting login with email:", email);
            // Don't log the actual password in production, this is for debugging only
            console.log("Password length:", password.length);

            const result = await login(email, password);

            if (result.success) {
                router.push(redirect);
            } else {
                setError(result.message);
            }
        } catch (err: unknown) {
            setError('An error occurred. Please try again.');
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Header />
            <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="p-8 rounded-lg shadow-lg max-w-md w-full border border-zinc-800"
                >
                    <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

                    {error && (
                        <div className="p-4 rounded-md mb-4 bg-red-900/30 border border-red-800 text-red-300">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-1">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 bg-zinc-900 border-zinc-700"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-1">
                                Password
                            </label>
                            <PasswordInput
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 bg-zinc-900 border-zinc-700"
                                required
                                showHelperText={false}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3 rounded-md transition-colors bg-white text-black hover:bg-zinc-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                        >
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-zinc-400">
                            Don&apos;t have an account?{' '}
                            <Link href="/signup" className="text-white hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
            <Footer />
        </>
    );
}