import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service - Cloka",
    description: "Terms and conditions for using Cloka services",
};

export default function TermsPage() {
    return (
        <main className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

            <div className="prose prose-lg max-w-none">
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                    <p>
                        By accessing and using Cloka&apos;s services, you agree to be bound by these Terms of Service
                        and all applicable laws and regulations. If you do not agree with any of these terms, you
                        are prohibited from using or accessing this site.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
                    <p>
                        Permission is granted to temporarily access the materials (information or software) on
                        Cloka&apos;s website for personal, non-commercial transitory viewing only.
                    </p>
                    <p className="mt-4">This license shall automatically terminate if you violate any of these restrictions and may be terminated by Cloka at any time.</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
                    <p>
                        When you create an account with us, you must provide accurate, complete, and current
                        information. You are responsible for safeguarding the password and for all activities that
                        occur under your account.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">4. Service Modifications</h2>
                    <p>
                        Cloka reserves the right to modify or discontinue, temporarily or permanently, the service
                        with or without notice. We shall not be liable to you or any third party for any
                        modification, suspension, or discontinuance of the service.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">5. Limitation of Liability</h2>
                    <p>
                        In no event shall Cloka or its suppliers be liable for any damages arising out of the use
                        or inability to use the materials on Cloka&apos;s website, even if Cloka or an authorized
                        representative has been notified orally or in writing of the possibility of such damage.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">6. Governing Law</h2>
                    <p>
                        These terms and conditions are governed by and construed in accordance with the laws and
                        you irrevocably submit to the exclusive jurisdiction of the courts in that location.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">7. Changes to Terms</h2>
                    <p>
                        Cloka reserves the right to revise these terms of service at any time without notice. By
                        using this website, you are agreeing to be bound by the current version of these terms
                        of service.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
                    <p>
                        If you have any questions about these Terms of Service, please contact us through our
                        <a href="https://forms.gle/2enLCA1zNw3QSJYs9" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline"> support form</a> or other support channels.
                    </p>
                </section>

                <div className="mt-12 text-sm text-gray-600">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>
                </div>
            </div>
        </main>
    );
} 