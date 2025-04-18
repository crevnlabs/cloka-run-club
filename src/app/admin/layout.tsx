'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAdmin, AdminProvider } from '@/lib/admin-context';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import PageTransition from '@/components/PageTransition';

const navItems = [
    { name: 'Events', href: '/admin/events' },
    { name: 'Registrations', href: '/admin/event-registrations' },
    { name: 'Check-In', href: '/admin/event-check-in' },
    { name: 'Users', href: '/admin/users' },
];

function AdminLayoutContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isAdmin, adminUser, logout, isLoading } = useAdmin();
    const router = useRouter();

    useEffect(() => {
        // Only redirect if we're sure the admin state has been loaded and user is not admin
        if (!isLoading && !isAdmin && pathname !== '/admin/login') {
            router.push('/admin/login');
        }
    }, [isAdmin, isLoading, pathname, router]);

    // Show loading state while checking admin status
    if (isLoading && pathname !== '/admin/login') {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mb-4"></div>
                    <p className="text-white">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render the admin layout for non-admins (except on login page)
    if (!isAdmin && pathname !== '/admin/login') {
        return null;
    }

    const handleNavigation = (href: string) => {
        if (pathname !== href) {
            setIsMenuOpen(false);
            router.push(href);
        }
    };

    return (
        <div className="min-h-screen bg-black">
            {/* Header Navigation */}
            <header className="relative">
                <div className="bg-black text-white p-4">
                    <div className="container mx-auto flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <Link href="/" className="flex items-center space-x-2">
                                <Image
                                    src="/logo-text-mark.PNG"
                                    alt="CLOKA Text"
                                    width={80}
                                    height={25}
                                    className="h-auto invert"
                                />
                            </Link>
                            <h1 className="text-xl font-bold ml-2">Admin</h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            {isAdmin && (
                                <div className="text-sm text-zinc-400">
                                    {adminUser?.email}
                                </div>
                            )}

                            {/* Hamburger button */}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 rounded-md text-white hover:bg-zinc-800 focus:outline-none hover:cursor-pointer"
                                aria-label="Toggle menu"
                            >
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    {isMenuOpen ? (
                                        <path d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu - now full screen */}
                {isMenuOpen && (
                    <div className="fixed inset-0 bg-black z-50">
                        <div className="flex flex-col h-full">
                            <div className="p-4 flex justify-between items-center">
                                <div className="flex items-center space-x-2">
                                    <Image
                                        src="/logo.png"
                                        alt="CLOKA Logo"
                                        width={30}
                                        height={30}
                                        className="h-auto invert"
                                    />
                                    <Image
                                        src="/logo-text-mark.PNG"
                                        alt="CLOKA Text"
                                        width={80}
                                        height={25}
                                        className="h-auto invert"
                                    />
                                    <h1 className="text-xl font-bold ml-2 text-white">Admin</h1>
                                </div>
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="p-2 text-white hover:bg-zinc-800 rounded-md hover:cursor-pointer"
                                >
                                    <svg
                                        className="h-6 w-6"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="flex-1 flex items-center justify-center">
                                <nav className="space-y-8">
                                    {navItems.map((item) => (
                                        <button
                                            key={item.href}
                                            onClick={() => handleNavigation(item.href)}
                                            className={cn(
                                                'block w-full px-4 py-2 text-xl font-medium text-center transition-colors',
                                                pathname === item.href
                                                    ? 'text-white'
                                                    : 'text-zinc-400 hover:text-zinc-300 hover:cursor-pointer'
                                            )}
                                        >
                                            {item.name}
                                        </button>
                                    ))}
                                    {isAdmin && (
                                        <button
                                            onClick={logout}
                                            className="block w-full px-4 py-2 text-xl font-medium text-center text-zinc-400 hover:text-zinc-300 hover:cursor-pointer"
                                        >
                                            Logout
                                        </button>
                                    )}
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <div className="container mx-auto text-white">
                    <Suspense fallback={
                        <PageTransition variant="admin">
                            <div />
                        </PageTransition>
                    }>
                        <PageTransition variant="admin">
                            {children}
                        </PageTransition>
                    </Suspense>
                </div>
            </main>
        </div>
    );
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </AdminProvider>
    );
} 