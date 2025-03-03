import React from 'react';

interface SkeletonProps {
    className?: string;
}

export function TextSkeleton({ className = '' }: SkeletonProps) {
    return (
        <div className={`animate-pulse bg-gray-200 rounded h-4 ${className}`}></div>
    );
}

export function CircleSkeleton({ className = '' }: SkeletonProps) {
    return (
        <div className={`animate-pulse bg-gray-200 rounded-full ${className}`}></div>
    );
}

export function RectangleSkeleton({ className = '' }: SkeletonProps) {
    return (
        <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
    );
}

export function ProductCardSkeleton() {
    return (
        <div className="border rounded-lg overflow-hidden">
            <RectangleSkeleton className="w-full h-64" />
            <div className="p-4 space-y-3">
                <TextSkeleton className="w-2/3" />
                <TextSkeleton className="w-1/3" />
                <TextSkeleton className="w-1/4" />
            </div>
        </div>
    );
}

export function EventCardSkeleton() {
    return (
        <div className="border rounded-lg overflow-hidden">
            <RectangleSkeleton className="w-full h-48" />
            <div className="p-4 space-y-3">
                <TextSkeleton className="w-3/4" />
                <TextSkeleton className="w-1/2" />
                <div className="flex space-x-2 pt-2">
                    <TextSkeleton className="w-1/4" />
                    <TextSkeleton className="w-1/4" />
                </div>
            </div>
        </div>
    );
}

export function ProfileSkeleton() {
    return (
        <div className="flex items-center space-x-4">
            <CircleSkeleton className="w-16 h-16" />
            <div className="space-y-2">
                <TextSkeleton className="w-32" />
                <TextSkeleton className="w-24" />
            </div>
        </div>
    );
}

export function TableRowSkeleton() {
    return (
        <div className="flex space-x-4 py-3">
            <TextSkeleton className="w-1/4" />
            <TextSkeleton className="w-1/4" />
            <TextSkeleton className="w-1/4" />
            <TextSkeleton className="w-1/4" />
        </div>
    );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(count).fill(0).map((_, index) => (
                <ProductCardSkeleton key={index} />
            ))}
        </div>
    );
}

export function EventGridSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(count).fill(0).map((_, index) => (
                <EventCardSkeleton key={index} />
            ))}
        </div>
    );
} 