'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import Image from 'next/image';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        issueType: '',
        details: '',
        contact: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Thank you for your message. We will get back to you soon!');
                setFormData({ issueType: '', details: '', contact: '' }); // Reset form
            } else {
                setError(data.message || 'Something went wrong. Please try again.');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl text-center font-bold mb-8">Contact Us</h1>

                    <div className="bg-zinc-900 text-gray-300 text-md p-4 text-left flex justify-between items-center gap-4">


                        <div>
                            <p className="font-semibold mb-1">Cloka India</p>
                            <address className="not-italic">
                                No.27, Aston Ville 4B,<br />
                                Kumaran Colony 1st Cross Street,<br />
                                Vadapalani, Chennai - 600026
                            </address>
                            <p className="mt-2 font-semibold">
                                info@cloka.in
                            </p>
                        </div>

                        <Image className='filter invert' src="/logo.png" alt="Cloka Logo" width={100} height={100} />

                    </div>

                    <div className="border-2 border-zinc-800 p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="issueType" className="block text-sm font-medium mb-1">
                                    What is your issue related with? *
                                </label>
                                <select
                                    id="issueType"
                                    name="issueType"
                                    value={formData.issueType}
                                    onChange={handleChange}
                                    className="w-full p-3 border focus:outline-none focus:ring-2 bg-zinc-900 border-zinc-700"
                                    required
                                >
                                    <option value="">Select an option</option>
                                    <option value="app">Something with the app</option>
                                    <option value="community">Something with the members of the community</option>
                                    <option value="during-run">Something that happened during the run</option>
                                    <option value="post-run">Something that happened post run</option>
                                    <option value="other">Everything else</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="details" className="block text-sm font-medium mb-1">
                                    Describe in details, we&apos;ll do our best to address them ASAP! *
                                </label>
                                <textarea
                                    id="details"
                                    name="details"
                                    value={formData.details}
                                    onChange={handleChange}
                                    rows={5}
                                    className="w-full p-3 border focus:outline-none focus:ring-2 bg-zinc-900 border-zinc-700"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="contact" className="block text-sm font-medium mb-1">
                                    Contact (optional)
                                </label>
                                <input
                                    id="contact"
                                    name="contact"
                                    type="text"
                                    value={formData.contact}
                                    onChange={handleChange}
                                    className="w-full p-3 border focus:outline-none focus:ring-2 bg-zinc-900 border-zinc-700"
                                />
                            </div>

                            {error && (
                                <div className="text-red-400">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="text-green-400">
                                    {success}
                                </div>
                            )}

                            <Button
                                type="submit"
                                variant='secondary'
                                disabled={isLoading}
                                className="cursor-pointer w-full"
                            >
                                {isLoading ? 'Sending...' : 'Send Message'}
                            </Button>
                        </form>
                    </div>
                </div>
            </main>


            <Footer />
        </div>
    );
} 