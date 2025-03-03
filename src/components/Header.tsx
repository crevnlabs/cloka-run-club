'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
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
                <nav className="hidden md:flex w-full md:w-1/3 justify-end space-x-8">
                    <Link href="/events" className="luxury-text hover:text-accent transition-colors">
                        Events
                    </Link>
                    <Link href="/register" className="luxury-text hover:text-accent transition-colors">
                        Register for Runs
                    </Link>
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
                            href="/"
                            className="luxury-text hover:text-accent transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            href="/about"
                            className="luxury-text hover:text-accent transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Cloka&apos;s Story
                        </Link>
                        <Link
                            href="/events"
                            className="luxury-text hover:text-accent transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Events
                        </Link>
                        <Link
                            href="/runner-of-the-week"
                            className="luxury-text hover:text-accent transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Runner of the Week
                        </Link>
                        <Link
                            href="/register"
                            className="luxury-text hover:text-accent transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Register for Runs
                        </Link>
                        <Link
                            href="/shop"
                            className="luxury-text hover:text-accent transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Shop
                        </Link>
                    </div>
                </motion.div>
            )}
        </header>
    );
};

export default Header; 