'use client';

import React from 'react';
import Link from 'next/link';

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-zinc-50">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-red-100">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                </div>
                <h1 className="mb-4 text-2xl font-bold text-center text-zinc-800">Something went wrong</h1>
                <p className="mb-6 text-zinc-600 text-center">
                    We apologize for the inconvenience. Our team has been notified of this issue.
                </p>
                {error.digest && (
                    <p className="mb-6 text-sm text-zinc-500 text-center">
                        Error ID: {error.digest}
                    </p>
                )}
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 justify-center">
                    <button
                        onClick={reset}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="px-4 py-2 text-sm font-medium text-primary bg-white border border-primary rounded-md hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary text-center"
                    >
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
} 