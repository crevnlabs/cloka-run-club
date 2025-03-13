'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Bars3Icon, XMarkIcon, UserCircleIcon as UserCircleIconOutline, } from '@heroicons/react/24/outline';
import { UserCircleIcon as UserCircleIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '@/lib/auth-context';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        // Close profile menu if open
        if (isProfileMenuOpen) setIsProfileMenuOpen(false);
    };

    const toggleProfileMenu = () => {
        setIsProfileMenuOpen(!isProfileMenuOpen);
        // Close main menu if open
        if (isMenuOpen) setIsMenuOpen(false);
    };

    const handleLogout = async () => {
        await logout();
        setIsProfileMenuOpen(false);
    };

    return (
        <header className="bg-black text-white py-4 sticky top-0 z-50">
            <div className="luxury-container flex flex-col md:flex-row items-center">
                {/* Left Side with Text-Mark Logo */}
                <div className="w-full md:w-1/3 flex items-center">
                    <button
                        className="md:hidden text-white mr-4"
                        onClick={toggleMenu}
                        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                    >
                        {isMenuOpen ? (
                            <XMarkIcon className="h-6 w-6" />
                        ) : (
                            <Bars3Icon className="h-6 w-6" />
                        )}
                    </button>

                    <Link href="/" className="hidden md:flex items-center">
                        <Image
                            src="/logo-text-mark.PNG"
                            alt="CLOKA Text Logo"
                            width={160}
                            height={80}
                            className="h-auto invert"
                            priority
                        />
                    </Link>
                </div>

                {/* Centered Logo */}
                <div className="w-full md:w-1/3 flex justify-center">
                    <Link href="/" className="flex items-center justify-center">
                        <Image
                            src="/logo.png"
                            alt="CLOKA Logo"
                            width={150}
                            height={150}
                            className="h-auto invert -my-10"
                            priority
                        />
                    </Link>
                </div>

                {/* Desktop Navigation - Right Side */}
                <nav className="hidden md:flex w-full md:w-1/3 justify-end space-x-8 items-center">
                    <Link href="/events" className="luxury-text hover:text-accent transition-colors hover:underline">
                        Events
                    </Link>
                    <Link href="/auth?mode=signup" className="luxury-text hover:text-accent transition-colors hover:underline">
                        Join
                    </Link>

                    {/* Profile Icon */}
                    <div className="relative">
                        <button
                            onClick={toggleProfileMenu}
                            className="flex items-center focus:outline-none cursor-pointer"
                            aria-label="Toggle profile menu"
                        >
                            {isAuthenticated && user ? (
                                <div className="bg-white text-black rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                            ) : (
                                isProfileMenuOpen ? <UserCircleIconOutline className="h-8 w-8 text-white" /> : <UserCircleIconSolid className="h-8 w-8 text-white" />
                            )}
                        </button>

                        {/* Profile Dropdown Menu */}
                        {isProfileMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-md shadow-lg py-1 z-50"
                            >
                                {isAuthenticated && user ? (
                                    <>
                                        <div className="px-4 py-2 border-b border-zinc-800">
                                            <p className="text-sm font-medium">{user.name}</p>
                                            <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                                        </div>
                                        <Link
                                            href="/profile"
                                            className="block px-4 py-2 text-sm hover:bg-zinc-800"
                                            onClick={() => setIsProfileMenuOpen(false)}
                                        >
                                            My Profile
                                        </Link>
                                        <Link
                                            href="/my-events"
                                            className="block px-4 py-2 text-sm hover:bg-zinc-800"
                                            onClick={() => setIsProfileMenuOpen(false)}
                                        >
                                            My Events
                                        </Link>
                                        {user.role === 'admin' && (
                                            <Link
                                                href="/admin"
                                                className="block px-4 py-2 text-sm hover:bg-zinc-800"
                                                onClick={() => setIsProfileMenuOpen(false)}
                                            >
                                                Admin Dashboard
                                            </Link>
                                        )}
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-800"
                                        >
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/auth"
                                            className="block px-4 py-2 text-sm hover:bg-zinc-800"
                                            onClick={() => setIsProfileMenuOpen(false)}
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            href="/auth?mode=signup"
                                            className="block px-4 py-2 text-sm hover:bg-zinc-800"
                                            onClick={() => setIsProfileMenuOpen(false)}
                                        >
                                            Sign Up
                                        </Link>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </div>
                </nav>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="md:hidden bg-black"
                >
                    <div className="luxury-container py-4 flex flex-col space-y-4">
                        <Link
                            href="/events"
                            className="luxury-text hover:text-accent transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Events
                        </Link>
                        <Link
                            href="/auth?mode=signup"
                            className="luxury-text hover:text-accent transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Register for Runs
                        </Link>

                        {/* Mobile Auth Links */}
                        <div className="pt-2 border-t border-zinc-800">
                            {isAuthenticated && user ? (
                                <>
                                    <div className="flex items-center space-x-3 mb-3">
                                        <div className="bg-white text-black rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{user.name}</p>
                                            <p className="text-xs text-zinc-400">{user.email}</p>
                                        </div>
                                    </div>
                                    <Link
                                        href="/profile"
                                        className="block py-2 luxury-text hover:text-accent"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        My Profile
                                    </Link>
                                    <Link
                                        href="/my-events"
                                        className="block py-2 luxury-text hover:text-accent"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        My Events
                                    </Link>
                                    {user.role === 'admin' && (
                                        <Link
                                            href="/admin"
                                            className="block py-2 luxury-text hover:text-accent"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Admin Dashboard
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left py-2 text-red-400 hover:text-red-300"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/auth"
                                        className="block py-2 luxury-text hover:text-accent"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/auth?mode=signup"
                                        className="block py-2 luxury-text hover:text-accent"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </header>
    );
};

export default Header; 