'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import Image from 'next/image';

interface FormData {
    availability: string;
    interests: string;
    experience: string;
    motivation: string;
    skills: string;
    languages: string;
    additionalInfo: string;
}

interface VolunteerApplication {
    _id: string;
    userId: string;
    availability: string;
    interests: string;
    experience: string;
    motivation: string;
    skills?: string;
    languages?: string;
    additionalInfo?: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    updatedAt: string;
}

export default function VolunteersPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();
    const [formData, setFormData] = useState<FormData>({
        availability: '',
        interests: '',
        experience: '',
        motivation: '',
        skills: '',
        languages: '',
        additionalInfo: '',
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [application, setApplication] = useState<VolunteerApplication | null>(null);
    const [loadingApplication, setLoadingApplication] = useState(true);

    // Fetch existing application
    useEffect(() => {
        const fetchApplication = async () => {
            try {
                const response = await fetch('/api/volunteers');
                if (response.ok) {
                    const data = await response.json();
                    if (data.applications && data.applications.length > 0) {
                        setApplication(data.applications[0]); // Get the most recent application
                    }
                }
            } catch (error) {
                console.error('Error fetching application:', error);
            } finally {
                setLoadingApplication(false);
            }
        };

        if (isAuthenticated) {
            fetchApplication();
        }
    }, [isAuthenticated]);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login?redirect=/volunteers');
        }
    }, [isLoading, isAuthenticated, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/volunteers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    router.push('/login?redirect=/volunteers');
                    return;
                }
                throw new Error('Failed to submit application');
            }

            setSuccess('Thank you for your volunteer application. We will get back to you soon!');
            setFormData({
                availability: '',
                interests: '',
                experience: '',
                motivation: '',
                skills: '',
                languages: '',
                additionalInfo: '',
            });
        } catch (err) {
            console.error(err);
            setError('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (isLoading || loadingApplication) {
        return <div className='min-h-screen flex items-center justify-center'>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <div className='min-h-screen flex items-center justify-center'>Redirecting to login...</div>;
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-grow">
                {/* Application Status Section */}
                {application && (
                    <div className="container mx-auto px-4 py-8">
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-zinc-800 p-6 rounded-lg mb-8">
                                <h2 className="text-2xl font-bold mb-4">Your Application Status</h2>
                                <div className="flex items-center space-x-2">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${application.status === 'approved'
                                        ? 'bg-green-900/30 text-green-300'
                                        : application.status === 'rejected'
                                            ? 'bg-red-900/30 text-red-300'
                                            : 'bg-yellow-900/30 text-yellow-300'
                                        }`}>
                                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                    </span>
                                    <span className="text-zinc-400">
                                        {application.status === 'pending'
                                            ? '- We are reviewing your application'
                                            : application.status === 'approved'
                                                ? '- Welcome to the team!'
                                                : '- Thank you for your interest'}
                                    </span>
                                </div>
                                <p className="mt-4 text-zinc-400">
                                    Application submitted on {new Date(application.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {!application && (
                    <>
                        {/* Hero Section */}
                        <div className="container mx-auto px-4 py-8">
                            <div className="max-w-4xl mx-auto">
                                <section className="text-center space-y-4">
                                    <h1 className="text-5xl font-bold">Volunteer with Cloka</h1>
                                    <p className="text-xl text-gray-300">Join Our Mission to Build a Healthier, More Connected Community</p>
                                    <div className="max-w-3xl mx-auto">
                                        <p className="text-zinc-400">
                                            At Cloka, we believe in the power of community and the impact that passionate individuals can make. As a volunteer, you&apos;ll be at the heart of our mission to promote fitness, well-being, and social connection across India&apos;s cities.
                                        </p>
                                    </div>
                                </section>
                            </div>
                        </div>

                        <div className="container mx-auto px-4">
                            <div className="max-w-4xl mx-auto space-y-12">
                                {/* Why Volunteer Section */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Portrait Image Section */}
                                    <section className="relative w-full aspect-[3/4]">
                                        <Image
                                            src="/images/reels.png"
                                            alt="Cloka Community Moments"
                                            fill
                                            className="object-cover rounded-lg shadow-lg"
                                            priority
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                        />
                                    </section>
                                    <section className="bg-zinc-800 p-8">
                                        <h2 className="text-4xl font-bold mb-6">Why Volunteer with Cloka?</h2>
                                        <ul className="space-y-4 text-md text-gray-300">
                                            <li>• <strong>Make a Real Impact</strong> in your local community through fitness and wellness initiatives.</li>
                                            <li>• <strong>Develop Leadership Skills</strong> by helping organize and lead community events.</li>
                                            <li>• <strong>Build Meaningful Connections</strong> with like-minded individuals across India.</li>
                                            <li>• <strong>Gain Experience</strong> in event management, community building, and social media.</li>
                                        </ul>
                                    </section>
                                </div>

                                {/* What We Look For Section */}
                                <section className="bg-zinc-800 p-8">
                                    <h2 className="text-3xl font-bold mb-6">What We Look For</h2>
                                    <p className="mb-4">We welcome volunteers who:</p>
                                    <ul className="space-y-2 text-gray-300">
                                        <li>• Are passionate about fitness, wellness, and community building</li>
                                        <li>• Can commit to regular involvement in our activities</li>
                                        <li>• Have strong communication and interpersonal skills</li>
                                        <li>• Are reliable, enthusiastic, and team-oriented</li>
                                        <li>• Bring unique skills or perspectives to our community</li>
                                    </ul>
                                    <p className="mt-4 text-gray-400">Whether you&apos;re a fitness enthusiast, event organizer, content creator, or just someone who loves bringing people together—we&apos;d love to hear from you!</p>
                                </section>

                                {/* Community Image - Full Width */}
                                <section className="w-full container mx-auto relative aspect-[21/9] mb-12">
                                    <Image
                                        src="/images/partner.png"
                                        alt="Cloka Community"
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                </section>

                                {/* Volunteer Form */}
                                <section className="bg-zinc-800 p-8">
                                    <h2 className="text-3xl font-bold mb-6">Ready to Join Us? Apply Now!</h2>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Availability */}
                                        <div>
                                            <label htmlFor="availability" className="block text-sm font-medium mb-1">Availability (Days/Times) *</label>
                                            <input
                                                id="availability"
                                                name="availability"
                                                type="text"
                                                value={formData.availability}
                                                onChange={handleChange}
                                                placeholder="E.g., Weekends, Weekday evenings"
                                                className="w-full p-3 border focus:outline-none focus:ring-2 bg-zinc-900 border-zinc-700"
                                                required
                                            />
                                        </div>

                                        {/* Areas of Interest */}
                                        <div>
                                            <label htmlFor="interests" className="block text-sm font-medium mb-1">Areas of Interest *</label>
                                            <textarea
                                                id="interests"
                                                name="interests"
                                                value={formData.interests}
                                                onChange={handleChange}
                                                placeholder="E.g., Event organization, Social media, Community engagement"
                                                rows={3}
                                                className="w-full p-3 border focus:outline-none focus:ring-2 bg-zinc-900 border-zinc-700"
                                                required
                                            />
                                        </div>

                                        {/* Experience */}
                                        <div>
                                            <label htmlFor="experience" className="block text-sm font-medium mb-1">Relevant Experience *</label>
                                            <textarea
                                                id="experience"
                                                name="experience"
                                                value={formData.experience}
                                                onChange={handleChange}
                                                placeholder="Tell us about any relevant experience in community work, events, or fitness"
                                                rows={3}
                                                className="w-full p-3 border focus:outline-none focus:ring-2 bg-zinc-900 border-zinc-700"
                                                required
                                            />
                                        </div>

                                        {/* Motivation */}
                                        <div>
                                            <label htmlFor="motivation" className="block text-sm font-medium mb-1">Why do you want to volunteer with Cloka? *</label>
                                            <textarea
                                                id="motivation"
                                                name="motivation"
                                                value={formData.motivation}
                                                onChange={handleChange}
                                                rows={3}
                                                className="w-full p-3 border focus:outline-none focus:ring-2 bg-zinc-900 border-zinc-700"
                                                required
                                            />
                                        </div>

                                        {/* Optional Fields */}
                                        <div>
                                            <label htmlFor="skills" className="block text-sm font-medium mb-1">Special Skills (Optional)</label>
                                            <textarea
                                                id="skills"
                                                name="skills"
                                                value={formData.skills}
                                                onChange={handleChange}
                                                placeholder="Any special skills you'd like to share? (e.g., photography, first aid, social media)"
                                                rows={3}
                                                className="w-full p-3 border focus:outline-none focus:ring-2 bg-zinc-900 border-zinc-700"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="languages" className="block text-sm font-medium mb-1">Languages Known (Optional)</label>
                                            <textarea
                                                id="languages"
                                                name="languages"
                                                value={formData.languages}
                                                onChange={handleChange}
                                                rows={2}
                                                className="w-full p-3 border focus:outline-none focus:ring-2 bg-zinc-900 border-zinc-700"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="additionalInfo" className="block text-sm font-medium mb-1">Additional Information (Optional)</label>
                                            <textarea
                                                id="additionalInfo"
                                                name="additionalInfo"
                                                value={formData.additionalInfo}
                                                onChange={handleChange}
                                                rows={3}
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
                                            disabled={isSubmitting}
                                            className="cursor-pointer w-full"
                                        >
                                            {isSubmitting ? 'Submitting...' : 'Submit Volunteer Application'}
                                        </Button>
                                    </form>
                                </section>
                            </div>
                        </div>
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
} 