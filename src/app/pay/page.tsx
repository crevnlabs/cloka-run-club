
import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TemporaryPaymentButton from '@/components/TemporaryPaymentButton';

export const metadata: Metadata = {
    title: 'Run & Game | Week 16 payment | Cloka',
    description: 'Run & Game | Week 16 payment for Cloka Club',
};

export default function ShippingPolicy() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Header />
            <div className="mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8">Run & Game | Week 16 payment</h1>

                <div className="prose prose-lg max-w-none space-y-8">
                    <p className="leading-relaxed">
                        You can pay for the event using the button below.
                    </p>

                    <TemporaryPaymentButton />
                </div>
            </div>
            <Footer />
        </div>
    );
}
