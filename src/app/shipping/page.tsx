import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
    title: 'Shipping Policy | Cloka',
    description: 'Shipping policy and delivery information for Cloka customers',
};

export default function ShippingPolicy() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Header />
            <div className="mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8">Shipping Policy</h1>

                <div className="prose prose-lg max-w-none space-y-8">
                    <p className="leading-relaxed">
                        Thank you for shopping with Cloka.in! We are committed to delivering your stylish clothing orders accurately, in good condition, and on time.
                        Below are the terms and conditions that constitute our Shipping Policy.
                    </p>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold ">Order Processing Time</h2>
                        <p className="">
                            All orders are processed within 2-3 business days from the date of purchase.
                            Orders are not processed or shipped on weekends or public holidays.
                            During peak seasons or promotional periods, processing times may extend slightly.
                            If there&apos;s a significant delay, we&apos;ll notify you via email.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold ">Shipping Destinations</h2>
                        <p className="">
                            We currently ship to all locations within India.
                            International shipping is not available at this time.
                            However, you may place an order from anywhere in the world as long as the delivery address is within India.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold ">Shipping Rates & Methods</h2>
                        <p className="">
                            Shipping charges are calculated based on the weight of your order and your delivery location.
                            These will be displayed at checkout before you complete your purchase.
                            We partner with reliable courier services to ensure safe and timely delivery.
                            Free shipping is available on orders above ₹1500, applicable only within India.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold ">Delivery Timeframes</h2>
                        <p className="">
                            Once your order is shipped, delivery typically takes 3-7 business days, depending on your location within India.
                            Delivery to metro cities (Mumbai, Delhi, Bangalore, Chennai) may take 3-5 business days,
                            while other regions may take 5-7 business days.
                            Please note that delivery times may vary due to factors beyond our control, such as weather conditions, courier delays, or remote location accessibility.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold ">Tracking Your Order</h2>
                        <p className="">
                            Once your order ships, you&apos;ll receive a Shipment Confirmation email with a tracking number.
                            You can track your order&apos;s status using the tracking link provided in the email.
                            Tracking details may take up to 24 hours to become active after shipping.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold ">Shipping Address Accuracy</h2>
                        <p className="">
                            Please ensure your shipping address is complete and accurate at checkout.
                            Include details like house number, street name, landmark, and PIN code.
                            Cloka.in is not responsible for delays or lost packages due to incorrect or incomplete addresses provided by the customer.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold ">Lost or Damaged Shipments</h2>
                        <p className="">
                            If your order is lost or arrives damaged, please contact us within 7 days of the expected delivery date at support@cloka.in with your order number and details.
                            For damaged items, retain the product and packaging and share photos with us to process a claim with the courier.
                            We&apos;ll work to replace or refund your order as applicable.
                            Cloka.in is not liable for packages lost or damaged during transit, but we&apos;ll assist you in filing a claim with the courier service.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold ">Customs, Duties, and Taxes</h2>
                        <p className="">
                            Since we currently ship only within India, no customs duties apply.
                            All applicable taxes (GST) are included in the product price and shipping charges shown at checkout.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold ">Contact Us</h2>
                        <p className="">
                            For any shipping-related queries, reach out to our customer support team at support@cloka.in.
                            We&apos;re here to help!
                        </p>
                    </section>
                </div>
            </div>
            <Footer />
        </div>
    );
}
