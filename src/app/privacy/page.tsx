import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy - Cloka",
    description: "Privacy policy and data handling practices for Cloka services",
};

export default function PrivacyPage() {
    return (
        <main className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

            <div className="prose prose-lg max-w-none">
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
                    <p>
                        We collect information that you provide directly to us, including:
                    </p>
                    <ul className="list-disc ml-6 mt-2">
                        <li>Name and contact information</li>
                        <li>Account credentials</li>
                        <li>Profile information</li>
                        <li>Payment information</li>
                        <li>Communications with us</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
                    <p>
                        We use the information we collect to:
                    </p>
                    <ul className="list-disc ml-6 mt-2">
                        <li>Provide and maintain our services</li>
                        <li>Process your transactions</li>
                        <li>Send you service-related communications</li>
                        <li>Improve and optimize our services</li>
                        <li>Protect against fraud and unauthorized access</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
                    <p>
                        We do not sell your personal information. We may share your information with:
                    </p>
                    <ul className="list-disc ml-6 mt-2">
                        <li>Service providers who assist in our operations</li>
                        <li>Professional advisors and consultants</li>
                        <li>Law enforcement when required by law</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
                    <p>
                        We implement appropriate technical and organizational measures to protect your
                        personal information. However, no method of transmission over the Internet or
                        electronic storage is 100% secure.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
                    <p>
                        You have the right to:
                    </p>
                    <ul className="list-disc ml-6 mt-2">
                        <li>Access your personal information</li>
                        <li>Correct inaccurate information</li>
                        <li>Request deletion of your information</li>
                        <li>Object to processing of your information</li>
                        <li>Request data portability</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking</h2>
                    <p>
                        We use cookies and similar tracking technologies to collect information about your
                        browsing activities. You can control cookies through your browser settings.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">7. Children&apos;s Privacy</h2>
                    <p>
                        Our services are not directed to children under 13. We do not knowingly collect
                        personal information from children under 13.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">8. Changes to This Policy</h2>
                    <p>
                        We may update this privacy policy from time to time. We will notify you of any
                        changes by posting the new policy on this page.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us through
                        our website or support channels.
                    </p>
                </section>

                <div className="mt-12 text-sm text-gray-600">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>
                </div>
            </div>
        </main>
    );
} 