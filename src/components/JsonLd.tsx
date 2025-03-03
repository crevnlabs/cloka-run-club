import React from 'react';

interface JsonLdProps {
    data: Record<string, unknown>;
}

export default function JsonLd({ data }: JsonLdProps) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}

// Organization schema
export const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CLOKA',
    url: 'https://cloka.in',
    logo: 'https://cloka.in/logo.png',
    sameAs: [
        'https://www.instagram.com/cloka.in/',
        'https://www.facebook.com/cloka.in/',
        // Add other social media profiles
    ],
    contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+91-XXXXXXXXXX', // Replace with actual phone number
        contactType: 'customer service',
        email: 'info@cloka.in', // Replace with actual email
    },
};

// Product schema
export function productSchema(product: {
    name: string;
    description: string;
    image: string;
    price: number;
    currency: string;
    sku: string;
    availability: string;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.image,
        sku: product.sku,
        offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: product.currency,
            availability: `https://schema.org/${product.availability}`,
        },
    };
}

// Event schema
export function eventSchema(event: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    image: string;
    url: string;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: event.name,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        location: {
            '@type': 'Place',
            name: event.location,
            address: {
                '@type': 'PostalAddress',
                addressLocality: 'City', // Replace with actual city
                addressRegion: 'State', // Replace with actual state
                addressCountry: 'India',
            },
        },
        image: event.image,
        url: event.url,
        organizer: {
            '@type': 'Organization',
            name: 'CLOKA',
            url: 'https://cloka.in',
        },
    };
} 