'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/apiUtils';

type EventProps = {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    description: string;
};

// Type for the event data from the API
type ApiEventData = {
    _id: string;
    title: string;
    date: string;
    location: string;
    description: string;
    createdAt: string;
};

// Props for the UpcomingEvents component
interface UpcomingEventsProps {
    serverEvents?: EventProps[];
}

const EventCard = ({ event }: { event: EventProps }) => {
    const [showModal, setShowModal] = useState(false);
    const [instagramUsername, setInstagramUsername] = useState('');
    const [secret, setSecret] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationError, setVerificationError] = useState('');
    const [exactLocation, setExactLocation] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [isGoogleMapsLink, setIsGoogleMapsLink] = useState(false);

    const handleRevealLocation = () => {
        setShowModal(true);
    };

    const closeModal = () => {
        if (!isVerified) {
            setInstagramUsername('');
            setSecret('');
            setVerificationError('');
        }
        setShowModal(false);
    };

    const verifySecret = async () => {
        if (!instagramUsername || !secret) {
            setVerificationError('Please fill in all fields');
            return;
        }

        setIsVerifying(true);
        setVerificationError('');

        try {
            const response = await fetch('/api/events/verify-secret', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    eventId: event.id,
                    instagramUsername,
                    secret,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setExactLocation(data.exactLocation);
                setIsGoogleMapsLink(data.isGoogleMapsLink || false);
                setIsVerified(true);
            } else {
                setVerificationError(data.message || 'Verification failed. Please check your information and try again.');
            }
        } catch (error) {
            setVerificationError('An error occurred during verification. Please try again.');
            console.error('Error verifying secret:', error);
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-white text-black p-6 luxury-border"
        >
            <div className="mb-4">
                <span className="text-sm uppercase tracking-wider text-accent">{event.date} • {event.time}</span>
            </div>
            <h3 className="text-xl font-bold mb-2">{event.title}</h3>
            <p className="text-sm mb-4">
                <span className="font-medium">Location:</span> {event.location}
            </p>
            <p className="luxury-text mb-6">{event.description}</p>
            <div className="flex flex-wrap gap-3">
                <button
                    onClick={handleRevealLocation}
                    className="hover:cursor-pointer luxury-button text-sm inline-block"
                >
                    Reveal Location
                </button>
            </div>

            {/* Location Verification Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4 text-black">
                            {isVerified ? 'Exact Location' : 'Verify to Reveal Location'}
                        </h3>

                        {isVerified ? (
                            <div>
                                <p className="mb-4 text-black">
                                    <span className="font-medium">Exact Location:</span>
                                </p>
                                {isGoogleMapsLink ? (
                                    <div className="mb-6">
                                        <a
                                            href={exactLocation}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-zinc-800 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                            Open in Google Maps
                                        </a>
                                        <p className="text-xs text-zinc-600 mt-2">
                                            Click the button above to view the exact location in Google Maps
                                        </p>
                                    </div>
                                ) : (
                                    <p className="mb-6 text-black">{exactLocation}</p>
                                )}
                                <div className="flex justify-end">
                                    <button
                                        onClick={closeModal}
                                        className="luxury-button text-sm"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="mb-4 text-black">
                                    Enter your Instagram username and the event secret to reveal the exact location.
                                </p>
                                <p className="mb-4 text-sm text-zinc-600">
                                    <strong>Note:</strong> If you have an approved registration with your Instagram username, you&apos;ll be verified automatically.
                                </p>

                                {verificationError && (
                                    <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md mb-4">
                                        {verificationError}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="instagramUsername" className="block text-sm font-medium mb-1 text-black">
                                            Instagram Username
                                        </label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-black">@</span>
                                            <input
                                                id="instagramUsername"
                                                type="text"
                                                value={instagramUsername}
                                                onChange={(e) => setInstagramUsername(e.target.value)}
                                                className="w-full p-3 pl-8 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black bg-white"
                                                placeholder="your_username"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="eventSecret" className="block text-sm font-medium mb-1 text-black">
                                            Event Secret
                                        </label>
                                        <input
                                            id="eventSecret"
                                            type="text"
                                            value={secret}
                                            onChange={(e) => setSecret(e.target.value)}
                                            className="w-full p-3 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black bg-white"
                                            placeholder="Enter event secret"
                                        />
                                        <p className="text-xs text-zinc-600 mt-1">
                                            Required only if you don&apos;t have an approved registration
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        onClick={closeModal}
                                        className="hover:cursor-pointer px-4 py-2 border border-black text-black rounded hover:bg-zinc-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={verifySecret}
                                        disabled={isVerifying}
                                        className="hover:cursor-pointer luxury-button text-sm"
                                    >
                                        {isVerifying ? 'Verifying...' : 'Verify & Reveal'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

const UpcomingEvents = ({ serverEvents }: UpcomingEventsProps) => {
    const [events, setEvents] = useState<EventProps[]>(serverEvents || []);
    const [loading, setLoading] = useState(!serverEvents);
    const [error, setError] = useState('');

    useEffect(() => {
        if (serverEvents) {
            return; // Skip fetching if server events are provided
        }

        const fetchEvents = async () => {
            setLoading(true);
            try {
                const data = await fetchApi<{ events: ApiEventData[] }>('/api/events');

                // Transform API data to component format
                const formattedEvents = data.events.map((event: ApiEventData) => {
                    const eventDate = new Date(event.date);
                    return {
                        id: event._id,
                        title: event.title,
                        date: eventDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                        time: eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                        location: event.location,
                        description: event.description,
                    };
                });

                setEvents(formattedEvents);
            } catch (error) {
                console.error('Error fetching events:', error);
                setError('Failed to load events. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [serverEvents]);

    return (
        <section className="py-16 bg-black text-white mt-10">
            <div className="luxury-container">


                {loading ? (
                    <div className="text-center py-12">
                        <div className="w-12 h-12 border-t-2 border-white rounded-full animate-spin mx-auto"></div>
                        <p className="mt-4">Loading events...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <p className="text-red-400">{error}</p>
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-12">
                        <p>No upcoming events at this time. Check back soon!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                )}

                <div className="text-center mt-12">
                    <Link href="/events" className="luxury-button inline-block">
                        View All Events
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default UpcomingEvents; 