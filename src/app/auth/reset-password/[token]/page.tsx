'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import PasswordInput from '@/components/PasswordInput';

export default function ResetPasswordPage({
    params
}: {
    params: Promise<{ token: string }>
}) {
    const resolvedParams = use(params);
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Validate password length
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: resolvedParams.token,
                    password: formData.password
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(data.message);
                // Clear form
                setFormData({
                    password: '',
                    confirmPassword: ''
                });
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push('/auth');
                }, 3000);
            } else {
                setError(data.message);
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-grow flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-zinc-800 p-8 rounded-lg shadow-lg">
                    <h1 className="text-2xl font-bold mb-6">Reset Password</h1>

                    {success ? (
                        <div className="text-green-400 mb-4">
                            {success}
                            <p className="mt-2 text-sm">Redirecting to login page...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium mb-1">
                                    New Password
                                </label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full p-3 border focus:outline-none focus:ring-2 bg-zinc-900 border-zinc-700"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                                    Confirm New Password
                                </label>
                                <PasswordInput
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full p-3 border focus:outline-none focus:ring-2 bg-zinc-900 border-zinc-700"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="text-red-400">
                                    {error}
                                </div>
                            )}

                            <div className="flex flex-col space-y-4">
                                <Button
                                    type="submit"
                                    variant="secondary"
                                    isLoading={isLoading}
                                    loadingText="Resetting..."
                                >
                                    Reset Password
                                </Button>

                                <Button
                                    type="button"
                                    variant="primary"
                                    onClick={() => router.push('/auth')}
                                >
                                    Back to Login
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}