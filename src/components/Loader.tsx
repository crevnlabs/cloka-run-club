import React from 'react';

type LoaderSize = 'small' | 'medium' | 'large';
type LoaderVariant = 'spinner' | 'dots' | 'pulse';

interface LoaderProps {
    size?: LoaderSize;
    variant?: LoaderVariant;
    text?: string;
    fullScreen?: boolean;
    className?: string;
}

export default function Loader({
    size = 'medium',
    variant = 'spinner',
    text,
    fullScreen = false,
    className = '',
}: LoaderProps) {
    const sizeClasses = {
        small: 'w-4 h-4',
        medium: 'w-8 h-8',
        large: 'w-12 h-12',
    };

    const renderLoader = () => {
        switch (variant) {
            case 'spinner':
                return (
                    <div className={`${sizeClasses[size]} border-4 border-t-transparent border-primary rounded-full animate-spin ${className}`}></div>
                );
            case 'dots':
                return (
                    <div className={`flex space-x-2 ${className}`}>
                        <div className={`${size === 'small' ? 'w-2 h-2' : size === 'medium' ? 'w-3 h-3' : 'w-4 h-4'} bg-primary rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
                        <div className={`${size === 'small' ? 'w-2 h-2' : size === 'medium' ? 'w-3 h-3' : 'w-4 h-4'} bg-primary rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
                        <div className={`${size === 'small' ? 'w-2 h-2' : size === 'medium' ? 'w-3 h-3' : 'w-4 h-4'} bg-primary rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
                    </div>
                );
            case 'pulse':
                return (
                    <div className={`${sizeClasses[size]} bg-primary rounded-full animate-pulse ${className}`}></div>
                );
            default:
                return null;
        }
    };

    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 z-50">
                {renderLoader()}
                {text && <p className="mt-4 text-gray-700">{text}</p>}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center">
            {renderLoader()}
            {text && <p className="mt-2 text-sm text-gray-600">{text}</p>}
        </div>
    );
} 