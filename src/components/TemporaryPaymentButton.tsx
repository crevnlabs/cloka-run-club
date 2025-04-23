'use client'

import { useEffect, useRef } from 'react';

export default function TemporaryPaymentButton(
    { paymentButtonId = process.env.NEXT_PUBLIC_RAZORPAY_BUTTON_ID || '' }: { paymentButtonId?: string }
) {
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
        script.async = true;
        script.dataset.payment_button_id = paymentButtonId;

        if (formRef.current) {
            formRef.current.innerHTML = '';
            formRef.current.appendChild(script);
        }

        return () => {
            if (formRef.current) {
                formRef.current.innerHTML = '';
            }
        };
    }, []);


    return <form ref={formRef} />;
} 