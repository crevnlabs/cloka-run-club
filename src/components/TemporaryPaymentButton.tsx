'use client'

import { useEffect, useRef } from 'react';

export default function TemporaryPaymentButton() {
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
        script.async = true;
        script.dataset.payment_button_id = 'pl_QGr8vsz93aK3Uv';

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