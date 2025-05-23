'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Button from './Button';

type ProductProps = {
    id: string;
    name: string;
    price: number;
    image: string;
    description: string;
};

interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

interface OrderData {
    id: string;
    amount: number;
    currency: string;
    receipt?: string;
}

// Define Razorpay type
interface RazorpayOptions {
    key: string | undefined;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: RazorpayResponse) => void;
    prefill: {
        name: string;
        email: string;
        contact: string;
    };
    theme: {
        color: string;
    };
}

interface RazorpayInstance {
    open: () => void;
}

declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
    }
}

const ProductCard = ({ product, onBuyNow }: { product: ProductProps; onBuyNow: (product: ProductProps) => void }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-white text-black"
        >
            <div className="relative aspect-square overflow-hidden">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                />
            </div>
            <div className="p-4">
                <h3 className="text-xl font-bold mb-1">{product.name}</h3>
                <p className="text-lg font-medium mb-2">₹{product.price}</p>
                <p className="luxury-text text-sm mb-4 text-zinc-700">{product.description}</p>
                <Button
                    onClick={() => onBuyNow(product)}
                    variant="luxury"
                    fullWidth
                >
                    Buy Now
                </Button>
            </div>
        </motion.div>
    );
};

const Shop = ({ products }: { products: ProductProps[] }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleBuyNow = async (product: ProductProps) => {
        if (isProcessing) return;

        try {
            setIsProcessing(true);

            // Create an order on your server
            const response = await fetch('/api/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: product.price * 100, // Razorpay expects amount in paise
                    currency: 'INR',
                    receipt: `receipt_${Date.now()}`,
                    product_id: product.id,
                }),
            });

            const orderData: OrderData = await response.json();

            if (!orderData.id) {
                throw new Error('Failed to create order');
            }

            // Initialize Razorpay
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: product.price * 100,
                currency: 'INR',
                name: 'CLOKA',
                description: `Purchase of ${product.name}`,
                order_id: orderData.id,
                handler: function (response: RazorpayResponse) {
                    // Handle successful payment
                    verifyPayment(response, orderData);
                },
                prefill: {
                    name: '',
                    email: '',
                    contact: '',
                },
                theme: {
                    color: '#000000',
                },
            };

            // Type-safe Razorpay initialization
            const razorpay = new window.Razorpay(options);
            razorpay.open();

        } catch (error) {
            console.error('Payment error:', error);
            alert('Something went wrong with the payment. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const verifyPayment = async (paymentData: RazorpayResponse, orderData: OrderData) => {
        try {
            const response = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    razorpay_payment_id: paymentData.razorpay_payment_id,
                    razorpay_order_id: paymentData.razorpay_order_id,
                    razorpay_signature: paymentData.razorpay_signature,
                    order_id: orderData.id,
                }),
            });

            const data = await response.json();

            if (data.success) {
                alert('Payment successful! Your order has been placed.');
            } else {
                alert('Payment verification failed. Please contact support.');
            }
        } catch (error) {
            console.error('Verification error:', error);
            alert('Payment verification failed. Please contact support.');
        }
    };

    return (
        <section className="py-16 bg-white text-black">
            <div className="luxury-container">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onBuyNow={handleBuyNow}
                        />
                    ))}
                </div>
            </div>

            {/* Razorpay Script */}
            <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
        </section>
    );
};

export default Shop; 