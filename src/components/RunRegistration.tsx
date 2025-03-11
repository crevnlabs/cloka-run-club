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

// Define the registration schema
const registrationSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(1, "Phone number is required"),
    age: z.string().min(1, "Age is required"),
    gender: z.string().min(1, "Gender is required"),
    joinCrew: z.boolean().optional(),
    acceptTerms: z.boolean().refine(val => val === true, {
        message: "You must accept the terms and conditions"
    }),
    emergencyContact: z.string().min(1, "Emergency contact is required"),
    instagramUsername: z.string().refine(
        (val) => !val || isValidInstagramFormat(val),
        "Invalid Instagram username format"
    ),
    eventId: z.string().optional(),
    // Password is required for all registrations
    password: z.string().min(6, "Password must be at least 6 characters"),
    // New password is only required when changing password
    newPassword: z.string().optional(),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

const RunRegistration = ({ eventId }: { eventId?: string }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [events, setEvents] = useState<EventOption[]>([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchPassword, setSearchPassword] = useState('');
    const [phoneVerification, setPhoneVerification] = useState('');
    const [needsPhoneVerification, setNeedsPhoneVerification] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);
    const [isLegacyAccount, setIsLegacyAccount] = useState(false);
    const [registrationId, setRegistrationId] = useState<string | null>(null);
    const [showNewPasswordField, setShowNewPasswordField] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch
    } = useForm<RegistrationFormData>({
        resolver: zodResolver(registrationSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            age: "",
            gender: "",
            joinCrew: false,
            acceptTerms: false,
            emergencyContact: "",
            instagramUsername: "",
            eventId: eventId || "",
            password: "",
            newPassword: ""
        }
    });

    // Function to search and fill form with previous registration
    const searchPreviousRegistration = async () => {
        if (!searchTerm) return;
        if (needsPhoneVerification && !phoneVerification) return;
        if (!needsPhoneVerification && !searchPassword) return;

        setIsSearching(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const response = await fetch('/api/search-registration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    searchTerm,
                    password: searchPassword,
                    phoneVerification: phoneVerification || undefined
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Check if we need phone verification
                if (data.requiresPhoneVerification) {
                    setNeedsPhoneVerification(true);
                    throw new Error(data.message || 'Please verify your identity with your phone number');
                } else {
                    throw new Error(data.message || 'No previous registration found');
                }
            }

            // Fill form with previous registration data
            Object.entries(data.registration).forEach(([key, value]) => {
                if (key !== 'acceptTerms') { // Don't auto-fill terms acceptance
                    setValue(key as keyof RegistrationFormData, value as string | boolean);
                }
            });

            // For legacy accounts, clear the password field to ensure user sets a new one
            if (data.isLegacyAccount) {
                setValue('password', '');
            } else {
                // Set the password field with the search password for non-legacy accounts
                // This is important - we use the authenticated password for future operations
                setValue('password', searchPassword);
            }

            setRegistrationId(data.registrationId);
            setIsUpdate(true);
            setNeedsPhoneVerification(false);

            // Show special message for legacy accounts
            if (data.isLegacyAccount) {
                setIsLegacyAccount(true);
                setSuccessMessage(data.message || 'Please set a password for your account.');
            } else {
                setIsLegacyAccount(false);
            }
        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage('An unexpected error occurred');
            }
        } finally {
            setIsSearching(false);
        }
    };

    // Reset the search form
    const resetSearch = () => {
        setSearchTerm('');
        setSearchPassword('');
        setPhoneVerification('');
        setNeedsPhoneVerification(false);
        setErrorMessage('');
        setSuccessMessage('');
    };

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

    // Effect to clear password field when legacy account is detected
    useEffect(() => {
        if (isLegacyAccount) {
            // Clear the password field for legacy accounts
            setValue('password', '');
        }
    }, [isLegacyAccount, setValue]);

    // Watch the gender field to show conditional validation message
    const selectedGender = watch('gender');
    const ageValue = watch('age');

    const onSubmit = async (data: RegistrationFormData) => {
        setIsSubmitting(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const cleanUsername = data.instagramUsername.startsWith('@')
                ? data.instagramUsername.substring(1)
                : data.instagramUsername;

            // Create a clean copy of the form data
            const formData: {
                name: string;
                email: string;
                phone: string;
                age: string;
                gender: string;
                joinCrew?: boolean;
                acceptTerms: boolean;
                emergencyContact: string;
                instagramUsername: string;
                eventId?: string;
                password: string;
                registrationId?: string;
                newPassword?: string;
                isLegacyAccount?: boolean;
            } = {
                name: data.name,
                email: data.email,
                phone: data.phone,
                age: data.age,
                gender: data.gender,
                joinCrew: data.joinCrew,
                acceptTerms: data.acceptTerms,
                emergencyContact: data.emergencyContact,
                instagramUsername: cleanUsername,
                eventId: data.eventId,
                password: data.password
            };

            // Add registration ID if updating
            if (isUpdate && registrationId) {
                formData.registrationId = registrationId;
            }

            // For legacy accounts, set the password as newPassword
            if (isLegacyAccount) {
                formData.newPassword = data.password;
                formData.isLegacyAccount = true;
                // For legacy accounts, we don't have an old password, so set a placeholder
                formData.password = 'legacy-account';
            }
            // For regular accounts, add new password if changing password
            else if (showNewPasswordField && data.newPassword && data.newPassword.length >= 6) {
                console.log("Including new password in submission, length:", data.newPassword.length);
                formData.newPassword = data.newPassword;
            } else if (showNewPasswordField) {
                console.log("New password checkbox checked but invalid password:", data.newPassword?.length);
            }

            console.log('Submitting form data:', {
                ...formData,
                password: '***',
                newPassword: formData.newPassword ? '***' : undefined,
                hasNewPassword: !!formData.newPassword,
                isUpdate,
                isLegacyAccount,
                showNewPasswordField
            });

            // Use different endpoint based on whether this is an update or new registration
            const endpoint = isUpdate ? '/api/update-registration' : '/api/register-run';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            console.log('Response from server:', result);

            if (!response.ok) {
                throw new Error(result.message || 'Something went wrong');
            }

            // Show success message with password update info if applicable
            if (result.passwordUpdated || isLegacyAccount) {
                setSuccessMessage(isLegacyAccount
                    ? 'Your account has been secured with a password. Please use this password for future logins.'
                    : 'Your password has been updated successfully!');
            } else {
                setSuccessMessage('Registration submitted successfully!');
            }

            setIsSuccess(true);
            reset();
            setIsUpdate(false);
            setIsLegacyAccount(false);
            setSearchTerm('');
            setSearchPassword('');
            setPhoneVerification('');
            setNeedsPhoneVerification(false);
            setRegistrationId(null);
            setShowNewPasswordField(false);
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
                {!isSuccess && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-center">Quick Registration</h2>
                        <div className="flex flex-col gap-4 items-center justify-center">
                            <div className="flex gap-4 w-full max-w-md">
                                <input
                                    type="text"
                                    placeholder="Enter Instagram username or email"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full p-3 border border-black dark:border-white rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-black dark:text-white bg-white dark:bg-black"
                                />
                            </div>

                            {needsPhoneVerification ? (
                                <div className="flex gap-4 w-full max-w-md">
                                    <input
                                        type="tel"
                                        placeholder="Enter your phone number to verify"
                                        value={phoneVerification}
                                        onChange={(e) => setPhoneVerification(e.target.value)}
                                        className="w-full p-3 border border-black dark:border-white rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-black dark:text-white bg-white dark:bg-black"
                                    />
                                    <button
                                        onClick={searchPreviousRegistration}
                                        disabled={isSearching || !phoneVerification}
                                        className={`luxury-button px-6 py-3 bg-black dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-white ${(isSearching || !phoneVerification) ? 'opacity-70 cursor-not-allowed' : ''
                                            }`}
                                    >
                                        {isSearching ? 'Verifying...' : 'Verify'}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-4 w-full max-w-md">
                                    <input
                                        type="password"
                                        placeholder="Enter your password"
                                        value={searchPassword}
                                        onChange={(e) => setSearchPassword(e.target.value)}
                                        className="w-full p-3 border border-black dark:border-white rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-black dark:text-white bg-white dark:bg-black"
                                    />
                                    <button
                                        onClick={searchPreviousRegistration}
                                        disabled={isSearching || !searchTerm || !searchPassword}
                                        className={`luxury-button px-6 py-3 bg-black dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-white ${(isSearching || !searchTerm || !searchPassword) ? 'opacity-70 cursor-not-allowed' : ''
                                            }`}
                                    >
                                        {isSearching ? 'Searching...' : 'Search'}
                                    </button>
                                </div>
                            )}

                            {needsPhoneVerification && (
                                <div className="w-full max-w-md">
                                    <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                                        This account was created before passwords were required.
                                        Please enter your phone number to verify your identity and set a password.
                                    </p>
                                    <div className="flex justify-end mt-2">
                                        <button
                                            onClick={resetSearch}
                                            className="text-sm text-gray-600 dark:text-gray-400 underline"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {!needsPhoneVerification && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 text-center">
                                    First time users: Enter your details and create a password below.
                                </p>
                            )}
                        </div>
                        {errorMessage && (
                            <p className="text-center mt-2 text-red-600 dark:text-red-400">
                                {errorMessage}
                            </p>
                        )}
                        {successMessage && (
                            <p className="text-center mt-2 text-green-600 dark:text-green-400">
                                {successMessage}
                            </p>
                        )}
                        {isUpdate && !successMessage && (
                            <p className="text-center mt-2 text-green-600 dark:text-green-400">
                                Previous registration found! Update your details below.
                            </p>
                        )}
                    </div>
                )}

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

                        {isUpdate && !isLegacyAccount && (
                            <div className="mb-6">
                                <div className="flex items-center mb-2">
                                    <input
                                        type="checkbox"
                                        id="changePassword"
                                        checked={showNewPasswordField}
                                        onChange={(e) => {
                                            setShowNewPasswordField(e.target.checked);
                                            // Clear the newPassword field when unchecking
                                            if (!e.target.checked) {
                                                setValue('newPassword', '');
                                            }
                                        }}
                                        className="mr-2"
                                    />
                                    <label htmlFor="changePassword" className="font-medium">
                                        Change Password
                                    </label>
                                </div>

                                {showNewPasswordField && (
                                    <>
                                        <label htmlFor="newPassword" className="block mb-2 font-medium">
                                            New Password <span className="text-red-500">*</span>
                                        </label>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            Enter a new password below. Your current password will be used for authentication.
                                        </p>
                                        <input
                                            type="password"
                                            id="newPassword"
                                            placeholder="Enter new password (min 6 characters)"
                                            {...register("newPassword", {
                                                required: showNewPasswordField ? "New password is required" : false,
                                                minLength: {
                                                    value: 6,
                                                    message: "New password must be at least 6 characters"
                                                }
                                            })}
                                            className={`w-full p-3 border ${errors.newPassword ? "border-red-500" : "border-black dark:border-white"
                                                } rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-black dark:text-white bg-white dark:bg-black`}
                                        />
                                        {errors.newPassword && (
                                            <p className="mt-1 text-red-500">{errors.newPassword.message}</p>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {isLegacyAccount && (
                            <div className="mb-6">
                                <label htmlFor="password" className="block mb-2 font-medium">
                                    Set Your Password <span className="text-red-500">*</span>
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    Your account was created before passwords were required. Please set a password for your account.
                                </p>
                                <input
                                    type="password"
                                    id="password"
                                    placeholder="Enter a password (min 6 characters)"
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: {
                                            value: 6,
                                            message: "Password must be at least 6 characters"
                                        }
                                    })}
                                    className={`w-full p-3 border ${errors.password ? "border-red-500" : "border-black dark:border-white"
                                        } rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-black dark:text-white bg-white dark:bg-black`}
                                />
                                {errors.password && (
                                    <p className="mt-1 text-red-500">{errors.password.message}</p>
                                )}
                            </div>
                        )}

                        {(!isUpdate || (!isLegacyAccount && isUpdate)) && (
                            <div className="mb-6">
                                <label htmlFor="password" className="block mb-2 font-medium">
                                    {isUpdate ? "Current Password" : "Password"} <span className="text-red-500">*</span>
                                </label>
                                {isUpdate && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        Enter your current password to authenticate changes.
                                    </p>
                                )}
                                <input
                                    type="password"
                                    id="password"
                                    placeholder={isUpdate ? "Enter your current password" : "Enter a password (min 6 characters)"}
                                    {...register("password")}
                                    className={`w-full p-3 border ${errors.password ? "border-red-500" : "border-black dark:border-white"
                                        } rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-black dark:text-white bg-white dark:bg-black`}
                                />
                                {errors.password && (
                                    <p className="mt-1 text-red-500">{errors.password.message}</p>
                                )}
                            </div>
                        )}

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