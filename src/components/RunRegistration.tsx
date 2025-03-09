'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { getApiUrl } from '@/lib/apiUtils';

// Define event type
type EventOption = {
    _id: string;
    title: string;
    date: Date;
    location: string;
};

// Function to validate Instagram username format
const isValidInstagramFormat = (username: string): boolean => {
    // Remove @ if present
    const cleanUsername = username.startsWith('@') ? username.substring(1) : username;

    // Instagram usernames can only contain letters, numbers, periods, and underscores
    // They cannot start or end with a period, and cannot have consecutive periods
    const regex = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/;
    return regex.test(cleanUsername);
};

// Define the form schema with Zod
const registrationSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    email: z.string().email({ message: 'Please enter a valid email address' }),
    phone: z.string().min(10, { message: 'Please enter a valid phone number' }),
    age: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: 'Please enter a valid age',
    }),
    gender: z.enum(['male', 'female', 'other'], {
        errorMap: () => ({ message: 'Please select a gender' }),
    }),
    emergencyContact: z.string().min(10, { message: 'Please enter a valid emergency contact' }),
    instagramUsername: z.string().min(1, { message: 'Please enter your Instagram username' })
        .refine(
            (username) => isValidInstagramFormat(username),
            { message: 'Please enter a valid Instagram username format' }
        ),
    eventId: z.string().optional(), // Made optional
    joinCrew: z.boolean().default(false),
    acceptTerms: z.boolean().refine(val => val === true, {
        message: 'You must accept the terms and conditions',
    }),
}).refine((data) => {
    // Age restriction based on gender
    if (data.gender === 'male') {
        return Number(data.age) < 35;
    }
    return true;
}, {
    message: "Age restriction: Registration is only available for those under 35 with current gender selection",
    path: ["age"]
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

const RunRegistration = ({ eventId }: { eventId?: string }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [events, setEvents] = useState<EventOption[]>([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue,
    } = useForm<RegistrationFormData>({
        resolver: zodResolver(registrationSchema),
        defaultValues: {
            eventId: eventId || '',
            joinCrew: false,
            acceptTerms: false,
            instagramUsername: '',
        },
    });

    // Fetch events when component mounts
    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoadingEvents(true);
            try {
                const response = await fetch(getApiUrl('/api/events'));
                if (!response.ok) {
                    throw new Error('Failed to fetch events');
                }
                const data = await response.json();

                // Filter events to only include future events
                const now = new Date();
                const futureEvents = data.events.filter((event: EventOption) => {
                    const eventDate = new Date(event.date);
                    return eventDate >= now;
                }) || [];

                setEvents(futureEvents);

                // If eventId is provided and exists in the fetched events, set it
                if (eventId && futureEvents.some((event: EventOption) => event._id === eventId)) {
                    setValue('eventId', eventId);
                }
            } catch (error) {
                console.error('Error fetching events:', error);
            } finally {
                setIsLoadingEvents(false);
            }
        };

        fetchEvents();
    }, [eventId, setValue]);

    // Watch the gender field to show conditional validation message
    const selectedGender = watch('gender');
    const ageValue = watch('age');

    const onSubmit = async (data: RegistrationFormData) => {
        setIsSubmitting(true);
        setErrorMessage('');

        try {
            // Clean the Instagram username (remove @ if present)
            const cleanUsername = data.instagramUsername.startsWith('@')
                ? data.instagramUsername.substring(1)
                : data.instagramUsername;

            // We'll validate the Instagram username on the server side
            // Just pass the cleaned username to the API
            const formData = {
                ...data,
                instagramUsername: cleanUsername
            };

            const response = await fetch('/api/register-run', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Something went wrong');
            }

            setIsSuccess(true);
            reset();
        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage('An unexpected error occurred');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="py-16 bg-white dark:bg-black text-black dark:text-white">
            <div className="luxury-container max-w-3xl mx-auto">

                {isSuccess ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-100 p-6 rounded-md text-center"
                    >
                        <h3 className="text-xl font-bold mb-2">Registration Submitted!</h3>
                        <p className="mb-4">Thank you for registering. Your registration is pending approval. We&apos;ll notify you once it&apos;s approved.</p>
                        <button
                            onClick={() => setIsSuccess(false)}
                            className="luxury-button bg-green-800 hover:bg-green-900 text-white"
                        >
                            Register Another Runner
                        </button>
                    </motion.div>
                ) : (
                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        {errorMessage && (
                            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
                                {errorMessage}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium mb-1 text-black dark:text-white">
                                    Full Name *
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    className={`w-full p-3 border ${errors.name ? 'border-red-500' : 'border-black dark:border-white'
                                        } rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-black dark:text-white bg-white dark:bg-black`}
                                    {...register('name')}
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium mb-1 text-black dark:text-white">
                                    Email Address *
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    className={`w-full p-3 border ${errors.email ? 'border-red-500' : 'border-black dark:border-white'
                                        } rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-black dark:text-white bg-white dark:bg-black`}
                                    {...register('email')}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium mb-1 text-black dark:text-white">
                                    Phone Number *
                                </label>
                                <input
                                    id="phone"
                                    type="tel"
                                    className={`w-full p-3 border ${errors.phone ? 'border-red-500' : 'border-black dark:border-white'
                                        } rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-black dark:text-white bg-white dark:bg-black`}
                                    {...register('phone')}
                                />
                                {errors.phone && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="gender" className="block text-sm font-medium mb-1 text-black dark:text-white">
                                    Gender *
                                </label>
                                <select
                                    id="gender"
                                    className={`w-full p-3 border ${errors.gender ? 'border-red-500' : 'border-black dark:border-white'
                                        } rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-black dark:text-white bg-white dark:bg-black`}
                                    {...register('gender')}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                                {errors.gender && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.gender.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="age" className="block text-sm font-medium mb-1 text-black dark:text-white">
                                    Age * {selectedGender === 'male' && <span className="text-xs font-bold text-red-600 dark:text-red-400">(Age restrictions apply)</span>}
                                </label>
                                <input
                                    id="age"
                                    type="number"
                                    className={`w-full p-3 border ${errors.age ? 'border-red-500' : 'border-black dark:border-white'
                                        } rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-black dark:text-white bg-white dark:bg-black`}
                                    {...register('age')}
                                />
                                {errors.age && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.age.message}</p>
                                )}
                                {selectedGender === 'male' && ageValue && Number(ageValue) >= 35 && !errors.age && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">Age restriction: Registration not available for current selection</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="emergencyContact" className="block text-sm font-medium mb-1 text-black dark:text-white">
                                    Emergency Contact *
                                </label>
                                <input
                                    id="emergencyContact"
                                    type="tel"
                                    className={`w-full p-3 border ${errors.emergencyContact ? 'border-red-500' : 'border-black dark:border-white'
                                        } rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-black dark:text-white bg-white dark:bg-black`}
                                    {...register('emergencyContact')}
                                />
                                {errors.emergencyContact && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.emergencyContact.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="instagramUsername" className="block text-sm font-medium mb-1 text-black dark:text-white">
                                    Instagram Username *
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-black dark:text-white">@</span>
                                    <input
                                        id="instagramUsername"
                                        type="text"
                                        className="w-full p-3 pl-8 border border-black dark:border-white rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-black dark:text-white bg-white dark:bg-black"
                                        placeholder="your_username"
                                        {...register('instagramUsername')}
                                    />
                                </div>
                                <div className="mt-1 flex items-center">
                                    <p className="text-xs text-black dark:text-white mr-2">We may feature you on our Instagram page</p>
                                    {watch('instagramUsername') && (
                                        <a
                                            href={`https://instagram.com/${watch('instagramUsername')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-black dark:text-white underline hover:text-black dark:hover:text-white"
                                        >
                                            Open Profile
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="eventId" className="block text-sm font-medium mb-1 text-black dark:text-white">
                                    Select Event
                                </label>
                                <select
                                    id="eventId"
                                    className={`w-full p-3 border ${errors.eventId ? 'border-red-500' : 'border-black dark:border-white'
                                        } rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-black dark:text-white bg-white dark:bg-black`}
                                    {...register('eventId')}
                                    disabled={isLoadingEvents}
                                >
                                    <option value="">Select an Event</option>
                                    {events.length > 0 ? (
                                        events.map((event) => (
                                            <option key={event._id} value={event._id}>
                                                {event.title} - {new Date(event.date).toLocaleDateString()} - {event.location}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled>No upcoming events available</option>
                                    )}
                                </select>
                                {isLoadingEvents && (
                                    <p className="mt-1 text-sm text-black dark:text-white">Loading events...</p>
                                )}
                                {!isLoadingEvents && events.length === 0 && (
                                    <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">No upcoming events available at this time.</p>
                                )}
                                {errors.eventId && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.eventId.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4 mt-4">
                            <div className="flex items-center">
                                <input
                                    id="joinCrew"
                                    type="checkbox"
                                    className="h-5 w-5 text-black dark:text-white focus:ring-black dark:focus:ring-white border-black dark:border-white rounded"
                                    {...register('joinCrew')}
                                />
                                <label htmlFor="joinCrew" className="ml-2 block text-sm text-black dark:text-white">
                                    I want to join the Cloka Crew and receive updates about exclusive events
                                </label>
                            </div>

                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="acceptTerms"
                                        type="checkbox"
                                        className="h-5 w-5 text-black dark:text-white focus:ring-black dark:focus:ring-white border-black dark:border-white rounded"
                                        {...register('acceptTerms')}
                                    />
                                </div>
                                <div className="ml-2 text-sm">
                                    <label htmlFor="acceptTerms" className="font-medium text-black dark:text-white">
                                        I accept the <Link href="/terms" className="text-black dark:text-white underline hover:text-black dark:hover:text-white">Terms and Conditions</Link> and <Link href="/privacy" className="text-black dark:text-white underline hover:text-black dark:hover:text-white">Privacy Policy</Link> *
                                    </label>
                                    {errors.acceptTerms && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.acceptTerms.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="text-center pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`luxury-button px-8 py-3 bg-black dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-white ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isSubmitting ? 'Submitting...' : 'Register Now'}
                            </button>
                        </div>
                    </motion.form>
                )}
            </div>
        </section>
    );
};

export default RunRegistration; 