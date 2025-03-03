'use client';

import React from 'react';
import Loader from './Loader';

interface LoadingButtonProps {
    isLoading: boolean;
    text: string;
    loadingText?: string;
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    size?: 'small' | 'medium' | 'large';
    className?: string;
    disabled?: boolean;
    onClick?: () => void;
}

export default function LoadingButton({
    isLoading,
    text,
    loadingText,
    type = 'button',
    variant = 'primary',
    size = 'medium',
    className = '',
    disabled = false,
    onClick,
}: LoadingButtonProps) {
    const baseClasses = 'flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variantClasses = {
        primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-300',
        outline: 'bg-transparent text-primary border border-primary hover:bg-primary/10 focus:ring-primary',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    };

    const sizeClasses = {
        small: 'py-1 px-3 text-sm',
        medium: 'py-2 px-4 text-base',
        large: 'py-3 px-6 text-lg',
    };

    const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    return (
        <button
            type={type}
            className={buttonClasses}
            disabled={disabled || isLoading}
            onClick={onClick}
        >
            {isLoading ? (
                <>
                    <Loader size="small" variant="spinner" className="mr-2" />
                    <span>{loadingText || text}</span>
                </>
            ) : (
                <span>{text}</span>
            )}
        </button>
    );
} 