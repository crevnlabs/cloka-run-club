'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ProfilePage() {
    const { user, isLoading, isAuthenticated, logout } = useAuth();
    const router = useRouter();

    // Redirect if not authenticated (this is a backup to middleware)
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/auth');
        }
    }, [isLoading, isAuthenticated, router]);

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    if (isLoading) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-black text-white flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
                        <p className="mt-4">Loading...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-black text-white py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">My Cloka</h1>

                    {user && (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                <div className="bg-zinc-800 rounded-full h-24 w-24 flex items-center justify-center text-3xl font-bold">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>

                                <div>
                                    <h2 className="text-2xl font-bold">{user.name}</h2>
                                    <p className="text-zinc-400">{user.email}</p>
                                    {user.role === 'admin' && (
                                        <span className="inline-block mt-2 px-3 py-1 bg-white text-black text-xs font-semibold rounded-full">
                                            Admin
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                            <h2 className="text-xl font-bold mb-4">Account Settings</h2>
                            <div className="space-y-4">
                                <button
                                    className="w-full py-2 px-4 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors"
                                    onClick={() => router.push('/profile/edit')}
                                >
                                    Edit Profile
                                </button>
                                <button
                                    className="w-full py-2 px-4 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors"
                                    onClick={() => router.push('/profile/change-password')}
                                >
                                    Change Password
                                </button>
                                <button
                                    className="w-full py-2 px-4 bg-red-900 hover:bg-red-800 rounded-md transition-colors"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </div>
                        </div>

                        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                            <h2 className="text-xl font-bold mb-4">My Events</h2>
                            <button
                                className="w-full py-2 px-4 bg-white text-black hover:bg-zinc-200 rounded-md transition-colors"
                                onClick={() => router.push('/my-events')}
                            >
                                View My Events
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
} 